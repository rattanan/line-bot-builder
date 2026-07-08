-- FAQ Table Migration
-- Create FAQ table for storing legal FAQ data

CREATE TABLE IF NOT EXISTS faq (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bot_id INT UNSIGNED NOT NULL,
  question VARCHAR(255) NOT NULL,
  answer TEXT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
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
