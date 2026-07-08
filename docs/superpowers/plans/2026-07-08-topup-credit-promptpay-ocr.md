# Top-up Credit PromptPay OCR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add PromptPay QR top-up with slip upload, OCR verification, manual review, and admin approval for user credit balances.

**Architecture:** A user creates a top-up order for a fixed package amount, uploads a payment slip image, and the server verifies it with OCR before crediting the account inside a database transaction. Orders and credit movements are tracked separately so we can prevent double credits, support manual review, and give admin a clean review queue.

**Tech Stack:** Next.js route handlers, MySQL, local file storage in `public/uploads`, OpenAI-compatible chat API for OCR extraction, existing auth/session helpers.

---

### Task 1: Schema and credit ledger

**Files:**
- Create: `sql/topup-orders-table.sql`
- Modify: `sql/credit-transactions-table.sql`

- [ ] **Step 1: Add `topup_orders` table and extend `credit_transactions`**

```sql
CREATE TABLE IF NOT EXISTS `topup_orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `credit_amount` INT NOT NULL,
  `status` ENUM('pending','uploaded','verified','rejected','manual_review','expired') NOT NULL DEFAULT 'pending',
  `qr_payload` TEXT NOT NULL,
  `slip_image_url` VARCHAR(512) DEFAULT NULL,
  `slip_transaction_id` VARCHAR(128) DEFAULT NULL,
  `slip_transfer_time` DATETIME DEFAULT NULL,
  `verified_at` DATETIME DEFAULT NULL,
  `rejected_reason` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_topup_orders_user_id` (`user_id`),
  KEY `idx_topup_orders_status` (`status`),
  KEY `idx_topup_orders_expires_at` (`expires_at`),
  CONSTRAINT `fk_topup_orders_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);
ALTER TABLE `credit_transactions`
  ADD COLUMN `user_id` BIGINT UNSIGNED NULL AFTER `id`,
  ADD COLUMN `type` ENUM('topup','usage','adjustment') NOT NULL DEFAULT 'usage' AFTER `user_id`,
  ADD COLUMN `balance_before` INT NOT NULL DEFAULT 0 AFTER `amount`,
  ADD COLUMN `balance_after` INT NOT NULL DEFAULT 0 AFTER `balance_before`,
  ADD COLUMN `ref_type` VARCHAR(32) DEFAULT NULL AFTER `balance_after`,
  ADD COLUMN `ref_id` BIGINT UNSIGNED DEFAULT NULL AFTER `ref_type`,
  ADD KEY `idx_credit_transactions_user_id` (`user_id`),
  ADD KEY `idx_credit_transactions_ref` (`ref_type`, `ref_id`);
```

- [ ] **Step 2: Run migration**

Run: `mysql ... < sql/topup-orders-table.sql`

Expected: table exists and credit ledger columns are present.

### Task 2: Ledger helpers and top-up services

**Files:**
- Create: `lib/topup.ts`
- Modify: `lib/bot-usage.ts`

- [ ] **Step 1: Add order creation, upload, OCR verification, and admin approve/reject helpers**
- [ ] **Step 2: Wire transaction-safe balance updates and duplicate slip checks**
- [ ] **Step 3: Keep credit usage and top-up ledger separate but compatible**

### Task 3: API routes

**Files:**
- Create: `app/api/dashboard/topup/route.ts`
- Create: `app/api/dashboard/topup/[id]/route.ts`
- Create: `app/api/dashboard/topup/[id]/upload-slip/route.ts`
- Create: `app/api/admin/topup-reviews/route.ts`
- Create: `app/api/admin/topup-reviews/[id]/route.ts`

- [ ] **Step 1: Create order/detail endpoints**
- [ ] **Step 2: Add slip upload endpoint with file validation**
- [ ] **Step 3: Add OCR verification and admin review actions**

### Task 4: User pages

**Files:**
- Create: `app/dashboard/topup/page.tsx`
- Create: `app/dashboard/topup/[id]/page.tsx`
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Add package selection page**
- [ ] **Step 2: Add order detail page with QR and upload form**
- [ ] **Step 3: Show current credit balance on dashboard**

### Task 5: Admin review UI

**Files:**
- Create: `app/admin/topup-reviews/page.tsx`

- [ ] **Step 1: Build review queue**
- [ ] **Step 2: Show slip image and OCR result**
- [ ] **Step 3: Add approve/reject actions**

### Task 6: Verification

**Files:**
- Modify: none

- [ ] **Step 1: Run lint/build**
- [ ] **Step 2: Exercise top-up API paths manually**
- [ ] **Step 3: Confirm no LINE webhook regressions**

*** End Patch
