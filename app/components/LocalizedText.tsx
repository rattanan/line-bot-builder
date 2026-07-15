"use client";

import { useLanguage } from "./LanguageProvider";

export default function LocalizedText({ english, thai }: { english: string; thai: string }) {
  const { text } = useLanguage();
  return <>{text(english, thai)}</>;
}
