-- ROAD Platform Database Initialization

-- Create database (if not using docker-compose default)
-- CREATE DATABASE road_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Prompts table for storing prompt templates and versions
CREATE TABLE IF NOT EXISTS prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL DEFAULT '1.0',
    content TEXT NOT NULL,
    description TEXT,
    author VARCHAR(255),
    tags TEXT[], -- Array of tags for categorization
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique combination of name and version
    UNIQUE(name, version)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_prompts_name ON prompts(name);
CREATE INDEX IF NOT EXISTS idx_prompts_active ON prompts(is_active);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at);

-- LLM conversations table for storing chat history (future use)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    model_provider VARCHAR(50) NOT NULL,
    system_prompt TEXT,
    messages JSONB NOT NULL, -- Store conversation messages as JSON
    parameters JSONB, -- Store model parameters (temperature, max_tokens, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_model ON conversations(model_name, model_provider);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

-- RAG pipelines table (for future RAG Builder feature)
CREATE TABLE IF NOT EXISTS rag_pipelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    configuration JSONB NOT NULL, -- Store pipeline configuration as JSON
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, inactive
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers for auto-updating timestamps
CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rag_pipelines_updated_at BEFORE UPDATE ON rag_pipelines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for development
INSERT INTO prompts (name, version, content, description, author, tags) VALUES
(
    'system_assistant',
    '1.0',
    'You are a helpful AI assistant. Please provide accurate, concise, and helpful responses to user queries.',
    'Basic system prompt for general assistance',
    'system',
    ARRAY['general', 'assistant', 'system']
),
(
    'code_reviewer',
    '1.0',
    'You are an expert code reviewer. Please review the provided code for:
1. Code quality and best practices
2. Potential bugs or security issues
3. Performance optimizations
4. Readability and maintainability

Provide constructive feedback with specific suggestions.',
    'System prompt for code review tasks',
    'system',
    ARRAY['code', 'review', 'development']
),
(
    'summarizer',
    '1.0',
    'You are a professional summarizer. Please create concise, accurate summaries that capture the key points and main ideas of the provided content. Focus on:
- Main concepts and themes
- Important details and facts
- Logical flow and structure
- Actionable insights when applicable',
    'System prompt for content summarization',
    'system',
    ARRAY['summary', 'content', 'analysis']
)
ON CONFLICT (name, version) DO NOTHING; 