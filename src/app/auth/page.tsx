"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import OAuthButtons from "@/components/oauth-buttons";

export default function AuthPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      router.replace("/");
    }
  }, [session, router]);

  if (isPending || session?.user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center">
      <div className="w-sm">
        <h1 className="mb-2 text-center text-2xl font-bold text-foreground">
          Welcome to LearnAgain
        </h1>
        <p className="mb-8 text-center text-sm text-muted">
          Sign in to your account or create a new one
        </p>
      </div>

      <OAuthButtons />

      <div className="my-6 flex w-sm items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-sm text-muted">or continue with email</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex w-sm flex-col gap-3">
        <Link
          href="/auth/sign-in"
          className="flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Sign in with email
        </Link>
        <Link
          href="/auth/sign-up"
          className="flex w-full justify-center rounded-md border border-border px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-card"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
