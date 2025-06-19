import {
  MessageSquare, Upload, Monitor, Brain, FileText, FileIcon, Scissors,
  Zap, Database, Search, Wrench, RefreshCw, Filter, GitBranch, 
  RotateCcw, Merge, Route, Hash, Clock, Network
} from 'lucide-react';

import { NodeType, NodeCategory, NodePaletteItem } from '../types';

// Node components
import { UserInputNode } from './input/UserInputNode';
import { FileUploadNode } from './input/FileUploadNode';
import { OutputNode } from './output/OutputNode';
import { LLMNode } from './llm/LLMNode';
import { PromptTemplateNode } from './llm/PromptTemplateNode';
import { DocumentLoaderNode } from './rag/DocumentLoaderNode';
import { TextSplitterNode } from './rag/TextSplitterNode';
import { EmbedderNode } from './rag/EmbedderNode';
import { VectorStoreNode } from './rag/VectorStoreNode';
import { RetrieverNode } from './rag/RetrieverNode';
import { ToolAgentNode } from './agent/ToolAgentNode';
import { ReActAgentNode } from './agent/ReActAgentNode';
import { TransformerNode } from './process/TransformerNode';
import { FilterNode } from './process/FilterNode';

// Node type registry for React Flow
export const nodeTypes = {
  userInput: UserInputNode,
  fileUpload: FileUploadNode,
  output: OutputNode,
  llm: LLMNode,
  promptTemplate: PromptTemplateNode,
  documentLoader: DocumentLoaderNode,
  textSplitter: TextSplitterNode,
  embedder: EmbedderNode,
  vectorStore: VectorStoreNode,
  retriever: RetrieverNode,
  toolAgent: ToolAgentNode,
  reactAgent: ReActAgentNode,
  transformer: TransformerNode,
  filter: FilterNode,
  // Note: LangGraph components use the same base nodes with different configs
  conditional: TransformerNode,
  router: TransformerNode,
  loop: TransformerNode,
  merge: TransformerNode,
  stateManager: TransformerNode,
  memory: TransformerNode,
};

