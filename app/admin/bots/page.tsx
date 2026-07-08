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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(244,244,245,0.95),white_42%,#f8fafc_100%)] text-zinc-950">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-black/5 bg-white/80 p-8 shadow-[0_10px_40px_rgba(24,24,27,0.06)]">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold tracking-tight">Bots</h1>
          </div>
          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-zinc-200">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-[0.15em] text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Bot</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Credit</th>
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
                      <Link href={`/admin/bots/${bot.id}`} className="rounded-full bg-zinc-950 px-4 py-2 text-xs text-white">
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
