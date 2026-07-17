ALTER TABLE `bots`
  ADD COLUMN `bot_profile_image_url` VARCHAR(500) NULL AFTER `system_prompt`,
  ADD COLUMN `widget_primary_color` CHAR(7) NOT NULL DEFAULT '#2563EB' AFTER `line_channel_access_token`,
  ADD COLUMN `widget_launcher_icon_type` ENUM('default', 'bot_profile', 'custom') NOT NULL DEFAULT 'default' AFTER `widget_primary_color`,
  ADD COLUMN `widget_default_icon` VARCHAR(32) NOT NULL DEFAULT 'chat' AFTER `widget_launcher_icon_type`,
  ADD COLUMN `widget_custom_icon_url` VARCHAR(500) NULL AFTER `widget_default_icon`,
  ADD COLUMN `widget_launcher_shape` ENUM('circle', 'rounded') NOT NULL DEFAULT 'circle' AFTER `widget_custom_icon_url`,
  ADD COLUMN `widget_public_token` CHAR(64) NULL AFTER `widget_launcher_shape`;

UPDATE `bots`
SET `widget_public_token` = LOWER(CONCAT(REPLACE(UUID(), '-', ''), REPLACE(UUID(), '-', '')))
WHERE `widget_public_token` IS NULL OR `widget_public_token` = '';

ALTER TABLE `bots`
  MODIFY COLUMN `widget_public_token` CHAR(64) NOT NULL,
  ADD UNIQUE KEY `uq_bots_widget_public_token` (`widget_public_token`);
