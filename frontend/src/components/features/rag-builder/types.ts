import { Node, Edge } from '@xyflow/react';

// Base node interface
export interface BaseNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  config: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'error';
  executionTime?: number;
}

export interface RAGNode extends Node {
  data: BaseNodeData;
}

// Edge types
export interface RAGEdge extends Edge {
  data?: {
    condition?: string;  // Python expression for conditional edges
    label?: string;
    animated?: boolean;
  };
}

// Node categories
export type NodeCategory = 'input' | 'llm' | 'rag' | 'agent' | 'process' | 'evaluation' | 'output';

export type NodeType = 
  // Input/Output nodes
  | 'userInput' | 'fileUpload' | 'webScraper' | 'apiFetcher' | 'output'
  // LLM nodes
  | 'llm' | 'promptTemplate' | 'chatMemory' | 'functionCalling'
  // RAG components
  | 'documentLoader' | 'textSplitter' | 'embedder' | 'vectorStore' | 'retriever' | 'reranker'
  // Agent nodes
  | 'toolAgent' | 'reactAgent' | 'plannerAgent' | 'executorAgent' | 'routerAgent'
  // Processing nodes
  | 'transformer' | 'filter' | 'aggregator' | 'splitter' | 'loop'
  // Evaluation nodes
  | 'evaluator' | 'validator' | 'logger'
  // LangGraph/GraphRAG nodes
  | 'conditional' | 'router' | 'merge' | 'stateManager' | 'memory';

// Workflow state
export interface WorkflowState {
  messages: Message[];
  context: Record<string, any>;
  nodeStates: {
    [nodeId: string]: {
      input: any;
      output: any;
      error?: string;
      metadata: Record<string, any>;
    };
  };
  executionId: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentNode?: string;
}

// Message interface
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Workflow interface
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: RAGNode[];
  edges: RAGEdge[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Execution state
export interface ExecutionState {
  workflowId: string;
  executionId: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentNode?: string;
  nodeStates: {
    [nodeId: string]: {
      status: 'idle' | 'running' | 'success' | 'error';
      startTime?: Date;
      endTime?: Date;
      error?: string;
    };
  };
  logs: ExecutionLog[];
}

export interface ExecutionLog {
  id: string;
  nodeId: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  data?: any;
}

// Node palette item
export interface NodePaletteItem {
  type: NodeType;
  label: string;
  category: NodeCategory;
  icon: React.ComponentType<any>;
  description: string;
  defaultConfig: Record<string, any>;
}

// Connection types
export type ConnectionType = 'default' | 'conditional' | 'loop';

// Props interfaces
export interface FlowCanvasProps {
  workflow: Workflow;
  onWorkflowChange: (workflow: Workflow) => void;
  executionState?: ExecutionState;
  onNodeSelect?: (nodeId: string | null) => void;
}

export interface NodePaletteProps {
  onNodeAdd: (nodeType: NodeType, position: { x: number; y: number }) => void;
}

export interface PropertiesPanelProps {
  selectedNode?: RAGNode;
  onNodeUpdate: (nodeId: string, updates: Partial<BaseNodeData>) => void;
}

export interface ExecutionControllerProps {
  workflow: Workflow;
  onExecute: (inputs?: Record<string, any>) => void;
  onStop: () => void;
  executionState?: ExecutionState;
}

export interface ToolbarPanelProps {
  workflow: Workflow;
  onSave: () => void;
  onLoad: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onClear: () => void;
} 