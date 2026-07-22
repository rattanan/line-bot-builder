import Header from "@/app/components/Header";
import { getSessionUser } from "@/lib/auth";
import { getBotById } from "@/lib/bots";
import { notFound, redirect } from "next/navigation";
import WidgetDemoClient from "./widget-demo-client";

type PageProps = { params: Promise<{ id: string }> };

export default async function WidgetDemoPage({ params }: PageProps) {
  const { id: idParam } = await params;
  const returnTo = `/dashboard/bots/${idParam}/widget-demo`;
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);

  const botId = Number(idParam);
  if (!Number.isSafeInteger(botId) || botId <= 0) notFound();

  const bot = await getBotById(botId);
  if (!bot || bot.user_id !== user.id) notFound();

  return (
    <div className="min-h-screen bg-transparent text-slate-950 dark:text-white">
      <Header />
      <WidgetDemoClient
        botId={bot.id}
        botName={bot.bot_name}
        widgetToken={bot.widget_public_token}
      />
    </div>
  );
}
