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

// Fetch data from Strapi
async function fetchFromStrapi(endpoint, env) {
  const response = await fetch(`${env.STRAPI_API_URL}/api/${endpoint}?populate=*`, {
    headers: {
      'Authorization': `Bearer ${env.STRAPI_TOKEN}`,
      'ngrok-skip-browser-warning': '1',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
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

// Generate embeddings and prepare vectors
async function prepareVectors(items, type, env) {
  const vectors = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const attributes = item.attributes || item;
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

    // Generate embedding
    const embedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
      text: text,
    });

    vectors.push({
      id: `${type}-${i + 1}`,
      values: embedding.data[0],
      metadata: { text }
    });
  }

  return vectors;
}

// Trigger Cloudflare Pages rebuild
async function triggerPagesBuild(env) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/pages/projects/${env.CLOUDFLARE_PAGES_PROJECT_NAME}/deployments`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        production_branch: 'main'
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to trigger build: ${response.status}`);
  }

  return await response.json();
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

      // Re-vectorize if content changed
      if (['entry.create', 'entry.update', 'entry.delete'].includes(event)) {
        console.log('Content changed, re-vectorizing...');

        // Fetch all data (we re-vectorize everything for simplicity)
        const [projects, events, jobs] = await Promise.all([
          fetchFromStrapi('projects', env),
          fetchFromStrapi('events', env),
          fetchFromStrapi('jobs', env),
        ]);

        // Generate vectors
        const [projectVectors, eventVectors, jobVectors] = await Promise.all([
          prepareVectors(projects, 'projects', env),
          prepareVectors(events, 'events', env),
          prepareVectors(jobs, 'jobs', env),
        ]);

        // Add about section
        const aboutVector = {
          id: 'about-1',
          values: (await env.AI.run('@cf/baai/bge-base-en-v1.5', {
            text: `Adhithyan VP is an AI engineer and software engineer who builds intelligent web apps with AI and data.
He focuses on crafting intuitive, AI-powered products that solve real-world problems.`
          })).data[0],
          metadata: {
            text: `Adhithyan VP is an AI engineer and software engineer who builds intelligent web apps with AI and data.
He focuses on crafting intuitive, AI-powered products that solve real-world problems.`
          }
        };

        // Combine all vectors
        const allVectors = [aboutVector, ...projectVectors, ...eventVectors, ...jobVectors];

        // Insert into Vectorize (this replaces existing vectors with same IDs)
        await env.VECTORIZE.upsert(allVectors);

        updates.vectorized = true;
        updates.vectorCount = allVectors.length;
        console.log(`✅ Vectorized ${allVectors.length} items`);
      }

      // Trigger rebuild for any content change
      if (['entry.create', 'entry.update', 'entry.delete', 'entry.publish', 'entry.unpublish'].includes(event)) {
        console.log('Triggering Cloudflare Pages rebuild...');

        const buildResult = await triggerPagesBuild(env);
        updates.buildTriggered = true;
        updates.buildId = buildResult.result?.id;
        console.log(`✅ Build triggered: ${buildResult.result?.id}`);
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
