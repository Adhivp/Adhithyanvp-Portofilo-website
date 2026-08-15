/**
 * Script to populate Vectorize with portfolio knowledge
 * This stores Projects and Events for semantic search
 *
 * TODO: Replace this manual data with automatic sync from Strapi
 * Run: node scripts/insert-vectors.js
 */

const fs = require('fs');
const path = require('path');

// Portfolio data to be embedded
// Add your projects and events here from Strapi
const knowledgeBase = [
  // About section
  {
    id: 'about-1',
    text: `Adhithyan VP is an AI engineer and software engineer who builds intelligent web apps with AI and data.
    He focuses on crafting intuitive, AI-powered products that solve real-world problems.`
  },

  // Example Projects - Replace with your actual projects from Strapi
  // Format: One object per project
  {
    id: 'project-1',
    text: `Project: [PROJECT_NAME]
    Description: [PROJECT_DESCRIPTION]
    Technologies: [TECH_STACK]
    Features: [KEY_FEATURES]
    Role: [YOUR_ROLE]`
  },

  // Example Events - Replace with your actual events from Strapi
  // Format: One object per event
  {
    id: 'event-1',
    text: `Event: [EVENT_NAME]
    Date: [EVENT_DATE]
    Location: [EVENT_LOCATION]
    Description: [EVENT_DESCRIPTION]
    Role: [YOUR_ROLE/PARTICIPATION]`
  },

  // Add more projects and events here...
  // Tip: Export from Strapi and convert to this format
];

async function getEmbeddings(text) {
  // This would typically call the AI model to get embeddings
  // For now, returning placeholder - you'll run this via wrangler
  console.log(`Getting embeddings for: ${text.substring(0, 50)}...`);
  return Array(768).fill(0); // Placeholder
}

async function insertVectors() {
  console.log('Starting vector insertion...');
  console.log(`Total items to process: ${knowledgeBase.length}`);

  // This script is meant to be used with wrangler vectorize insert
  // Generate ndjson format for bulk insert
  const vectors = [];

  for (const item of knowledgeBase) {
    vectors.push({
      id: item.id,
      values: await getEmbeddings(item.text),
      metadata: { text: item.text }
    });
  }

  // Write to file for manual insertion
  const outputPath = path.join(__dirname, 'vectors.ndjson');
  const ndjsonContent = vectors.map(v => JSON.stringify(v)).join('\n');
  fs.writeFileSync(outputPath, ndjsonContent);

  console.log(`\nVectors written to: ${outputPath}`);
  console.log('\nTo insert into Vectorize, run:');
  console.log('wrangler vectorize insert adhibot-knowledge --file=scripts/vectors.ndjson');
}

// Better approach: Use this with actual Strapi data
function generateFromStrapi() {
  console.log('\nTo populate from your actual Strapi data:');
  console.log('1. Export your portfolio data from Strapi');
  console.log('2. Update the knowledgeBase array above with real content');
  console.log('3. Run this script again');
  console.log('\nOr use the Worker to embed data on-the-fly during build time.');
}

if (require.main === module) {
  insertVectors().then(() => {
    generateFromStrapi();
    console.log('\nDone!');
  }).catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}

module.exports = { insertVectors, knowledgeBase };
