/**
 * Strapi Webhook Worker
 * Triggered when Strapi content changes to:
 * 1. Re-vectorize updated content
 * 2. Trigger Cloudflare Pages rebuild
 */

// Verify webhook signature
function verifyWebhook(request, env) {
  const signature = request.headers.get('X-Webhook-Signature');
  return signature === env.WEBHOOK_SECRET;
}

// Fetch data from Strapi with pagination
async function fetchFromStrapi(endpoint, env) {
  let allData = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `${env.STRAPI_API_URL}/api/${endpoint}?populate=*&pagination[page]=${page}&pagination[pageSize]=100`,
      {
        headers: {
          'Authorization': `Bearer ${env.STRAPI_TOKEN}`,
          'ngrok-skip-browser-warning': '1',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.status}`);
    }

    const data = await response.json();
    allData = allData.concat(data.data);

    // Check if there are more pages
    const pagination = data.meta?.pagination;
    hasMore = pagination && pagination.page < pagination.pageCount;
    page++;
  }

  return allData;
}

// Extract text from Strapi rich text
function extractText(richText) {
  if (!richText) return '';
  if (typeof richText === 'string') return richText;
  if (richText.data) {
    return richText.data.description || richText.data.content || JSON.stringify(richText.data);
  }
  return JSON.stringify(richText);
}

// Generate SHA-256 hash of content
async function hashContent(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Check if content has changed by comparing hashes
async function hasContentChanged(id, text, env) {
  const newHash = await hashContent(text);

  const result = await env.DB.prepare(
    'SELECT content_hash FROM content_hashes WHERE id = ?'
  ).bind(id).first();

  // If no record exists or hash is different, content changed
  return !result || result.content_hash !== newHash;
}

// Update content hash in D1
async function updateContentHash(id, type, text, env) {
  const hash = await hashContent(text);
  const timestamp = Math.floor(Date.now() / 1000);

  await env.DB.prepare(
    'INSERT OR REPLACE INTO content_hashes (id, type, content_hash, last_updated) VALUES (?, ?, ?, ?)'
  ).bind(id, type, hash, timestamp).run();
}

// Generate embeddings and prepare vectors (only for changed content)
// Process sequentially to stay within 50 subrequest limit
async function prepareVectors(items, type, env, maxAiCalls = Infinity) {
  if (!items || items.length === 0) return [];

  const allVectors = [];
  let changedCount = 0;
  let skippedDueToLimit = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const attributes = item.attributes || item;
    const id = `${type}-${i + 1}`;
    let text = '';

    // Format based on type
    if (type === 'projects') {
      const description = extractText(attributes.description);
      const tech = attributes.tech?.strapi_json_value || attributes.tech || [];

      text = `Project: ${attributes.title}

Description: ${description}

Technologies: ${Array.isArray(tech) ? tech.join(', ') : tech}

Type: Portfolio Project by Adhithyan VP`;
    } else if (type === 'events') {
      const content = extractText(attributes.content);

      text = `Event: ${attributes.title}

Date: ${attributes.date}

Location: ${attributes.location}

Description: ${content}

Type: Event attended/participated by Adhithyan VP`;
    } else if (type === 'jobs') {
      const description = extractText(attributes.description);

      text = `Work Experience: ${attributes.title} at ${attributes.company}

Duration: ${attributes.dateRange}

Description: ${description}

Type: Professional experience of Adhithyan VP`;
    }

    // Check if content changed
    const changed = await hasContentChanged(id, text, env);

    if (changed) {
      changedCount++;

      // Check if we've hit the AI call limit
      if (allVectors.length >= maxAiCalls) {
        skippedDueToLimit++;
        continue;
      }

      try {
        // Generate embedding
        const result = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
          text: text,
        });

        // Update hash after successful embedding
        await updateContentHash(id, type, text, env);

        allVectors.push({
          id,
          values: result.data[0],
          metadata: { text }
        });

        if (allVectors.length % 10 === 0) {
          console.log(`  ${type}: ${allVectors.length} embedded...`);
        }
      } catch (error) {
        console.error(`Failed to embed ${id}:`, error.message);
      }
    }
  }

  if (changedCount === 0) {
    console.log(`✅ No changes in ${type}`);
  } else {
    const msg = `✅ Embedded ${allVectors.length}/${changedCount} ${type} (${items.length - changedCount} unchanged)`;
    console.log(skippedDueToLimit > 0 ? `${msg} ⚠️ ${skippedDueToLimit} skipped due to limit` : msg);
  }

  return allVectors;
}

// Trigger Cloudflare Pages rebuild via Deploy Hook
async function triggerPagesBuild(env) {
  // Deploy Hook is a simple POST request to the hook URL
  const response = await fetch(env.DEPLOY_HOOK_URL, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Deploy Hook error (${response.status}):`, errorBody);
    throw new Error(`Failed to trigger rebuild: ${response.status} - ${errorBody}`);
  }

  const result = await response.json();
  console.log('✅ Deploy Hook triggered:', result);
  return result;
}

