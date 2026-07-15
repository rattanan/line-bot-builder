import Header from "../../../components/Header";
import TopupHistoryTable from "@/app/components/TopupHistoryTable";
import { getSessionUser } from "@/lib/auth";
import { listTopupOrders } from "@/lib/topup";
import { redirect } from "next/navigation";
import Link from "next/link";
import LocalizedText from "@/app/components/LocalizedText";

export default async function TopupHistoryPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard/topup/history");
  const orders = await listTopupOrders(user.id);

  return (
    <div className="min-h-screen bg-transparent text-zinc-950 dark:text-white">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="app-card p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500"><LocalizedText english="Credits & Billing" thai="เครดิตและการชำระเงิน" /></span>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight"><LocalizedText english="Billing history" thai="ประวัติการเติมเครดิต" /></h1>
              <p className="mt-2 text-sm text-zinc-600"><LocalizedText english="Review the amount, status, and date of every credit order." thai="ตรวจสอบยอดเครดิต สถานะ และวันเวลาของรายการทั้งหมด" /></p>
            </div>
            <Link href="/dashboard/topup" className="app-button-primary"><LocalizedText english="Add credits" thai="เติมเครดิต" /></Link>
          </div>
          <TopupHistoryTable orders={orders} linkToDetails />
        </section>
      </main>
    </div>
  );
}
