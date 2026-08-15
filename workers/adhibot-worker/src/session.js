/**
 * Durable Object for managing chat sessions
 * Stores conversation history without requiring user login
 */

export class ChatSession {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.history = [];
    this.lastAccess = Date.now();
  }

  async fetch(request) {
    // Initialize from storage on first access
    if (!this.initialized) {
      const stored = await this.state.storage.get('history');
      const lastAccess = await this.state.storage.get('lastAccess');

      if (stored) {
        this.history = stored;
      }
      if (lastAccess) {
        this.lastAccess = lastAccess;
      }

      this.initialized = true;

      // Check if session expired
      const timeoutMs = (parseInt(this.env.MAX_HISTORY_LENGTH) || 60) * 60 * 1000;
      if (Date.now() - this.lastAccess > timeoutMs) {
        // Session expired, clear history
        this.history = [];
        await this.state.storage.delete('history');
      }
    }

    const method = request.method;

    if (method === 'POST') {
      // Get current history
      return new Response(
        JSON.stringify({ history: this.history }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'PUT') {
      // Update history with new messages
      const { userMessage, assistantMessage } = await request.json();

      this.history.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: assistantMessage }
      );

      // Keep only last N messages
      const maxLength = parseInt(this.env.MAX_HISTORY_LENGTH) || 10;
      if (this.history.length > maxLength * 2) {
        this.history = this.history.slice(-maxLength * 2);
      }

      this.lastAccess = Date.now();

      // Persist to storage
      await this.state.storage.put('history', this.history);
      await this.state.storage.put('lastAccess', this.lastAccess);

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (method === 'DELETE') {
      // Clear session history
      this.history = [];
      await this.state.storage.delete('history');
      await this.state.storage.delete('lastAccess');

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method not allowed', { status: 405 });
  }
}
