// Theme types
export type Theme = 'light' | 'dark'

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
}

// Prompt types
export interface Prompt {
  id: string
  name: string
  version: string
  content: string
  description?: string
  author?: string
  tags: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PromptCreate {
  name: string
  version?: string
  content: string
  description?: string
  author?: string
  tags?: string[]
}

export interface PromptUpdate {
  name?: string
  version?: string
  content?: string
  description?: string
  author?: string
  tags?: string[]
  is_active?: boolean
}

// LLM types
export type LLMProviderType = 'openai' | 'anthropic' | 'google' | 'groq' | 'huggingface'

export interface LLMProvider {
  id: string
  name: string
  description: string
  available: boolean
  configured: boolean
  error?: string
}

export interface LLMModel {
  id: string
  name: string
  provider: LLMProviderType
  description?: string
  contextWindow?: number
  maxOutputTokens?: number
  available: boolean
  pricePerToken?: {
    input: number
    output: number
  }
}

export type MessageRole = 'system' | 'user' | 'assistant'

export interface ChatMessage {
  role: MessageRole
  content: string
  timestamp?: string
}

export interface LLMParameters {
  temperature: number
  max_tokens: number
  top_p?: number
  presence_penalty?: number
  frequency_penalty?: number
  stop?: string[]
}

export interface ModelInfo {
  name: string
  provider: LLMProviderType
  description: string
  max_tokens: number
  supports_streaming: boolean
  supports_functions?: boolean
  parameters: Record<string, {
    min: number
    max: number
    default: number
  }>
}

export interface ChatRequest {
  llm_model_name: string
  llm_model_provider: LLMProviderType
  messages: ChatMessage[]
  system_prompt?: string
  parameters: LLMParameters
  stream?: boolean
  session_id?: string
}

export interface ChatResponse {
  message: ChatMessage
  llm_model_name: string
  llm_model_provider: string
  parameters: LLMParameters
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  response_time?: number
  session_id?: string
}

// UI Component types
export interface MenuItem {
  id: string
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  isAvailable: boolean
  comingSoon?: boolean
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  duration?: number
}

// Store types
export interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export interface NotificationStore {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

// Utility types
export type Status = 'idle' | 'loading' | 'success' | 'error'

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface SearchParams {
  query?: string
  page?: number
  page_size?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  filters?: Record<string, any>
}