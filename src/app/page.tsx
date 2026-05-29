import { auth } from "@/lib/auth/server";
import Link from "next/link";
import Dashboard from "@/components/dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: session } = await auth.getSession();

  if (session?.user) {
    return <Dashboard />;
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-bold text-primary">LearnAgain</h1>
      <p className="text-sm text-muted">Sign in to start studying</p>
      <div className="flex items-center gap-4">
        <Link
          href="/auth/sign-up"
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Sign up
        </Link>
        <Link
          href="/auth/sign-in"
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-card"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
