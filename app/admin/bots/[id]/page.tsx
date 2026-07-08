import Header from "../../../components/Header";
import { requireAdminUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import BotDetailClient from "./bot-detail-client";

export default async function AdminBotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminUser();
  if (!admin) redirect("/login?next=/admin/bots");
  const { id } = await params;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(244,244,245,0.95),white_42%,#f8fafc_100%)] text-zinc-950">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <BotDetailClient botId={Number(id)} />
      </main>
    </div>
  );
}
