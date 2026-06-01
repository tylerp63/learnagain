import { auth } from "@/lib/auth/server";

export async function requireUser() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { user: null } as const;
  }
  return { user: session.user } as const;
}
