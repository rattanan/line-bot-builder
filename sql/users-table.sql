-- Users table for authentication and administration
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(191) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `password_salt` VARCHAR(64) DEFAULT NULL,
  `google_sub` VARCHAR(191) DEFAULT NULL,
  `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
  `credit_balance` INT NOT NULL DEFAULT 50,
  `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_email` (`email`),
  UNIQUE KEY `uniq_google_sub` (`google_sub`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`email`, `full_name`, `password_hash`, `password_salt`, `role`, `email_verified_at`)
VALUES (
  'admin@line-bot-builder.local',
  'Admin',
  '4a1b08000a24117e620ba0b57749cc1bd79b64a959575172b602fe0bb4a34860',
  '2a6d3d1a7d2f4f79e1d5a2c7f1c7c8f2',
  'ADMIN',
  CURRENT_TIMESTAMP
)
ON DUPLICATE KEY UPDATE `email` = `email`;
