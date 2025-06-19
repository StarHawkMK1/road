import React from 'react';
import { NodeProps } from '@xyflow/react';
import { RefreshCw } from 'lucide-react';
import { BaseNode } from '../BaseNode';
import { BaseNodeData } from '../../types';

interface TransformerNodeData extends BaseNodeData {
  transformType?: 'format' | 'extract' | 'clean' | 'validate';
  script?: string;
  outputFormat?: string;
}

export const TransformerNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as TransformerNodeData;
  
  return (
    <BaseNode
      data={nodeData}
      icon={<RefreshCw size={16} />}
      color="indigo"
      inputs={true}
      outputs={true}
      selected={selected}
    >
      <div className="space-y-1">
        {nodeData.transformType && (
          <span className="bg-indigo-100 px-1 rounded text-xs">
            {nodeData.transformType}
          </span>
        )}
        {nodeData.outputFormat && (
          <div className="text-xs text-gray-600">
            → {nodeData.outputFormat}
          </div>
        )}
        {nodeData.script && (
          <div className="text-xs text-gray-500 truncate" title={nodeData.script}>
            Script: {nodeData.script.slice(0, 20)}...
          </div>
        )}
      </div>
    </BaseNode>
  );
}; 