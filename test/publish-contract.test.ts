import { afterEach, describe, expect, it } from "vitest";

import { buildApp } from "../src/app.js";
import { assignTaToClass, createStore, type Lab } from "../src/domain.js";
import { PROBLEM_BASE } from "../src/problem.js";

const NOW = new Date("2026-11-10T12:00:00.000Z");
const DEADLINE_PASSED = new Date("2026-11-10T11:00:00.000Z");
const DEADLINE_FUTURE = new Date("2026-11-10T13:00:00.000Z");

function lab(overrides: Partial<Lab> = {}): Lab {
  return {
    id: "lab-merge-sort",
    classId: "class-a",
    title: "Merge sort",
    deadline: DEADLINE_PASSED,
    pendingReviewCount: 0,
    publishedAt: null,
    publishedBy: null,
    ...overrides,
  };
}

function setup(subject = lab()) {
  const store = createStore([subject]);
  assignTaToClass(store, "ta-a", "class-a");
  assignTaToClass(store, "ta-b", "class-b");
  const app = buildApp({ store, now: () => NOW });
  return { app, store, subject };
}

const apps: ReturnType<typeof buildApp>[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map(async (app) => app.close()));
});

describe("POST /labs/{labId}/publish contract", () => {
  it("reports health without authentication", async () => {
    const context = setup();
    apps.push(context.app);

    const response = await context.app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });

  it("uses the server clock when no clock is injected", async () => {
    const subject = lab({ deadline: new Date("2020-01-01T00:00:00.000Z") });
    const store = createStore([subject]);
    assignTaToClass(store, "ta-a", "class-a");
    const app = buildApp({ store });
    apps.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/labs/lab-merge-sort/publish",
      headers: { authorization: "Bearer ta:ta-a" },
    });

    expect(response.statusCode).toBe(200);
    expect(
      new Date(response.json<{ publishedAt: string }>().publishedAt).getTime(),
    ).toBeGreaterThan(subject.deadline.getTime());
  });

  it("publishes a lab after the deadline when its review queue is complete", async () => {
    const context = setup();
    apps.push(context.app);

    const response = await context.app.inject({
      method: "POST",
      url: "/labs/lab-merge-sort/publish",
      headers: { authorization: "Bearer ta:ta-a" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toMatch(/^application\/json/);
    expect(response.json()).toEqual({
      labId: "lab-merge-sort",
      status: "published",
      publishedAt: NOW.toISOString(),
      publishedBy: "ta-a",
    });
    expect(context.subject.publishedAt).toEqual(NOW);
  });

  it("is idempotent and preserves the first publication audit fields", async () => {
    const firstPublish = new Date("2026-11-09T12:00:00.000Z");
    const context = setup(
      lab({ publishedAt: firstPublish, publishedBy: "ta-original" }),
    );
    apps.push(context.app);

    const response = await context.app.inject({
      method: "POST",
      url: "/labs/lab-merge-sort/publish",
      headers: { authorization: "Bearer ta:ta-a" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: "published",
      publishedAt: firstPublish.toISOString(),
      publishedBy: "ta-original",
    });
  });

  it("returns RFC 9457 authentication-required when no token is supplied", async () => {
    const context = setup();
    apps.push(context.app);

    const response = await context.app.inject({
      method: "POST",
      url: "/labs/lab-merge-sort/publish",
    });

    expectProblem(
      response,
      401,
      "authentication-required",
      "/labs/lab-merge-sort/publish",
    );
  });

  it("returns ta-role-required when a student calls it", async () => {
    const context = setup();
    apps.push(context.app);

    const response = await context.app.inject({
      method: "POST",
      url: "/labs/lab-merge-sort/publish",
      headers: { authorization: "Bearer student:student-a" },
    });

    expectProblem(
      response,
      403,
      "ta-role-required",
      "/labs/lab-merge-sort/publish",
    );
  });

  it("hides a lab owned by another class behind lab-not-found", async () => {
    const context = setup();
    apps.push(context.app);

    const response = await context.app.inject({
      method: "POST",
      url: "/labs/lab-merge-sort/publish",
      headers: { authorization: "Bearer ta:ta-b" },
    });

    expectProblem(
      response,
      404,
      "lab-not-found",
      "/labs/lab-merge-sort/publish",
    );
  });

  it("returns lab-not-found for an unknown lab", async () => {
    const context = setup();
    apps.push(context.app);

    const response = await context.app.inject({
      method: "POST",
      url: "/labs/missing/publish",
      headers: { authorization: "Bearer ta:ta-a" },
    });

    expectProblem(response, 404, "lab-not-found", "/labs/missing/publish");
  });

  it("refuses publication before the submission deadline", async () => {
    const context = setup(lab({ deadline: DEADLINE_FUTURE }));
    apps.push(context.app);

    const response = await context.app.inject({
      method: "POST",
      url: "/labs/lab-merge-sort/publish",
      headers: { authorization: "Bearer ta:ta-a" },
    });

    expectProblem(
      response,
      409,
      "submission-deadline-not-reached",
      "/labs/lab-merge-sort/publish",
    );
  });

  it("refuses publication and reports the count while reviews are pending", async () => {
    const context = setup(lab({ pendingReviewCount: 3 }));
    apps.push(context.app);

    const response = await context.app.inject({
      method: "POST",
      url: "/labs/lab-merge-sort/publish",
      headers: { authorization: "Bearer ta:ta-a" },
    });

    expectProblem(
      response,
      409,
      "reviews-pending",
      "/labs/lab-merge-sort/publish",
    );
    expect(response.json()).toMatchObject({ pendingReviewCount: 3 });
    expect(context.subject.publishedAt).toBeNull();
  });

  it("returns RFC 9457 bad-request when Content-Type is json but body is empty", async () => {
    const context = setup();
    apps.push(context.app);

    const response = await context.app.inject({
      method: "POST",
      url: "/labs/lab-merge-sort/publish",
      headers: {
        authorization: "Bearer ta:ta-a",
        "content-type": "application/json",
      },
      body: "",
    });

    expectProblem(response, 400, "bad-request", "/labs/lab-merge-sort/publish");
  });

  it("returns RFC 9457 bad-request when body is malformed JSON", async () => {
    const context = setup();
    apps.push(context.app);

    const response = await context.app.inject({
      method: "POST",
      url: "/labs/lab-merge-sort/publish",
      headers: {
        authorization: "Bearer ta:ta-a",
        "content-type": "application/json",
      },
      body: "{ invalid json",
    });

    expectProblem(response, 400, "bad-request", "/labs/lab-merge-sort/publish");
  });

  it("returns RFC 9457 unsupported-media-type for an unhandled Content-Type", async () => {
    const context = setup();
    apps.push(context.app);

    const response = await context.app.inject({
      method: "POST",
      url: "/labs/lab-merge-sort/publish",
      headers: {
        authorization: "Bearer ta:ta-a",
        "content-type": "application/xml",
      },
      body: "<publish />",
    });

    expectProblem(
      response,
      415,
      "unsupported-media-type",
      "/labs/lab-merge-sort/publish",
    );
  });

  it("returns RFC 9457 not-found for an unknown route", async () => {
    const context = setup();
    apps.push(context.app);

    const response = await context.app.inject({
      method: "GET",
      url: "/unknown-route",
    });

    expectProblem(response, 404, "not-found", "/unknown-route");
  });

  it("strips query parameters from the problem instance path", async () => {
    const context = setup();
    apps.push(context.app);

    const response = await context.app.inject({
      method: "POST",
      url: "/labs/lab-merge-sort/publish?unexpected=1&filter=all",
    });

    expectProblem(
      response,
      401,
      "authentication-required",
      "/labs/lab-merge-sort/publish",
    );
  });

  it("returns RFC 9457 internal-server-error when domain state is inconsistent", async () => {
    const context = setup(
      lab({
        publishedAt: new Date("2026-11-09T12:00:00.000Z"),
        publishedBy: null,
      }),
    );
    apps.push(context.app);

    const response = await context.app.inject({
      method: "POST",
      url: "/labs/lab-merge-sort/publish",
      headers: { authorization: "Bearer ta:ta-a" },
    });

    expectProblem(
      response,
      500,
      "internal-server-error",
      "/labs/lab-merge-sort/publish",
    );
  });
});

function expectProblem(
  response: {
    statusCode: number;
    headers: Record<string, string | string[] | number | undefined>;
    json(): unknown;
  },
  status: number,
  slug: string,
  instance: string,
): void {
  expect(response.statusCode).toBe(status);
  expect(response.headers["content-type"]).toMatch(
    /^application\/problem\+json/,
  );
  expect(response.json()).toMatchObject({
    type: `${PROBLEM_BASE}/${slug}`,
    status,
    instance,
  });
}
