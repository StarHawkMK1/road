import React from 'react';
import { NodeProps } from '@xyflow/react';
import { Search } from 'lucide-react';
import { BaseNode } from '../BaseNode';
import { BaseNodeData } from '../../types';

interface RetrieverNodeData extends BaseNodeData {
  strategy?: 'similarity' | 'mmr' | 'hybrid';
  topK?: number;
  scoreThreshold?: number;
}

export const RetrieverNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as RetrieverNodeData;
  
  return (
    <BaseNode
      data={nodeData}
      icon={<Search size={16} />}
      color="cyan"
      inputs={true}
      outputs={true}
      selected={selected}
    >
      <div className="space-y-1">
        {nodeData.strategy && (
          <span className="bg-cyan-100 px-1 rounded text-xs">
            {nodeData.strategy}
          </span>
        )}
        <div className="flex gap-2 text-xs">
          {nodeData.topK && (
            <span className="bg-gray-100 px-1 rounded">
              Top-K: {nodeData.topK}
            </span>
          )}
          {nodeData.scoreThreshold && (
            <span className="bg-gray-100 px-1 rounded">
              Min: {nodeData.scoreThreshold}
            </span>
          )}
        </div>
      </div>
    </BaseNode>
  );
}; 