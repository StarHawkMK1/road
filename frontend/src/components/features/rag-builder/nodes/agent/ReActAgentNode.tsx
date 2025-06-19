import React from 'react';
import { NodeProps } from '@xyflow/react';
import { Brain } from 'lucide-react';
import { BaseNode } from '../BaseNode';
import { BaseNodeData } from '../../types';

interface ReActAgentNodeData extends BaseNodeData {
  maxSteps?: number;
  thoughtPattern?: 'chain-of-thought' | 'tree-of-thought';
  tools?: string[];
}

export const ReActAgentNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as ReActAgentNodeData;
  
  return (
    <BaseNode
      data={nodeData}
      icon={<Brain size={16} />}
      color="violet"
      inputs={true}
      outputs={true}
      selected={selected}
    >
      <div className="space-y-1">
        <span className="bg-violet-100 px-1 rounded text-xs">
          Reasoning + Acting
        </span>
        <div className="flex gap-2 text-xs">
          {nodeData.thoughtPattern && (
            <span className="bg-gray-100 px-1 rounded">
              {nodeData.thoughtPattern.split('-')[0]}
            </span>
          )}
          {nodeData.maxSteps && (
            <span className="bg-gray-100 px-1 rounded">
              Steps: {nodeData.maxSteps}
            </span>
          )}
        </div>
        {nodeData.tools && nodeData.tools.length > 0 && (
          <div className="text-xs text-gray-500">
            {nodeData.tools.length} tool(s) available
          </div>
        )}
      </div>
    </BaseNode>
  );
}; 