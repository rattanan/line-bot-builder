import { openAICompatibleChat } from "./ai/openai-compatible";

type ExtractedFaq = {
  question: string;
  answer: string;
  category: string;
  confidenceScore: number;
  sourceType: "website";
  languageCode: string;
};

type CrawledPage = {
  url: string;
  text: string;
};

function normalizeUrl(input: string) {
  const value = input.trim();
  if (!value) throw new Error("Website URL is required");
  return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
}

function extractReadableText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractInternalLinks(html: string, pageUrl: URL, rootHost: string) {
  const links = new Set<string>();
  for (const match of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
    try {
      const next = new URL(match[1], pageUrl);
      if (!["http:", "https:"].includes(next.protocol)) continue;
      if (next.hostname !== rootHost) continue;
      next.hash = "";
      links.add(next.toString());
    } catch {
      // Ignore malformed links from third-party widgets or tracking snippets.
    }
  }
  return Array.from(links);
}

async function fetchPage(url: string) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "LineBotBuilderKnowledgeCrawler/1.0" },
    signal: AbortSignal.timeout(12000),
  });
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok || !contentType.includes("text/html")) {
    return null;
  }
  return response.text();
}

async function generateFaqsFromWebsiteText(pages: CrawledPage[]): Promise<ExtractedFaq[]> {
  const context = pages
    .map((page) => `URL: ${page.url}\n${page.text.slice(0, 2500)}`)
    .join("\n\n---\n\n")
    .slice(0, 18000);

  if (!context.trim()) return [];

  try {
    const { content } = await openAICompatibleChat(
      [
        { role: "system", content: "You generate concise FAQ drafts from website text. Return strict JSON only." },
        {
          role: "user",
          content: `Create 5-15 useful customer FAQs in Thai from this website text. Return JSON: {"faqs":[{"question":"string","answer":"string","category":"string","confidenceScore":0.0,"languageCode":"th"}]}\n\n${context}`,
        },
      ],
      { temperature: 0.2, maxTokens: 1800, timeoutMs: 45000 }
    );
    const parsed = JSON.parse(content) as { faqs?: Array<Partial<ExtractedFaq>> };
    return (parsed.faqs || [])
      .filter((faq) => faq.question && faq.answer)
      .slice(0, 15)
      .map((faq) => ({
        question: String(faq.question),
        answer: String(faq.answer),
        category: String(faq.category || "website"),
        confidenceScore: Number(faq.confidenceScore || 0.75),
        sourceType: "website",
        languageCode: String(faq.languageCode || "th"),
      }));
  } catch (error) {
    console.error("Website FAQ generation failed:", error);
    return [
      {
        question: "เว็บไซต์นี้มีข้อมูลอะไรบ้าง?",
        answer: context.slice(0, 500),
        category: "website",
        confidenceScore: 0.55,
        sourceType: "website",
        languageCode: "th",
      },
    ];
  }
}

export async function crawlWebsiteForKnowledge(input: { url: string; maxDepth: number; maxPages: number }) {
  const start = normalizeUrl(input.url);
  const queue: Array<{ url: string; depth: number }> = [{ url: start.toString(), depth: 0 }];
  const seen = new Set<string>();
  const pages: CrawledPage[] = [];
  const maxDepth = Math.max(0, input.maxDepth);
  const maxPages = Math.max(1, input.maxPages);

  while (queue.length && pages.length < maxPages) {
    const item = queue.shift();
    if (!item || seen.has(item.url) || item.depth > maxDepth) continue;
    seen.add(item.url);

    const html = await fetchPage(item.url);
    if (!html) continue;
    const pageUrl = new URL(item.url);
    const text = extractReadableText(html).slice(0, 8000);
    if (text) pages.push({ url: item.url, text });

    if (item.depth < maxDepth) {
      for (const link of extractInternalLinks(html, pageUrl, start.hostname)) {
        if (!seen.has(link) && queue.length + pages.length < maxPages * 2) {
          queue.push({ url: link, depth: item.depth + 1 });
        }
      }
    }
  }

  return {
    pages,
    extractedFaqs: await generateFaqsFromWebsiteText(pages),
  };
}

export async function crawlWebsiteForKnowledgeBackground(input: { url: string; maxDepth: number; maxPages: number }) {
  return crawlWebsiteForKnowledge(input);
}
