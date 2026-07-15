-- AI Business Insight demo seed
-- Run business-insight-migration.sql before this file.
-- By default this seeds the oldest bot. To target another bot, run:
-- SET @business_insight_seed_bot_id = 123;

SET @seed_bot_id := COALESCE(
  @business_insight_seed_bot_id,
  (SELECT `id` FROM `bots` ORDER BY `id` ASC LIMIT 1)
);

-- Idempotent: only demo rows created by this file are replaced.
DELETE FROM `chat_log`
WHERE `bot_id` = @seed_bot_id
  AND `user_id` LIKE 'demo-insight:%';

DELETE FROM `business_insight_snapshots`
WHERE `bot_id` = @seed_bot_id
  AND `source` = 'seed';

INSERT INTO `chat_log` (
  `user_id`, `bot_id`, `channel`, `user_message`, `bot_reply`, `answer_source`, `created_at`
)
SELECT
  CONCAT('demo-insight:', questions.code, ':', numbers.n),
  @seed_bot_id,
  CASE WHEN MOD(numbers.n, 3) = 0 THEN 'web' ELSE 'line' END,
  questions.question,
  questions.answer,
  questions.answer_source,
  DATE_SUB(NOW(), INTERVAL (numbers.n + questions.hour_offset) HOUR)
FROM (
  SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
  UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
  UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
  UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20
  UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24 UNION ALL SELECT 25
  UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29 UNION ALL SELECT 30
) AS numbers
JOIN (
  SELECT 'price' AS code, 'สินค้าราคาเท่าไร?' AS question,
         'ราคาจะแตกต่างตามรุ่นและแพ็กเกจ กรุณาแจ้งรุ่นที่สนใจเพื่อให้ทีมงานเสนอราคาที่เหมาะสม' AS answer,
         'mysql_faq' AS answer_source, 28 AS desired_count, 0 AS hour_offset
  UNION ALL
  SELECT 'promotion', 'ตอนนี้มีโปรโมชั่นอะไรบ้าง?',
         'โปรโมชั่นมีการอัปเดตเป็นระยะ กรุณาแจ้งสินค้าที่สนใจเพื่อให้ทีมงานตรวจสอบข้อเสนอล่าสุด',
         'ai', 23, 30
  UNION ALL
  SELECT 'installment', 'สามารถผ่อนชำระได้ไหม?',
         'เงื่อนไขการผ่อนชำระขึ้นอยู่กับสินค้าและผู้ให้บริการ กรุณาติดต่อทีมขายเพื่อตรวจสอบตัวเลือกที่ใช้ได้',
         'ai', 18, 60
  UNION ALL
  SELECT 'warranty', 'สินค้ามีประกันกี่ปี?',
         'ระยะเวลารับประกันแตกต่างกันตามรุ่น กรุณาแจ้งชื่อรุ่นเพื่อให้ทีมงานยืนยันรายละเอียด',
         'mysql_faq', 14, 90
  UNION ALL
  SELECT 'delivery', 'จัดส่งใช้เวลากี่วัน?',
         'ระยะเวลาจัดส่งขึ้นอยู่กับพื้นที่และสต็อกสินค้า ทีมงานจะแจ้งกำหนดส่งที่ชัดเจนหลังยืนยันคำสั่งซื้อ',
         'ai', 11, 120
  UNION ALL
  SELECT 'wifi7', 'มีรุ่นที่รองรับ WiFi 7 ไหม?',
         'มีสินค้าบางรุ่นที่รองรับ WiFi 7 กรุณาแจ้งงบประมาณและรูปแบบการใช้งานเพื่อให้ทีมงานแนะนำรุ่นที่เหมาะสม',
         'ai', 9, 150
) AS questions ON numbers.n <= questions.desired_count
WHERE @seed_bot_id IS NOT NULL;

INSERT INTO `business_insight_snapshots` (
  `bot_id`, `analysis_json`, `conversation_count`, `source`, `created_at`
)
SELECT
  @seed_bot_id,
  '{
    "topQuestions": [
      {"question": "สินค้าราคาเท่าไร?", "count": 28},
      {"question": "ตอนนี้มีโปรโมชั่นอะไรบ้าง?", "count": 23},
      {"question": "สามารถผ่อนชำระได้ไหม?", "count": 18},
      {"question": "สินค้ามีประกันกี่ปี?", "count": 14},
      {"question": "จัดส่งใช้เวลากี่วัน?", "count": 11}
    ],
    "missingFAQ": [
      {"question": "สามารถผ่อนชำระได้ไหม?", "count": 18},
      {"question": "ตอนนี้มีโปรโมชั่นอะไรบ้าง?", "count": 23},
      {"question": "มีรุ่นที่รองรับ WiFi 7 ไหม?", "count": 9}
    ],
    "suggestedFAQ": [
      {"question": "สามารถผ่อนชำระได้ไหม?", "answer": "มีตัวเลือกการผ่อนชำระสำหรับสินค้าบางรายการ กรุณาแจ้งรุ่นที่สนใจเพื่อให้ทีมงานตรวจสอบเงื่อนไขและช่องทางที่ใช้ได้", "category": "Payment"},
      {"question": "ตอนนี้มีโปรโมชั่นอะไรบ้าง?", "answer": "โปรโมชั่นมีการอัปเดตเป็นระยะ กรุณาแจ้งสินค้าที่สนใจเพื่อให้ทีมงานแนะนำข้อเสนอล่าสุด", "category": "Promotion"},
      {"question": "มีรุ่นที่รองรับ WiFi 7 ไหม?", "answer": "มีสินค้าบางรุ่นที่รองรับ WiFi 7 กรุณาแจ้งงบประมาณและรูปแบบการใช้งานเพื่อรับคำแนะนำที่เหมาะสม", "category": "Product"}
    ],
    "businessInsight": [
      "คำถามด้านราคาและโปรโมชั่นคิดเป็นสัดส่วนสูง ควรทำข้อเสนอให้เห็นชัดตั้งแต่ต้นการสนทนา",
      "ลูกค้าถามเรื่องผ่อนชำระบ่อย ควรเพิ่ม FAQ และข้อมูลเงื่อนไขการชำระเงิน",
      "ความสนใจสินค้า WiFi 7 เริ่มเพิ่มขึ้น ควรเตรียม comparison guide สำหรับทีมขาย",
      "ข้อมูลระยะเวลาจัดส่งและการรับประกันควรแยกตามรุ่นเพื่อลดเวลาตอบคำถาม"
    ]
  }',
  (SELECT COUNT(*) FROM `chat_log` WHERE `bot_id` = @seed_bot_id),
  'seed',
  NOW()
FROM (SELECT 1 AS seed_ready) AS seed_guard
WHERE @seed_bot_id IS NOT NULL;

SELECT
  @seed_bot_id AS `seeded_bot_id`,
  (SELECT COUNT(*) FROM `chat_log` WHERE `bot_id` = @seed_bot_id AND `user_id` LIKE 'demo-insight:%') AS `seeded_conversations`,
  (SELECT COUNT(*) FROM `business_insight_snapshots` WHERE `bot_id` = @seed_bot_id AND `source` = 'seed') AS `seeded_snapshots`;
