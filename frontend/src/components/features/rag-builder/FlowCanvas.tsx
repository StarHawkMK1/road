import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  NodeChange,
  EdgeChange,
  ReactFlowProvider,
  ReactFlowInstance,
  BackgroundVariant,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { FlowCanvasProps, RAGNode, RAGEdge } from './types';
import { nodeTypes } from './nodes/nodeRegistry';

const FlowCanvasInner: React.FC<FlowCanvasProps> = ({
  workflow,
  onWorkflowChange,
  executionState,
  onNodeSelect,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(workflow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow.edges);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null);

  // Keep track of workflow ID to prevent unnecessary updates
  const prevWorkflowId = useRef(workflow.id);

  // Update local state only when workflow ID changes
  React.useEffect(() => {
    if (prevWorkflowId.current !== workflow.id) {
      setNodes(workflow.nodes);
      setEdges(workflow.edges);
      prevWorkflowId.current = workflow.id;
    }
  }, [workflow.id, workflow.nodes, workflow.edges, setNodes, setEdges]);

  // Update workflow when nodes or edges change
  React.useEffect(() => {
    const updatedWorkflow = {
      ...workflow,
      nodes: nodes as RAGNode[],
      edges: edges as RAGEdge[],
      updatedAt: new Date(),
    };
    onWorkflowChange(updatedWorkflow);
  }, [nodes, edges, workflow.id, workflow.name, workflow.description, workflow.metadata, onWorkflowChange]);

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes as any);
  }, [onNodesChange]);

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChange(changes);
  }, [onEdgesChange]);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      const newEdge = {
        ...params,
        id: `e${params.source}-${params.target}`,
        animated: executionState?.status === 'running',
      } as RAGEdge;
      
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, executionState]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (onNodeSelect) {
        onNodeSelect(node.id);
      }
    },
    [onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    if (onNodeSelect) {
      onNodeSelect(null);
    }
  }, [onNodeSelect]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      // Check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Get the position where the node was dropped
      if (reactFlowInstance && reactFlowWrapper.current) {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const newNode: RAGNode = {
          id: `${type}-${Date.now()}`,
          type,
          position,
          data: {
            label: type.charAt(0).toUpperCase() + type.slice(1),
            config: {},
            status: 'idle',
          },
        };

        setNodes((nds) => nds.concat(newNode));
      }
    },
    [reactFlowInstance, setNodes]
  );

  // Apply execution state styling
  const nodesWithExecutionState = React.useMemo(() => {
    if (!executionState) return nodes;

    return nodes.map((node) => {
      const executionStatus = executionState.nodeStates[node.id];
      if (executionStatus) {
        return {
          ...node,
          data: {
            ...node.data,
            status: executionStatus.status,
          },
        };
      }
      return node;
    });
  }, [nodes, executionState]);

  // Apply execution state to edges
  const edgesWithExecutionState = React.useMemo(() => {
    if (!executionState || executionState.status !== 'running') {
      return edges.map(edge => ({ ...edge, animated: false }));
    }

    return edges.map((edge) => {
      const sourceStatus = executionState.nodeStates[edge.source];
      const targetStatus = executionState.nodeStates[edge.target];
      
      return {
        ...edge,
        animated: sourceStatus?.status === 'success' && targetStatus?.status === 'running',
      };
    });
  }, [edges, executionState]);

  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodesWithExecutionState}
        edges={edgesWithExecutionState}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="top-right"
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export const FlowCanvas: React.FC<FlowCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}; 