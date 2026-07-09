# AI Knowledge Onboarding Wizard Design

## Goal
Add a step-by-step onboarding wizard during bot creation that automatically builds an initial knowledge base from:

- Business details entered by the user
- Uploaded images
- Optional website URL

The wizard must create draft FAQs only. Approved FAQs must never be overwritten.

## Current Context

- Bot creation already has a basic AI wizard in `lib/bot-wizard.ts` and `app/dashboard/bots/new/page.tsx`.
- FAQ storage already exists in `faq` with `is_active`.
- Bot ownership is scoped by `bot_id` and data separation is already expected throughout the app.

## User Flow

### Step 1: Bot Identity + Optional Website

The user enters:

- Bot name
- Website URL, optional

Behavior:

- Bot name is required.
- Website URL is optional.
- If a URL is provided, a background website ingestion job starts immediately.
- The UI must not block on scraping.

### Step 2: Store Information + Image Uploads

The user enters:

- Store name
- Business category
- Business description
- Target customers
- Business hours
- Contact information

The user uploads multiple images from sources such as:

- Storefront
- Interior
- Products
- Menu
- Price list
- Brochure
- Posters
- Flyers
- Business cards
- Certificates
- Logos

Behavior:

- AI generates an initial FAQ set from business details.
- Vision/OCR extraction runs in the background for each image.
- Image-derived knowledge is converted into candidate FAQs.
- The step can be completed without waiting for background jobs to finish.

### Step 3: Review + Approve

The user sees one merged FAQ list composed from:

- Business description
- Images
- Website

Behavior:

- Duplicate questions are merged.
- Each FAQ stores source metadata internally.
- The default review view is merged-first.
- Users can expand a FAQ to inspect source details.
- The reviewer can approve, edit, delete, merge, search, and filter.
- Only approved FAQs become active.
- After approval, the UI must show a button to go to Bot Setting.

## Data Model

### Bot Wizard Job

Add a durable record for onboarding progress so the wizard can survive refreshes and background execution.

Recommended fields:

- `id`
- `bot_id`
- `user_id`
- `website_url`
- `status`
- `created_at`
- `updated_at`

Suggested statuses:

- `draft`
- `scraping`
- `extracting_images`
- `generating_faq`
- `ready_for_review`
- `approved`
- `cancelled`

### Knowledge Source Records

Store generated content with source metadata so future incremental updates do not overwrite approved items.

Recommended fields per candidate FAQ:

- `id`
- `bot_id`
- `wizard_id`
- `question`
- `answer`
- `category`
- `confidence_score`
- `source_type` (`description`, `image`, `website`)
- `source_ref` or source payload
- `language_code`
- `status` (`draft`, `approved`, `rejected`, `merged`)
- `created_at`
- `updated_at`

If the current `faq` table is reused for active FAQs, add wizard-generated drafts in a separate table or add nullable source/status columns so approved FAQ rows remain immutable.

## Processing Pipeline

### 1. Business Details Generator

Input:

- Store name
- Business category
- Business description
- Target customers
- Business hours
- Contact information

Output:

- Initial FAQ draft set
- System prompt
- Optional image prompts for profile/banner generation if still needed by the bot flow

The generator should:

- Produce 10 to 20 FAQs where possible
- Support Thai and English generation
- Avoid duplicates
- Normalize answer tone and formatting

### 2. Website Scraper

Triggered only if the user provides a URL.

Rules:

- Maximum depth: 3
- Maximum pages: 30
- Extract readable text only
- Ignore non-content noise as much as possible

Output:

- Extracted text chunks
- Candidate FAQs
- Source metadata pointing to the URL and page path

### 3. Image Vision/OCR Extractor

Each uploaded image is processed asynchronously.

Extraction targets:

- Product names
- Services
- Prices
- Opening hours
- Contact numbers
- Brand names
- Business type
- Promotions
- Menus
- OCR text

Output:

- Structured extraction result
- Candidate FAQs
- Source metadata pointing to the uploaded image

### 4. Merge + Deduplicate

Merge candidate FAQs from:

- Description
- Image
- Website

Merge rules:

- Normalize text before comparison
- Deduplicate similar questions
- Keep the strongest answer or merge answer content when safe
- Keep the original sources attached
- Assign confidence score from the contributing sources
- Group by category for display, but show a unified list first

## Approval Rules

- Every AI-generated FAQ starts as draft.
- Human approval is required before a FAQ becomes active.
- Approved FAQs must never be overwritten by future wizard runs.
- Future wizard runs create new draft candidates instead of editing approved rows.
- Incremental updates should be appended as new drafts and optionally linked to prior source groups.

## UI Requirements

### Wizard Step 1

- Inputs for bot name and website URL
- Clear note that website import runs in the background
- Proceed button to move to Step 2

### Wizard Step 2

- Form for store information
- Multi-image upload
- Progress state for background extraction

### Wizard Step 3

- Unified FAQ list
- Search and filter
- Expandable source details
- Edit, delete, merge, approve actions
- Button to go to Bot Setting after approval

## API / Backend Requirements

- Add an onboarding job endpoint for starting website crawl
- Add an image upload endpoint that stores files and triggers vision extraction
- Add a merge endpoint that combines draft FAQ candidates
- Add a review endpoint that approves selected FAQs
- Keep all routes scoped by `user_id` and `bot_id`

## Error Handling

- If website crawl fails, keep the wizard alive and let the user continue with local inputs.
- If an image fails OCR, keep the uploaded file and mark that source as error or low confidence.
- If AI generation fails, fall back to a smaller deterministic FAQ seed set.
- Never block the approval screen because one source failed.

## Testing

- Verify Step 1 can start a background website job without requiring the remaining steps.
- Verify Step 2 generates draft FAQs and stores source metadata.
- Verify Step 3 merges sources without duplicating approved FAQs.
- Verify approved FAQs remain unchanged after a later rerun.
- Verify Thai and English generation produce valid draft rows.

## Out of Scope For This Phase

- Full CMS for article editing
- Real-time collaborative review
- Complex semantic search over the knowledge base
- Auto-publishing draft FAQs without human approval

