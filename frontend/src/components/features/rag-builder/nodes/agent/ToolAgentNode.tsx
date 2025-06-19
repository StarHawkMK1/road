import React from 'react';
import { NodeProps } from '@xyflow/react';
import { Wrench } from 'lucide-react';
import { BaseNode } from '../BaseNode';
import { BaseNodeData } from '../../types';

interface ToolAgentNodeData extends BaseNodeData {
  tools?: string[];
  maxIterations?: number;
  strategy?: 'sequential' | 'parallel';
}

export const ToolAgentNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as ToolAgentNodeData;
  
  return (
    <BaseNode
      data={nodeData}
      icon={<Wrench size={16} />}
      color="rose"
      inputs={true}
      outputs={true}
      selected={selected}
    >
      <div className="space-y-1">
        {nodeData.tools && nodeData.tools.length > 0 && (
          <div className="text-xs">
            <span className="text-gray-500">Tools ({nodeData.tools.length}):</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {nodeData.tools.slice(0, 3).map((tool, index) => (
                <span key={index} className="bg-rose-100 px-1 rounded text-xs">
                  {tool}
                </span>
              ))}
              {nodeData.tools.length > 3 && (
                <span className="text-gray-400 text-xs">+{nodeData.tools.length - 3}</span>
              )}
            </div>
          </div>
        )}
        <div className="flex gap-2 text-xs">
          {nodeData.strategy && (
            <span className="bg-gray-100 px-1 rounded">
              {nodeData.strategy}
            </span>
          )}
          {nodeData.maxIterations && (
            <span className="bg-gray-100 px-1 rounded">
              Max: {nodeData.maxIterations}
            </span>
          )}
        </div>
      </div>
    </BaseNode>
  );
}; 