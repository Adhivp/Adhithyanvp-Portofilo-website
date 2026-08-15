/**
 * Adhibot Cloudflare Worker
 * Handles AI chat requests with session management and vector knowledge base
 */

import { ChatSession } from './session';

export { ChatSession };

// CORS headers helper
function getCorsHeaders(origin, env) {
  const allowedOrigins = env.ALLOWED_ORIGINS.split(',');
  const isAllowed = allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, X-Session-Id',
    'Access-Control-Max-Age': '86400',
  };
}

// Handle OPTIONS preflight
function handleOptions(request, env) {
  const origin = request.headers.get('Origin') || '';
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin, env),
  });
}

// Security: Verify API key
function verifyApiKey(request, env) {
  const apiKey = request.headers.get('X-API-Key');
  return apiKey === env.WORKER_API_KEY;
}

// Main request handler
export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const corsHeaders = getCorsHeaders(origin, env);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request, env);
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders
      });
    }

    // Verify API key
    if (!verifyApiKey(request, env)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      const { message, sessionId, context } = await request.json();

      if (!message) {
        return new Response(JSON.stringify({ error: 'Message is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('📥 Request received:', { message, sessionId });

      // Get or create session
      const id = env.SESSIONS.idFromName(sessionId || 'default');
      const session = env.SESSIONS.get(id);
      console.log('✅ Durable Object session created');

      // Forward request to Durable Object
      console.log('🔄 Fetching session history...');
      const sessionResponse = await session.fetch(request.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context }),
      });

      const sessionData = await sessionResponse.json();
      console.log('✅ Session history loaded, turns:', sessionData.history?.length || 0);

      // Search vector knowledge base
      let relevantContext = '';
      try {
        console.log('🔍 Generating embedding...');
        const embedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
          text: message,
        });
        console.log('✅ Embedding generated');

        console.log('🔎 Searching Vectorize...');
        const matches = await env.VECTORIZE.query(embedding.data[0], {
          topK: 3,
          returnValues: true,
          returnMetadata: true,
        });
        console.log('✅ Vectorize search complete, matches:', matches.matches.length);

        if (matches.matches.length > 0) {
          relevantContext = matches.matches
            .map(m => m.metadata?.text || '')
            .filter(t => t)
            .join('\n\n');
        }
      } catch (error) {
        console.error('❌ Vector search error:', error.message);
        // Continue without vector context
      }

      // Prepare messages for AI
      const systemPrompt = `${context || ''}

${relevantContext ? `\n### Additional Context from Knowledge Base:\n${relevantContext}` : ''}`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...sessionData.history,
        { role: 'user', content: message },
      ];

      // Call Cloudflare Workers AI
      // Using Mistral 7B Instruct v0.2 with LoRA (improved version)
      // For model list: https://developers.cloudflare.com/workers-ai/models/
      console.log('🤖 Calling AI model: Mistral 7B v0.2 LoRA...');
      const aiResponse = await env.AI.run('@cf/mistral/mistral-7b-instruct-v0.2-lora', {
        messages,
        max_tokens: 512,        // Reduced from 1024 for shorter responses
        temperature: 0.2,       // Slightly higher for more natural conversation
        top_p: 0.8,
      });
      console.log('✅ AI response received');

      const responseText = aiResponse.response || 'Sorry, I could not generate a response.';

      // Update session with new messages
      await session.fetch(request.url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: message,
          assistantMessage: responseText,
        }),
      });

      return new Response(
        JSON.stringify({
          response: responseText,
          sessionId: sessionId || 'default',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('❌ Worker error:', error);
      console.error('Error stack:', error.stack);
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: error.message,
          details: error.stack
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  },
};
