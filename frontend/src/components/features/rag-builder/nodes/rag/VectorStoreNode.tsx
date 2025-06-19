import React from 'react';
import { NodeProps } from '@xyflow/react';
import { Database } from 'lucide-react';
import { BaseNode } from '../BaseNode';
import { BaseNodeData } from '../../types';

interface VectorStoreNodeData extends BaseNodeData {
  provider?: 'opensearch' | 'pinecone' | 'chroma' | 'faiss';
  indexName?: string;
  dimensions?: number;
}

export const VectorStoreNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as VectorStoreNodeData;
  
  return (
    <BaseNode
      data={nodeData}
      icon={<Database size={16} />}
      color="emerald"
      inputs={true}
      outputs={true}
      selected={selected}
    >
      <div className="space-y-1">
        {nodeData.provider && (
          <span className="bg-emerald-100 px-1 rounded text-xs">
            {nodeData.provider}
          </span>
        )}
        {nodeData.indexName && (
          <div className="text-xs text-gray-600">
            Index: {nodeData.indexName}
          </div>
        )}
        {nodeData.dimensions && (
          <span className="bg-gray-100 px-1 rounded text-xs">
            Dim: {nodeData.dimensions}
          </span>
        )}
      </div>
    </BaseNode>
  );
}; 