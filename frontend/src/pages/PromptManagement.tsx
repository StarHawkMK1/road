import { useState } from 'react'
import { Prompt } from '@/types'
import { PromptLibrary, PromptEditor, TemplateSelector } from '@/components/prompt'
import { Button } from '@/components/common'
import { Plus, ArrowLeft } from 'lucide-react'

type ViewMode = 'library' | 'editor' | 'templates'

export default function PromptManagement() {
  const [currentView, setCurrentView] = useState<ViewMode>('library')
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | undefined>()
  const [isCreating, setIsCreating] = useState(false)

  const handleSelectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt)
  }

  const handleEditPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt)
    setCurrentView('editor')
    setIsCreating(false)
  }

  const handleCreateNew = () => {
    setSelectedPrompt(undefined)
    setCurrentView('editor')
    setIsCreating(true)
  }

  const handleUseTemplate = (template: any) => {
    // Convert template to prompt format for editing
    const promptFromTemplate: Partial<Prompt> = {
      name: template.name,
      content: template.content,
      description: template.description,
      tags: template.tags,
      version: '1.0',
      is_active: true
    }
    setSelectedPrompt(promptFromTemplate as Prompt)
    setCurrentView('editor')
    setIsCreating(true)
  }

  const handleSavePrompt = (prompt: Prompt) => {
    // Refresh library view
    setCurrentView('library')
    setSelectedPrompt(prompt)
    setIsCreating(false)
  }

  const handleCancel = () => {
    setCurrentView('library')
    setSelectedPrompt(undefined)
    setIsCreating(false)
  }

  const showBackButton = currentView !== 'library'

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button
                variant="ghost"
                onClick={() => setCurrentView('library')}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Library
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                Prompt Management
              </h1>
              <p className="text-light-secondary dark:text-dark-secondary mt-1">
                {currentView === 'library' && 'Manage and organize your prompt library'}
                {currentView === 'editor' && (isCreating ? 'Create a new prompt' : 'Edit prompt')}
                {currentView === 'templates' && 'Choose from pre-built templates'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-full">
              Active
            </span>
            {currentView === 'library' && (
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentView('templates')}
                >
                  Browse Templates
                </Button>
                <Button
                  onClick={handleCreateNew}
                  icon={<Plus className="w-4 h-4" />}
                >
                  New Prompt
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {currentView === 'library' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
            {/* Prompt Library */}
            <div className="xl:col-span-2">
              <PromptLibrary
                onSelectPrompt={handleSelectPrompt}
                onEditPrompt={handleEditPrompt}
                onCreateNew={handleCreateNew}
                selectedPromptId={selectedPrompt?.id}
                showActions={true}
              />
            </div>

            {/* Selected Prompt Preview */}
            <div className="xl:col-span-1">
              {selectedPrompt ? (
                <div className="bg-light-panel dark:bg-dark-panel border border-light-border dark:border-dark-border rounded-lg p-6 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                      {selectedPrompt.name}
                    </h3>
                    <Button
                      size="sm"
                      onClick={() => handleEditPrompt(selectedPrompt)}
                    >
                      Edit
                    </Button>
                  </div>
                  
                  {selectedPrompt.description && (
                    <p className="text-light-secondary dark:text-dark-secondary mb-4">
                      {selectedPrompt.description}
                    </p>
                  )}
                  
                  <div className="space-y-3 mb-4">
                    <div className="text-sm">
                      <span className="font-medium text-light-primary dark:text-dark-primary">Version:</span>
                      <span className="ml-2 text-light-secondary dark:text-dark-secondary">{selectedPrompt.version}</span>
                    </div>
                    {selectedPrompt.author && (
                      <div className="text-sm">
                        <span className="font-medium text-light-primary dark:text-dark-primary">Author:</span>
                        <span className="ml-2 text-light-secondary dark:text-dark-secondary">{selectedPrompt.author}</span>
                      </div>
                    )}
                    <div className="text-sm">
                      <span className="font-medium text-light-primary dark:text-dark-primary">Status:</span>
                      <span className={`ml-2 ${selectedPrompt.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {selectedPrompt.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-light-muted dark:bg-dark-muted rounded-lg p-4">
                    <h4 className="font-medium text-light-primary dark:text-dark-primary mb-2">
                      Content Preview:
                    </h4>
                    <pre className="text-xs text-light-primary dark:text-dark-primary whitespace-pre-wrap">
                      {selectedPrompt.content}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="bg-light-panel dark:bg-dark-panel border border-light-border dark:border-dark-border rounded-lg p-6 h-full flex items-center justify-center">
                  <div className="text-center text-light-secondary dark:text-dark-secondary">
                    <p className="mb-4">Select a prompt to see its details</p>
                    <Button variant="ghost" onClick={handleCreateNew}>
                      Create New Prompt
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'editor' && (
          <PromptEditor
            prompt={selectedPrompt}
            onSave={handleSavePrompt}
            onCancel={handleCancel}
            isCreating={isCreating}
          />
        )}

        {currentView === 'templates' && (
          <TemplateSelector
            onUseTemplate={handleUseTemplate}
          />
        )}
      </div>
    </div>
  )
} 