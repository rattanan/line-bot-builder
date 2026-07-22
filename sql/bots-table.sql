CREATE TABLE IF NOT EXISTS `bots` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `bot_name` VARCHAR(150) NOT NULL,
  `business_name` VARCHAR(191) NOT NULL,
  `business_description` TEXT NOT NULL,
  `system_prompt` TEXT NOT NULL,
  `bot_profile_image_url` VARCHAR(500) NULL,
  `line_channel_secret` VARCHAR(191) NOT NULL,
  `line_channel_access_token` TEXT NOT NULL,
  `widget_primary_color` CHAR(7) NOT NULL DEFAULT '#2563EB',
  `widget_launcher_icon_type` ENUM('default', 'bot_profile', 'custom') NOT NULL DEFAULT 'default',
  `widget_default_icon` VARCHAR(32) NOT NULL DEFAULT 'chat',
  `widget_custom_icon_url` VARCHAR(500) NULL,
  `widget_launcher_shape` ENUM('circle', 'rounded') NOT NULL DEFAULT 'circle',
  `widget_launcher_position` ENUM('left', 'right') NOT NULL DEFAULT 'right',
  `widget_horizontal_offset` SMALLINT UNSIGNED NOT NULL DEFAULT 20,
  `widget_bottom_offset` SMALLINT UNSIGNED NOT NULL DEFAULT 20,
  `widget_show_dismiss_button` TINYINT(1) NOT NULL DEFAULT 0,
  `widget_public_token` CHAR(64) NOT NULL,
  `credit_balance` INT NOT NULL DEFAULT 0,
  `status` ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_bots_widget_public_token` (`widget_public_token`),
  KEY `idx_bots_user_id` (`user_id`),
  CONSTRAINT `fk_bots_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `bots` (
  `user_id`, `bot_name`, `business_name`, `business_description`, `system_prompt`,
  `line_channel_secret`, `line_channel_access_token`, `widget_public_token`, `credit_balance`, `status`
)
SELECT
  u.id,
  'Default Bot',
  'Default Business',
  'Default workspace bot',
  'You are a helpful assistant for this business.',
  '',
  '',
  LOWER(CONCAT(REPLACE(UUID(), '-', ''), REPLACE(UUID(), '-', ''))),
  50,
  'active'
FROM `users` u
WHERE u.email = 'admin@line-bot-builder.local'
ON DUPLICATE KEY UPDATE `bot_name` = `bot_name`;
