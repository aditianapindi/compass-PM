-- Run this in Supabase SQL Editor (supabase.com → your project → SQL Editor)
-- Step 1: Enable pgvector extension
create extension if not exists vector;

-- Step 2: Create embeddings table
create table if not exists embeddings (
  id text primary key,
  type text not null,
  content text not null,
  metadata jsonb not null default '{}',
  embedding vector(768) not null
);

-- Step 3: Create similarity search function
create or replace function match_embeddings(
  query_embedding text,
  match_count int default 5,
  filter_type text default null
)
returns table (
  id text,
  type text,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    e.id,
    e.type,
    e.content,
    e.metadata,
    1 - (e.embedding <=> query_embedding::vector) as similarity
  from embeddings e
  where (filter_type is null or e.type = filter_type)
  order by e.embedding <=> query_embedding::vector
  limit match_count;
end;
$$;

-- Step 4: Add v2 enriched onboarding columns to profiles table
-- (Run this if profiles table already exists — safe to re-run, uses IF NOT EXISTS)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS q6 text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS q7 text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS q8 text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS exp_signals jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills jsonb;
