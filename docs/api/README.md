# ROAD Platform API Documentation

## Overview

ROAD 플랫폼의 REST API 문서입니다. FastAPI를 사용하여 구축되었으며, 자동 생성된 OpenAPI 스키마를 제공합니다.

## API Base URL

- **Development**: `http://localhost:8000`
- **Production**: TBD

## Authentication

현재 Phase 1에서는 인증이 구현되지 않았습니다. Phase 2에서 JWT 기반 인증이 추가될 예정입니다.

## API Documentation

### Interactive Documentation

FastAPI는 자동으로 interactive API 문서를 생성합니다:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

## API Endpoints

### Phase 1 Endpoints

#### LLM Playground

```
POST   /api/v1/llm/chat              # Send chat message to LLM
GET    /api/v1/llm/models            # Get available LLM models
POST   /api/v1/llm/stream            # Stream LLM responses
```

#### Prompt Management

```
GET    /api/v1/prompts               # List all prompts
POST   /api/v1/prompts               # Create new prompt
GET    /api/v1/prompts/{id}          # Get specific prompt
PUT    /api/v1/prompts/{id}          # Update prompt
DELETE /api/v1/prompts/{id}          # Delete prompt
GET    /api/v1/prompts/{id}/versions # Get prompt versions
POST   /api/v1/prompts/storage-config # Update storage configuration
```

#### Health Check

```
GET    /api/v1/health                # Health check endpoint
```

### Future Endpoints (Phase 2+)

#### RAG Builder
```
GET    /api/v1/rag/pipelines         # List RAG pipelines
POST   /api/v1/rag/pipelines         # Create RAG pipeline
GET    /api/v1/rag/pipelines/{id}    # Get specific pipeline
PUT    /api/v1/rag/pipelines/{id}    # Update pipeline
DELETE /api/v1/rag/pipelines/{id}    # Delete pipeline
POST   /api/v1/rag/pipelines/{id}/run # Run pipeline
```

#### Document Processing
```
POST   /api/v1/documents/upload      # Upload documents
GET    /api/v1/documents             # List documents
POST   /api/v1/documents/process     # Process documents
```

#### Monitoring
```
GET    /api/v1/monitoring/metrics    # Get system metrics
GET    /api/v1/monitoring/logs       # Get system logs
```

## Request/Response Format

### Standard Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Data Models

### Prompt Model

```json
{
  "id": "uuid",
  "name": "string",
  "version": "string",
  "content": "string",
  "description": "string",
  "author": "string",
  "tags": ["string"],
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Chat Message Model

```json
{
  "role": "user|assistant|system",
  "content": "string",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### LLM Model Info

```json
{
  "name": "string",
  "provider": "openai|anthropic|google|groq|huggingface",
  "description": "string",
  "max_tokens": 4096,
  "supports_streaming": true,
  "parameters": {
    "temperature": { "min": 0, "max": 2, "default": 1 },
    "max_tokens": { "min": 1, "max": 4096, "default": 1000 }
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `PROMPT_NOT_FOUND` | Prompt not found |
| `LLM_API_ERROR` | External LLM API error |
| `STORAGE_ERROR` | Storage operation failed |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |

## Rate Limits

Currently no rate limits are implemented. Future implementation will include:
- 100 requests per minute per IP
- 1000 requests per hour per user
- Special limits for LLM API calls

## Development

### Running the API Server

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Testing the API

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Get prompts
curl http://localhost:8000/api/v1/prompts

# Create prompt
curl -X POST http://localhost:8000/api/v1/prompts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test_prompt",
    "version": "1.0",
    "content": "You are a helpful assistant.",
    "description": "Test prompt"
  }'
```

## SDK and Client Libraries

현재는 HTTP REST API만 제공됩니다. 향후 다음 클라이언트 라이브러리가 추가될 예정입니다:

- Python SDK
- Node.js SDK
- TypeScript SDK

## Changelog

### v1.0.0 (Phase 1)
- Initial API implementation
- LLM Playground endpoints
- Prompt Management endpoints
- Basic health check

### Future Versions
- v2.0.0: RAG Builder APIs
- v3.0.0: Monitoring and Analytics APIs
- v4.0.0: A/B Testing APIs 