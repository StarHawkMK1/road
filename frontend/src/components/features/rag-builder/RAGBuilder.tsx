import React, { useState, useCallback } from 'react';
import { FlowCanvas } from './FlowCanvas';
import { NodePalette } from './NodePalette';
import { PropertiesPanel } from './PropertiesPanel';
import { ExecutionController } from './ExecutionController';
import { ToolbarPanel } from './ToolbarPanel';
import { 
  Workflow, 
  RAGNode, 
  ExecutionState, 
  NodeType, 
  BaseNodeData 
} from './types';
import { getNodePaletteItem } from './nodes/nodeRegistry';

export const RAGBuilder: React.FC = () => {
  // State management
  const [workflow, setWorkflow] = useState<Workflow>({
    id: `workflow-${Date.now()}`,
    name: 'New Workflow',
    description: '',
    nodes: [],
    edges: [],
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [selectedNode, setSelectedNode] = useState<RAGNode | undefined>();
  const [executionState, setExecutionState] = useState<ExecutionState | undefined>();

  // Node selection handler
  const handleNodeSelection = useCallback((nodeId: string | null) => {
    if (nodeId) {
      const node = workflow.nodes.find(n => n.id === nodeId);
      setSelectedNode(node);
    } else {
      setSelectedNode(undefined);
    }
  }, [workflow.nodes]);

  // Add node from palette
  const handleNodeAdd = useCallback((nodeType: NodeType, position: { x: number; y: number }) => {
    const nodeInfo = getNodePaletteItem(nodeType);
    if (!nodeInfo) return;

    const newNode: RAGNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position,
      data: {
        label: nodeInfo.label,
        description: nodeInfo.description,
        config: { ...nodeInfo.defaultConfig },
        status: 'idle',
      },
    };

    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      updatedAt: new Date(),
    }));
  }, []);

  // Update node properties
  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<BaseNodeData>) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      ),
      updatedAt: new Date(),
    }));
  }, []);

  // Workflow management
  const handleSave = useCallback(() => {
    // TODO: Implement save to backend
    console.log('Saving workflow:', workflow);
    
    // For now, save to localStorage
    localStorage.setItem(`workflow-${workflow.id}`, JSON.stringify(workflow));
    alert('Workflow saved!');
  }, [workflow]);

  const handleLoad = useCallback(() => {
    // TODO: Implement load from backend
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const loadedWorkflow = JSON.parse(e.target?.result as string);
            setWorkflow(loadedWorkflow);
            setSelectedNode(undefined);
            alert('Workflow loaded!');
          } catch (error) {
            alert('Error loading workflow');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  const handleExport = useCallback(() => {
    // Export is handled by ToolbarPanel
  }, []);

  const handleImport = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loadedWorkflow = JSON.parse(e.target?.result as string);
        setWorkflow(loadedWorkflow);
        setSelectedNode(undefined);
        alert('Workflow imported!');
      } catch (error) {
        alert('Error importing workflow');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleClear = useCallback(() => {
    if (confirm('Are you sure you want to clear the workflow? This action cannot be undone.')) {
      setWorkflow({
        id: `workflow-${Date.now()}`,
        name: 'New Workflow',
        description: '',
        nodes: [],
        edges: [],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setSelectedNode(undefined);
      setExecutionState(undefined);
    }
  }, []);

  // Execution control
  const handleExecute = useCallback((inputs?: Record<string, any>) => {
    if (workflow.nodes.length === 0) {
      alert('Cannot execute empty workflow');
      return;
    }

    // Initialize execution state
    const newExecutionState: ExecutionState = {
      workflowId: workflow.id,
      executionId: `exec-${Date.now()}`,
      status: 'running',
      nodeStates: {},
      logs: [],
    };

    // Initialize all nodes as idle
    workflow.nodes.forEach(node => {
      newExecutionState.nodeStates[node.id] = {
        status: 'idle',
      };
    });

    setExecutionState(newExecutionState);

    // TODO: Implement actual execution logic
    // For now, simulate execution
    simulateExecution(newExecutionState);
  }, [workflow]);

  const handleStop = useCallback(() => {
    setExecutionState(prev => 
      prev ? { ...prev, status: 'completed' } : undefined
    );
  }, []);

  // Simulate execution for demo
  const simulateExecution = (execState: ExecutionState) => {
    // Build execution order based on graph topology
    const getExecutionOrder = (): string[] => {
      const nodeIds = workflow.nodes.map(n => n.id);
      const edges = workflow.edges;
      const inDegree = new Map<string, number>();
      const adjList = new Map<string, string[]>();
      
      // Initialize in-degree and adjacency list
      nodeIds.forEach(id => {
        inDegree.set(id, 0);
        adjList.set(id, []);
      });
      
      // Build adjacency list and calculate in-degrees
      edges.forEach(edge => {
        const from = edge.source;
        const to = edge.target;
        adjList.get(from)?.push(to);
        inDegree.set(to, (inDegree.get(to) || 0) + 1);
      });
      
      // Topological sort (Kahn's algorithm)
      const queue: string[] = [];
      const result: string[] = [];
      
      // Find all nodes with no incoming edges
      nodeIds.forEach(id => {
        if (inDegree.get(id) === 0) {
          queue.push(id);
        }
      });
      
      while (queue.length > 0) {
        const current = queue.shift()!;
        result.push(current);
        
        // For each neighbor of current node
        const neighbors = adjList.get(current) || [];
        neighbors.forEach(neighbor => {
          const newInDegree = (inDegree.get(neighbor) || 0) - 1;
          inDegree.set(neighbor, newInDegree);
          
          if (newInDegree === 0) {
            queue.push(neighbor);
          }
        });
      }
      
      // If result doesn't contain all nodes, there's a cycle
      // In that case, fallback to original order
      return result.length === nodeIds.length ? result : nodeIds;
    };

    const executionOrder = getExecutionOrder();
    let currentIndex = 0;

    const executeNext = () => {
      if (currentIndex >= executionOrder.length) {
        setExecutionState(prev => 
          prev ? { ...prev, status: 'completed' } : undefined
        );
        return;
      }

      const nodeId = executionOrder[currentIndex];
      
      // Set current node as running
      setExecutionState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          currentNode: nodeId,
          nodeStates: {
            ...prev.nodeStates,
            [nodeId]: {
              status: 'running',
              startTime: new Date(),
            },
          },
          logs: [
            ...prev.logs,
            {
              id: `log-${Date.now()}`,
              nodeId,
              level: 'info',
              message: 'Starting execution',
              timestamp: new Date(),
            },
          ],
        };
      });

      // Simulate processing time
      setTimeout(() => {
        setExecutionState(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            nodeStates: {
              ...prev.nodeStates,
              [nodeId]: {
                status: 'success',
                startTime: prev.nodeStates[nodeId]?.startTime,
                endTime: new Date(),
              },
            },
            logs: [
              ...prev.logs,
              {
                id: `log-${Date.now()}-complete`,
                nodeId,
                level: 'info',
                message: 'Execution completed',
                timestamp: new Date(),
              },
            ],
          };
        });

        currentIndex++;
        setTimeout(executeNext, 500); // Delay between nodes
      }, 1000 + Math.random() * 2000); // Random execution time
    };

    executeNext();
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <ToolbarPanel
        workflow={workflow}
        onSave={handleSave}
        onLoad={handleLoad}
        onExport={handleExport}
        onImport={handleImport}
        onClear={handleClear}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Node Palette */}
        <NodePalette onNodeAdd={handleNodeAdd} />

        {/* Canvas */}
        <div className="flex-1 flex flex-col">
          <FlowCanvas
            workflow={workflow}
            onWorkflowChange={setWorkflow}
            executionState={executionState}
            onNodeSelect={handleNodeSelection}
          />
          
          {/* Execution Controller */}
          <ExecutionController
            workflow={workflow}
            onExecute={handleExecute}
            onStop={handleStop}
            executionState={executionState}
          />
        </div>

        {/* Properties Panel */}
        <PropertiesPanel
          selectedNode={selectedNode}
          onNodeUpdate={handleNodeUpdate}
        />
      </div>
    </div>
  );
}; 