SET @db_name := DATABASE();

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = @db_name
    AND table_name = 'users'
    AND column_name = 'credit_balance'
);
SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE users ADD COLUMN credit_balance INT NOT NULL DEFAULT 50 AFTER role',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE users ALTER COLUMN credit_balance SET DEFAULT 50;

CREATE TABLE IF NOT EXISTS credit_transactions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  bot_id INT UNSIGNED NULL,
  user_id INT UNSIGNED NULL,
  type ENUM('topup','usage','adjustment') NOT NULL DEFAULT 'usage',
  amount INT NOT NULL,
  balance_before INT NOT NULL DEFAULT 0,
  balance_after INT NOT NULL DEFAULT 0,
  ref_type VARCHAR(32) DEFAULT NULL,
  ref_id BIGINT UNSIGNED DEFAULT NULL,
  reason VARCHAR(255) NOT NULL,
  admin_email VARCHAR(191) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_credit_transactions_bot_id (bot_id),
  KEY idx_credit_transactions_user_id (user_id),
  KEY idx_credit_transactions_ref (ref_type, ref_id),
  KEY idx_credit_transactions_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = @db_name
    AND table_name = 'credit_transactions'
    AND column_name = 'bot_id'
);
SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE credit_transactions ADD COLUMN bot_id INT UNSIGNED NULL AFTER id',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = @db_name
    AND table_name = 'credit_transactions'
    AND column_name = 'user_id'
);
SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE credit_transactions ADD COLUMN user_id INT UNSIGNED NULL AFTER bot_id',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE credit_transactions MODIFY COLUMN user_id INT UNSIGNED NULL;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = @db_name
    AND table_name = 'credit_transactions'
    AND column_name = 'type'
);
SET @sql := IF(
  @col_exists = 0,
  "ALTER TABLE credit_transactions ADD COLUMN type ENUM('topup','usage','adjustment') NOT NULL DEFAULT 'usage' AFTER user_id",
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = @db_name
    AND table_name = 'credit_transactions'
    AND column_name = 'balance_before'
);
SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE credit_transactions ADD COLUMN balance_before INT NOT NULL DEFAULT 0 AFTER amount',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = @db_name
    AND table_name = 'credit_transactions'
    AND column_name = 'balance_after'
);
SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE credit_transactions ADD COLUMN balance_after INT NOT NULL DEFAULT 0 AFTER balance_before',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = @db_name
    AND table_name = 'credit_transactions'
    AND column_name = 'ref_type'
);
SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE credit_transactions ADD COLUMN ref_type VARCHAR(32) DEFAULT NULL AFTER balance_after',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = @db_name
    AND table_name = 'credit_transactions'
    AND column_name = 'ref_id'
);
SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE credit_transactions ADD COLUMN ref_id BIGINT UNSIGNED DEFAULT NULL AFTER ref_type',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = @db_name
    AND table_name = 'credit_transactions'
    AND column_name = 'admin_email'
);
SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE credit_transactions ADD COLUMN admin_email VARCHAR(191) DEFAULT NULL AFTER reason',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE users u
SET u.credit_balance = 50
WHERE u.credit_balance = 0
  AND NOT EXISTS (
    SELECT 1
    FROM credit_transactions ct
    WHERE ct.user_id = u.id
    LIMIT 1
  );

CREATE TABLE IF NOT EXISTS topup_orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  credit_amount INT NOT NULL,
  status ENUM('pending','uploaded','verified','rejected','manual_review','expired') NOT NULL DEFAULT 'pending',
  qr_payload TEXT NOT NULL,
  slip_image_url VARCHAR(512) DEFAULT NULL,
  slip_transaction_id VARCHAR(128) DEFAULT NULL,
  slip_transfer_time DATETIME DEFAULT NULL,
  verified_at DATETIME DEFAULT NULL,
  rejected_reason VARCHAR(255) DEFAULT NULL,
  ocr_result LONGTEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_topup_orders_user_id (user_id),
  KEY idx_topup_orders_status (status),
  KEY idx_topup_orders_expires_at (expires_at),
  CONSTRAINT fk_topup_orders_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
