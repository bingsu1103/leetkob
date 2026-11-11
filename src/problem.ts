export const PROBLEM_BASE = "https://leetkob.example/problems";

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

export function problem(
  slug: string,
  title: string,
  status: number,
  detail: string,
  instance: string,
): ProblemDetails {
  return {
    type: `${PROBLEM_BASE}/${slug}`,
    title,
    status,
    detail,
    instance,
  };
}
