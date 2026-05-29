"use client";

import { useActionState } from "react";
import { signInWithEmail } from "./actions";
import OAuthButtons from "@/components/oauth-buttons";

export default function SignInForm() {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900">
      <div className="w-sm">
        <h1 className="mb-6 text-center text-2xl/9 font-bold text-white">
          Sign in to your account
        </h1>
      </div>

      <OAuthButtons />

      <div className="my-6 flex w-sm items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-sm text-gray-400">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form
        action={formAction}
        className="flex w-sm flex-col gap-5"
      >
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-100"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="john@my-company.com"
            className="block rounded-md w-full bg-white/5 px-2 py-1.5 placeholder:text-gray-500 text-white outline-1 outline-white/10 focus:outline-indigo-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-100"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="*****"
            className="block rounded-md w-full bg-white/5 px-2 py-1.5 placeholder:text-gray-500 text-white outline-1 outline-white/10 focus:outline-indigo-500"
          />
        </div>

        {state?.error && (
          <div className="rounded-md px-3 py-2 text-sm text-red-500">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
