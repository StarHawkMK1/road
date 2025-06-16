# ROAD - RAG Orchestration & Application Development

**ROAD (RAG Orchestration & Application Development)**는 개발자가 고성능 RAG 시스템을 가장 효율적이고 직관적인 방식으로 구축, 테스트, 배포할 수 있도록 지원하는 올인원 플랫폼입니다.

## 🎯 프로젝트 비전

현대적이고 세련된 GUI를 통해 복잡한 RAG 파이프라인 설계를 단순화하고, LLM의 성능을 극대화하는 실험 환경을 제공하여 RAG 개발의 새로운 표준을 제시합니다.

## ✨ 주요 기능 (Phase 1 - MVP)

### 🎮 LLM Playground
- **다중 모델 API 연동**: OpenAI, Claude, Gemini, Groq, Hugging Face 지원
- **실시간 파라미터 조정**: Temperature, Max Tokens, Top P 등
- **System Prompt 연동**: 직접 입력 및 저장된 프롬프트 불러오기
- **대화형 인터페이스**: 채팅 형식의 직관적인 UI

### 📝 Prompt Management
- **버전 관리**: 프롬프트의 여러 버전 생성 및 추적
- **통합 검색**: 이름 및 내용 기반 검색
- **듀얼 저장**: JSON 파일 및 데이터베이스 동시 저장 지원
- **메타데이터 관리**: 작성자, 생성일, 수정일 등 추적

## 🚀 빠른 시작

### 전제 조건
- Python 3.9+
- Node.js 18+
- Docker & Docker Compose (선택사항)

### 1. 저장소 클론
```bash
git clone <repository-url>
cd road
```

### 2. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 열어 API 키 등 필요한 값들을 설정하세요
```

### 3. Docker를 사용한 실행 (권장)
```bash
docker-compose up --build
```

### 4. 수동 설치 및 실행

#### 백엔드 설정
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### 프론트엔드 설정
```bash
cd frontend
npm install
npm run dev
```

## 🏗️ 아키텍처

```
ROAD Platform
├── Frontend (React + TypeScript)
│   ├── LLM Playground
│   ├── Prompt Management
│   └── 미래 기능들...
├── Backend (FastAPI)
│   ├── LLM Provider Services
│   ├── Prompt CRUD APIs
│   └── Database Models
└── Storage
    ├── PostgreSQL (메타데이터)
    └── JSON Files (백업)
```

## 🎨 UI/UX 디자인

- **테마**: 라이트/다크 모드 지원
- **영감**: devin.ai의 세련된 다크 모드, MLflow의 정보 밀도
- **컴포넌트**: Radix UI 기반 모던 컴포넌트
- **레이아웃**: 확장/축소 가능한 사이드바

## 📚 기술 스택

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API Client**: Axios + React Query
- **UI Components**: Radix UI

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL + SQLAlchemy
- **LLM Integration**: OpenAI, Anthropic, Google, Groq, Hugging Face
- **Storage**: Dual storage (JSON + Database)

## 🛣️ 로드맵

### Phase 1 (Current) - MVP
- ✅ 프로젝트 구조 설정
- ⏳ LLM Playground 구현
- ⏳ Prompt Management 구현

### Phase 2 - RAG Builder
- 🔄 Visual RAG Pipeline Builder
- 🔄 Document Processing
- 🔄 Vector Database Integration

### Phase 3 - Advanced Features
- 🔄 A/B Testing
- 🔄 Performance Monitoring
- 🔄 Evaluation Metrics

## 🤝 기여하기

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🔗 관련 링크

- [API 문서](http://localhost:8000/docs) - FastAPI 자동 생성 문서
- [Redoc](http://localhost:8000/redoc) - 대안 API 문서

## 📧 연락처

프로젝트 관련 문의사항이 있으시면 이슈를 생성해 주세요. 