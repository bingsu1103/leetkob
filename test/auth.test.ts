import { describe, expect, it } from "vitest";

import { authenticate } from "../src/auth.js";

describe("authenticate", () => {
  it.each([
    undefined,
    "",
    "Basic value",
    "Bearer ",
    "Bearer unknown:user",
    "Bearer ta:",
  ])("rejects malformed authorization %s", (authorization) => {
    expect(authenticate(authorization)).toBeNull();
  });

  it("accepts a supported role and non-empty identifier", () => {
    expect(authenticate("Bearer admin:admin-1")).toEqual({
      id: "admin-1",
      role: "admin",
    });
  });
});
