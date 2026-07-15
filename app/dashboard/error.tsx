"use client";

import Header from "@/app/components/Header";
import AppIcon from "@/app/components/AppIcon";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-transparent text-slate-950 dark:text-white">
      <Header />
      <main className="mx-auto flex max-w-4xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="app-empty-state min-h-[28rem] w-full">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-300"><AppIcon name="activity" className="h-7 w-7" /></span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-red-600 dark:text-red-300">Something went wrong</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">We couldn’t load this workspace</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">Your data is safe. Try loading the page again, or return to the overview.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3"><button type="button" onClick={reset} className="app-button-primary">Try again</button><a href="/dashboard" className="app-button-outline">Back to overview</a></div>
        </section>
      </main>
    </div>
  );
}
