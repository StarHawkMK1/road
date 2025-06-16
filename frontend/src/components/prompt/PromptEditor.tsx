import { useState, useEffect } from 'react'
import { 
  Card, 
  CardHeader, 
  CardContent,
  CardFooter,
  Input, 
  Textarea,
  Button, 
  Badge,
  Select
} from '@/components/common'
import { Prompt, PromptCreate, PromptUpdate } from '@/types'
import { promptsApi } from '@/lib/api'
import { 
  Save, 
  X, 
  Plus,
  Eye,
  Code,
  FileText,
  Tag as TagIcon,
  User,
  Hash
} from 'lucide-react'

interface PromptEditorProps {
  prompt?: Prompt
  onSave?: (prompt: Prompt) => void
  onCancel?: () => void
  isCreating?: boolean
}

const PROMPT_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Prompt',
    description: 'Start with an empty prompt',
    content: ''
  },
  {
    id: 'chat-assistant',
    name: 'Chat Assistant',
    description: 'General purpose conversational AI',
    content: `You are a helpful, harmless, and honest AI assistant. You should:

- Provide accurate and helpful information
- Be concise but thorough in your responses
- Ask clarifying questions when needed
- Admit when you don't know something
- Be respectful and professional

User query: {user_input}`
  },
  {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    description: 'Review and improve code quality',
    content: `You are an expert code reviewer. Please review the following code and provide:

1. **Code Quality Assessment**: Rate the code quality (1-10)
2. **Issues Found**: List any bugs, security issues, or problems
3. **Improvements**: Suggest specific improvements
4. **Best Practices**: Highlight any violations of best practices
5. **Refactored Code**: Provide improved version if needed

Code to review:
\`\`\`
{code_input}
\`\`\``
  },
  {
    id: 'creative-writer',
    name: 'Creative Writer',
    description: 'Generate creative content and stories',
    content: `You are a creative writing assistant. Help users with:

- Story creation and development
- Character development
- Plot structure and pacing
- Writing style improvement
- Creative inspiration

Writing request: {writing_prompt}

Please provide creative, engaging, and well-structured content.`
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Analyze data and provide insights',
    content: `You are a data analyst. Analyze the provided data and deliver:

1. **Summary**: Key findings and overview
2. **Trends**: Important patterns and trends
3. **Insights**: Actionable insights and recommendations
4. **Visualizations**: Suggest appropriate charts/graphs
5. **Next Steps**: Recommended actions based on analysis

Data to analyze:
{data_input}`
  }
]

const COMMON_TAGS = [
  'general', 'coding', 'creative', 'analysis', 'research', 
  'education', 'business', 'technical', 'casual', 'formal'
]

