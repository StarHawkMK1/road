// frontend/src/components/llm/ModelSelector.tsx
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent, Select, Badge, Loading } from '@/components/common'
import { LLMProvider, ModelInfo } from '@/types'
import { llmApi, apiUtils } from '@/lib/api'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'

interface ModelSelectorProps {
  selectedProvider: string
  selectedModel: string
  onProviderChange: (provider: string) => void
  onModelChange: (model: string) => void
}

const ModelSelector = ({ 
  selectedProvider, 
  selectedModel, 
  onProviderChange, 
  onModelChange 
}: ModelSelectorProps) => {
  const [providers, setProviders] = useState<LLMProvider[]>([])
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'connected' | 'error' | 'checking'>>({})
  const [error, setError] = useState<string | null>(null)

  // Load providers on mount
  useEffect(() => {
    const loadProviders = async () => {
      try {
        setError(null)
        const response = await llmApi.getProviders()
        setProviders(response.data.providers)
        
        // Check connection status for each provider
        const statusChecks = response.data.providers.map(async (provider: LLMProvider) => {
          setConnectionStatus(prev => ({ ...prev, [provider.id]: 'checking' }))
          try {
            const testResponse = await llmApi.testConnection(provider.id)
            const isConnected = testResponse.data.status === 'connected'
            setConnectionStatus(prev => ({ 
              ...prev, 
              [provider.id]: isConnected ? 'connected' : 'error' 
            }))
          } catch (error) {
            console.error(`Connection test failed for ${provider.id}:`, error)
            setConnectionStatus(prev => ({ ...prev, [provider.id]: 'error' }))
          }
        })
        
        await Promise.all(statusChecks)
      } catch (error) {
        console.error('Failed to load providers:', error)
        setError(apiUtils.handleError(error))
      } finally {
        setLoading(false)
      }
    }
    
    loadProviders()
  }, [])

  // Load models when provider changes
  useEffect(() => {
    const loadModels = async () => {
      if (!selectedProvider) {
        setModels([])
        return
      }
      
      try {
        setError(null)
        const response = await llmApi.getModels(selectedProvider)
        setModels(response.data.models)
        
        // Auto-select first model if none selected
        if (!selectedModel && response.data.models.length > 0) {
          onModelChange(response.data.models[0].name)
        }
      } catch (error) {
        console.error('Failed to load models:', error)
        setError(apiUtils.handleError(error))
        setModels([])
      }
    }
    
    loadModels()
  }, [selectedProvider, selectedModel, onModelChange])

  const getConnectionStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'checking':
        return <Loading size="sm" variant="spinner" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
  }

  const getConnectionStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected'
      case 'error':
        return 'Connection Error'
      case 'checking':
        return 'Checking...'
      default:
        return 'Unknown'
    }
  }

  const getConnectionStatusVariant = (status: string) => {
    switch (status) {
      case 'connected':
        return 'success' as const
      case 'error':
        return 'danger' as const
      case 'checking':
        return 'warning' as const
      default:
        return 'default' as const
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title="Model Selection" />
        <CardContent>
          <Loading text="Loading providers..." center />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader title="Model Selection" />
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader 
        title="Model Selection"
        subtitle="Choose your LLM provider and model"
      />
      <CardContent className="space-y-4">
        {/* Provider Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-light-primary dark:text-dark-primary">
            LLM Provider
          </label>
          <select
            value={selectedProvider}
            onChange={(e) => onProviderChange(e.target.value)}
            className="w-full px-3 py-2 bg-light-panel dark:bg-dark-panel border border-light-border dark:border-dark-border rounded-lg text-light-primary dark:text-dark-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent transition-colors"
          >
            <option value="">Select a provider</option>
            {providers.map(provider => (
              <option 
                key={provider.id} 
                value={provider.id}
                disabled={connectionStatus[provider.id] === 'error'}
              >
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        {/* Provider Status */}
        {selectedProvider && (
          <div className="flex items-center justify-between p-3 bg-light-muted dark:bg-dark-muted rounded-lg">
            <span className="text-sm font-medium text-light-primary dark:text-dark-primary">
              Connection Status
            </span>
            <div className="flex items-center space-x-2">
              {getConnectionStatusIcon(connectionStatus[selectedProvider])}
              <Badge variant={getConnectionStatusVariant(connectionStatus[selectedProvider])}>
                {getConnectionStatusText(connectionStatus[selectedProvider])}
              </Badge>
            </div>
          </div>
        )}

        {/* Model Selection */}
        {selectedProvider && connectionStatus[selectedProvider] === 'connected' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-light-primary dark:text-dark-primary">
              Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="w-full px-3 py-2 bg-light-panel dark:bg-dark-panel border border-light-border dark:border-dark-border rounded-lg text-light-primary dark:text-dark-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent transition-colors"
            >
              <option value="">Select a model</option>
              {models.map(model => (
                <option 
                  key={model.name} 
                  value={model.name}
                >
                  {model.name} {model.max_tokens ? `(${model.max_tokens.toLocaleString()} tokens)` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Model Info */}
        {selectedModel && (
          <div className="space-y-2">
            {(() => {
              const model = models.find(m => m.name === selectedModel)
              if (!model) return null
              
              return (
                <div className="p-3 bg-light-muted dark:bg-dark-muted rounded-lg">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-light-primary dark:text-dark-primary">
                        Provider:
                      </span>
                      <span className="ml-2 text-light-secondary dark:text-dark-secondary">
                        {model.provider}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-light-primary dark:text-dark-primary">
                        Max Tokens:
                      </span>
                      <span className="ml-2 text-light-secondary dark:text-dark-secondary">
                        {model.max_tokens?.toLocaleString() || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-light-primary dark:text-dark-primary">
                        Streaming:
                      </span>
                      <span className="ml-2 text-light-secondary dark:text-dark-secondary">
                        {model.supports_streaming ? 'Supported' : 'Not supported'}
                      </span>
                    </div>
                    {model.description && (
                      <div className="col-span-2">
                        <span className="font-medium text-light-primary dark:text-dark-primary">
                          Description:
                        </span>
                        <p className="mt-1 text-light-secondary dark:text-dark-secondary">
                          {model.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* No providers available */}
        {providers.length === 0 && (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-light-secondary dark:text-dark-secondary mb-2">
              No LLM providers available
            </p>
            <p className="text-sm text-light-secondary dark:text-dark-secondary">
              Please check your API key configuration in the .env file
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ModelSelector