import AppIcon from "@/app/components/AppIcon";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="sticky top-0 z-40 flex h-18 items-center border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 sm:px-6 lg:px-8">
        <div className="app-skeleton h-9 w-48 rounded-xl" />
      </div>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10" aria-busy="true" aria-label="Loading workspace">
        <div className="app-page-header">
          <div className="app-skeleton h-3 w-32 rounded-full" />
          <div className="app-skeleton mt-5 h-10 w-full max-w-lg rounded-xl" />
          <div className="app-skeleton mt-4 h-4 w-full max-w-xl rounded-full" />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <div key={item} className="app-card p-5"><div className="flex justify-between"><div className="app-skeleton h-4 w-24 rounded-full" /><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-300 dark:bg-blue-400/10"><AppIcon name="activity" /></span></div><div className="app-skeleton mt-5 h-8 w-20 rounded-lg" /><div className="app-skeleton mt-5 h-3 w-32 rounded-full" /></div>)}
        </div>
        <div className="app-card mt-6 p-6"><div className="app-skeleton h-5 w-36 rounded-lg" /><div className="mt-6 space-y-4">{[0, 1, 2].map((item) => <div key={item} className="app-skeleton h-16 w-full rounded-xl" />)}</div></div>
      </main>
    </div>
  );
}
