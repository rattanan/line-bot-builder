ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `credit_balance` INT NOT NULL DEFAULT 0 AFTER `role`;

ALTER TABLE `credit_transactions`
  ADD COLUMN IF NOT EXISTS `bot_id` INT UNSIGNED NULL AFTER `id`,
  ADD COLUMN IF NOT EXISTS `user_id` BIGINT UNSIGNED NULL AFTER `bot_id`,
  ADD COLUMN IF NOT EXISTS `type` ENUM('topup','usage','adjustment') NOT NULL DEFAULT 'usage' AFTER `user_id`,
  ADD COLUMN IF NOT EXISTS `balance_before` INT NOT NULL DEFAULT 0 AFTER `amount`,
  ADD COLUMN IF NOT EXISTS `balance_after` INT NOT NULL DEFAULT 0 AFTER `balance_before`,
  ADD COLUMN IF NOT EXISTS `ref_type` VARCHAR(32) DEFAULT NULL AFTER `balance_after`,
  ADD COLUMN IF NOT EXISTS `ref_id` BIGINT UNSIGNED DEFAULT NULL AFTER `ref_type`,
  ADD COLUMN IF NOT EXISTS `admin_email` VARCHAR(191) DEFAULT NULL AFTER `reason`;

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
  `ocr_result` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_topup_orders_user_id` (`user_id`),
  KEY `idx_topup_orders_status` (`status`),
  KEY `idx_topup_orders_expires_at` (`expires_at`),
  CONSTRAINT `fk_topup_orders_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
