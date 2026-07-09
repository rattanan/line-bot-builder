# AI Knowledge Onboarding Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a step-by-step bot creation wizard that gathers business info, kicks off background website and image ingestion, merges generated FAQs into drafts, and lets a human approve FAQs before they become active.

**Architecture:** Extend the existing bot creation flow with a durable wizard record and a separate draft knowledge store so approved FAQs remain immutable. Keep long-running website crawl and vision/OCR work asynchronous, then merge all generated candidates into a single review list with source metadata and confidence scoring.

**Tech Stack:** Next.js 16 app routes, React client pages, MySQL, existing AI helpers in `lib/ai/*`, existing FAQ/bot data access in `lib/faq.ts` and `lib/bots.ts`, file uploads through the current storage pattern used by the top-up flow.

---

### Task 1: Define the wizard data model and migrations

**Files:**
- Modify: `sql/faq-table.sql`
- Create: `sql/bot-knowledge-wizard-table.sql`
- Create: `sql/bot-knowledge-candidates-table.sql`
- Modify: `sql/topup-migration.sql` if a bootstrap migration path is needed for local/dev environments
- Modify: `lib/mysql.ts` only if helper support for new schema checks is required

- [ ] **Step 1: Add a durable wizard table for onboarding jobs**

```sql
CREATE TABLE IF NOT EXISTS bot_knowledge_wizard (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bot_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  website_url VARCHAR(2048) DEFAULT NULL,
  status ENUM('draft','scraping','extracting_images','generating_faq','ready_for_review','approved','cancelled') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  KEY idx_bot_id (bot_id),
  KEY idx_user_id (user_id),
  CONSTRAINT fk_bot_knowledge_wizard_bot_id FOREIGN KEY (bot_id) REFERENCES bots (id) ON DELETE CASCADE,
  CONSTRAINT fk_bot_knowledge_wizard_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

- [ ] **Step 2: Add a draft knowledge candidate table**

```sql
CREATE TABLE IF NOT EXISTS bot_knowledge_candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bot_id INT UNSIGNED NOT NULL,
  wizard_id INT NOT NULL,
  question VARCHAR(255) NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) DEFAULT NULL,
  confidence_score DECIMAL(5,4) NOT NULL DEFAULT 0,
  source_type ENUM('description','image','website') NOT NULL,
  source_ref VARCHAR(2048) DEFAULT NULL,
  language_code VARCHAR(10) NOT NULL DEFAULT 'th',
  status ENUM('draft','approved','rejected','merged') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  KEY idx_bot_id (bot_id),
  KEY idx_wizard_id (wizard_id),
  KEY idx_status (status),
  KEY idx_question (question),
  CONSTRAINT fk_bot_knowledge_candidates_bot_id FOREIGN KEY (bot_id) REFERENCES bots (id) ON DELETE CASCADE,
  CONSTRAINT fk_bot_knowledge_candidates_wizard_id FOREIGN KEY (wizard_id) REFERENCES bot_knowledge_wizard (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

- [ ] **Step 3: Add FAQ source metadata columns without breaking active FAQ usage**

```sql
ALTER TABLE faq
  ADD COLUMN IF NOT EXISTS source_type ENUM('manual','description','image','website') NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_ref VARCHAR(2048) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS source_meta LONGTEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS language_code VARCHAR(10) NOT NULL DEFAULT 'th',
  ADD COLUMN IF NOT EXISTS faq_status ENUM('draft','active','archived') NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(5,4) NOT NULL DEFAULT 1.0000,
  ADD COLUMN IF NOT EXISTS wizard_id INT DEFAULT NULL;
```

- [ ] **Step 4: Verify the schema locally**

Run:

```bash
mysql -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < sql/bot-knowledge-wizard-table.sql
mysql -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < sql/bot-knowledge-candidates-table.sql
mysql -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < sql/topup-migration.sql
```

Expected:

- Tables are created successfully.
- Existing `faq` rows remain readable.
- No approved FAQ data is overwritten.

---

### Task 2: Add wizard persistence and candidate management helpers

**Files:**
- Create: `lib/bot-knowledge-wizard.ts`
- Modify: `lib/faq.ts`
- Modify: `lib/bots.ts`
- Modify: `lib/mysql.ts` only if transaction helpers need small adjustments

- [ ] **Step 1: Implement wizard CRUD helpers**

```ts
export type BotKnowledgeWizardStatus =
  | "draft"
  | "scraping"
  | "extracting_images"
  | "generating_faq"
  | "ready_for_review"
  | "approved"
  | "cancelled";

export type BotKnowledgeWizard = {
  id: number;
  bot_id: number;
  user_id: number;
  website_url: string | null;
  status: BotKnowledgeWizardStatus;
  created_at: string;
  updated_at: string | null;
};
```

- [ ] **Step 2: Implement candidate FAQ CRUD helpers**

```ts
export type KnowledgeCandidateStatus = "draft" | "approved" | "rejected" | "merged";

export type KnowledgeCandidate = {
  id: number;
  bot_id: number;
  wizard_id: number;
  question: string;
  answer: string;
  category: string | null;
  confidence_score: number;
  source_type: "description" | "image" | "website";
  source_ref: string | null;
  language_code: string;
  status: KnowledgeCandidateStatus;
  created_at: string;
  updated_at: string | null;
};
```

- [ ] **Step 3: Add merge and approval helpers that never modify approved FAQ rows**

```ts
export async function approveKnowledgeCandidate(candidateId: number): Promise<FAQ | null>;
export async function archiveApprovedFAQ(faqId: number): Promise<FAQ | null>;
export async function mergeKnowledgeCandidates(wizardId: number): Promise<KnowledgeCandidate[]>;
```

- [ ] **Step 4: Keep normal FAQ lookups unchanged for runtime answering**

```ts
export async function getActiveFaqsByBot(botId: number): Promise<FAQ[]> {
  return getFAQData(botId).then((rows) => rows.filter((row) => row.is_active === 1 && row.faq_status === "active"));
}
```

- [ ] **Step 5: Verify helper behavior with a small smoke run**

Run:

```bash
npm run build
```

Expected:

- The new helper module type-checks.
- Existing bot and FAQ consumers still compile.

---

### Task 3: Extend AI generation for merged draft knowledge

**Files:**
- Modify: `lib/bot-wizard.ts`
- Create: `lib/knowledge-merger.ts`
- Create: `lib/website-scraper.ts`
- Create: `lib/vision-extractor.ts`

- [ ] **Step 1: Update the business-details generator to emit draft-friendly output**

```ts
export type WizardInput = {
  storeName: string;
  businessCategory: string;
  storeDescription: string;
  targetCustomers: string;
  services: string;
  openingHours: string;
  contactChannels: string;
  tone: string;
  languageCodes: string[];
};
```

- [ ] **Step 2: Make the AI prompt return source-aware draft candidates**

```ts
type CandidatePayload = {
  question: string;
  answer: string;
  category: string;
  confidenceScore: number;
  sourceType: "description" | "image" | "website";
  languageCode: string;
};
```

- [ ] **Step 3: Add a merge utility that de-duplicates candidates and preserves source refs**

```ts
export function mergeCandidatesByNormalizedQuestion(
  candidates: KnowledgeCandidate[]
): KnowledgeCandidate[];
```

- [ ] **Step 4: Add a website crawler that respects depth and page caps**

```ts
export async function crawlWebsiteForKnowledge(input: {
  url: string;
  maxDepth: number;
  maxPages: number;
}): Promise<{ pages: Array<{ url: string; text: string }>; extractedFaqs: CandidatePayload[] }>;
```

- [ ] **Step 5: Add a vision/OCR extractor for uploaded images**

```ts
export async function extractKnowledgeFromImages(files: Array<{ url: string; type: string }>): Promise<{
  items: Array<{ sourceRef: string; extractedText: string; extractedFaqs: CandidatePayload[] }>;
}>;
```

- [ ] **Step 6: Verify the generators still fall back safely**

Run:

```bash
npm run build
```

Expected:

- The existing wizard preview still renders.
- Generation failures fall back to the current deterministic FAQ seed behavior.

---

### Task 4: Add wizard API routes for create, background jobs, and review

**Files:**
- Create: `app/api/dashboard/bots/[id]/knowledge-wizard/route.ts`
- Create: `app/api/dashboard/bots/[id]/knowledge-wizard/crawl/route.ts`
- Create: `app/api/dashboard/bots/[id]/knowledge-wizard/images/route.ts`
- Create: `app/api/dashboard/bots/[id]/knowledge-wizard/review/route.ts`
- Modify: `app/api/dashboard/bots/route.ts`
- Modify: `app/api/dashboard/bots/wizard/route.ts`

- [ ] **Step 1: Create the wizard record when bot creation starts**

```ts
export async function POST(req: NextRequest, context: RouteContext<"/api/dashboard/bots/[id]/knowledge-wizard">) {
  const { id: botId } = await context.params;
  const body = await req.json();
  const wizard = await createBotKnowledgeWizard({
    botId: Number(botId),
    userId: sessionUser.id,
    websiteUrl: body.websiteUrl || null,
  });
  return NextResponse.json({ wizard }, { status: 201 });
}
```

- [ ] **Step 2: Kick off website crawl in the background**

```ts
export async function POST(req: NextRequest, context: RouteContext<"/api/dashboard/bots/[id]/knowledge-wizard/crawl">) {
  const { id: botId } = await context.params;
  const { wizardId, websiteUrl } = await req.json();
  const result = await crawlWebsiteForKnowledge({ url: websiteUrl, maxDepth: 3, maxPages: 30 });
  await saveWebsiteCandidates(Number(botId), wizardId, result.extractedFaqs);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Handle image upload and extraction**

```ts
export async function POST(req: NextRequest, context: RouteContext<"/api/dashboard/bots/[id]/knowledge-wizard/images">) {
  const { id: botId } = await context.params;
  const formData = await req.formData();
  const files = formData.getAll("images");
  const uploaded = await storeKnowledgeWizardImages(files);
  const result = await extractKnowledgeFromImages(uploaded);
  await saveImageCandidates(Number(botId), Number(formData.get("wizardId")), result.items);
  return NextResponse.json({ ok: true, uploadedCount: uploaded.length });
}
```

- [ ] **Step 4: Return merged review data**

```ts
export async function GET(req: NextRequest, context: RouteContext<"/api/dashboard/bots/[id]/knowledge-wizard/review">) {
  const { id: botId } = await context.params;
  const candidates = await listWizardCandidates(Number(botId), Number(req.nextUrl.searchParams.get("wizardId")));
  return NextResponse.json({ candidates: mergeCandidatesByNormalizedQuestion(candidates) });
}
```

- [ ] **Step 5: Approve selected FAQs without touching existing approved rows**

```ts
export async function POST(req: NextRequest, context: RouteContext<"/api/dashboard/bots/[id]/knowledge-wizard/review">) {
  const { id: botId } = await context.params;
  const { approvedCandidateIds } = await req.json();
  const result = await approveSelectedKnowledgeCandidates(Number(botId), approvedCandidateIds);
  return NextResponse.json(result);
}
```

- [ ] **Step 6: Verify the new routes return JSON and enforce bot ownership**

Run:

```bash
npm run build
```

Expected:

- Routes compile.
- Unauthorized users cannot access another bot's wizard data.

---

### Task 5: Replace the current bot creation page with the new 3-step wizard

**Files:**
- Modify: `app/dashboard/bots/new/page.tsx`
- Modify: `app/dashboard/bots/new/page.tsx` if stepper logic needs local subcomponents
- Modify: `app/components/Header.tsx` only if navigation labels need to point to the wizard

- [ ] **Step 1: Add stepper state for bot name + optional website first**

```ts
type WizardStep = 1 | 2 | 3;
```

- [ ] **Step 2: Render the business info form and multi-image upload**

```tsx
<input name="botName" />
<input name="websiteUrl" />
<textarea name="storeName" />
<input type="file" multiple accept="image/png,image/jpeg,image/webp" />
```

- [ ] **Step 3: Show merged review with expandable source details**

```tsx
{candidates.map((candidate) => (
  <details key={candidate.id}>
    <summary>{candidate.question}</summary>
    <p>{candidate.answer}</p>
    <pre>{JSON.stringify(candidate.sources, null, 2)}</pre>
  </details>
))}
```

- [ ] **Step 4: Add approve and continue buttons**

```tsx
<button type="button" onClick={handleApprove}>Approve selected FAQs</button>
<button type="button" onClick={() => router.push(`/dashboard/bots/${botId}/settings`)}>Go to Bot Setting</button>
```

- [ ] **Step 5: Keep the old wizard preview fields only if they still help create the initial bot**

Run:

```bash
npm run build
```

Expected:

- The new wizard still creates a bot successfully.
- The user can finish bot creation and then move directly to Bot Setting.

---

### Task 6: Add bot knowledge review UI and source inspection

**Files:**
- Create: `app/dashboard/bots/[id]/knowledge/page.tsx`
- Create: `app/dashboard/bots/[id]/knowledge/candidate-card.tsx`
- Modify: `app/dashboard/bots/[id]/settings/page.tsx` to add a link back to review

- [ ] **Step 1: Build the unified review list page**

```tsx
export default function BotKnowledgeReviewPage() {
  return <main>{/* merged candidates, filters, search */}</main>;
}
```

- [ ] **Step 2: Add source drill-down per FAQ**

```tsx
<details>
  <summary>Source details</summary>
  <ul>
    <li>Description</li>
    <li>Image</li>
    <li>Website</li>
  </ul>
</details>
```

- [ ] **Step 3: Add search and category filters**

```tsx
const filtered = candidates.filter((candidate) =>
  candidate.question.toLowerCase().includes(search.toLowerCase()) ||
  candidate.answer.toLowerCase().includes(search.toLowerCase())
);
```

- [ ] **Step 4: Add approve, edit, delete, and merge actions**

```tsx
await fetch(`/api/dashboard/bots/${botId}/knowledge-wizard/review`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ approvedCandidateIds: selectedIds }),
});
```

- [ ] **Step 5: Verify the review page respects draft/approved separation**

Run:

```bash
npm run build
```

Expected:

- Approved FAQs still appear in the bot FAQ list.
- Draft candidates remain editable on the review page only.

---

### Task 7: Update runtime answer path to read only active approved FAQs

**Files:**
- Modify: `lib/bot-runtime.ts`
- Modify: `lib/bot/answer.ts`
- Modify: `app/api/chat-log/route.ts` if metadata needs source labels

- [ ] **Step 1: Filter answer lookup to approved active FAQ rows only**

```ts
const faqData = (await getFAQData(botId)).filter((faq) => faq.is_active === 1 && faq.faq_status === "active");
```

- [ ] **Step 2: Preserve source labels in logs**

```ts
type AnswerSource = "mysql_faq" | "ai" | "fallback" | "credit_block";
```

- [ ] **Step 3: Verify LINE webhook behavior still scopes to one bot only**

Run:

```bash
npm run build
```

Expected:

- No bot data leaks across tenants.
- FAQ answering still works when only approved rows exist.

---

### Task 8: Add tests and end-to-end verification

**Files:**
- Create: `tests/knowledge-wizard.test.ts` or the repo's equivalent test location if one exists
- Modify: any existing integration test helpers if present

- [ ] **Step 1: Test background website import can run independently**

```ts
it("stores website candidates without blocking step 2", async () => {
  // create wizard, start crawl, assert status transitions
});
```

- [ ] **Step 2: Test image candidates merge into drafts**

```ts
it("creates draft candidates from image extraction", async () => {
  // upload image, stub vision extraction, assert candidates saved as draft
});
```

- [ ] **Step 3: Test approved FAQs are not overwritten**

```ts
it("keeps approved faq rows immutable across reruns", async () => {
  // approve one row, rerun generation, assert original active row unchanged
});
```

- [ ] **Step 4: Test multi-language generation**

```ts
it("returns both Thai and English candidates when requested", async () => {
  // request languages, assert output rows include requested codes
});
```

- [ ] **Step 5: Run the full build and smoke the wizard page**

Run:

```bash
npm run build
```

Expected:

- Build passes.
- The wizard page renders.
- Bot creation still works for existing users.

---

## Coverage Check

- Step 1 website URL background import: Task 1, Task 4, Task 5
- Step 2 store info + image extraction: Task 2, Task 3, Task 4, Task 5
- Step 3 website crawl with depth/page limits: Task 3, Task 4
- Step 4 merge knowledge and deduplicate: Task 2, Task 3, Task 4, Task 6
- Step 5 review and approve workflow: Task 2, Task 4, Task 6
- Never overwrite approved FAQ: Task 1, Task 2, Task 6, Task 7, Task 8
- Multi-language generation: Task 3, Task 8
- Future incremental updates: Task 1, Task 2, Task 4, Task 6

