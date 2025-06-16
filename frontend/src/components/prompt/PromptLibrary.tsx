import { useState, useEffect } from 'react'
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Input, 
  Button, 
  Badge, 
  Loading,
  Modal,
  ModalHeader,
  ModalFooter 
} from '@/components/common'
import { Prompt, SearchParams } from '@/types'
import { promptsApi } from '@/lib/api'
import { 
  Search, 
  Plus, 
  Edit3, 
  Copy, 
  Trash2, 
  Tag, 
  User, 
  Calendar,
  Eye,
  Download
} from 'lucide-react'
import { formatDate, debounce } from '@/lib/utils'

interface PromptLibraryProps {
  onSelectPrompt?: (prompt: Prompt) => void
  onEditPrompt?: (prompt: Prompt) => void
  onCreateNew?: () => void
  selectedPromptId?: string
  showActions?: boolean
  compact?: boolean
}

const PromptLibrary = ({
  onSelectPrompt,
  onEditPrompt,
  onCreateNew,
  selectedPromptId,
  showActions = true,
  compact = false
}: PromptLibraryProps) => {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    page: 1,
    page_size: compact ? 5 : 10,
    sort_by: 'updated_at',
    sort_order: 'desc'
  })
  const [totalPrompts, setTotalPrompts] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; prompt?: Prompt }>({
    isOpen: false
  })

  // Debounced search
  const debouncedSearch = debounce((query: string) => {
    setSearchParams(prev => ({ ...prev, query, page: 1 }))
  }, 300)

  // Load prompts
  useEffect(() => {
    const loadPrompts = async () => {
      setLoading(true)
      try {
        const params = {
          ...searchParams,
          tags: selectedTags.length > 0 ? selectedTags : undefined
        }
        const response = await promptsApi.getAll(params)
        
        // Backend returns data directly without success wrapper
        if (response && response.prompts) {
          setPrompts(response.prompts)
          setTotalPrompts(response.total)
        }
      } catch (error) {
        console.error('Failed to load prompts:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPrompts()
  }, [searchParams, selectedTags])

  const handleSearch = (query: string) => {
    debouncedSearch(query)
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleCopyPrompt = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content)
      // TODO: Add toast notification
      console.log('Prompt copied to clipboard')
    } catch (error) {
      console.error('Failed to copy prompt:', error)
    }
  }

  const handleDeletePrompt = async (prompt: Prompt) => {
    setDeleteModal({ isOpen: true, prompt })
  }

  const confirmDelete = async () => {
    if (!deleteModal.prompt) return

    try {
      await promptsApi.delete(deleteModal.prompt.id)
      setPrompts(prev => prev.filter(p => p.id !== deleteModal.prompt!.id))
      setDeleteModal({ isOpen: false })
      // TODO: Add toast notification
      console.log('Prompt deleted successfully')
    } catch (error) {
      console.error('Failed to delete prompt:', error)
    }
  }

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, page }))
  }

  // Get all unique tags from prompts
  const allTags = Array.from(
    new Set(prompts.flatMap(p => p.tags))
  ).sort()

  const totalPages = Math.ceil(totalPrompts / (searchParams.page_size || 10))

  if (loading && prompts.length === 0) {
    return (
      <Card>
        <CardHeader title="Prompt Library" />
        <CardContent>
          <Loading text="Loading prompts..." center />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader 
          title="Prompt Library"
          subtitle={`${totalPrompts} prompt${totalPrompts !== 1 ? 's' : ''} available`}
          action={
            showActions && onCreateNew && (
              <Button
                onClick={onCreateNew}
                icon={<Plus className="w-4 h-4" />}
                size="sm"
              >
                New Prompt
              </Button>
            )
          }
        />
        
        <CardContent className="space-y-4">
          {/* Search */}
          <Input
            placeholder="Search prompts..."
            leftIcon={<Search className="w-4 h-4" />}
            onChange={(e) => handleSearch(e.target.value)}
          />

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-light-primary dark:text-dark-primary">
                Filter by tags:
              </label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'info' : 'outline'}
                    className="cursor-pointer transition-colors"
                    onClick={() => handleTagToggle(tag)}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Prompts List */}
          <div className="space-y-3">
            {prompts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-light-secondary dark:text-dark-secondary">
                  {searchParams.query || selectedTags.length > 0 
                    ? 'No prompts match your search criteria'
                    : 'No prompts found. Create your first prompt!'
                  }
                </div>
                {showActions && onCreateNew && (
                  <Button
                    onClick={onCreateNew}
                    variant="ghost"
                    className="mt-4"
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Create First Prompt
                  </Button>
                )}
              </div>
            ) : (
              prompts.map(prompt => (
                <div
                  key={prompt.id}
                  className={`
                    p-4 border border-light-border dark:border-dark-border rounded-lg
                    ${selectedPromptId === prompt.id 
                      ? 'bg-light-accent/10 dark:bg-dark-accent/10 border-light-accent dark:border-dark-accent' 
                      : 'bg-light-panel dark:bg-dark-panel hover:bg-light-muted dark:hover:bg-dark-muted'
                    }
                    transition-colors cursor-pointer
                  `}
                  onClick={() => onSelectPrompt?.(prompt)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Title and Version */}
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-light-primary dark:text-dark-primary truncate">
                          {prompt.name}
                        </h3>
                        <Badge variant="outline" size="sm">
                          v{prompt.version}
                        </Badge>
                        {!prompt.is_active && (
                          <Badge variant="warning" size="sm">
                            Inactive
                          </Badge>
                        )}
                      </div>

                      {/* Description */}
                      {prompt.description && (
                        <p className="text-sm text-light-secondary dark:text-dark-secondary mb-3 line-clamp-2">
                          {prompt.description}
                        </p>
                      )}

                      {/* Content Preview */}
                      {!compact && (
                        <div className="bg-light-muted dark:bg-dark-muted rounded p-3 mb-3">
                          <pre className="text-xs text-light-primary dark:text-dark-primary whitespace-pre-wrap line-clamp-3">
                            {prompt.content}
                          </pre>
                        </div>
                      )}

                      {/* Tags */}
                      {prompt.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {prompt.tags.map(tag => (
                            <Badge key={tag} variant="outline" size="sm">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center space-x-4 text-xs text-light-secondary dark:text-dark-secondary">
                        {prompt.author && (
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{prompt.author}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(prompt.updated_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {showActions && (
                      <div className="flex items-center space-x-1 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopyPrompt(prompt)
                          }}
                          icon={<Copy className="w-3 h-3" />}
                        />
                        {onEditPrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onEditPrompt(prompt)
                            }}
                            icon={<Edit3 className="w-3 h-3" />}
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeletePrompt(prompt)
                          }}
                          icon={<Trash2 className="w-3 h-3" />}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-light-border dark:border-dark-border">
              <div className="text-sm text-light-secondary dark:text-dark-secondary">
                Page {searchParams.page} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={searchParams.page === 1}
                  onClick={() => handlePageChange((searchParams.page || 1) - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={searchParams.page === totalPages}
                  onClick={() => handlePageChange((searchParams.page || 1) + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        title="Delete Prompt"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-light-primary dark:text-dark-primary">
            Are you sure you want to delete the prompt "{deleteModal.prompt?.name}"?
          </p>
          <p className="text-sm text-light-secondary dark:text-dark-secondary">
            This action cannot be undone.
          </p>
        </div>
        
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setDeleteModal({ isOpen: false })}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

export default PromptLibrary 