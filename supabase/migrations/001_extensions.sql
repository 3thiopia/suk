-- ==========================================
-- Migration 001: Required Extensions
-- ==========================================

-- Enable UUID generation functions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for cryptographic utilities
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable trigram matching for fuzzy search across products & businesses
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
