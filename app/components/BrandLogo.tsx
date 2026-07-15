import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  showName?: boolean;
  className?: string;
  markClassName?: string;
  nameClassName?: string;
};

function BrandMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      role="img"
      aria-label="AI Sales Companion"
    >
      <defs>
        <linearGradient id="brand-mark-gradient" x1="5" y1="4" x2="35" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="0.55" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="brand-mark-shine" x1="10" y1="8" x2="30" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.28" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#brand-mark-gradient)" />
      <path d="M7 15.5C7 10.8 10.8 7 15.5 7h9C29.2 7 33 10.8 33 15.5v6c0 4.7-3.8 8.5-8.5 8.5h-7.2l-6.8 4.5V29A8.5 8.5 0 0 1 7 22.1v-6.6Z" fill="url(#brand-mark-shine)" />
      <path d="M11 25.5v-10a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4h-8l-6 4v-5Z" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 21v-2M20 21v-4.5M24 21v-7" stroke="white" strokeWidth="2.3" strokeLinecap="round" />
      <circle cx="30.5" cy="9.5" r="2.5" fill="#A5F3FC" />
    </svg>
  );
}

export default function BrandLogo({
  href = "/",
  showName = true,
  className = "inline-flex items-center gap-3",
  markClassName = "h-10 w-10 shrink-0",
  nameClassName = "text-sm font-bold tracking-[-0.02em] text-slate-950 dark:text-white sm:text-base",
}: BrandLogoProps) {
  return (
    <Link href={href} className={className} aria-label="AI Sales Companion home">
      <BrandMark className={markClassName} />
      {showName && <span className={nameClassName}>AI Sales Companion</span>}
    </Link>
  );
}

export { BrandMark };
