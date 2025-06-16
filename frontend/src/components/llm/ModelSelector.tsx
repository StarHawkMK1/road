import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent, Select, Badge, Loading } from '@/components/common'
import { LLMProvider, LLMModel } from '@/types'
import api from '@/lib/api'
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
  const [models, setModels] = useState<LLMModel[]>([])
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'connected' | 'error' | 'checking'>>({})

  // Load providers on mount
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const response = await api.get('/api/v1/llm/providers')
        setProviders(response.data)
        
        // Check connection status for each provider
        const statusChecks = response.data.map(async (provider: LLMProvider) => {
          setConnectionStatus(prev => ({ ...prev, [provider.id]: 'checking' }))
          try {
            await api.post(`/api/v1/llm/test-connection`, { provider: provider.id })
            setConnectionStatus(prev => ({ ...prev, [provider.id]: 'connected' }))
          } catch (error) {
            setConnectionStatus(prev => ({ ...prev, [provider.id]: 'error' }))
          }
        })
        
        await Promise.all(statusChecks)
      } catch (error) {
        console.error('Failed to load providers:', error)
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
        const response = await api.get(`/api/v1/llm/models?provider=${selectedProvider}`)
        setModels(response.data)
        
        // Auto-select first model if none selected
        if (!selectedModel && response.data.length > 0) {
          onModelChange(response.data[0].id)
        }
      } catch (error) {
        console.error('Failed to load models:', error)
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

  return (
    <Card>
      <CardHeader 
        title="Model Selection"
        subtitle="Choose your LLM provider and model"
      />
      <CardContent className="space-y-4">
        {/* Provider Selection */}
        <Select
          label="LLM Provider"
          placeholder="Select a provider"
          value={selectedProvider}
          onChange={(e) => onProviderChange(e.target.value)}
          options={providers.map(provider => ({
            value: provider.id,
            label: provider.name,
            disabled: connectionStatus[provider.id] === 'error'
          }))}
        />

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
        {selectedProvider && (
          <Select
            label="Model"
            placeholder="Select a model"
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            options={models.map(model => ({
              value: model.id,
              label: `${model.name} ${model.contextWindow ? `(${model.contextWindow.toLocaleString()} tokens)` : ''}`,
              disabled: !model.available
            }))}
            disabled={connectionStatus[selectedProvider] !== 'connected'}
          />
        )}

        {/* Model Info */}
        {selectedModel && (
          <div className="space-y-2">
            {(() => {
              const model = models.find(m => m.id === selectedModel)
              if (!model) return null
              
              return (
                <div className="p-3 bg-light-muted dark:bg-dark-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-light-primary dark:text-dark-primary">
                        Context Window:
                      </span>
                      <span className="ml-2 text-light-secondary dark:text-dark-secondary">
                        {model.contextWindow?.toLocaleString() || 'N/A'} tokens
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-light-primary dark:text-dark-primary">
                        Max Output:
                      </span>
                      <span className="ml-2 text-light-secondary dark:text-dark-secondary">
                        {model.maxOutputTokens?.toLocaleString() || 'N/A'} tokens
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
      </CardContent>
    </Card>
  )
}

export default ModelSelector 