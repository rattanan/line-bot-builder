-- Minimal, idempotent migration for AI Business Insight channel tracking.
SET @sql := (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `chat_log` ADD COLUMN `channel` VARCHAR(20) NOT NULL DEFAULT ''unknown'' COMMENT ''Conversation channel: line, web, test, or unknown'' AFTER `bot_id`',
    'SELECT 1'
  )
  FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'chat_log' AND column_name = 'channel'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS `business_insight_snapshots` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `bot_id` INT UNSIGNED NOT NULL,
  `analysis_json` LONGTEXT NOT NULL,
  `conversation_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `source` ENUM('ai','seed') NOT NULL DEFAULT 'ai',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_insight_snapshot_bot_created` (`bot_id`, `created_at`),
  CONSTRAINT `fk_insight_snapshot_bot_id`
    FOREIGN KEY (`bot_id`) REFERENCES `bots` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @sql := (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `chat_log` ADD INDEX `idx_bot_channel` (`bot_id`, `channel`)',
    'SELECT 1'
  )
  FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'chat_log' AND index_name = 'idx_bot_channel'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
