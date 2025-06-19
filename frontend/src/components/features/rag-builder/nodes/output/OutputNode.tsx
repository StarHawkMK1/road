import React from 'react';
import { NodeProps } from '@xyflow/react';
import { Monitor } from 'lucide-react';
import { BaseNode } from '../BaseNode';
import { BaseNodeData } from '../../types';

interface OutputNodeData extends BaseNodeData {
  format?: 'text' | 'json' | 'markdown' | 'html';
  stream?: boolean;
}

export const OutputNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as OutputNodeData;
  
  return (
    <BaseNode
      data={nodeData}
      icon={<Monitor size={16} />}
      color="purple"
      inputs={true}
      outputs={false}
      selected={selected}
    >
      <div className="space-y-1">
        <div className="flex gap-2 text-xs">
          {nodeData.format && (
            <span className="bg-purple-100 px-1 rounded">
              {nodeData.format.toUpperCase()}
            </span>
          )}
          {nodeData.stream && <span className="bg-blue-100 px-1 rounded">Stream</span>}
        </div>
      </div>
    </BaseNode>
  );
}; 