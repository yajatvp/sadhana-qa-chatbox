-- =============================================================
-- Supabase Setup for Sadhana Q&A Chatbox
-- =============================================================
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- This creates the table and vector search function needed for RAG.
-- =============================================================

-- 1. Enable the pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the Q&A documents table
CREATE TABLE IF NOT EXISTS qa_documents (
  id BIGSERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- text-embedding-3-small produces 1536 dimensions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create an index for faster similarity search
CREATE INDEX IF NOT EXISTS qa_documents_embedding_idx 
ON qa_documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 50);

-- 4. Create the similarity search function
CREATE OR REPLACE FUNCTION match_qa_documents(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 8
)
RETURNS TABLE (
  id BIGINT,
  category TEXT,
  question TEXT,
  answer TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    qa_documents.id,
    qa_documents.category,
    qa_documents.question,
    qa_documents.answer,
    1 - (qa_documents.embedding <=> query_embedding) AS similarity
  FROM qa_documents
  WHERE 1 - (qa_documents.embedding <=> query_embedding) > match_threshold
  ORDER BY qa_documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 5. Enable Row Level Security (RLS) - Important for production!
ALTER TABLE qa_documents ENABLE ROW LEVEL SECURITY;

-- Allow read access for the service role (API routes) 
CREATE POLICY "Allow service role read access" ON qa_documents
  FOR SELECT
  USING (true);

-- Allow insert for service role (ingestion script)
CREATE POLICY "Allow service role insert" ON qa_documents
  FOR INSERT
  WITH CHECK (true);

-- =============================================================
-- ✅ Done! Now run the ingestion script: npm run ingest
-- =============================================================
