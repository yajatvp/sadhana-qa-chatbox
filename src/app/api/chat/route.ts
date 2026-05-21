import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';
import { getEmbedding } from '@/lib/embeddings';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a knowledgeable spiritual guide for KBUF (Kamakhya Bhairava Upasaka Foundation) sadhana practices. Answer questions based on the provided knowledge base context.

RULES:
1. Answer based on the context provided. Extract and synthesize relevant information from ALL provided Q&A pairs.
2. The context contains both direct answers AND instructional content. Use ALL of it to form a comprehensive answer.
3. If the context contains step-by-step instructions relevant to the question, include them in your answer.
4. If the context contains answers from previous Q&A that are relevant, use them.
5. Be respectful, warm, and encouraging.
6. Only say you don't have information if NONE of the provided context is relevant to the question at all.
7. If the question is not related to spiritual sadhana, politely redirect.`;

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const queryEmbedding = await getEmbedding(message);
    const { data: matches, error: searchError } = await supabase.rpc('match_qa_documents', {
      query_embedding: queryEmbedding, match_threshold: 0.25, match_count: 12,
    });

    if (searchError) {
      console.error('Supabase search error:', searchError);
      return NextResponse.json({ error: 'Failed to search knowledge base' }, { status: 500 });
    }

    let context = '';
    if (matches && matches.length > 0) {
      context = matches.map((match: any, i: number) =>
        `[${i + 1}] Category: ${match.category}\nQ: ${match.question}\nA: ${match.answer}\n(Relevance: ${(match.similarity * 100).toFixed(0)}%)`
      ).join('\n\n---\n\n');
    } else {
      context = 'No relevant information found in the knowledge base.';
    }

    const messages: any[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-6),
      { role: 'user', content: `KNOWLEDGE BASE CONTEXT:\n${context}\n\nUSER QUESTION: ${message}\n\nProvide a helpful answer using the context above. If there are step-by-step instructions or direct answers in the context, include them.` },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages,
    });

    const assistantMessage = response.choices[0]?.message?.content || '';

    return NextResponse.json({
      answer: assistantMessage,
      sources: matches?.slice(0, 3).map((m: any) => ({
        category: m.category, question: m.question, similarity: m.similarity,
      })),
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
