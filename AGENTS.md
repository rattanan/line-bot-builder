<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Repository guide

## Product

This repository contains **AI Sales Companion**, a Next.js application for building AI-powered sales agents that can answer through LINE Official Account and an embeddable website chat widget. It includes authentication, agent and FAQ management, knowledge generation, chat logs, business insights, credit top-ups, and admin tools.

## Stack

- Next.js 16 App Router and React 19
- TypeScript
- Tailwind CSS 4
- MySQL 8+ through `mysql2/promise`
- Gemini and OpenAI-compatible AI providers
- LINE Messaging API
- Google OAuth and Resend
- Google Cloud Run deployment using source-based Buildpacks

## Important directories

- `app/`: pages, layouts, components, and route handlers
- `app/api/`: server-side HTTP endpoints
- `lib/`: database access, auth, AI providers, LINE integration, and business logic
- `sql/`: database schemas, additive migrations, and optional demo seed data
- `public/embed/chat-widget.js`: standalone website chat widget
- `docs/superpowers/`: implementation plans and design specifications

Keep database and internal API names containing the legacy word `bot` unless a migration is explicitly requested. The user-facing product uses the term **Agent**.

## Working rules

- Inspect the relevant implementation and the local Next.js 16 documentation before editing.
- Make the smallest change that satisfies the request. Do not refactor adjacent code without a reason tied to the task.
- Preserve existing user changes in a dirty worktree. Check `git status --short` before and after editing.
- Use Server Components by default. Add `"use client"` only when browser APIs, state, effects, or event handlers require it.
- Keep route handlers thin and put reusable business logic in `lib/`.
- Reuse the existing MySQL pool and helpers from `lib/mysql.ts`; do not create independent pools in feature code.
- Preserve the existing provider abstraction under `lib/ai/`; do not call a provider SDK directly from UI code.
- Maintain the existing responsive light/dark visual language and English/Thai localization behavior.
- Do not add dependencies unless the task genuinely requires them.

## Environment and secrets

Local development reads `.env` from the repository root. Required and optional variables are documented in `README.md`.

- Never commit `.env`, credentials, service-account files, API keys, tokens, passwords, or OAuth secrets.
- Never print the contents of `.env` or secret values to command output, logs, chat, tests, or screenshots.
- When checking environment configuration, report only whether each variable is set; mask all values.
- Do not use an unrestricted `gcloud run services describe --format=json` or YAML dump because the service configuration can contain plaintext environment values. Select only safe fields such as revision name, URL, region, and traffic percentage.
- `.env` is excluded by both `.gitignore` and `.gcloudignore`. Keep it that way.
- Cloud Run environment changes are production changes. Do not add, remove, or replace them unless the user explicitly requests it.

## Local development

Prerequisites are Node.js 20+, npm, and access to the configured MySQL database.

```bash
npm install
npm run dev
```

The local application is available at `http://localhost:3000`.

For a fresh checkout, Next-generated route types may not exist until `next dev`, `next build`, or `next typegen` has run. Do not work around missing generated `PageProps` or `RouteContext` globals with hand-written duplicate types.

## Database

SQL files are applied manually. For a new database, follow the dependency order documented in `README.md`. Treat migration execution and demo seeding as external data mutations: inspect the target database and obtain explicit authorization before running them.

- Prefer additive, backward-compatible migrations.
- Use parameterized queries for all user-controlled values.
- Wrap multi-statement writes that must succeed together in `withTransaction`.
- Never run destructive schema or data commands unless the user explicitly requests them and the exact target has been verified.

## Validation

Run checks appropriate to the change:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

For changes affecting runtime behavior, also start the dev server and exercise the relevant page or endpoint. For deployment work, verify the deployed URL over HTTP and confirm a visible or behavioral marker from the new revision.

Do not claim a check passed if it did not. If an existing unrelated lint failure remains, identify it separately from failures introduced by the current change.

## Google Cloud Run

Current production target:

- Google Cloud project: `line-bot-builder`
- Cloud Run service: `line-bot-builder`
- Region: `asia-southeast1`
- Custom application URL: `https://line.rattanan.dev`

Deploy only when the user explicitly asks for a production deployment. Confirm the active account, project, service, region, diff, and successful local build first.

```bash
gcloud config get-value project
gcloud run deploy line-bot-builder \
  --source . \
  --region asia-southeast1 \
  --project line-bot-builder \
  --platform managed \
  --quiet
```

Source deployment must continue to exclude `.env`; the existing Cloud Run service owns its runtime environment configuration. After deployment:

1. Confirm the latest ready revision and that it receives the intended traffic.
2. Check the direct Cloud Run URL and `https://line.rattanan.dev`.
3. Verify the specific feature or visible marker changed by the task.
4. Report the revision name, traffic percentage, validation result, and any uncommitted local changes.

Do not commit, push, change traffic allocation, roll back, or rotate credentials unless the user requests that action.
