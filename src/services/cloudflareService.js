/**
 * Cloudflare Workers AI Service
 * Replaces geminiService.js with Cloudflare Workers AI
 */

// Generate a unique session ID for the browser session
const getSessionId = () => {
  if (typeof window === 'undefined') return 'default';

  let sessionId = sessionStorage.getItem('adhibot-session-id');

  if (!sessionId) {
    // Generate a simple unique ID
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('adhibot-session-id', sessionId);
  }

  return sessionId;
};

export const getChatResponse = async (prompt, context) => {
  try {
    const workerUrl = process.env.GATSBY_CLOUDFLARE_WORKER_URL;
    const apiKey = process.env.GATSBY_WORKER_API_KEY;

    if (!workerUrl) {
      throw new Error('GATSBY_CLOUDFLARE_WORKER_URL is not defined');
    }

    if (!apiKey) {
      throw new Error('GATSBY_WORKER_API_KEY is not defined');
    }

    const sessionId = getSessionId();

    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'X-Session-Id': sessionId,
      },
      body: JSON.stringify({
        message: prompt,
        context,
        sessionId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Worker request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Cloudflare Worker Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    // Check for specific error types
    if (error.message.includes('API key')) {
      throw new Error('API key configuration error');
    } else if (error.message.includes('CORS')) {
      throw new Error('Domain not allowed');
    } else if (error.message.includes('quota')) {
      throw new Error('API quota exceeded');
    } else if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error - please check your connection');
    }

    // Re-throw generic error
    throw new Error('Failed to get response from Adhibot');
  }
};

// Clear session history
export const clearSession = async () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('adhibot-session-id');
  }
};
