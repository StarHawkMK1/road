import React from 'react';
import { NodeProps } from '@xyflow/react';
import { Brain } from 'lucide-react';
import { BaseNode } from '../BaseNode';
import { BaseNodeData } from '../../types';

interface LLMNodeData extends BaseNodeData {
  provider?: 'openai' | 'anthropic' | 'google' | 'groq';
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export const LLMNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as LLMNodeData;
  
  return (
    <BaseNode
      data={nodeData}
      icon={<Brain size={16} />}
      color="blue"
      inputs={true}
      outputs={true}
      selected={selected}
    >
      <div className="space-y-1">
        {nodeData.provider && nodeData.model && (
          <div className="text-gray-600 text-xs font-medium">
            {nodeData.provider}: {nodeData.model}
          </div>
        )}
        <div className="flex gap-2 text-xs">
          {nodeData.temperature !== undefined && (
            <span className="bg-blue-100 px-1 rounded">
              T: {nodeData.temperature}
            </span>
          )}
          {nodeData.maxTokens && (
            <span className="bg-gray-100 px-1 rounded">
              Max: {nodeData.maxTokens}
            </span>
          )}
        </div>
      </div>
    </BaseNode>
  );
}; 