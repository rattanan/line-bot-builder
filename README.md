This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## FAQ Data Storage

This bot uses MySQL for storing FAQ (Frequently Asked Questions) data.

### MySQL Setup

1. **Install MySQL** on your local machine or server

2. **Create a database** for the bot:
   ```sql
   CREATE DATABASE line_legal_bot;
   ```

3. **Run the migration** to create the FAQ table:
   ```bash
   mysql -u root -p line_legal_bot < sql/faq-table.sql
   ```

4. **Configure environment variables**:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` with your MySQL credentials:
     ```
     MYSQL_HOST=localhost
     MYSQL_PORT=3306
     MYSQL_USER=root
     MYSQL_PASSWORD=your_password
     MYSQL_DATABASE=line_legal_bot
     ```

5. **Verify the connection** by running the development server

### Adding FAQ Data

You can add FAQ entries directly to the MySQL database:

```sql
INSERT INTO faq (question, answer) VALUES 
('คำถามตัวอย่าง', 'คำตอบตัวอย่าง'),
('อีกคำถาม', 'อีกคำตอบ');
```

### API Endpoints

The FAQ data is accessible via the `lib/faq.ts` library which provides:
- `getFAQData()` - Get all FAQ entries
- `getFAQById(id)` - Get FAQ by ID
- `getFAQByQuestion(question)` - Search FAQs by question
- `addFAQ(question, answer)` - Add new FAQ
- `updateFAQ(id, question, answer)` - Update existing FAQ
- `deleteFAQ(id)` - Delete FAQ

## AI Provider Configuration

This application supports multiple AI providers. You can switch between providers by changing a single environment variable.

### Supported Providers

| Provider | Description |
|----------|-------------|
| `gemini` | Google GenAI (Gemini 2.5 Flash) |
| `qwen` | Qwen (OpenAI-compatible API) |

### How to Switch Providers

1. Edit your `.env` file
2. Set the `AI_PROVIDER` variable to your desired provider:

```bash
# Use Gemini
AI_PROVIDER=gemini

# Use Qwen
AI_PROVIDER=qwen
```

3. Restart your application

### Provider Configuration

#### Gemini

```bash
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-2.5-flash
```

#### Qwen

```bash
QWEN_API_URL=http://1.179.140.78:8001/v1
QWEN_API_KEY=your_api_key
QWEN_MODEL=Qwen/Qwen3.6-27B
```

### Logging

When a request is made, the following information is logged:

```
AI Provider : Gemini
Model : gemini-2.5-flash
Response : 1380 ms
Prompt length : 1234 chars
```

### Error Handling

If the selected provider fails, the application returns:

```
ขออภัย ระบบ AI ยังไม่สามารถตอบได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง
```

No automatic failover or retry is performed. The selected provider is used exclusively.

### Adding New Providers

To add a new provider:

1. Create a new file `lib/ai/<provider>.ts`
2. Implement the `AIProvider` interface from `lib/ai/provider.ts`
3. Update `createProvider()` in `lib/ai/provider.ts` to handle the new provider

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.