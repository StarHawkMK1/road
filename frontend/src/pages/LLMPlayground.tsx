import { useState } from 'react'
import { LLMParameters, ChatMessage, LLMProviderType } from '@/types'
import { llmApi } from '@/lib/api'
import ModelSelector from '@/components/llm/ModelSelector'
import ParameterPanel from '@/components/llm/ParameterPanel'
import ChatInterface from '@/components/llm/ChatInterface'

export default function LLMPlayground() {
  // Model Selection State
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [selectedModel, setSelectedModel] = useState<string>('')

  // Parameters State
  const [parameters, setParameters] = useState<LLMParameters>({
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 1.0,
    presence_penalty: 0,
    frequency_penalty: 0,
    stop: []
  })

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}`)

  // Handlers
  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider)
    setSelectedModel('') // Reset model when provider changes
    setMessages([]) // Clear chat when provider changes
  }

  const handleModelChange = (model: string) => {
    setSelectedModel(model)
    setMessages([]) // Clear chat when model changes
  }

  const handleParametersChange = (newParameters: LLMParameters) => {
    setParameters(newParameters)
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedProvider || !selectedModel) {
      console.error('Provider and model must be selected')
      return
    }

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      // Send to API
      const response = await llmApi.chat({
        model_name: selectedModel,
        model_provider: selectedProvider as LLMProviderType,
        messages: newMessages,
        parameters,
        session_id: sessionId
      })

      // Add assistant response
      if (response.data) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.data.message.content,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Chat error:', error)
      
      // Add error message
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please check your configuration and try again.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const isPlaygroundReady = selectedProvider && selectedModel

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-light-primary dark:text-dark-primary">
            LLM Playground
          </h1>
          <span className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-full">
            Active
          </span>
        </div>
        <p className="text-light-secondary dark:text-dark-secondary mt-2">
          Test and interact with different Large Language Models
        </p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left Panel - Configuration */}
        <div className="w-80 flex-shrink-0 space-y-6 overflow-y-auto">
          {/* Model Selection */}
          <ModelSelector
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            onProviderChange={handleProviderChange}
            onModelChange={handleModelChange}
          />

          {/* Parameters */}
          <ParameterPanel
            parameters={parameters}
            onParametersChange={handleParametersChange}
            selectedModel={selectedModel}
            disabled={!isPlaygroundReady}
          />
        </div>

        {/* Right Panel - Chat */}
        <div className="flex-1 min-w-0">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            disabled={!isPlaygroundReady}
            placeholder={
              !isPlaygroundReady 
                ? "Select a provider and model to start chatting..." 
                : "Type your message here..."
            }
            showModelInfo={true}
            modelName={selectedModel}
            providerName={selectedProvider}
          />
        </div>
      </div>
    </div>
  )
} 