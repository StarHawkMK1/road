import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodePaletteProps, NodeCategory } from './types';
import { nodePaletteItems } from './nodes/nodeRegistry';

const categoryLabels: Record<NodeCategory, string> = {
  input: 'Input/Output',
  output: 'Output',
  llm: 'Language Models',
  rag: 'RAG Components',
  agent: 'AI Agents',
  process: 'Processing',
  evaluation: 'Evaluation',
};

export const NodePalette: React.FC<NodePaletteProps> = ({ onNodeAdd }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<NodeCategory>>(
    new Set(['input', 'llm', 'rag'])
  );

  const toggleCategory = (category: NodeCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleNodeClick = (nodeType: string) => {
    // Add node at center of viewport
    onNodeAdd(nodeType as any, { x: 250, y: 250 });
  };

  return (
    <div className="w-64 bg-light-surface dark:bg-dark-surface border-r border-light-border dark:border-dark-border h-full overflow-y-auto">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-4">Node Palette</h3>
        
        <div className="space-y-2">
          {Object.entries(nodePaletteItems).map(([category, nodes]) => {
            const categoryKey = category as NodeCategory;
            const isExpanded = expandedCategories.has(categoryKey);
            
            if (nodes.length === 0) return null;
            
            return (
              <div key={category} className="border border-light-border dark:border-dark-border rounded-lg">
                <button
                  onClick={() => toggleCategory(categoryKey)}
                  className="w-full px-3 py-2 flex items-center justify-between text-sm font-medium text-light-secondary dark:text-dark-secondary hover:bg-light-hover dark:hover:bg-dark-hover rounded-t-lg"
                >
                  <span>{categoryLabels[categoryKey]}</span>
                  {isExpanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="border-t border-light-border dark:border-dark-border">
                    {nodes.map((node) => (
                      <div
                        key={node.type}
                        className={cn(
                          "p-3 border-b border-light-border dark:border-dark-border last:border-b-0 cursor-move hover:bg-light-hover dark:hover:bg-dark-hover transition-colors",
                          "flex items-start gap-3"
                        )}
                        draggable
                        onDragStart={(e) => onDragStart(e, node.type)}
                        onClick={() => handleNodeClick(node.type)}
                        title={node.description}
                      >
                        <div className={`text-${getCategoryColor(categoryKey)}-600 dark:text-${getCategoryColor(categoryKey)}-400 flex-shrink-0 mt-0.5`}>
                          <node.icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-light-primary dark:text-dark-primary truncate">
                            {node.label}
                          </div>
                          <div className="text-xs text-light-secondary dark:text-dark-secondary line-clamp-2">
                            {node.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const getCategoryColor = (category: NodeCategory): string => {
  const colors: Record<NodeCategory, string> = {
    input: 'indigo',
    output: 'purple',
    llm: 'blue',
    rag: 'emerald',
    agent: 'rose',
    process: 'slate',
    evaluation: 'amber',
  };
  return colors[category] || 'gray';
}; 