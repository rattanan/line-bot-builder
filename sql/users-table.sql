-- Users table for app authentication and administration
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `password_salt` VARCHAR(64) NOT NULL,
  `role` ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`username`, `full_name`, `password_hash`, `password_salt`, `role`)
VALUES (
  'admin',
  'Admin',
  '4a1b08000a24117e620ba0b57749cc1bd79b64a959575172b602fe0bb4a34860',
  '2a6d3d1a7d2f4f79e1d5a2c7f1c7c8f2',
  'admin'
)
ON DUPLICATE KEY UPDATE `username` = `username`;
