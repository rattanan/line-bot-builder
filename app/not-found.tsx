import Link from "next/link";
import BrandLogo from "./components/BrandLogo";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-16 sm:px-6">
      <section className="app-empty-state min-h-[32rem] w-full">
        <BrandLogo showName={false} markClassName="h-16 w-16" />
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-300">404 · Page not found</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-950 dark:text-white sm:text-4xl">This conversation took a wrong turn</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">The page may have moved or the link is no longer available.</p>
        <Link href="/dashboard" className="app-button-primary mt-7">Return to workspace</Link>
      </section>
    </main>
  );
}
