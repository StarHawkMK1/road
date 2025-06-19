import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { BaseNodeData } from '../types';

interface BaseNodeProps {
  data: BaseNodeData;
  icon?: React.ReactNode;
  color?: string;
  inputs?: boolean;
  outputs?: boolean;
  selected?: boolean;
  children?: React.ReactNode;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  data,
  icon,
  color = 'blue',
  inputs = true,
  outputs = true,
  selected,
  children,
}) => {
  const getStatusColor = () => {
    switch (data.status) {
      case 'running':
        return 'border-blue-500 bg-blue-50 shadow-blue-200';
      case 'success':
        return 'border-green-500 bg-green-50';
      case 'error':
        return 'border-red-500 bg-red-50';
      default:
        return `border-${color}-300 bg-white`;
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'running':
        return (
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
        );
      case 'success':
        return (
          <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        );
      case 'error':
        return (
          <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">!</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'min-w-[200px] border-2 rounded-lg p-3 transition-all duration-200',
        getStatusColor(),
        selected && 'ring-2 ring-blue-400 ring-offset-2',
        data.status === 'running' && 'animate-pulse'
      )}
    >
      {/* Input handles */}
      {inputs && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-gray-400 border-2 border-white"
        />
      )}

      {/* Node header */}
      <div className="flex items-center gap-2 mb-2">
        {icon && (
          <div className={`text-${color}-600 flex-shrink-0`}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-900 truncate">
            {data.label}
          </h4>
          {data.description && (
            <p className="text-xs text-gray-500 truncate">
              {data.description}
            </p>
          )}
        </div>
        {getStatusIcon()}
      </div>

      {/* Node content */}
      {children && (
        <div className="mt-2 text-xs text-gray-600">
          {children}
        </div>
      )}

      {/* Execution time */}
      {data.executionTime && (
        <div className="mt-2 text-xs text-gray-400">
          {data.executionTime}ms
        </div>
      )}

      {/* Output handles */}
      {outputs && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-gray-400 border-2 border-white"
        />
      )}
    </div>
  );
}; 