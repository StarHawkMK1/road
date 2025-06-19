import React, { useRef } from 'react';
import { 
  Save, FolderOpen, Download, Upload, Trash2, Settings, 
  Undo, Redo, Copy, ZoomIn, ZoomOut, Maximize
} from 'lucide-react';
import Button from '@/components/common/Button';
import { ToolbarPanelProps } from './types';

export const ToolbarPanel: React.FC<ToolbarPanelProps> = ({
  workflow,
  onSave,
  onLoad,
  onExport,
  onImport,
  onClear,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset input value to allow selecting the same file again
      event.target.value = '';
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `workflow-${workflow.name || 'untitled'}-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="h-16 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border flex items-center justify-between px-4">
      {/* Left side - Main actions */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            className="flex items-center gap-2"
          >
            <Save size={16} />
            Save
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoad}
            className="flex items-center gap-2"
          >
            <FolderOpen size={16} />
            Load
          </Button>
        </div>

        <div className="w-px h-6 bg-light-border dark:bg-dark-border" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportJSON}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleImportClick}
            className="flex items-center gap-2"
          >
            <Upload size={16} />
            Import
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="w-px h-6 bg-light-border dark:bg-dark-border" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="flex items-center gap-2"
          >
            <Undo size={16} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="flex items-center gap-2"
          >
            <Redo size={16} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="flex items-center gap-2"
          >
            <Copy size={16} />
          </Button>
        </div>
      </div>

      {/* Center - Workflow info */}
      <div className="flex-1 text-center">
        <h2 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
          {workflow.name || 'Untitled Workflow'}
        </h2>
        <div className="text-xs text-light-secondary dark:text-dark-secondary">
          {workflow.nodes.length} nodes, {workflow.edges.length} connections
        </div>
      </div>

      {/* Right side - View controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="flex items-center gap-2"
          >
            <ZoomOut size={16} />
          </Button>
          
          <span className="text-sm text-light-secondary dark:text-dark-secondary min-w-[3rem] text-center">
            100%
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="flex items-center gap-2"
          >
            <ZoomIn size={16} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="flex items-center gap-2"
          >
            <Maximize size={16} />
          </Button>
        </div>

        <div className="w-px h-6 bg-light-border dark:bg-dark-border" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="flex items-center gap-2"
          >
            <Settings size={16} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}; 