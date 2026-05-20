import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';
import { getEmbedding } from '@/lib/embeddings';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a knowledgeable and compassionate spiritual guide specializing in sadhana practices. You answer questions ONLY based on the provided context from the Q&A knowledge base.

IMPORTANT RULES:
1. ONLY answer based on the context provided below. Do not use any external knowledge.
2. If the context does not contain relevant information, respond with: "I don't have specific guidance on this topic in my knowledge base. Please consult your guru or spiritual guide for personalized advice."
3. Be respectful, warm, and encouraging in your tone.
4. If multiple relevant answers exist in the context, synthesize them into a coherent response.
5. Never fabricate or speculate beyond what is in the provided context.
6. If the question is not related to spiritual sadhana, politely redirect.`;

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const queryEmbedding = await getEmbedding(message);
    const { data: matches, error: searchError } = await supabase.rpc('match_qa_documents', {
      query_embedding: queryEmbedding, match_threshold: 0.3, match_count: 8,
    });

    if (searchError) {
      console.error('Supabase search error:', searchError);
      return NextResponse.json({ error: 'Failed to search knowledge base' }, { status: 500 });
    }

    let context = '';
    if (matches && matches.length > 0) {
      context = matches.map((match: any, i: number) =>
        `[${i + 1}] Category: ${match.category}\nQuestion: ${match.question}\nAnswer: ${match.answer}`
      ).join('\n\n---\n\n');
    } else {
      context = 'No relevant information found in the knowledge base.';
    }

    const messages: any[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-6),
      { role: 'user', content: `Based on the following knowledge base context, please answer the user's question.\n\nKNOWLEDGE BASE CONTEXT:\n${context}\n\nUSER'S QUESTION: ${message}\n\nRemember: Only answer based on the context above.` },
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
