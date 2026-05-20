# 🕉️ Sadhana Guide — Spiritual Q&A Chatbox

A RAG-powered (Retrieval Augmented Generation) Q&A chatbox for answering questions about spiritual sadhana practices. The chatbot answers **ONLY** from your curated Q&A knowledge base — no external information is used.

## Architecture

```
User Question → OpenAI Embedding → Supabase pgvector Search → Top Matches → Claude API → Answer
```

- **Frontend**: Next.js 14 + Tailwind CSS (warm saffron theme)
- **Vector DB**: Supabase (PostgreSQL + pgvector)
- **Embeddings**: OpenAI `text-embedding-3-small` (cheap, effective)
- **LLM**: Anthropic Claude Sonnet (grounded, follows instructions well)
- **Hosting**: Vercel (free tier)

## Features

- 🔒 **Strictly grounded** — answers ONLY from your Q&A data
- 🔍 **Source attribution** — shows which Q&A pairs informed the answer
- 💬 **Conversational** — maintains context across messages
- 📱 **Responsive** — works on mobile and desktop
- ⚡ **Fast** — semantic search returns results in milliseconds
- 🕉️ **Beautiful UI** — warm, spiritual-themed design

---

## Setup Guide (Step by Step)

### Prerequisites

- Node.js 18+ installed
- A [Supabase](https://supabase.com) account (free tier works)
- An [OpenAI](https://platform.openai.com) API key (for embeddings)
- An [Anthropic](https://console.anthropic.com) API key (for Claude)

### Step 1: Clone & Install

```bash
cd sadhana-qa-chatbox
npm install
```

### Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once the project is ready, go to **SQL Editor** in the dashboard
3. Copy and paste the contents of `scripts/supabase_setup.sql` and run it
4. Go to **Settings → API** to get your:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`)

### Step 3: Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
ANTHROPIC_API_KEY=sk-ant-...your-anthropic-key
OPENAI_API_KEY=sk-...your-openai-key
```

### Step 4: Ingest Your Q&A Data

The `data/qa_data.json` file is already prepared with your 1,430 cleaned Q&A pairs.

```bash
npm run ingest
```

This will:
- Read all Q&A pairs from `data/qa_data.json`
- Generate vector embeddings for each pair
- Store them in your Supabase database

**Cost estimate**: ~$0.02 for embedding 1,430 entries with text-embedding-3-small.

### Step 5: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to test.

### Step 6: Deploy to Vercel

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Select your repo
4. Add environment variables in Vercel's dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
   - `OPENAI_API_KEY`
5. Deploy! 🚀

---

## Cost Breakdown (Monthly)

| Service | Free Tier | Estimated Usage |
|---------|-----------|-----------------|
| Vercel | 100GB bandwidth, serverless functions | ✅ Free |
| Supabase | 500MB DB, 2GB bandwidth | ✅ Free |
| OpenAI Embeddings | Pay per use | ~$0.01/1000 queries |
| Claude API | Pay per use | ~$0.003/query (Sonnet) |

**Estimated cost for 1,000 queries/month: ~$4-5**

---

## Project Structure

```
sadhana-qa-chatbox/
├── data/
│   └── qa_data.json          # Your cleaned Q&A data (1,430 pairs)
├── scripts/
│   ├── ingest.mjs            # Data ingestion script
│   └── supabase_setup.sql    # Database setup SQL
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts # Chat API (RAG pipeline)
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Main chat page
│   ├── components/
│   │   ├── ChatInput.tsx     # Input component
│   │   └── ChatMessage.tsx   # Message component with sources
│   └── lib/
│       ├── embeddings.ts     # OpenAI embeddings utility
│       └── supabase.ts       # Supabase client
├── .env.local.example        # Environment template
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## How It Works

1. **User asks a question** in the chat interface
2. The question is converted to a vector embedding (OpenAI)
3. Supabase performs cosine similarity search against all stored Q&A embeddings
4. The top 8 most relevant Q&A pairs are retrieved
5. These are sent to Claude along with the user's question
6. Claude generates a natural answer **strictly** from the provided context
7. If no relevant context is found, it politely declines to answer

---

## Updating the Knowledge Base

To add more Q&A pairs:

1. Add new entries to `data/qa_data.json` (same format: category, question, answer)
2. Run `npm run ingest` again (it will append new entries)
3. To do a full refresh, clear the Supabase table first:
   ```sql
   TRUNCATE qa_documents;
   ```
   Then re-run `npm run ingest`.

---

## Security Notes

- The `SUPABASE_SERVICE_ROLE_KEY` is only used server-side (API routes)
- API keys are never exposed to the browser
- RLS (Row Level Security) is enabled on the database
- Rate limiting can be added via Vercel's Edge Config if needed
