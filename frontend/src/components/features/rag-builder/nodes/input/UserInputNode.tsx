import React from 'react';
import { NodeProps } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';
import { BaseNode } from '../BaseNode';
import { BaseNodeData } from '../../types';

interface UserInputNodeData extends BaseNodeData {
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
}

export const UserInputNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as UserInputNodeData;
  
  return (
    <BaseNode
      data={nodeData}
      icon={<MessageSquare size={16} />}
      color="indigo"
      inputs={false}
      outputs={true}
      selected={selected}
    >
      <div className="space-y-1">
        {nodeData.placeholder && (
          <div className="text-gray-500">"{nodeData.placeholder}"</div>
        )}
        <div className="flex gap-2 text-xs">
          {nodeData.multiline && <span className="bg-indigo-100 px-1 rounded">Multiline</span>}
          {nodeData.maxLength && <span className="bg-gray-100 px-1 rounded">Max: {nodeData.maxLength}</span>}
        </div>
      </div>
    </BaseNode>
  );
}; 