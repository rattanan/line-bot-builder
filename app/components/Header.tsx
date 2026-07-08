"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type SessionUser = {
  username: string;
  fullName: string;
  role: string;
} | null;

export default function Header() {
  const [user, setUser] = useState<SessionUser>(null);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const loadSession = async () => {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user ?? null);
    };

    loadSession();
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  const navLinkClass =
    "rounded-full px-3 py-2 transition-colors hover:bg-zinc-100 hover:text-zinc-950";

  return (
    <header className="border-b border-black/5 bg-white/80 px-4 py-4 backdrop-blur-md sm:px-6">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-semibold tracking-tight text-zinc-950">
            Line Legal Bot
          </Link>
          {user && (
            <Link
              href="/admin"
              className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-950"
            >
              {user.role}
            </Link>
          )}
        </div>

        <button
          className="inline-flex items-center rounded-full border border-zinc-200 px-3 py-2 text-sm text-zinc-700 sm:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          Menu
        </button>

        <div className={`${isOpen ? "flex" : "hidden"} w-full flex-col gap-2 sm:flex sm:w-auto sm:flex-row sm:items-center`}>
          <Link href="/" className={navLinkClass}>
            Home
          </Link>
          <Link href="/chat-test" className={navLinkClass}>
            Chat Test
          </Link>
          <Link href="/faq" className={navLinkClass}>
            FAQ
          </Link>
          <Link href="/chat-log" className={navLinkClass}>
            Chat Log
          </Link>
          {user ? (
            <>
              <Link
                href="/admin"
                className="rounded-full bg-zinc-100 px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-200 hover:text-zinc-950"
              >
                {user.fullName}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full bg-zinc-950 px-3 py-2 text-sm text-white transition-transform hover:-translate-y-0.5"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded-full bg-zinc-950 px-3 py-2 text-sm text-white transition-transform hover:-translate-y-0.5">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
