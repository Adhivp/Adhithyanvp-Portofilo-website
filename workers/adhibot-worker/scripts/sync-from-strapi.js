/**
 * Script to automatically sync Projects and Events from Strapi to Vectorize
 * This eliminates manual data entry
 *
 * Usage: node scripts/sync-from-strapi.js
 */

// Load environment variables from .env file
require('dotenv').config();

const fs = require('fs');
const path = require('path');

// Configuration - update these with your values
const STRAPI_URL = (process.env.STRAPI_API_URL || 'your-strapi-url').replace(/\/+$/, ''); // Remove trailing slash
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || 'your-strapi-token';

async function fetchFromStrapi(endpoint) {
  let allData = [];
  let page = 1;
  let hasMore = true;
  const pageSize = 100; // Fetch 100 items per request

  while (hasMore) {
    const url = `${STRAPI_URL}/api/${endpoint}?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
    console.log(`Fetching page ${page}: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'ngrok-skip-browser-warning': '1',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error Response: ${errorText}`);
      throw new Error(`Failed to fetch ${endpoint}: ${response.status} - ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    const items = data.data || [];
    allData = allData.concat(items);

    // Check if there are more pages
    const pagination = data.meta?.pagination;
    if (pagination) {
      console.log(`  → Got ${items.length} items (total so far: ${allData.length}/${pagination.total})`);
      hasMore = page < pagination.pageCount;
      page++;
    } else {
      hasMore = false;
    }
  }

  console.log(`✅ Total ${endpoint} fetched: ${allData.length}`);
  return allData;
}

function extractText(richText) {
  // Extract plain text from Strapi rich text format
  if (!richText) return '';
  if (typeof richText === 'string') return richText;
  if (richText.data && typeof richText.data === 'object') {
    return richText.data.description || richText.data.content || JSON.stringify(richText.data);
  }
  return JSON.stringify(richText);
}

async function syncProjects() {
  console.log('Fetching projects from Strapi...');
  const projects = await fetchFromStrapi('projects');

  return projects.map((project, index) => {
    const attributes = project.attributes || project;
    const description = extractText(attributes.description);
    const tech = attributes.tech?.strapi_json_value || attributes.tech || [];

    return {
      id: `project-${index + 1}`,
      text: `Project: ${attributes.title}

Description: ${description}

Technologies: ${Array.isArray(tech) ? tech.join(', ') : tech}

Type: Portfolio Project by Adhithyan VP`
    };
  });
}

async function syncEvents() {
  console.log('Fetching events from Strapi...');
  const events = await fetchFromStrapi('events');

  return events.map((event, index) => {
    const attributes = event.attributes || event;
    const content = extractText(attributes.content);

    return {
      id: `event-${index + 1}`,
      text: `Event: ${attributes.title}

Date: ${attributes.date}

Location: ${attributes.location}

Description: ${content}

Type: Event attended/participated by Adhithyan VP`
    };
  });
}

async function syncJobs() {
  console.log('Fetching work experience from Strapi...');
  const jobs = await fetchFromStrapi('jobs');

  return jobs.map((job, index) => {
    const attributes = job.attributes || job;
    const description = extractText(attributes.description);

    return {
      id: `job-${index + 1}`,
      text: `Work Experience: ${attributes.title} at ${attributes.company}

Duration: ${attributes.dateRange}

Description: ${description}

Type: Professional experience of Adhithyan VP`
    };
  });
}

async function main() {
  try {
    console.log('Starting Strapi sync...\n');

    // Fetch all data
    const projects = await syncProjects();
    const events = await syncEvents();
    const jobs = await syncJobs();

    // Combine all knowledge
    const knowledgeBase = [
      {
        id: 'about-1',
        text: `Adhithyan VP is an AI engineer and software engineer who builds intelligent web apps with AI and data.
He focuses on crafting intuitive, AI-powered products that solve real-world problems.`
      },
      ...projects,
      ...events,
      ...jobs,
    ];

    console.log(`\nTotal items to vectorize: ${knowledgeBase.length}`);
    console.log(`- Projects: ${projects.length}`);
    console.log(`- Events: ${events.length}`);
    console.log(`- Jobs: ${jobs.length}`);

    // Generate placeholder embeddings (actual embeddings done by Wrangler)
    const vectors = knowledgeBase.map(item => ({
      id: item.id,
      values: Array(768).fill(0), // Placeholder, Wrangler will generate real ones
      metadata: { text: item.text }
    }));

    // Write to NDJSON file
    const outputPath = path.join(__dirname, 'vectors.ndjson');
    const ndjsonContent = vectors.map(v => JSON.stringify(v)).join('\n');
    fs.writeFileSync(outputPath, ndjsonContent);

    console.log(`\n✅ Vectors written to: ${outputPath}`);
    console.log('\nNext steps:');
    console.log('1. wrangler vectorize insert adhibot-knowledge --file=scripts/vectors.ndjson');
    console.log('2. Deploy your worker: npm run deploy');

  } catch (error) {
    console.error('❌ Error syncing from Strapi:', error.message);
    console.error('\nMake sure:');
    console.error('1. STRAPI_API_URL is set correctly');
    console.error('2. STRAPI_TOKEN has read permissions');
    console.error('3. Strapi is accessible from this machine');
    process.exit(1);
  }
}

if (require.main === module) {
  // Check for required env vars
  if (!process.env.STRAPI_API_URL || !process.env.STRAPI_TOKEN) {
    console.error('❌ Missing environment variables!');
    console.error('\nUsage:');
    console.error('STRAPI_API_URL=your-url STRAPI_TOKEN=your-token node scripts/sync-from-strapi.js');
    console.error('\nOr add them to workers/adhibot-worker/.env:');
    console.error('STRAPI_API_URL=https://your-strapi-url.com');
    console.error('STRAPI_TOKEN=your-token-here');
    process.exit(1);
  }

  main();
}

module.exports = { syncProjects, syncEvents, syncJobs };
