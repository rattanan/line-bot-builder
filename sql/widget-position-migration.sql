ALTER TABLE `bots`
  ADD COLUMN `widget_launcher_position` ENUM('left', 'right') NOT NULL DEFAULT 'right' AFTER `widget_launcher_shape`,
  ADD COLUMN `widget_horizontal_offset` SMALLINT UNSIGNED NOT NULL DEFAULT 20 AFTER `widget_launcher_position`,
  ADD COLUMN `widget_bottom_offset` SMALLINT UNSIGNED NOT NULL DEFAULT 20 AFTER `widget_horizontal_offset`,
  ADD COLUMN `widget_show_dismiss_button` TINYINT(1) NOT NULL DEFAULT 0 AFTER `widget_bottom_offset`;
