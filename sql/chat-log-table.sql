-- Chat log table for storing all incoming and outgoing messages
CREATE TABLE IF NOT EXISTS `chat_log` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(100) NOT NULL COMMENT 'LINE user ID',
  `user_message` TEXT NOT NULL COMMENT 'User\'s incoming message',
  `bot_reply` TEXT NOT NULL COMMENT 'Bot\'s reply message',
  `answer_source` ENUM('mysql_faq', 'ai', 'fallback') NOT NULL DEFAULT 'fallback' COMMENT 'Source of the answer',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;