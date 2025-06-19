import React, { useState, useEffect } from 'react';
import { X, Settings, Info } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Textarea from '@/components/common/Textarea';
import Select from '@/components/common/Select';
import { PropertiesPanelProps } from './types';
import { getNodePaletteItem } from './nodes/nodeRegistry';

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  onNodeUpdate,
}) => {
  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'general' | 'config' | 'advanced'>('general');

  useEffect(() => {
    if (selectedNode) {
      setFormData({
        label: selectedNode.data.label || '',
        description: selectedNode.data.description || '',
        ...selectedNode.data.config,
      });
    }
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <div className="w-80 bg-light-surface dark:bg-dark-surface border-l border-light-border dark:border-dark-border h-full flex items-center justify-center">
        <div className="text-center text-light-secondary dark:text-dark-secondary">
          <Settings size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-sm">Select a node to edit its properties</p>
        </div>
      </div>
    );
  }

  const nodeInfo = getNodePaletteItem(selectedNode.type as any);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    const { label, description, ...config } = formData;
    onNodeUpdate(selectedNode.id, {
      label,
      description,
      config,
    });
  };

  const handleReset = () => {
    setFormData({
      label: selectedNode.data.label || '',
      description: selectedNode.data.description || '',
      ...selectedNode.data.config,
    });
  };

  const renderGeneralTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
          Node Label
        </label>
        <Input
          value={formData.label || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('label', e.target.value)}
          placeholder="Enter node label"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
          Description
        </label>
        <Textarea
          value={formData.description || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
          placeholder="Enter node description"
          rows={3}
        />
      </div>
      
      {nodeInfo && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium">{nodeInfo.label}</p>
              <p className="mt-1">{nodeInfo.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderConfigTab = () => {
    const config = selectedNode.data.config || {};
    
    return (
      <div className="space-y-4">
        {selectedNode.type === 'llm' && (
          <>
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Provider
              </label>
              <Select
                value={formData.provider || 'openai'}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('provider', e.target.value)}
                options={[
                  { value: 'openai', label: 'OpenAI' },
                  { value: 'anthropic', label: 'Anthropic' },
                  { value: 'google', label: 'Google' },
                  { value: 'groq', label: 'Groq' },
                ]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Model
              </label>
              <Input
                value={formData.model || ''}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder="e.g., gpt-4"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Temperature ({formData.temperature || 0.7})
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={formData.temperature || 0.7}
                onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Max Tokens
              </label>
              <Input
                type="number"
                value={formData.maxTokens?.toString() || ''}
                onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
                placeholder="e.g., 1000"
              />
            </div>
          </>
        )}
        
        {selectedNode.type === 'retriever' && (
          <>
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Strategy
              </label>
              <Select
                value={formData.strategy || 'similarity'}
                onChange={(e) => handleInputChange('strategy', e.target.value)}
                options={[
                  { value: 'similarity', label: 'Similarity' },
                  { value: 'mmr', label: 'MMR' },
                  { value: 'hybrid', label: 'Hybrid' },
                ]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Top-K
              </label>
              <Input
                type="number"
                value={formData.topK?.toString() || ''}
                onChange={(e) => handleInputChange('topK', parseInt(e.target.value))}
                placeholder="e.g., 5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Score Threshold ({formData.scoreThreshold || 0.7})
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={formData.scoreThreshold || 0.7}
                onChange={(e) => handleInputChange('scoreThreshold', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </>
        )}
        
        {selectedNode.type === 'textSplitter' && (
          <>
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Strategy
              </label>
              <Select
                value={formData.strategy || 'recursive'}
                onChange={(e) => handleInputChange('strategy', e.target.value)}
                options={[
                  { value: 'character', label: 'Character' },
                  { value: 'token', label: 'Token' },
                  { value: 'semantic', label: 'Semantic' },
                  { value: 'recursive', label: 'Recursive' },
                ]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Chunk Size
              </label>
              <Input
                type="number"
                value={formData.chunkSize?.toString() || ''}
                onChange={(e) => handleInputChange('chunkSize', parseInt(e.target.value))}
                placeholder="e.g., 1000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Chunk Overlap
              </label>
              <Input
                type="number"
                value={formData.chunkOverlap?.toString() || ''}
                onChange={(e) => handleInputChange('chunkOverlap', parseInt(e.target.value))}
                placeholder="e.g., 200"
              />
            </div>
          </>
        )}
        
        {selectedNode.type === 'conditional' && (
          <>
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Condition Type
              </label>
              <Select
                value={formData.conditionType || 'python'}
                onChange={(e) => handleInputChange('conditionType', e.target.value)}
                options={[
                  { value: 'python', label: 'Python Expression' },
                  { value: 'javascript', label: 'JavaScript Expression' },
                  { value: 'simple', label: 'Simple Comparison' },
                ]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Condition
              </label>
              <Textarea
                value={formData.condition || ''}
                onChange={(e) => handleInputChange('condition', e.target.value)}
                placeholder="e.g., input.score > 0.8"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Branches (comma-separated)
              </label>
              <Input
                value={(formData.branches || ['true', 'false']).join(', ')}
                onChange={(e) => handleInputChange('branches', e.target.value.split(', ').map(s => s.trim()))}
                placeholder="true, false"
              />
            </div>
          </>
        )}
        
        {selectedNode.type === 'router' && (
          <>
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Routing Strategy
              </label>
              <Select
                value={formData.routingStrategy || 'semantic'}
                onChange={(e) => handleInputChange('routingStrategy', e.target.value)}
                options={[
                  { value: 'semantic', label: 'Semantic Similarity' },
                  { value: 'keyword', label: 'Keyword Matching' },
                  { value: 'classifier', label: 'ML Classifier' },
                  { value: 'rule-based', label: 'Rule-based' },
                ]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Routes (JSON)
              </label>
              <Textarea
                value={JSON.stringify(formData.routes || [], null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleInputChange('routes', parsed);
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                rows={5}
                placeholder='[{"name": "technical", "keywords": ["api", "code"]}, {"name": "general", "keywords": ["help", "info"]}]'
                className="font-mono text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Fallback Route
              </label>
              <Input
                value={formData.fallbackRoute || 'default'}
                onChange={(e) => handleInputChange('fallbackRoute', e.target.value)}
                placeholder="default"
              />
            </div>
          </>
        )}
        
        {selectedNode.type === 'loop' && (
          <>
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Loop Type
              </label>
              <Select
                value={formData.loopType || 'while'}
                onChange={(e) => handleInputChange('loopType', e.target.value)}
                options={[
                  { value: 'while', label: 'While Loop' },
                  { value: 'for', label: 'For Loop' },
                  { value: 'until', label: 'Until Loop' },
                ]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Max Iterations
              </label>
              <Input
                type="number"
                value={(formData.maxIterations ?? 10).toString()}
                onChange={(e) => handleInputChange('maxIterations', parseInt(e.target.value))}
                placeholder="10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Break Condition
              </label>
              <Textarea
                value={formData.breakCondition || ''}
                onChange={(e) => handleInputChange('breakCondition', e.target.value)}
                placeholder="e.g., result.confidence > 0.9"
                rows={2}
              />
            </div>
          </>
        )}
        
        {selectedNode.type === 'merge' && (
          <>
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Merge Strategy
              </label>
              <Select
                value={formData.mergeStrategy || 'concat'}
                onChange={(e) => handleInputChange('mergeStrategy', e.target.value)}
                options={[
                  { value: 'concat', label: 'Concatenate' },
                  { value: 'union', label: 'Union' },
                  { value: 'intersect', label: 'Intersection' },
                  { value: 'weighted', label: 'Weighted Average' },
                ]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Conflict Resolution
              </label>
              <Select
                value={formData.conflictResolution || 'last'}
                onChange={(e) => handleInputChange('conflictResolution', e.target.value)}
                options={[
                  { value: 'first', label: 'First Wins' },
                  { value: 'last', label: 'Last Wins' },
                  { value: 'merge', label: 'Merge All' },
                  { value: 'priority', label: 'Priority Based' },
                ]}
              />
            </div>
          </>
        )}
        
        {selectedNode.type === 'stateManager' && (
          <>
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                State Type
              </label>
              <Select
                value={formData.stateType || 'persistent'}
                onChange={(e) => handleInputChange('stateType', e.target.value)}
                options={[
                  { value: 'persistent', label: 'Persistent' },
                  { value: 'session', label: 'Session' },
                  { value: 'temporary', label: 'Temporary' },
                ]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Scope
              </label>
              <Select
                value={formData.scope || 'workflow'}
                onChange={(e) => handleInputChange('scope', e.target.value)}
                options={[
                  { value: 'global', label: 'Global' },
                  { value: 'workflow', label: 'Workflow' },
                  { value: 'node', label: 'Node' },
                ]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Serialization
              </label>
              <Select
                value={formData.serialization || 'json'}
                onChange={(e) => handleInputChange('serialization', e.target.value)}
                options={[
                  { value: 'json', label: 'JSON' },
                  { value: 'pickle', label: 'Pickle' },
                  { value: 'msgpack', label: 'MessagePack' },
                ]}
              />
            </div>
          </>
        )}
        
        {selectedNode.type === 'memory' && (
          <>
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Memory Type
              </label>
              <Select
                value={formData.memoryType || 'conversational'}
                onChange={(e) => handleInputChange('memoryType', e.target.value)}
                options={[
                  { value: 'conversational', label: 'Conversational' },
                  { value: 'summary', label: 'Summary' },
                  { value: 'entity', label: 'Entity' },
                  { value: 'vector', label: 'Vector' },
                ]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
                Max Tokens
              </label>
              <Input
                type="number"
                value={(formData.maxTokens ?? 4000).toString()}
                onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
                placeholder="4000"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="summarization"
                checked={formData.summarization || true}
                onChange={(e) => handleInputChange('summarization', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="summarization" className="text-sm text-light-secondary dark:text-dark-secondary">
                Enable automatic summarization
              </label>
            </div>
          </>
        )}
        
        {/* Generic config editor for other node types */}
        {!['llm', 'retriever', 'textSplitter', 'conditional', 'router', 'loop', 'merge', 'stateManager', 'memory'].includes(selectedNode.type) && (
          <div>
            <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
              Configuration (JSON)
            </label>
            <Textarea
              value={JSON.stringify(config, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setFormData((prev: any) => ({ ...prev, ...parsed }));
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              rows={8}
              placeholder="{}"
              className="font-mono text-sm"
            />
          </div>
        )}
      </div>
    );
  };

  const renderAdvancedTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
          Node ID
        </label>
        <Input
          value={selectedNode?.id || ''}
          disabled
          className="bg-light-hover dark:bg-dark-hover"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
          Node Type
        </label>
        <Input
          value={selectedNode?.type || ''}
          disabled
          className="bg-light-hover dark:bg-dark-hover"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
          Position
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={Math.round(selectedNode?.position?.x || 0).toString()}
            disabled
            className="bg-light-hover dark:bg-dark-hover"
            placeholder="X"
          />
          <Input
            value={Math.round(selectedNode?.position?.y || 0).toString()}
            disabled
            className="bg-light-hover dark:bg-dark-hover"
            placeholder="Y"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-1">
          Status
        </label>
        <div className={`px-3 py-2 rounded text-sm font-medium ${
          selectedNode?.data?.status === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
          selectedNode?.data?.status === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
          selectedNode?.data?.status === 'running' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
          'bg-light-hover dark:bg-dark-hover text-light-secondary dark:text-dark-secondary'
        }`}>
          {selectedNode?.data?.status || 'idle'}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-80 bg-light-surface dark:bg-dark-surface border-l border-light-border dark:border-dark-border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-light-border dark:border-dark-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary">Properties</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* Close panel logic */}}
          >
            <X size={16} />
          </Button>
        </div>
        
        {nodeInfo && (
          <div className="mt-2 flex items-center gap-2">
            <nodeInfo.icon size={16} className="text-light-secondary dark:text-dark-secondary" />
            <span className="text-sm text-light-secondary dark:text-dark-secondary">{nodeInfo.label}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-light-border dark:border-dark-border">
        {[
          { key: 'general', label: 'General' },
          { key: 'config', label: 'Config' },
          { key: 'advanced', label: 'Advanced' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-light-secondary dark:text-dark-secondary hover:text-light-primary dark:hover:text-dark-primary hover:bg-light-hover dark:hover:bg-dark-hover'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'general' && renderGeneralTab()}
        {activeTab === 'config' && renderConfigTab()}
        {activeTab === 'advanced' && renderAdvancedTab()}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-light-border dark:border-dark-border">
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            variant="primary"
            size="sm"
            className="flex-1"
          >
            Save Changes
          </Button>
          <Button
            onClick={handleReset}
            variant="secondary"
            size="sm"
            className="flex-1"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}; 