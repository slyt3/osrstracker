import { prisma } from "@/lib/prisma";

// Dev-user stub. Per-user tables carry a userId from day one; until auth lands
// (M6) every per-user query resolves to this one hardcoded user. Swapping this
// for a real session lookup is the whole of the auth migration — no schema or
// query changes. See plan.md.
export const DEV_USER_ID = "dev-user";

export async function currentUserId(): Promise<string> {
  // TODO(M6): replace with the authenticated session's user id.
  return DEV_USER_ID;
}

/** Ensures the dev user row exists; call from a seed script. */
export async function ensureDevUser(): Promise<void> {
  await prisma.user.upsert({
    where: { id: DEV_USER_ID },
    update: {},
    create: { id: DEV_USER_ID, email: "dev@localhost", plan: "free" },
  });
}
