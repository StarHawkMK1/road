import React from 'react';
import { NodeProps } from '@xyflow/react';
import { Upload } from 'lucide-react';
import { BaseNode } from '../BaseNode';
import { BaseNodeData } from '../../types';

interface FileUploadNodeData extends BaseNodeData {
  acceptedTypes?: string[];
  maxFileSize?: number;
  multiple?: boolean;
}

export const FileUploadNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as FileUploadNodeData;
  
  return (
    <BaseNode
      data={nodeData}
      icon={<Upload size={16} />}
      color="green"
      inputs={false}
      outputs={true}
      selected={selected}
    >
      <div className="space-y-1">
        {nodeData.acceptedTypes && (
          <div className="text-gray-500 text-xs">
            Types: {nodeData.acceptedTypes.join(', ')}
          </div>
        )}
        <div className="flex gap-2 text-xs">
          {nodeData.multiple && <span className="bg-green-100 px-1 rounded">Multiple</span>}
          {nodeData.maxFileSize && (
            <span className="bg-gray-100 px-1 rounded">
              Max: {Math.round(nodeData.maxFileSize / 1024 / 1024)}MB
            </span>
          )}
        </div>
      </div>
    </BaseNode>
  );
}; 