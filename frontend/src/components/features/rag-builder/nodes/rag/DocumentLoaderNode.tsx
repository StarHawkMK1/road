import React from 'react';
import { NodeProps } from '@xyflow/react';
import { FileIcon } from 'lucide-react';
import { BaseNode } from '../BaseNode';
import { BaseNodeData } from '../../types';

interface DocumentLoaderNodeData extends BaseNodeData {
  loaderType?: 'pdf' | 'docx' | 'txt' | 'csv' | 'html' | 'web';
  url?: string;
  chunkSize?: number;
}

export const DocumentLoaderNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as DocumentLoaderNodeData;
  
  return (
    <BaseNode
      data={nodeData}
      icon={<FileIcon size={16} />}
      color="amber"
      inputs={true}
      outputs={true}
      selected={selected}
    >
      <div className="space-y-1">
        {nodeData.loaderType && (
          <span className="bg-amber-100 px-1 rounded text-xs">
            {nodeData.loaderType.toUpperCase()}
          </span>
        )}
        {nodeData.url && (
          <div className="text-xs text-gray-500 truncate">
            {nodeData.url}
          </div>
        )}
        {nodeData.chunkSize && (
          <span className="bg-gray-100 px-1 rounded text-xs">
            Chunk: {nodeData.chunkSize}
          </span>
        )}
      </div>
    </BaseNode>
  );
}; 