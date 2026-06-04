"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInWithEmail } from "./actions";
import OAuthButtons from "@/components/oauth-buttons";

export default function SignInForm() {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center">
      <div className="w-sm">
        <h1 className="mb-6 text-center text-2xl/9 font-bold text-foreground">
          Sign in to your account
        </h1>
      </div>

      <OAuthButtons />

      <div className="my-6 flex w-sm items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-sm text-muted">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form
        action={formAction}
        className="flex w-sm flex-col gap-5"
      >
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="john@my-company.com"
            className="block w-full rounded-md border border-border bg-card px-2 py-1.5 text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="*****"
            className="block w-full rounded-md border border-border bg-card px-2 py-1.5 text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
          />
        </div>

        {state?.error && (
          <div className="rounded-md px-3 py-2 text-sm text-danger">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm/6 font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/auth/sign-up" className="font-medium text-primary hover:text-primary-hover">
          Sign up
        </Link>
      </p>
    </div>
  );
}
