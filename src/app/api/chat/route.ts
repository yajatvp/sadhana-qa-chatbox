import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';
import { getEmbedding } from '@/lib/embeddings';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a knowledgeable and compassionate spiritual guide specializing in sadhana practices. You answer questions ONLY based on the provided context from the Q&A knowledge base.

IMPORTANT RULES:
1. ONLY answer based on the context provided below. Do not use any external knowledge.
2. If the context does not contain relevant information to answer the question, respond with: "I don't have specific guidance on this topic in my knowledge base. Please consult your guru or spiritual guide for personalized advice."
3. Be respectful, warm, and encouraging in your tone.
4. If multiple relevant answers exist in the context, synthesize them into a coherent response.
5. Reference the category/topic when relevant to help the user understand the context.
6. Keep answers clear and concise while being thorough.
7. Never fabricate or speculate beyond what is in the provided context.
8. If the question is not related to spiritual sadhana, politely redirect: "I am designed to assist only with questions related to spiritual sadhana practices."`;

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // 1. Generate embedding for the user's question
    const queryEmbedding = await getEmbedding(message);

    // 2. Search Supabase for relevant Q&A pairs using vector similarity
    const { data: matches, error: searchError } = await supabase.rpc(
      'match_qa_documents',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: 8,
      }
    );

    if (searchError) {
      console.error('Supabase search error:', searchError);
      return NextResponse.json(
        { error: 'Failed to search knowledge base' },
        { status: 500 }
      );
    }

    // 3. Build context from matched documents
    let context = '';
    if (matches && matches.length > 0) {
      context = matches
        .map(
          (match: any, i: number) =>
            `[${i + 1}] Category: ${match.category}\nQuestion: ${match.question}\nAnswer: ${match.answer}\n(Relevance: ${(match.similarity * 100).toFixed(1)}%)`
        )
        .join('\n\n---\n\n');
    } else {
      context = 'No relevant information found in the knowledge base.';
    }

    // 4. Build messages for Claude
    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory.slice(-6), // Keep last 3 exchanges for context
      {
        role: 'user',
        content: `Based on the following knowledge base context, please answer the user's question.

KNOWLEDGE BASE CONTEXT:
${context}

USER'S QUESTION: ${message}

Remember: Only answer based on the context above. If the context doesn't contain relevant information, say so politely.`,
      },
    ];

    // 5. Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const assistantMessage =
      response.content[0].type === 'text' ? response.content[0].text : '';

    // 6. Return the response with sources
    return NextResponse.json({
      answer: assistantMessage,
      sources: matches?.slice(0, 3).map((m: any) => ({
        category: m.category,
        question: m.question,
        similarity: m.similarity,
      })),
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
