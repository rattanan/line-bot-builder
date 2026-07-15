import { getSessionUser } from "@/lib/auth";
import { getBotsByUserId } from "@/lib/bots";
import { redirect } from "next/navigation";
import BusinessInsightDashboard from "./business-insight-dashboard";

export default async function BusinessInsightPage({
  searchParams,
}: {
  searchParams: Promise<{ bot?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard/insights");

  const bots = await getBotsByUserId(user.id);
  const requestedBotId = Number((await searchParams).bot);
  const initialBotId = bots.some((bot) => bot.id === requestedBotId) ? requestedBotId : bots[0]?.id;
  return (
    <BusinessInsightDashboard
      initialBotId={initialBotId}
      bots={bots.map((bot) => ({
        id: bot.id,
        name: bot.bot_name,
        businessName: bot.business_name,
      }))}
    />
  );
}
