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
