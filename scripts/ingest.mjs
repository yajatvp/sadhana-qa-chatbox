/**
 * Data Ingestion Script
 * 
 * This script reads your Q&A data from qa_data.json, generates embeddings
 * using OpenAI's text-embedding-3-small model, and stores them in Supabase
 * with pgvector for semantic search.
 * 
 * Usage: 
 *   1. Set up .env.local with your API keys
 *   2. Run the Supabase SQL migration first (see supabase_setup.sql)
 *   3. Run: npm run ingest
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load .env.local
config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Batch size for embedding generation (OpenAI allows up to 2048 inputs)
const BATCH_SIZE = 100;

async function generateEmbeddings(texts) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts.map((t) => t.replace(/\n/g, ' ').trim().slice(0, 8000)),
  });
  return response.data.map((d) => d.embedding);
}

async function ingest() {
  console.log('🕉️  Sadhana Q&A Ingestion Script');
  console.log('================================\n');

  // 1. Load Q&A data
  const dataPath = path.join(__dirname, '..', 'data', 'qa_data.json');
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ File not found: ${dataPath}`);
    console.log('   Place your qa_data.json file in the /data directory.');
    process.exit(1);
  }

  const qaData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`📖 Loaded ${qaData.length} Q&A pairs\n`);

  // 2. Process in batches
  let processed = 0;
  let errors = 0;

  for (let i = 0; i < qaData.length; i += BATCH_SIZE) {
    const batch = qaData.slice(i, i + BATCH_SIZE);

    // Create combined text for embedding (question + answer for better semantic matching)
    const textsToEmbed = batch.map(
      (item) =>
        `Category: ${item.category}\nQuestion: ${item.question}\nAnswer: ${item.answer}`
    );

    try {
      const embeddings = await generateEmbeddings(textsToEmbed);
      const rows = batch.map((item, idx) => ({ category: item.category, question: item.question, answer: item.answer, content: textsToEmbed[idx], embedding: embeddings[idx] }));
      const { error } = await supabase.from('qa_documents').insert(rows);
      if (error) { errors += batch.length; } else { processed += batch.length; }
    } catch (err) { errors += batch.length; }
    await new Promise((r) => setTimeout(r, 500));
  }
  console.log('Done');
}
ingest().catch(console.error);
