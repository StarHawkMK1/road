import React from 'react';
import { NodeProps } from '@xyflow/react';
import { Scissors } from 'lucide-react';
import { BaseNode } from '../BaseNode';
import { BaseNodeData } from '../../types';

interface TextSplitterNodeData extends BaseNodeData {
  strategy?: 'character' | 'token' | 'semantic' | 'recursive';
  chunkSize?: number;
  chunkOverlap?: number;
}

export const TextSplitterNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as TextSplitterNodeData;
  
  return (
    <BaseNode
      data={nodeData}
      icon={<Scissors size={16} />}
      color="teal"
      inputs={true}
      outputs={true}
      selected={selected}
    >
      <div className="space-y-1">
        {nodeData.strategy && (
          <span className="bg-teal-100 px-1 rounded text-xs">
            {nodeData.strategy}
          </span>
        )}
        <div className="flex gap-2 text-xs">
          {nodeData.chunkSize && (
            <span className="bg-gray-100 px-1 rounded">
              Size: {nodeData.chunkSize}
            </span>
          )}
          {nodeData.chunkOverlap && (
            <span className="bg-gray-100 px-1 rounded">
              Overlap: {nodeData.chunkOverlap}
            </span>
          )}
        </div>
      </div>
    </BaseNode>
  );
}; 