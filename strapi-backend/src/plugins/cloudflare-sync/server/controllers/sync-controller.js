'use strict';

module.exports = {
  async trigger(ctx) {
    try {
      const workerUrl = process.env.CLOUDFLARE_WEBHOOK_URL;
      const webhookSecret = process.env.WEBHOOK_SECRET;

      if (!workerUrl || !webhookSecret) {
        return ctx.badRequest('Cloudflare webhook configuration missing');
      }

      // Call the Cloudflare webhook worker
      const response = await fetch(workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': webhookSecret,
        },
        body: JSON.stringify({
          event: 'manual.trigger',
          model: 'all',
          source: 'strapi-admin',
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Worker responded with ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      ctx.body = {
        success: true,
        message: 'Sync triggered successfully',
        vectorCount: result.updates?.vectorCount,
        buildTriggered: result.updates?.buildTriggered,
        buildId: result.updates?.buildId,
      };
    } catch (error) {
      ctx.throw(500, `Failed to trigger sync: ${error.message}`);
    }
  },
};
