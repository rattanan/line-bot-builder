CREATE TABLE IF NOT EXISTS `bot_knowledge_wizard` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `bot_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `website_url` VARCHAR(2048) DEFAULT NULL,
  `status` ENUM('draft','scraping','extracting_images','generating_faq','ready_for_review','approved','cancelled') NOT NULL DEFAULT 'draft',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_bot_knowledge_wizard_bot_id` (`bot_id`),
  KEY `idx_bot_knowledge_wizard_user_id` (`user_id`),
  CONSTRAINT `fk_bot_knowledge_wizard_bot_id` FOREIGN KEY (`bot_id`) REFERENCES `bots` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bot_knowledge_wizard_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `bot_knowledge_candidates` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `bot_id` INT UNSIGNED NOT NULL,
  `wizard_id` INT NOT NULL,
  `question` VARCHAR(255) NOT NULL,
  `answer` TEXT NOT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `confidence_score` DECIMAL(5,4) NOT NULL DEFAULT 0,
  `source_type` ENUM('description','image','website') NOT NULL,
  `source_ref` VARCHAR(2048) DEFAULT NULL,
  `language_code` VARCHAR(10) NOT NULL DEFAULT 'th',
  `status` ENUM('draft','approved','rejected','merged') NOT NULL DEFAULT 'draft',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_bot_knowledge_candidates_bot_id` (`bot_id`),
  KEY `idx_bot_knowledge_candidates_wizard_id` (`wizard_id`),
  KEY `idx_bot_knowledge_candidates_status` (`status`),
  KEY `idx_bot_knowledge_candidates_question` (`question`),
  CONSTRAINT `fk_bot_knowledge_candidates_bot_id` FOREIGN KEY (`bot_id`) REFERENCES `bots` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bot_knowledge_candidates_wizard_id` FOREIGN KEY (`wizard_id`) REFERENCES `bot_knowledge_wizard` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @sql := (
  SELECT IF(COUNT(*) = 0, 'ALTER TABLE `faq` ADD COLUMN `source_type` ENUM(''manual'',''description'',''image'',''website'') NOT NULL DEFAULT ''manual''', 'SELECT 1')
  FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'faq' AND column_name = 'source_type'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(COUNT(*) = 0, 'ALTER TABLE `faq` ADD COLUMN `source_ref` VARCHAR(2048) DEFAULT NULL', 'SELECT 1')
  FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'faq' AND column_name = 'source_ref'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(COUNT(*) = 0, 'ALTER TABLE `faq` ADD COLUMN `source_meta` LONGTEXT DEFAULT NULL', 'SELECT 1')
  FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'faq' AND column_name = 'source_meta'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(COUNT(*) = 0, 'ALTER TABLE `faq` ADD COLUMN `language_code` VARCHAR(10) NOT NULL DEFAULT ''th''', 'SELECT 1')
  FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'faq' AND column_name = 'language_code'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(COUNT(*) = 0, 'ALTER TABLE `faq` ADD COLUMN `faq_status` ENUM(''draft'',''active'',''archived'') NOT NULL DEFAULT ''active''', 'SELECT 1')
  FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'faq' AND column_name = 'faq_status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(COUNT(*) = 0, 'ALTER TABLE `faq` ADD COLUMN `confidence_score` DECIMAL(5,4) NOT NULL DEFAULT 1.0000', 'SELECT 1')
  FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'faq' AND column_name = 'confidence_score'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(COUNT(*) = 0, 'ALTER TABLE `faq` ADD COLUMN `wizard_id` INT DEFAULT NULL', 'SELECT 1')
  FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'faq' AND column_name = 'wizard_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