const PromptEditor = ({ 
  prompt, 
  onSave, 
  onCancel,
  isCreating = false 
}: PromptEditorProps) => {
  const [formData, setFormData] = useState({
    name: '',
    version: '1.0',
    content: '',
    description: '',
    author: '',
    tags: [] as string[],
    is_active: true
  })
  const [newTag, setNewTag] = useState('')
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('blank')

  // Initialize form data
  useEffect(() => {
    if (prompt) {
      setFormData({
        name: prompt.name,
        version: prompt.version,
        content: prompt.content,
        description: prompt.description || '',
        author: prompt.author || '',
        tags: [...prompt.tags],
        is_active: prompt.is_active
      })
    } else {
      // Reset for new prompt
      setFormData({
        name: '',
        version: '1.0',
        content: '',
        description: '',
        author: '',
        tags: [],
        is_active: true
      })
    }
  }, [prompt])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = PROMPT_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      handleInputChange('content', template.content)
      if (!formData.name && template.name !== 'Blank Prompt') {
        handleInputChange('name', template.name)
      }
      if (!formData.description) {
        handleInputChange('description', template.description)
      }
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      // TODO: Add form validation feedback
      console.error('Name and content are required')
      return
    }

    setIsSaving(true)
    try {
      let savedPrompt: Prompt

      if (prompt) {
        // Update existing prompt
        const updateData: PromptUpdate = {
          name: formData.name,
          version: formData.version,
          content: formData.content,
          description: formData.description || undefined,
          author: formData.author || undefined,
          tags: formData.tags,
          is_active: formData.is_active
        }
        savedPrompt = await promptsApi.update(prompt.id, updateData)
      } else {
        // Create new prompt
        const createData: PromptCreate = {
          name: formData.name,
          version: formData.version,
          content: formData.content,
          description: formData.description || undefined,
          author: formData.author || undefined,
          tags: formData.tags
        }
        savedPrompt = await promptsApi.create(createData)
      }

      onSave?.(savedPrompt)
    } catch (error) {
      console.error('Failed to save prompt:', error)
      // TODO: Add error notification
    } finally {
      setIsSaving(false)
    }
  }

  const isFormValid = formData.name.trim().length > 0 && formData.content.trim().length > 0

  return (
    <Card>
      <CardHeader 
        title={isCreating ? 'Create New Prompt' : `Edit Prompt: ${prompt?.name}`}
        subtitle={isCreating ? 'Design a new prompt template' : 'Modify prompt settings and content'}
        action={
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              icon={isPreviewMode ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            >
              {isPreviewMode ? 'Edit' : 'Preview'}
            </Button>
            {onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                icon={<X className="w-4 h-4" />}
              >
                Cancel
              </Button>
            )}
          </div>
        }
      />

      <CardContent className="space-y-6">
        {/* Template Selection (only for new prompts) */}
        {isCreating && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-light-primary dark:text-dark-primary">
              Start with Template
            </label>
            <Select
              value={selectedTemplate}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              options={PROMPT_TEMPLATES.map(template => ({
                value: template.id,
                label: template.name
              }))}
            />
            {selectedTemplate !== 'blank' && (
              <p className="text-xs text-light-secondary dark:text-dark-secondary">
                {PROMPT_TEMPLATES.find(t => t.id === selectedTemplate)?.description}
              </p>
            )}
          </div>
        )}

        {!isPreviewMode ? (
          <>
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Prompt Name"
                placeholder="Enter prompt name..."
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                leftIcon={<FileText className="w-4 h-4" />}
                required
              />
              <Input
                label="Version"
                placeholder="1.0"
                value={formData.version}
                onChange={(e) => handleInputChange('version', e.target.value)}
                leftIcon={<Hash className="w-4 h-4" />}
              />
            </div>

            <Input
              label="Author"
              placeholder="Your name (optional)"
              value={formData.author}
              onChange={(e) => handleInputChange('author', e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
            />

            <Textarea
              label="Description"
              placeholder="Brief description of this prompt's purpose..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={2}
            />

            {/* Tags */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-light-primary dark:text-dark-primary">
                Tags
              </label>
              
              {/* Current Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge
                      key={tag}
                      variant="info"
                      removable
                      onRemove={() => handleRemoveTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add Tag Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  leftIcon={<TagIcon className="w-4 h-4" />}
                  fullWidth={false}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddTag}
                  disabled={!newTag.trim() || formData.tags.includes(newTag.trim())}
                  icon={<Plus className="w-4 h-4" />}
                  size="md"
                >
                  Add
                </Button>
              </div>

              {/* Common Tags */}
              <div className="space-y-2">
                <span className="text-xs text-light-secondary dark:text-dark-secondary">
                  Common tags:
                </span>
                <div className="flex flex-wrap gap-1">
                  {COMMON_TAGS.filter(tag => !formData.tags.includes(tag)).map(tag => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer text-xs"
                      onClick={() => handleInputChange('tags', [...formData.tags, tag])}
                    >
                      + {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <Textarea
              label="Prompt Content"
              placeholder="Enter your prompt content here..."
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={12}
              helperText="Use {variable_name} for dynamic placeholders"
              required
            />

            {/* Status */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="rounded border-light-border dark:border-dark-border"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-light-primary dark:text-dark-primary">
                Active prompt
              </label>
            </div>
          </>
        ) : (
          /* Preview Mode */
          <div className="space-y-4">
            <div className="bg-light-muted dark:bg-dark-muted rounded-lg p-4">
              <h3 className="font-semibold text-light-primary dark:text-dark-primary mb-2">
                {formData.name || 'Untitled Prompt'}
              </h3>
              {formData.description && (
                <p className="text-light-secondary dark:text-dark-secondary text-sm mb-3">
                  {formData.description}
                </p>
              )}
              <div className="flex items-center space-x-4 text-xs text-light-secondary dark:text-dark-secondary mb-4">
                <span>Version: {formData.version}</span>
                {formData.author && <span>Author: {formData.author}</span>}
                <span>Status: {formData.is_active ? 'Active' : 'Inactive'}</span>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="outline" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-light-panel dark:bg-dark-panel border border-light-border dark:border-dark-border rounded-lg p-4">
              <h4 className="font-medium text-light-primary dark:text-dark-primary mb-3">
                Prompt Content:
              </h4>
              <pre className="whitespace-pre-wrap text-sm text-light-primary dark:text-dark-primary">
                {formData.content || 'No content yet...'}
              </pre>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter align="right">
        <div className="flex space-x-2">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
            loading={isSaving}
            icon={<Save className="w-4 h-4" />}
          >
            {isCreating ? 'Create Prompt' : 'Save Changes'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default PromptEditor 