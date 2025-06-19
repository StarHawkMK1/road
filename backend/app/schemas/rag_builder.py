from datetime import datetime
from typing import Dict, List, Optional, Any, Literal
from pydantic import BaseModel, Field


class NodePosition(BaseModel):
    x: float
    y: float


class NodeData(BaseModel):
    label: str
    description: Optional[str] = None
    config: Dict[str, Any] = Field(default_factory=dict)
    status: Optional[Literal['idle', 'running', 'success', 'error']] = 'idle'
    execution_time: Optional[int] = None


class NodeSchema(BaseModel):
    id: str
    type: str
    position: NodePosition
    data: NodeData


class EdgeData(BaseModel):
    condition: Optional[str] = None
    label: Optional[str] = None
    animated: Optional[bool] = False


class EdgeSchema(BaseModel):
    id: str
    source: str
    target: str
    type: Optional[str] = "default"
    data: Optional[EdgeData] = None


class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = None
    nodes: List[NodeSchema] = Field(default_factory=list)
    edges: List[EdgeSchema] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    nodes: Optional[List[NodeSchema]] = None
    edges: Optional[List[EdgeSchema]] = None
    metadata: Optional[Dict[str, Any]] = None


class WorkflowResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    nodes: List[NodeSchema]
    edges: List[EdgeSchema]
    metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None

    model_config = {
        "from_attributes": True
    }


class ExecutionLog(BaseModel):
    id: str
    node_id: str
    level: Literal['info', 'warning', 'error']
    message: str
    timestamp: datetime
    data: Optional[Dict[str, Any]] = None


class NodeExecutionState(BaseModel):
    status: Literal['idle', 'running', 'success', 'error']
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    error: Optional[str] = None


class ExecutionStateResponse(BaseModel):
    workflow_id: str
    execution_id: str
    status: Literal['idle', 'running', 'completed', 'failed']
    current_node: Optional[str] = None
    node_states: Dict[str, NodeExecutionState] = Field(default_factory=dict)
    logs: List[ExecutionLog] = Field(default_factory=list)


class ExecutionRequest(BaseModel):
    inputs: Optional[Dict[str, Any]] = Field(default_factory=dict)
    config: Optional[Dict[str, Any]] = Field(default_factory=dict)


class WorkflowExecutionResponse(BaseModel):
    id: str
    workflow_id: str
    status: Literal['running', 'completed', 'failed']
    inputs: Dict[str, Any]
    outputs: Optional[Dict[str, Any]] = None
    execution_time_ms: Optional[int] = None
    error_message: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }


class NodeExecutionResponse(BaseModel):
    id: str
    execution_id: str
    node_id: str
    node_type: str
    status: Literal['running', 'success', 'error']
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    execution_time_ms: Optional[int] = None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


# WebSocket message schemas
class WebSocketMessage(BaseModel):
    type: str
    data: Dict[str, Any]


class ExecutionUpdateMessage(BaseModel):
    type: Literal['execution_update'] = 'execution_update'
    execution_id: str
    node_id: Optional[str] = None
    status: str
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now) 