-- Migration: Add RAG Builder tables
-- Date: 2024-01-01
-- Description: Add workflow, execution, and related tables for RAG Builder functionality

-- Create workflows table
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    graph_data JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}',
    workflow_metadata JSONB DEFAULT '{}',
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create workflow_executions table
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'running',
    inputs JSONB,
    outputs JSONB,
    execution_time_ms INTEGER,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create node_executions table
CREATE TABLE IF NOT EXISTS node_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
    node_id VARCHAR(255) NOT NULL,
    node_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'running',
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create workflow_templates table for reusable templates
CREATE TABLE IF NOT EXISTS workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    graph_data JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}',
    template_metadata JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create workflow_shares table for sharing workflows
CREATE TABLE IF NOT EXISTS workflow_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    shared_by VARCHAR(255) NOT NULL,
    shared_with VARCHAR(255), -- null means public
    permission VARCHAR(20) DEFAULT 'read', -- read, write, execute
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workflows_created_by ON workflows(created_by);
CREATE INDEX IF NOT EXISTS idx_workflows_updated_at ON workflows(updated_at);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON workflow_executions(started_at);
CREATE INDEX IF NOT EXISTS idx_node_executions_execution_id ON node_executions(execution_id);
CREATE INDEX IF NOT EXISTS idx_node_executions_node_id ON node_executions(node_id);
CREATE INDEX IF NOT EXISTS idx_node_executions_status ON node_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_is_public ON workflow_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_workflow_shares_workflow_id ON workflow_shares(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_shares_shared_with ON workflow_shares(shared_with);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_workflows_updated_at 
    BEFORE UPDATE ON workflows 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_templates_updated_at 
    BEFORE UPDATE ON workflow_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample workflow templates
INSERT INTO workflow_templates (name, description, category, graph_data, is_public, created_by) VALUES 
(
    'Basic RAG Pipeline',
    'A simple RAG pipeline with document loading, embedding, and retrieval',
    'rag',
    '{
        "nodes": [
            {
                "id": "input-1",
                "type": "userInput",
                "position": {"x": 100, "y": 100},
                "data": {
                    "label": "User Input",
                    "description": "User question input",
                    "config": {"placeholder": "Ask a question..."},
                    "status": "idle"
                }
            },
            {
                "id": "loader-1",
                "type": "documentLoader",
                "position": {"x": 300, "y": 100},
                "data": {
                    "label": "Document Loader",
                    "description": "Load PDF documents",
                    "config": {"loaderType": "pdf", "chunkSize": 1000},
                    "status": "idle"
                }
            },
            {
                "id": "embedder-1",
                "type": "embedder",
                "position": {"x": 500, "y": 100},
                "data": {
                    "label": "Embedder",
                    "description": "Generate embeddings",
                    "config": {"provider": "openai", "model": "text-embedding-ada-002"},
                    "status": "idle"
                }
            },
            {
                "id": "retriever-1",
                "type": "retriever",
                "position": {"x": 700, "y": 100},
                "data": {
                    "label": "Retriever",
                    "description": "Retrieve relevant documents",
                    "config": {"strategy": "similarity", "topK": 5},
                    "status": "idle"
                }
            },
            {
                "id": "llm-1",
                "type": "llm",
                "position": {"x": 900, "y": 100},
                "data": {
                    "label": "LLM",
                    "description": "Generate response",
                    "config": {"provider": "openai", "model": "gpt-4", "temperature": 0.7},
                    "status": "idle"
                }
            },
            {
                "id": "output-1",
                "type": "output",
                "position": {"x": 1100, "y": 100},
                "data": {
                    "label": "Output",
                    "description": "Final response",
                    "config": {"format": "text"},
                    "status": "idle"
                }
            }
        ],
        "edges": [
            {"id": "e1", "source": "input-1", "target": "retriever-1", "type": "default"},
            {"id": "e2", "source": "loader-1", "target": "embedder-1", "type": "default"},
            {"id": "e3", "source": "embedder-1", "target": "retriever-1", "type": "default"},
            {"id": "e4", "source": "retriever-1", "target": "llm-1", "type": "default"},
            {"id": "e5", "source": "llm-1", "target": "output-1", "type": "default"}
        ]
    }',
    true,
    'system'
),
(
    'Agent Workflow',
    'Multi-agent workflow with planning and execution',
    'agent',
    '{
        "nodes": [
            {
                "id": "input-1",
                "type": "userInput",
                "position": {"x": 100, "y": 200},
                "data": {
                    "label": "Task Input",
                    "description": "Input task description",
                    "config": {},
                    "status": "idle"
                }
            },
            {
                "id": "planner-1",
                "type": "plannerAgent",
                "position": {"x": 300, "y": 200},
                "data": {
                    "label": "Planner Agent",
                    "description": "Plan task execution",
                    "config": {"maxSteps": 5},
                    "status": "idle"
                }
            },
            {
                "id": "executor-1",
                "type": "executorAgent",
                "position": {"x": 500, "y": 200},
                "data": {
                    "label": "Executor Agent",
                    "description": "Execute planned tasks",
                    "config": {"tools": ["search", "calculator"]},
                    "status": "idle"
                }
            },
            {
                "id": "output-1",
                "type": "output",
                "position": {"x": 700, "y": 200},
                "data": {
                    "label": "Result",
                    "description": "Task execution result",
                    "config": {"format": "json"},
                    "status": "idle"
                }
            }
        ],
        "edges": [
            {"id": "e1", "source": "input-1", "target": "planner-1", "type": "default"},
            {"id": "e2", "source": "planner-1", "target": "executor-1", "type": "default"},
            {"id": "e3", "source": "executor-1", "target": "output-1", "type": "default"}
        ]
    }',
    true,
    'system'
);

-- Add comments to tables
COMMENT ON TABLE workflows IS 'Stores user-created workflows with nodes and edges';
COMMENT ON TABLE workflow_executions IS 'Tracks workflow execution instances';
COMMENT ON TABLE node_executions IS 'Tracks individual node executions within workflows';
COMMENT ON TABLE workflow_templates IS 'Stores reusable workflow templates';
COMMENT ON TABLE workflow_shares IS 'Manages workflow sharing permissions'; 