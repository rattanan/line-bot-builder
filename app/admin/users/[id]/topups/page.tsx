import Header from "../../../../components/Header";
import TopupHistoryTable from "@/app/components/TopupHistoryTable";
import { requireAdminUser } from "@/lib/auth";
import { findUserById } from "@/lib/users";
import { listTopupOrders } from "@/lib/topup";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminUserTopupsPage({ params }: PageProps<"/admin/users/[id]/topups">) {
  const admin = await requireAdminUser();
  if (!admin) redirect("/login?next=/admin/users");

  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) notFound();

  const user = await findUserById(userId);
  if (!user) notFound();
  const orders = await listTopupOrders(userId);

  return (
    <div className="min-h-screen bg-transparent text-zinc-950 dark:text-white">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="app-card p-8">
          <Link href="/admin/users" className="text-sm text-zinc-500 hover:text-zinc-950">← Back to users</Link>
          <span className="mt-5 block text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Admin · Top-up history</span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{user.full_name}</h1>
          <p className="mt-2 text-sm text-zinc-600">{user.email} · {orders.length} orders</p>
          <TopupHistoryTable orders={orders} />
        </section>
      </main>
    </div>
  );
}