// Main webhook handler
export default {
  async fetch(request, env, ctx) {
    // Only allow POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Verify webhook signature
    if (!verifyWebhook(request, env)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const payload = await request.json();
      const { event, model } = payload;

      console.log(`Webhook received: ${event} on ${model}`);

      // Track what was updated
      const updates = {
        vectorized: false,
        buildTriggered: false,
        model,
        event,
      };

      // Re-vectorize if content changed or manual trigger
      if (['entry.create', 'entry.update', 'entry.delete', 'trigger-test', 'manual.trigger'].includes(event)) {
        console.log('Content changed, re-vectorizing...');

        // Fetch only Projects and Events (Jobs and About are already in BotContext)
        const [projects, events] = await Promise.all([
          fetchFromStrapi('projects', env),
          fetchFromStrapi('events', env),
        ]);

        console.log(`Fetched: ${projects.length} projects, ${events.length} events`);

        // Track AI calls to stay under 50 subrequest limit (use 45 to be safe)
        const MAX_AI_CALLS = 45;
        let aiCallsUsed = 0;

        // Generate vectors sequentially to avoid subrequest limit
        // Only vectorize Projects and Events (not Jobs/About - those are in BotContext)
        const projectVectors = await prepareVectors(projects, 'projects', env, MAX_AI_CALLS - aiCallsUsed);
        aiCallsUsed += projectVectors.length;

        const eventVectors = await prepareVectors(events, 'events', env, MAX_AI_CALLS - aiCallsUsed);
        aiCallsUsed += eventVectors.length;

        // Combine all vectors (only changed ones)
        const allVectors = [...projectVectors, ...eventVectors];

        if (allVectors.length > 0) {
          // Insert into Vectorize (this replaces existing vectors with same IDs)
          await env.VECTORIZE.upsert(allVectors);
          updates.vectorized = true;
          updates.vectorCount = allVectors.length;
          console.log(`✅ Vectorized ${allVectors.length} changed items (used ${aiCallsUsed}/${MAX_AI_CALLS} AI calls)`);

          // Check if we hit the limit
          if (aiCallsUsed >= MAX_AI_CALLS) {
            updates.limitReached = true;
            updates.message = 'Processed maximum items per trigger. Click Trigger again to process remaining items.';
            console.log('⚠️ Hit AI call limit - trigger again to process remaining items');
          }
        } else {
          console.log('✅ No content changes detected, skipping vectorization');
          updates.vectorized = false;
          updates.vectorCount = 0;
        }
      }

      // Trigger rebuild for any content change or manual trigger
      if (['entry.create', 'entry.update', 'entry.delete', 'entry.publish', 'entry.unpublish', 'trigger-test', 'manual.trigger'].includes(event)) {
        console.log('Triggering Cloudflare Pages rebuild via Deploy Hook...');

        try {
          const buildResult = await triggerPagesBuild(env);
          updates.buildTriggered = true;
          updates.deploymentId = buildResult.id;
          console.log('✅ Pages rebuild triggered successfully');
        } catch (error) {
          console.error('Failed to trigger rebuild:', error.message);
          updates.buildTriggered = false;
          updates.buildError = error.message;
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Webhook processed successfully',
          updates,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Webhook error:', error);
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },
};