// Node palette items grouped by category
export const nodePaletteItems: Record<NodeCategory, NodePaletteItem[]> = {
  input: [
    {
      type: 'userInput',
      label: 'User Input',
      category: 'input',
      icon: MessageSquare,
      description: 'Collect input from users',
      defaultConfig: {
        placeholder: 'Enter your message...',
        multiline: true,
      },
    },
    {
      type: 'fileUpload',
      label: 'File Upload',
      category: 'input',
      icon: Upload,
      description: 'Upload and process files',
      defaultConfig: {
        acceptedTypes: ['pdf', 'txt', 'docx'],
        multiple: false,
        maxFileSize: 10485760, // 10MB
      },
    },
  ],
  
  output: [
    {
      type: 'output',
      label: 'Output',
      category: 'output',
      icon: Monitor,
      description: 'Display final results',
      defaultConfig: {
        format: 'text',
        stream: false,
      },
    },
  ],

  llm: [
    {
      type: 'llm',
      label: 'LLM',
      category: 'llm',
      icon: Brain,
      description: 'Large Language Model processing',
      defaultConfig: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000,
      },
    },
    {
      type: 'promptTemplate',
      label: 'Prompt Template',
      category: 'llm',
      icon: FileText,
      description: 'Use saved prompt templates',
      defaultConfig: {
        variables: [],
      },
    },
  ],

  rag: [
    {
      type: 'documentLoader',
      label: 'Document Loader',
      category: 'rag',
      icon: FileIcon,
      description: 'Load and parse documents',
      defaultConfig: {
        loaderType: 'pdf',
        chunkSize: 1000,
      },
    },
    {
      type: 'textSplitter',
      label: 'Text Splitter',
      category: 'rag',
      icon: Scissors,
      description: 'Split text into chunks',
      defaultConfig: {
        strategy: 'recursive',
        chunkSize: 1000,
        chunkOverlap: 200,
      },
    },
    {
      type: 'embedder',
      label: 'Embedder',
      category: 'rag',
      icon: Zap,
      description: 'Generate text embeddings',
      defaultConfig: {
        provider: 'openai',
        model: 'text-embedding-ada-002',
        dimensions: 1536,
      },
    },
    {
      type: 'vectorStore',
      label: 'Vector Store',
      category: 'rag',
      icon: Database,
      description: 'Store and index vectors',
      defaultConfig: {
        provider: 'opensearch',
        dimensions: 1536,
      },
    },
    {
      type: 'retriever',
      label: 'Retriever',
      category: 'rag',
      icon: Search,
      description: 'Retrieve relevant documents',
      defaultConfig: {
        strategy: 'similarity',
        topK: 5,
        scoreThreshold: 0.7,
      },
    },
  ],

  agent: [
    {
      type: 'toolAgent',
      label: 'Tool Agent',
      category: 'agent',
      icon: Wrench,
      description: 'Agent with tool capabilities',
      defaultConfig: {
        tools: [],
        maxIterations: 5,
        strategy: 'sequential',
      },
    },
    {
      type: 'reactAgent',
      label: 'ReAct Agent',
      category: 'agent',
      icon: Brain,
      description: 'Reasoning and Acting agent',
      defaultConfig: {
        maxSteps: 10,
        thoughtPattern: 'chain-of-thought',
        tools: [],
      },
    },
  ],

  process: [
    {
      type: 'transformer',
      label: 'Transformer',
      category: 'process',
      icon: RefreshCw,
      description: 'Transform data format',
      defaultConfig: {
        transformType: 'format',
        outputFormat: 'json',
      },
    },
    {
      type: 'filter',
      label: 'Filter',
      category: 'process',
      icon: Filter,
      description: 'Filter data based on conditions',
      defaultConfig: {
        filterType: 'conditional',
        threshold: 0.5,
      },
    },
    {
      type: 'conditional',
      label: 'Conditional',
      category: 'process',
      icon: GitBranch,
      description: 'Conditional branching based on logic',
      defaultConfig: {
        condition: 'if',
        branches: ['true', 'false'],
        conditionType: 'python',
      },
    },
    {
      type: 'router',
      label: 'Router',
      category: 'process',
      icon: Route,
      description: 'Dynamic routing based on content',
      defaultConfig: {
        routingStrategy: 'semantic',
        routes: [],
        fallbackRoute: 'default',
      },
    },
    {
      type: 'loop',
      label: 'Loop',
      category: 'process',
      icon: RotateCcw,
      description: 'Iterative processing loop',
      defaultConfig: {
        loopType: 'while',
        maxIterations: 10,
        breakCondition: '',
      },
    },
    {
      type: 'merge',
      label: 'Merge',
      category: 'process',
      icon: Merge,
      description: 'Merge multiple data streams',
      defaultConfig: {
        mergeStrategy: 'concat',
        conflictResolution: 'last',
      },
    },
    {
      type: 'stateManager',
      label: 'State Manager',
      category: 'process',
      icon: Hash,
      description: 'Manage workflow state',
      defaultConfig: {
        stateType: 'persistent',
        scope: 'workflow',
        serialization: 'json',
      },
    },
    {
      type: 'memory',
      label: 'Memory',
      category: 'process',
      icon: Clock,
      description: 'Conversation and context memory',
      defaultConfig: {
        memoryType: 'conversational',
        maxTokens: 4000,
        summarization: true,
      },
    },
  ],

  evaluation: [],
};

// Helper functions
export const getNodePaletteItem = (nodeType: NodeType): NodePaletteItem | undefined => {
  for (const category of Object.values(nodePaletteItems)) {
    const item = category.find(item => item.type === nodeType);
    if (item) return item;
  }
  return undefined;
};

export const getAllNodeTypes = (): NodeType[] => {
  return Object.values(nodePaletteItems)
    .flat()
    .map(item => item.type);
};

export const getNodesByCategory = (category: NodeCategory): NodePaletteItem[] => {
  return nodePaletteItems[category] || [];
};

export const nodeRegistry = {
  nodeTypes,
  nodePaletteItems,
  getNodePaletteItem,
  getAllNodeTypes,
  getNodesByCategory,
}; 