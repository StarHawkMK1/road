import React from 'react';
import { NodeProps } from '@xyflow/react';
import { FileText } from 'lucide-react';
import { BaseNode } from '../BaseNode';
import { BaseNodeData } from '../../types';

interface PromptTemplateNodeData extends BaseNodeData {
  templateId?: string;
  variables?: string[];
  preview?: string;
}

export const PromptTemplateNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as PromptTemplateNodeData;
  
  return (
    <BaseNode
      data={nodeData}
      icon={<FileText size={16} />}
      color="orange"
      inputs={true}
      outputs={true}
      selected={selected}
    >
      <div className="space-y-1">
        {nodeData.templateId && (
          <div className="text-gray-600 text-xs font-medium">
            ID: {nodeData.templateId}
          </div>
        )}
        {nodeData.variables && nodeData.variables.length > 0 && (
          <div className="text-xs">
            <span className="text-gray-500">Variables:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {nodeData.variables.map((variable, index) => (
                <span key={index} className="bg-orange-100 px-1 rounded text-xs">
                  {variable}
                </span>
              ))}
            </div>
          </div>
        )}
        {nodeData.preview && (
          <div className="text-xs text-gray-500 truncate" title={nodeData.preview}>
            "{nodeData.preview}"
          </div>
        )}
      </div>
    </BaseNode>
  );
}; 