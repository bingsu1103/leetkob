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

function requestPath(url: string): string {
  const queryIndex = url.indexOf("?");
  return queryIndex === -1 ? url : url.slice(0, queryIndex);
}

function problemForStatus(status: number): { slug: string; title: string } {
  if (status === 415) {
    return {
      slug: "unsupported-media-type",
      title: "Unsupported Media Type",
    };
  }
  if (status === 400) {
    return { slug: "bad-request", title: "Bad Request" };
  }
  return {
    slug: "internal-server-error",
    title: "Internal Server Error",
  };
}

function getStatusCode(error: unknown): number {
  if (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof (error as { statusCode?: unknown }).statusCode === "number"
  ) {
    const code = (error as { statusCode: number }).statusCode;
    if (code >= 400 && code < 500) {
      return code;
    }
  }
  return 500;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    const msg = (error as { message: string }).message;
    if (msg.length > 0) {
      return msg;
    }
  }
  return fallback;
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

  app.setNotFoundHandler((request, reply) => {
    const instance = requestPath(request.url);
    return sendProblem(
      reply,
      404,
      "not-found",
      "Not Found",
      `Route ${request.method} ${instance} not found.`,
      instance,
    );
  });

  app.setErrorHandler((error: unknown, request, reply) => {
    const instance = requestPath(request.url);
    const status = getStatusCode(error);
    const { slug, title } = problemForStatus(status);
    const detail = getErrorMessage(error, title);
    return sendProblem(reply, status, slug, title, detail, instance);
  });

  app.get("/health", () => ({ status: "ok" }));

  app.post<{ Params: PublishParams }>(
    "/labs/:labId/publish",
    async (request, reply) => {
      const instance = requestPath(request.url);
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
