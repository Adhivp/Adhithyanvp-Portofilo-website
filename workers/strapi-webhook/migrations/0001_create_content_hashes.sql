-- Migration to create content_hashes table
-- Tracks content hashes to avoid re-vectorizing unchanged content

CREATE TABLE IF NOT EXISTS content_hashes (
  id TEXT PRIMARY KEY,           -- e.g., 'projects-1', 'events-5'
  type TEXT NOT NULL,             -- 'projects', 'events', 'jobs'
  content_hash TEXT NOT NULL,     -- SHA-256 hash of the content
  last_updated INTEGER NOT NULL,  -- Unix timestamp
  metadata TEXT                   -- Optional JSON metadata
);

CREATE INDEX IF NOT EXISTS idx_type ON content_hashes(type);
CREATE INDEX IF NOT EXISTS idx_last_updated ON content_hashes(last_updated);
