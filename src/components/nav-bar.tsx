"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth/client";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/upload", label: "Upload" },
  { href: "/study", label: "Study" }
];

export default function NavBar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  return (
    <nav className="border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-8 px-4">
        <Link href="/" className="text-lg font-bold text-primary">
          LearnAgain
        </Link>
        {session?.user && (
          <div className="flex gap-1">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
        {session?.user && (
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-muted">
              {session.user.name || session.user.email}
            </span>
            <button
              onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/auth"; } } })}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
