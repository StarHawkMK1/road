import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent, Input, Badge, Tooltip } from '@/components/common'
import { LLMParameters } from '@/types'
import { Info, RotateCcw } from 'lucide-react'

interface ParameterPanelProps {
  parameters: LLMParameters
  onParametersChange: (parameters: LLMParameters) => void
  selectedModel?: string
  disabled?: boolean
}

// Default parameter configurations
const DEFAULT_PARAMETERS: LLMParameters = {
  temperature: 0.7,
  max_tokens: 1000,
  top_p: 1.0,
  presence_penalty: 0,
  frequency_penalty: 0,
  stop: []
}

// Parameter ranges and descriptions
const PARAMETER_CONFIG = {
  temperature: {
    min: 0,
    max: 2,
    step: 0.1,
    description: 'Controls randomness. Lower values make responses more focused and deterministic.'
  },
  max_tokens: {
    min: 1,
    max: 4096,
    step: 1,
    description: 'Maximum number of tokens to generate in the response.'
  },
  top_p: {
    min: 0,
    max: 1,
    step: 0.01,
    description: 'Nucleus sampling. Alternative to temperature for controlling randomness.'
  },
  presence_penalty: {
    min: -2,
    max: 2,
    step: 0.1,
    description: 'Penalizes new tokens based on whether they appear in the text so far.'
  },
  frequency_penalty: {
    min: -2,
    max: 2,
    step: 0.1,
    description: 'Penalizes new tokens based on their existing frequency in the text.'
  }
}

const ParameterPanel = ({ 
  parameters, 
  onParametersChange, 
  selectedModel,
  disabled = false 
}: ParameterPanelProps) => {
  const [localParameters, setLocalParameters] = useState<LLMParameters>(parameters)

  // Update local state when parameters prop changes
  useEffect(() => {
    setLocalParameters(parameters)
  }, [parameters])

  const handleParameterChange = (key: keyof LLMParameters, value: any) => {
    const updatedParameters = { ...localParameters, [key]: value }
    setLocalParameters(updatedParameters)
    onParametersChange(updatedParameters)
  }

  const resetToDefaults = () => {
    setLocalParameters(DEFAULT_PARAMETERS)
    onParametersChange(DEFAULT_PARAMETERS)
  }

  const renderSliderInput = (
    key: keyof typeof PARAMETER_CONFIG,
    label: string,
    value: number
  ) => {
    const config = PARAMETER_CONFIG[key]
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-light-primary dark:text-dark-primary">
              {label}
            </label>
            <Tooltip
              content={config.description}
              position="top"
              maxWidth="300px"
            >
              <Info className="w-4 h-4 text-light-secondary dark:text-dark-secondary cursor-help" />
            </Tooltip>
          </div>
          <Badge variant="outline" className="text-xs">
            {value}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-xs text-light-secondary dark:text-dark-secondary w-8">
            {config.min}
          </span>
          <input
            type="range"
            min={config.min}
            max={config.max}
            step={config.step}
            value={value}
            onChange={(e) => handleParameterChange(key, parseFloat(e.target.value))}
            disabled={disabled}
            className="flex-1 h-2 bg-light-border dark:bg-dark-border rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-xs text-light-secondary dark:text-dark-secondary w-8">
            {config.max}
          </span>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader 
        title="Parameters"
        subtitle="Adjust model behavior and response characteristics"
        action={
          <Tooltip content="Reset to defaults">
            <button
              onClick={resetToDefaults}
              disabled={disabled}
              className="p-2 text-light-secondary dark:text-dark-secondary hover:text-light-primary dark:hover:text-dark-primary transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </Tooltip>
        }
      />
      <CardContent className="space-y-6">
        {/* Temperature */}
        {renderSliderInput('temperature', 'Temperature', localParameters.temperature)}
        
        {/* Max Tokens */}
        {renderSliderInput('max_tokens', 'Max Tokens', localParameters.max_tokens)}
        
        {/* Top P */}
        {renderSliderInput('top_p', 'Top P', localParameters.top_p || 1.0)}
        
        {/* Presence Penalty */}
        {renderSliderInput('presence_penalty', 'Presence Penalty', localParameters.presence_penalty || 0)}
        
        {/* Frequency Penalty */}
        {renderSliderInput('frequency_penalty', 'Frequency Penalty', localParameters.frequency_penalty || 0)}
        
        {/* Stop Sequences */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-light-primary dark:text-dark-primary">
              Stop Sequences
            </label>
            <Tooltip
              content="Sequences where the model will stop generating. Enter one per line."
              position="top"
              maxWidth="300px"
            >
              <Info className="w-4 h-4 text-light-secondary dark:text-dark-secondary cursor-help" />
            </Tooltip>
          </div>
          
          <textarea
            placeholder="Enter stop sequences (one per line)"
            value={localParameters.stop?.join('\n') || ''}
            onChange={(e) => {
              const stopSequences = e.target.value
                .split('\n')
                .map(s => s.trim())
                .filter(s => s.length > 0)
              handleParameterChange('stop', stopSequences)
            }}
            disabled={disabled}
            rows={3}
            className="w-full px-3 py-2 bg-light-panel dark:bg-dark-panel border border-light-border dark:border-dark-border rounded-lg text-light-primary dark:text-dark-primary placeholder-light-secondary dark:placeholder-dark-secondary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent transition-colors resize-none"
          />
        </div>

        {/* Parameter Summary */}
        <div className="pt-4 border-t border-light-border dark:border-dark-border">
          <div className="text-sm text-light-secondary dark:text-dark-secondary">
            <p className="font-medium mb-2">Parameter Summary:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Temperature: {localParameters.temperature}</div>
              <div>Max Tokens: {localParameters.max_tokens}</div>
              <div>Top P: {localParameters.top_p || 1.0}</div>
              <div>Presence: {localParameters.presence_penalty || 0}</div>
              <div>Frequency: {localParameters.frequency_penalty || 0}</div>
              <div>Stop Seqs: {localParameters.stop?.length || 0}</div>
            </div>
          </div>
        </div>

        {/* Model-specific notes */}
        {selectedModel && (
          <div className="p-3 bg-light-muted dark:bg-dark-muted rounded-lg">
            <p className="text-xs text-light-secondary dark:text-dark-secondary">
              <strong>Note:</strong> Some parameters may not be supported by all models. 
              Unsupported parameters will be ignored by the provider.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ParameterPanel 