import { useState, useRef, useEffect } from 'react'
import { Card, CardHeader, CardContent, Button, Textarea, Loading, Badge } from '@/components/common'
import { ChatMessage, MessageRole } from '@/types'
import { Send, Copy, RotateCcw, User, Bot, Zap } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

interface ChatInterfaceProps {
  messages: ChatMessage[]
  onSendMessage: (content: string) => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
  showModelInfo?: boolean
  modelName?: string
  providerName?: string
}

const ChatInterface = ({
  messages,
  onSendMessage,
  isLoading = false,
  disabled = false,
  placeholder = "Type your message here...",
  showModelInfo = true,
  modelName,
  providerName
}: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputValue])

  const handleSend = () => {
    if (!inputValue.trim() || isLoading || disabled) return
    
    onSendMessage(inputValue.trim())
    setInputValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    // TODO: Add toast notification
  }

  const clearChat = () => {
    // TODO: Implement clear chat functionality
    console.log('Clear chat requested')
  }

  const getRoleIcon = (role: MessageRole) => {
    switch (role) {
      case 'user':
        return <User className="w-5 h-5" />
      case 'assistant':
        return <Bot className="w-5 h-5" />
      case 'system':
        return <Zap className="w-5 h-5" />
      default:
        return null
    }
  }

  const getRoleColor = (role: MessageRole) => {
    switch (role) {
      case 'user':
        return 'text-blue-600 dark:text-blue-400'
      case 'assistant':
        return 'text-green-600 dark:text-green-400'
      case 'system':
        return 'text-purple-600 dark:text-purple-400'
      default:
        return 'text-light-secondary dark:text-dark-secondary'
    }
  }

  const getRoleBadgeVariant = (role: MessageRole) => {
    switch (role) {
      case 'user':
        return 'info' as const
      case 'assistant':
        return 'success' as const
      case 'system':
        return 'warning' as const
      default:
        return 'default' as const
    }
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader 
        title="Chat"
        subtitle={showModelInfo && modelName ? `${providerName} • ${modelName}` : 'LLM Conversation'}
        action={
          <div className="flex items-center space-x-2">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                disabled={disabled}
                icon={<RotateCcw className="w-4 h-4" />}
              >
                Clear
              </Button>
            )}
          </div>
        }
      />
      
      <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot className="w-12 h-12 text-light-secondary dark:text-dark-secondary mb-4" />
              <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-2">
                Start a conversation
              </h3>
              <p className="text-light-secondary dark:text-dark-secondary max-w-sm">
                Send a message to begin chatting with the selected AI model.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex gap-4 p-4 rounded-lg',
                    message.role === 'user' 
                      ? 'bg-light-muted dark:bg-dark-muted ml-12' 
                      : 'bg-light-panel dark:bg-dark-panel mr-12'
                  )}
                >
                  {/* Avatar */}
                  <div className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                    message.role === 'user'
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : 'bg-green-100 dark:bg-green-900'
                  )}>
                    <span className={getRoleColor(message.role)}>
                      {getRoleIcon(message.role)}
                    </span>
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={getRoleBadgeVariant(message.role)}
                          size="sm"
                        >
                          {message.role}
                        </Badge>
                        {message.timestamp && (
                          <span className="text-xs text-light-secondary dark:text-dark-secondary">
                            {formatDate(message.timestamp)}
                          </span>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyMessage(message.content)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        icon={<Copy className="w-3 h-3" />}
                      />
                    </div>
                    
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-light-primary dark:text-dark-primary">
                        {message.content}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-4 p-4 rounded-lg bg-light-panel dark:bg-dark-panel mr-12">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <Badge variant="success" size="sm" className="mb-2">
                      assistant
                    </Badge>
                    <Loading text="Thinking..." />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-light-border dark:border-dark-border p-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={disabled}
                resize={false}
                rows={1}
                className="min-h-[44px] max-h-32 resize-none"
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading || disabled}
              loading={isLoading}
              icon={<Send className="w-4 h-4" />}
              className="self-end"
            >
              Send
            </Button>
          </div>
          
          {inputValue.trim() && (
            <div className="mt-2 text-xs text-light-secondary dark:text-dark-secondary">
              Press Enter to send, Shift+Enter for new line
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ChatInterface 