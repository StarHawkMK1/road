import React from 'react';
import { NodeProps } from '@xyflow/react';
import { Filter } from 'lucide-react';
import { BaseNode } from '../BaseNode';
import { BaseNodeData } from '../../types';

interface FilterNodeData extends BaseNodeData {
  condition?: string;
  filterType?: 'include' | 'exclude' | 'conditional';
  threshold?: number;
}

export const FilterNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as FilterNodeData;
  
  return (
    <BaseNode
      data={nodeData}
      icon={<Filter size={16} />}
      color="slate"
      inputs={true}
      outputs={true}
      selected={selected}
    >
      <div className="space-y-1">
        {nodeData.filterType && (
          <span className="bg-slate-100 px-1 rounded text-xs">
            {nodeData.filterType}
          </span>
        )}
        {nodeData.condition && (
          <div className="text-xs text-gray-500 truncate" title={nodeData.condition}>
            {nodeData.condition}
          </div>
        )}
        {nodeData.threshold && (
          <span className="bg-gray-100 px-1 rounded text-xs">
            Threshold: {nodeData.threshold}
          </span>
        )}
      </div>
    </BaseNode>
  );
}; 