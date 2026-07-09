-- FAQ Table Migration
-- Create FAQ table for storing legal FAQ data

CREATE TABLE IF NOT EXISTS faq (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bot_id INT UNSIGNED NOT NULL,
  question VARCHAR(255) NOT NULL,
  answer TEXT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  source_type ENUM('manual','description','image','website') NOT NULL DEFAULT 'manual',
  source_ref VARCHAR(2048) DEFAULT NULL,
  source_meta LONGTEXT DEFAULT NULL,
  language_code VARCHAR(10) NOT NULL DEFAULT 'th',
  faq_status ENUM('draft','active','archived') NOT NULL DEFAULT 'active',
  confidence_score DECIMAL(5,4) NOT NULL DEFAULT 1.0000,
  wizard_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  KEY idx_bot_id (bot_id),
  CONSTRAINT fk_faq_bot_id FOREIGN KEY (bot_id) REFERENCES bots (id) ON DELETE CASCADE,
  INDEX idx_question (question)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data (optional)
-- INSERT INTO faq (question, answer) VALUES
-- ('คำถามตัวอย่าง', 'คำตอบตัวอย่าง'),
-- ('อีกคำถาม', 'อีกคำตอบ');
