export type UserRole = "admin" | "ta" | "student";

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
}

export interface Lab {
  id: string;
  classId: string;
  title: string;
  deadline: Date;
  pendingReviewCount: number;
  publishedAt: Date | null;
  publishedBy: string | null;
}

export interface Store {
  labs: Map<string, Lab>;
  taClassIds: Map<string, Set<string>>;
}

export interface PublishLabResponse {
  labId: string;
  status: "published";
  publishedAt: string;
  publishedBy: string;
}

export function createStore(labs: Lab[] = []): Store {
  return {
    labs: new Map(labs.map((lab) => [lab.id, lab])),
    taClassIds: new Map(),
  };
}

export function assignTaToClass(
  store: Store,
  taId: string,
  classId: string,
): void {
  const classIds = store.taClassIds.get(taId) ?? new Set<string>();
  classIds.add(classId);
  store.taClassIds.set(taId, classIds);
}
