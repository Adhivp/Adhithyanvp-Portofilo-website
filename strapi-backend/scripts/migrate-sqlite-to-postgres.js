#!/usr/bin/env node
/**
 * Migrate Strapi SQLite data to PostgreSQL (Neon)
 *
 * Prerequisites:
 * 1. Run Strapi with Postgres first (`npm run develop`) to create tables
 * 2. Stop Strapi
 * 3. Run this script: node scripts/migrate-sqlite-to-postgres.js
 */

const Database = require('better-sqlite3');
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const SQLITE_PATH = path.join(__dirname, '..', '.tmp', 'data.db');

// Tables to migrate in order (respecting foreign keys)
const TABLES_IN_ORDER = [
  'admin_roles',
  'admin_users',
  'admin_permissions',
  'admin_permissions_role_links',
  'admin_users_roles_links',
  'upload_folders',
  'files',
  'files_folder_links',
  'abouts',
  'contacts',
  'heroes',
  'events',
  'jobs',
  'projects',
  'files_related_morphs',
  'strapi_api_tokens',
  'strapi_api_token_permissions',
  'strapi_api_token_permissions_token_links',
  'up_roles',
  'up_permissions',
  'up_permissions_role_links',
];

// Columns that store timestamps as milliseconds in SQLite
// PostgreSQL timestamp columns expect ISO date strings or seconds
function isTimestampMs(value) {
  return typeof value === 'number' && value > 1000000000000 && value < 9999999999999;
}

function convertValue(value, colName) {
  if (value === null || value === undefined) return null;

  // Convert millisecond timestamps to ISO date strings
  if (isTimestampMs(value)) {
    return new Date(value).toISOString();
  }

  // Convert unix seconds timestamps (10 digits)
  if (typeof value === 'number' && value > 1000000000 && value < 9999999999 &&
      (colName.includes('created') || colName.includes('updated') || colName.includes('published'))) {
    return new Date(value * 1000).toISOString();
  }

  return value;
}

async function migrate() {
  const sqlite = new Database(SQLITE_PATH, { readonly: true });

  const pg = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await pg.connect();

  console.log('Connected to both databases.\n');

  // Disable foreign key triggers by deferring constraints
  await pg.query('SET CONSTRAINTS ALL DEFERRED;');

  for (const table of TABLES_IN_ORDER) {
    try {
      const tableExists = sqlite.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
      ).get(table);

      if (!tableExists) {
        console.log(`  Skipping ${table} (not in SQLite)`);
        continue;
      }

      const rows = sqlite.prepare(`SELECT * FROM ${table}`).all();

      if (rows.length === 0) {
        console.log(`  Skipping ${table} (empty)`);
        continue;
      }

      const columns = Object.keys(rows[0]);

      // Check which columns exist in Postgres
      const pgColResult = await pg.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND table_schema = 'public'`,
        [table]
      );
      const pgColumns = new Set(pgColResult.rows.map(r => r.column_name));

      // Only use columns that exist in both
      const validColumns = columns.filter(c => pgColumns.has(c));

      if (validColumns.length === 0) {
        console.log(`  Skipping ${table} (no matching columns in Postgres)`);
        continue;
      }

      // Clear existing data
      await pg.query(`DELETE FROM "${table}"`);

      let inserted = 0;
      let skipped = 0;

      for (const row of rows) {
        const values = validColumns.map(col => convertValue(row[col], col));
        const placeholders = validColumns.map((_, i) => `$${i + 1}`).join(', ');
        const colNames = validColumns.map(c => `"${c}"`).join(', ');

        try {
          await pg.query(
            `INSERT INTO "${table}" (${colNames}) VALUES (${placeholders})`,
            values
          );
          inserted++;
        } catch (err) {
          skipped++;
          if (skipped <= 3) {
            console.log(`    Warn: ${err.message.slice(0, 100)}`);
          }
        }
      }

      console.log(`  ✓ ${table}: ${inserted}/${rows.length} rows${skipped > 0 ? ` (${skipped} skipped)` : ''}`);

      // Reset sequences for tables with auto-increment IDs
      try {
        await pg.query(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1, false)`);
      } catch (e) {
        // Not all tables have serial IDs, ignore
      }
    } catch (err) {
      console.error(`  ✗ ${table}: ${err.message.slice(0, 120)}`);
    }
  }

  // Re-enable constraints
  await pg.query('SET CONSTRAINTS ALL IMMEDIATE;');

  // Update file URLs to point to R2
  try {
    const r2Endpoint = process.env.R2_ENDPOINT;
    const bucket = process.env.R2_BUCKET || 'adhivp-media';

    if (r2Endpoint) {
      const result = await pg.query(
        `UPDATE files SET url = $1 || '/uploads/' || hash || ext WHERE url LIKE '/uploads/%'`,
        [`${r2Endpoint}/${bucket}`]
      );
      console.log(`\n  ✓ Updated ${result.rowCount} file URLs to R2 paths`);
    } else {
      console.log('\n  ⚠ R2_ENDPOINT not set, file URLs not updated');
    }
  } catch (err) {
    console.error(`  ✗ URL update: ${err.message}`);
  }

  sqlite.close();
  await pg.end();

  console.log('\n✅ Migration complete!');
  console.log('\nNext steps:');
  console.log('1. Run `npm run develop` to start Strapi with Postgres');
  console.log('2. Login to admin panel and verify content');
  console.log('3. Deploy to Render');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
