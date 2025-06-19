import React from 'react';
import { NodeProps } from '@xyflow/react';
import { Zap } from 'lucide-react';
import { BaseNode } from '../BaseNode';
import { BaseNodeData } from '../../types';

interface EmbedderNodeData extends BaseNodeData {
  provider?: 'openai' | 'huggingface' | 'sentence-transformers';
  model?: string;
  dimensions?: number;
}

export const EmbedderNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as EmbedderNodeData;
  
  return (
    <BaseNode
      data={nodeData}
      icon={<Zap size={16} />}
      color="yellow"
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
        {nodeData.dimensions && (
          <span className="bg-yellow-100 px-1 rounded text-xs">
            Dim: {nodeData.dimensions}
          </span>
        )}
      </div>
    </BaseNode>
  );
}; 