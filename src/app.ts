import Fastify, { type FastifyInstance, type FastifyReply } from "fastify";

import { authenticate } from "./auth.js";
import type { Lab, PublishLabResponse, Store } from "./domain.js";
import { problem } from "./problem.js";

interface PublishParams {
  labId: string;
}

export interface AppOptions {
  store: Store;
  now?: () => Date;
  logger?: boolean;
}

function sendProblem(
  reply: FastifyReply,
  status: number,
  slug: string,
  title: string,
  detail: string,
  instance: string,
): FastifyReply {
  return reply
    .code(status)
    .type("application/problem+json")
    .send(problem(slug, title, status, detail, instance));
}

function publishedResponse(lab: Lab): PublishLabResponse {
  if (lab.publishedAt === null || lab.publishedBy === null) {
    throw new Error("Published lab is missing audit fields");
  }

  return {
    labId: lab.id,
    status: "published",
    publishedAt: lab.publishedAt.toISOString(),
    publishedBy: lab.publishedBy,
  };
}

export function buildApp(options: AppOptions): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });
  const now = options.now ?? (() => new Date());

  app.get("/health", () => ({ status: "ok" }));

  app.post<{ Params: PublishParams }>(
    "/labs/:labId/publish",
    async (request, reply) => {
      const instance = request.url;
      const user = authenticate(request.headers.authorization);
      if (user === null) {
        return sendProblem(
          reply,
          401,
          "authentication-required",
          "Authentication required",
          "Supply a valid bearer token.",
          instance,
        );
      }

      if (user.role !== "ta") {
        return sendProblem(
          reply,
          403,
          "ta-role-required",
          "TA role required",
          "Only a teaching assistant may publish a lab.",
          instance,
        );
      }

      const lab = options.store.labs.get(request.params.labId);
      const ownsClass =
        lab !== undefined &&
        options.store.taClassIds.get(user.id)?.has(lab.classId);
      if (lab === undefined || ownsClass !== true) {
        return sendProblem(
          reply,
          404,
          "lab-not-found",
          "Lab not found",
          "No lab visible to this teaching assistant has that identifier.",
          instance,
        );
      }

      if (lab.publishedAt !== null) {
        lab.publishedAt = now();
        lab.publishedBy = user.id;
        return reply.code(200).send(publishedResponse(lab));
      }

      const currentTime = now();
      if (currentTime < lab.deadline) {
        return sendProblem(
          reply,
          409,
          "submission-deadline-not-reached",
          "Submission deadline not reached",
          "The whole lab can be published only after its submission deadline.",
          instance,
        );
      }

      if (lab.pendingReviewCount > 0) {
        return reply
          .code(409)
          .type("application/problem+json")
          .send({
            ...problem(
              "reviews-pending",
              "Reviews pending",
              409,
              "Every queued violation, unsure verdict, and sampled pass needs a TA decision.",
              instance,
            ),
            pendingReviewCount: lab.pendingReviewCount,
          });
      }

      lab.publishedAt = currentTime;
      lab.publishedBy = user.id;

      return reply.code(200).send(publishedResponse(lab));
    },
  );

  return app;
}
