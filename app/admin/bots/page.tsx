import Header from "../../components/Header";
import { requireAdminUser } from "@/lib/auth";
import { getAdminBots } from "@/lib/admin";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminBotsPage() {
  const admin = await requireAdminUser();
  if (!admin) redirect("/login?next=/admin/bots");

  const bots = await getAdminBots();

  return (
    <div className="min-h-screen bg-transparent text-zinc-950 dark:text-white">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="app-card p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold tracking-tight">Agents</h1>
          </div>
          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-zinc-200">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-[0.15em] text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Owner Credit</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Usage</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {bots.map((bot) => (
                  <tr key={bot.id}>
                    <td className="px-4 py-4">
                      <div className="font-medium text-zinc-900">{bot.bot_name}</div>
                      <div className="text-zinc-500">{bot.business_name}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div>{bot.owner_name}</div>
                      <div className="text-zinc-500">{bot.owner_email}</div>
                    </td>
                    <td className="px-4 py-4">{bot.credit_balance}</td>
                    <td className="px-4 py-4">{bot.status}</td>
                    <td className="px-4 py-4">{bot.usage_count}</td>
                    <td className="px-4 py-4">
                      <Link href={`/admin/bots/${bot.id}`} className="app-button-primary min-h-9 px-3 py-1.5 text-xs">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
