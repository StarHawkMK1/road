from typing import List, Optional, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.session import get_db
from app.db.models import Workflow, WorkflowExecution, NodeExecution
from app.schemas.rag_builder import (
    WorkflowCreate,
    WorkflowUpdate,
    WorkflowResponse,
    ExecutionRequest,
    WorkflowExecutionResponse,
    NodeExecutionResponse,
    ExecutionStateResponse,
    ExecutionUpdateMessage
)
import json
import asyncio
from datetime import datetime

router = APIRouter()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.execution_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, execution_id: Optional[str] = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        
        if execution_id:
            if execution_id not in self.execution_connections:
                self.execution_connections[execution_id] = []
            self.execution_connections[execution_id].append(websocket)

    def disconnect(self, websocket: WebSocket, execution_id: Optional[str] = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
        if execution_id and execution_id in self.execution_connections:
            if websocket in self.execution_connections[execution_id]:
                self.execution_connections[execution_id].remove(websocket)
            if not self.execution_connections[execution_id]:
                del self.execution_connections[execution_id]

    async def broadcast_execution_update(self, execution_id: str, message: dict):
        if execution_id in self.execution_connections:
            disconnected = []
            for connection in self.execution_connections[execution_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    disconnected.append(connection)
            
            # Remove disconnected connections
            for connection in disconnected:
                self.disconnect(connection, execution_id)

manager = ConnectionManager()


@router.get("/workflows", response_model=List[WorkflowResponse])
async def list_workflows(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all workflows with pagination."""
    workflows = db.query(Workflow).order_by(desc(Workflow.updated_at)).offset(skip).limit(limit).all()
    
    result = []
    for workflow in workflows:
        # Parse graph_data to extract nodes and edges
        graph_data = workflow.graph_data or {"nodes": [], "edges": []}
        result.append(WorkflowResponse(
            id=str(workflow.id),
            name=workflow.name,
            description=workflow.description,
            nodes=graph_data.get("nodes", []),
            edges=graph_data.get("edges", []),
            metadata=workflow.workflow_metadata or {},
            created_at=workflow.created_at,
            updated_at=workflow.updated_at,
            created_by=workflow.created_by
        ))
    
    return result


@router.post("/workflows", response_model=WorkflowResponse)
async def create_workflow(
    workflow_data: WorkflowCreate,
    db: Session = Depends(get_db)
):
    """Create a new workflow."""
    
    # Prepare graph data
    graph_data = {
        "nodes": [node.dict() for node in workflow_data.nodes],
        "edges": [edge.dict() for edge in workflow_data.edges]
    }
    
    db_workflow = Workflow(
        name=workflow_data.name,
        description=workflow_data.description,
        graph_data=graph_data,
        workflow_metadata=workflow_data.metadata,
        created_by="system"  # TODO: Get from authentication
    )
    
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)
    
    return WorkflowResponse(
        id=str(db_workflow.id),
        name=db_workflow.name,
        description=db_workflow.description,
        nodes=workflow_data.nodes,
        edges=workflow_data.edges,
        metadata=db_workflow.workflow_metadata or {},
        created_at=db_workflow.created_at,
        updated_at=db_workflow.updated_at,
        created_by=db_workflow.created_by
    )


@router.get("/workflows/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
    workflow_id: UUID,
    db: Session = Depends(get_db)
):
    """Get a specific workflow by ID."""
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Parse graph data
    graph_data = workflow.graph_data or {"nodes": [], "edges": []}
    
    return WorkflowResponse(
        id=str(workflow.id),
        name=workflow.name,
        description=workflow.description,
        nodes=graph_data.get("nodes", []),
        edges=graph_data.get("edges", []),
        metadata=workflow.workflow_metadata or {},
        created_at=workflow.created_at,
        updated_at=workflow.updated_at,
        created_by=workflow.created_by
    )


@router.put("/workflows/{workflow_id}", response_model=WorkflowResponse)
async def update_workflow(
    workflow_id: UUID,
    workflow_update: WorkflowUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing workflow."""
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Update fields
    if workflow_update.name is not None:
        workflow.name = workflow_update.name
    if workflow_update.description is not None:
        workflow.description = workflow_update.description
    if workflow_update.metadata is not None:
        workflow.workflow_metadata = workflow_update.metadata
    
    # Update graph data if provided
    if workflow_update.nodes is not None or workflow_update.edges is not None:
        current_graph = workflow.graph_data or {"nodes": [], "edges": []}
        
        if workflow_update.nodes is not None:
            current_graph["nodes"] = [node.dict() for node in workflow_update.nodes]
        if workflow_update.edges is not None:
            current_graph["edges"] = [edge.dict() for edge in workflow_update.edges]
        
        workflow.graph_data = current_graph
    
    db.commit()
    db.refresh(workflow)
    
    # Parse updated graph data
    graph_data = workflow.graph_data or {"nodes": [], "edges": []}
    
    return WorkflowResponse(
        id=str(workflow.id),
        name=workflow.name,
        description=workflow.description,
        nodes=graph_data.get("nodes", []),
        edges=graph_data.get("edges", []),
        metadata=workflow.workflow_metadata or {},
        created_at=workflow.created_at,
        updated_at=workflow.updated_at,
        created_by=workflow.created_by
    )


@router.delete("/workflows/{workflow_id}")
async def delete_workflow(
    workflow_id: UUID,
    db: Session = Depends(get_db)
):
    """Delete a workflow."""
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    db.delete(workflow)
    db.commit()
    
    return {"message": "Workflow deleted successfully"}


@router.post("/workflows/{workflow_id}/execute", response_model=WorkflowExecutionResponse)
async def execute_workflow(
    workflow_id: UUID,
    execution_request: ExecutionRequest,
    db: Session = Depends(get_db)
):
    """Execute a workflow."""
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Create execution record
    execution = WorkflowExecution(
        workflow_id=workflow_id,
        status="running",
        inputs=execution_request.inputs,
        started_at=datetime.now()
    )
    
    db.add(execution)
    db.commit()
    db.refresh(execution)
    
    # Start async execution (in a real implementation, this would be done in background)
    asyncio.create_task(execute_workflow_async(str(execution.id), workflow, execution_request, db))
    
    return WorkflowExecutionResponse(
        id=str(execution.id),
        workflow_id=str(workflow_id),
        status=execution.status,
        inputs=execution.inputs,
        started_at=execution.started_at
    )


@router.get("/workflows/{workflow_id}/executions", response_model=List[WorkflowExecutionResponse])
async def list_workflow_executions(
    workflow_id: UUID,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List executions for a specific workflow."""
    executions = (
        db.query(WorkflowExecution)
        .filter(WorkflowExecution.workflow_id == workflow_id)
        .order_by(desc(WorkflowExecution.started_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return [
        WorkflowExecutionResponse(
            id=str(execution.id),
            workflow_id=str(execution.workflow_id),
            status=execution.status,
            inputs=execution.inputs or {},
            outputs=execution.outputs,
            execution_time_ms=execution.execution_time_ms,
            error_message=execution.error_message,
            started_at=execution.started_at,
            completed_at=execution.completed_at
        )
        for execution in executions
    ]


@router.get("/executions/{execution_id}", response_model=WorkflowExecutionResponse)
async def get_execution(
    execution_id: UUID,
    db: Session = Depends(get_db)
):
    """Get execution details."""
    execution = db.query(WorkflowExecution).filter(WorkflowExecution.id == execution_id).first()
    
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    return WorkflowExecutionResponse(
        id=str(execution.id),
        workflow_id=str(execution.workflow_id),
        status=execution.status,
        inputs=execution.inputs or {},
        outputs=execution.outputs,
        execution_time_ms=execution.execution_time_ms,
        error_message=execution.error_message,
        started_at=execution.started_at,
        completed_at=execution.completed_at
    )


@router.get("/executions/{execution_id}/nodes", response_model=List[NodeExecutionResponse])
async def get_execution_nodes(
    execution_id: UUID,
    db: Session = Depends(get_db)
):
    """Get node execution details for a specific execution."""
    node_executions = (
        db.query(NodeExecution)
        .filter(NodeExecution.execution_id == execution_id)
        .order_by(NodeExecution.created_at)
        .all()
    )
    
    return [
        NodeExecutionResponse(
            id=str(node_exec.id),
            execution_id=str(node_exec.execution_id),
            node_id=node_exec.node_id,
            node_type=node_exec.node_type,
            status=node_exec.status,
            input_data=node_exec.input_data,
            output_data=node_exec.output_data,
            error_message=node_exec.error_message,
            execution_time_ms=node_exec.execution_time_ms,
            created_at=node_exec.created_at
        )
        for node_exec in node_executions
    ]


@router.websocket("/workflows/{workflow_id}/execute/stream")
async def execute_workflow_stream(
    websocket: WebSocket,
    workflow_id: str,
    db: Session = Depends(get_db)
):
    """Execute workflow with real-time updates via WebSocket."""
    await manager.connect(websocket)
    
    try:
        while True:
            # Wait for execution start message
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("action") == "start":
                # Start workflow execution
                execution_id = f"exec-{datetime.now().timestamp()}"
                await manager.connect(websocket, execution_id)
                
                # Send initial status
                await manager.broadcast_execution_update(execution_id, {
                    "type": "execution_start",
                    "execution_id": execution_id,
                    "workflow_id": workflow_id,
                    "status": "running",
                    "timestamp": datetime.now().isoformat()
                })
                
                # Simulate workflow execution
                await simulate_workflow_execution(execution_id, workflow_id)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)


async def execute_workflow_async(
    execution_id: str, 
    workflow: Workflow, 
    execution_request: ExecutionRequest,
    db: Session
):
    """Execute workflow asynchronously (placeholder implementation)."""
    try:
        # Parse workflow nodes
        graph_data = workflow.graph_data or {"nodes": [], "edges": []}
        nodes = graph_data.get("nodes", [])
        
        start_time = datetime.now()
        
        # Simulate node execution
        for node in nodes:
            node_start = datetime.now()
            
            # Create node execution record
            node_execution = NodeExecution(
                execution_id=execution_id,
                node_id=node.get("id"),
                node_type=node.get("type"),
                status="running",
                input_data={"simulation": True}
            )
            db.add(node_execution)
            db.commit()
            
            # Simulate processing time
            await asyncio.sleep(1)
            
            # Update node execution
            node_execution.status = "success"
            node_execution.output_data = {"result": f"Processed {node.get('type')} node"}
            node_execution.execution_time_ms = int((datetime.now() - node_start).total_seconds() * 1000)
            db.commit()
        
        # Update execution status
        execution = db.query(WorkflowExecution).filter(WorkflowExecution.id == execution_id).first()
        if execution:
            execution.status = "completed"
            execution.completed_at = datetime.now()
            execution.execution_time_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            execution.outputs = {"status": "completed", "nodes_processed": len(nodes)}
            db.commit()
            
    except Exception as e:
        # Update execution with error
        execution = db.query(WorkflowExecution).filter(WorkflowExecution.id == execution_id).first()
        if execution:
            execution.status = "failed"
            execution.error_message = str(e)
            execution.completed_at = datetime.now()
            db.commit()


async def simulate_workflow_execution(execution_id: str, workflow_id: str):
    """Simulate workflow execution with WebSocket updates."""
    # Simulate node execution progress
    for i in range(3):  # Simulate 3 nodes
        await asyncio.sleep(2)
        
        await manager.broadcast_execution_update(execution_id, {
            "type": "node_update",
            "execution_id": execution_id,
            "node_id": f"node-{i}",
            "status": "running",
            "timestamp": datetime.now().isoformat()
        })
        
        await asyncio.sleep(1)
        
        await manager.broadcast_execution_update(execution_id, {
            "type": "node_update",
            "execution_id": execution_id,
            "node_id": f"node-{i}",
            "status": "success",
            "timestamp": datetime.now().isoformat()
        })
    
    # Send completion message
    await manager.broadcast_execution_update(execution_id, {
        "type": "execution_complete",
        "execution_id": execution_id,
        "status": "completed",
        "timestamp": datetime.now().isoformat()
    }) 