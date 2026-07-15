import type { ReactNode } from "react";

export type AppIconName =
  | "dashboard"
  | "agents"
  | "sparkles"
  | "wallet"
  | "history"
  | "users"
  | "settings"
  | "menu"
  | "collapse"
  | "logout"
  | "chevron"
  | "plus"
  | "search"
  | "book"
  | "activity"
  | "arrow"
  | "help";

export default function AppIcon({ name, className = "h-5 w-5" }: { name: AppIconName; className?: string }) {
  const paths: Record<AppIconName, ReactNode> = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    agents: <><circle cx="9" cy="8" r="4" /><path d="M2.5 21v-2a5.5 5.5 0 0 1 5.5-5.5h2A5.5 5.5 0 0 1 15.5 19v2M16 4.5a4 4 0 0 1 0 7M18 14a5.5 5.5 0 0 1 3.5 5.1V21" /></>,
    sparkles: <path d="m12 3-1.2 3.1a3 3 0 0 1-1.7 1.7L6 9l3.1 1.2a3 3 0 0 1 1.7 1.7L12 15l1.2-3.1a3 3 0 0 1 1.7-1.7L18 9l-3.1-1.2a3 3 0 0 1-1.7-1.7L12 3ZM5 15l-.6 1.4A2.7 2.7 0 0 1 3 17.8l-1 .4 1 .4A2.7 2.7 0 0 1 4.4 20L5 21.5l.6-1.5A2.7 2.7 0 0 1 7 18.6l1-.4-1-.4a2.7 2.7 0 0 1-1.4-1.4L5 15Z" />,
    wallet: <><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H19a2 2 0 0 1 2 2v13H6a2 2 0 0 1-2-2V6.5Z" /><path d="M4 8h15M16 12h5v4h-5a2 2 0 0 1 0-4Z" /></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    collapse: <path d="m14 7-5 5 5 5" />,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></>,
    activity: <path d="M3 12h4l2.5-7 5 14 2.5-7h4" />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.4 2.4 0 0 1 4.7.7c0 1.8-2.5 2.1-2.5 3.8M12 17.5h.01" /></>,
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
