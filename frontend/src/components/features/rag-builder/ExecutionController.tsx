import React, { useState } from 'react';
import { Play, Square, Loader, Settings, Zap, AlertCircle } from 'lucide-react';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import { ExecutionControllerProps } from './types';

export const ExecutionController: React.FC<ExecutionControllerProps> = ({
  workflow,
  onExecute,
  onStop,
  executionState,
}) => {
  const [executionSpeed, setExecutionSpeed] = useState<number>(1);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const isRunning = executionState?.status === 'running';
  const hasCompleted = executionState?.status === 'completed';
  const hasFailed = executionState?.status === 'failed';

  const handleExecute = () => {
    if (isRunning) {
      onStop();
    } else {
      onExecute({
        speed: executionSpeed,
        debug: debugMode,
      });
    }
  };

  const getExecutionStats = () => {
    if (!executionState) return null;

    const totalNodes = Object.keys(executionState.nodeStates).length;
    const completedNodes = Object.values(executionState.nodeStates)
      .filter(state => state.status === 'success').length;
    const errorNodes = Object.values(executionState.nodeStates)
      .filter(state => state.status === 'error').length;

    return { totalNodes, completedNodes, errorNodes };
  };

  const stats = getExecutionStats();

  return (
    <div className="bg-light-surface dark:bg-dark-surface border-t border-light-border dark:border-dark-border p-4">
      <div className="flex items-center justify-between">
        {/* Main execution control */}
        <div className="flex items-center gap-4">
          <Button
            onClick={handleExecute}
            variant={isRunning ? 'danger' : 'primary'}
            size="md"
            className="flex items-center gap-2 min-w-[120px]"
          >
            {isRunning ? (
              <>
                <Square size={16} />
                Stop
              </>
            ) : (
              <>
                <Play size={16} />
                Execute
              </>
            )}
          </Button>

          {/* Execution status */}
          <div className="flex items-center gap-2">
            {isRunning && (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Loader size={16} className="animate-spin" />
                <span className="text-sm font-medium">Running...</span>
              </div>
            )}
            
            {hasCompleted && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Zap size={16} />
                <span className="text-sm font-medium">Completed</span>
              </div>
            )}
            
            {hasFailed && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle size={16} />
                <span className="text-sm font-medium">Failed</span>
              </div>
            )}
          </div>
        </div>

        {/* Execution settings */}
        <div className="flex items-center gap-4">
          {stats && (
            <div className="text-sm text-light-secondary dark:text-dark-secondary">
              Progress: {stats.completedNodes}/{stats.totalNodes} nodes
              {stats.errorNodes > 0 && (
                <span className="text-red-600 dark:text-red-400 ml-2">
                  ({stats.errorNodes} errors)
                </span>
              )}
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2"
          >
            <Settings size={16} />
            Settings
          </Button>
        </div>
      </div>

      {/* Advanced settings */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-light-secondary dark:text-dark-secondary">
                Execution Speed
              </label>
              <Select
                value={executionSpeed.toString()}
                onChange={(e) => setExecutionSpeed(parseFloat(e.target.value))}
                disabled={isRunning}
                options={[
                  { value: '0.5', label: '0.5x (Slow)' },
                  { value: '1', label: '1x (Normal)' },
                  { value: '2', label: '2x (Fast)' },
                  { value: '5', label: '5x (Very Fast)' },
                ]}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-light-secondary dark:text-dark-secondary">
                Debug Mode
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={debugMode}
                  onChange={(e) => setDebugMode(e.target.checked)}
                  disabled={isRunning}
                  className="mr-2"
                />
                <span className="text-sm text-light-secondary dark:text-dark-secondary">
                  Show detailed execution logs
                </span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-light-secondary dark:text-dark-secondary">
                Validation
              </label>
              <div className="text-sm text-light-secondary dark:text-dark-secondary">
                {workflow.nodes.length === 0 && (
                  <div className="text-red-600 dark:text-red-400">No nodes in workflow</div>
                )}
                {workflow.nodes.length > 0 && workflow.edges.length === 0 && (
                  <div className="text-yellow-600 dark:text-yellow-400">No connections between nodes</div>
                )}
                {workflow.nodes.length > 0 && workflow.edges.length > 0 && (
                  <div className="text-green-600 dark:text-green-400">Workflow is ready</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Execution logs */}
      {executionState && debugMode && executionState.logs.length > 0 && (
        <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
          <h4 className="text-sm font-medium text-light-secondary dark:text-dark-secondary mb-2">Execution Logs</h4>
          <div className="bg-light-hover dark:bg-dark-hover rounded p-3 max-h-32 overflow-y-auto">
            {executionState.logs.slice(-10).map((log) => (
              <div
                key={log.id}
                className={`text-xs mb-1 ${
                  log.level === 'error' ? 'text-red-600 dark:text-red-400' :
                  log.level === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-light-secondary dark:text-dark-secondary'
                }`}
              >
                <span className="text-light-muted dark:text-dark-muted">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                {' '}
                <span className="font-medium">[{log.nodeId}]</span>
                {' '}
                {log.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 