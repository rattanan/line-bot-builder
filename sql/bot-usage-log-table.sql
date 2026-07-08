CREATE TABLE IF NOT EXISTS `bot_usage_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `bot_id` INT UNSIGNED NOT NULL,
  `line_user_id` VARCHAR(100) NOT NULL,
  `user_message` TEXT NOT NULL,
  `credit_before` INT NOT NULL,
  `credit_after` INT NOT NULL,
  `status` ENUM('consumed', 'insufficient', 'suspended', 'not_found') NOT NULL,
  `source` ENUM('mysql_faq', 'ai', 'fallback', 'credit_block') NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bot_usage_logs_bot_id` (`bot_id`),
  KEY `idx_bot_usage_logs_created_at` (`created_at`),
  KEY `idx_bot_usage_logs_line_user_id` (`line_user_id`),
  CONSTRAINT `fk_bot_usage_logs_bot_id` FOREIGN KEY (`bot_id`) REFERENCES `bots` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
