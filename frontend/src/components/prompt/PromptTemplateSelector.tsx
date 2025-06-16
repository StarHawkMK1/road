import { useState } from 'react'
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Badge,
  Button,
  Modal,
  ModalHeader,
  ModalFooter
} from '@/components/common'
import { Prompt } from '@/types'
import { 
  FileText, 
  Code, 
  PenTool, 
  BarChart, 
  MessageSquare,
  Eye,
  Plus
} from 'lucide-react'

interface PromptTemplate {
  id: string
  name: string
  description: string
  content: string
  category: string
  icon: React.ComponentType<{ className?: string }>
  variables: string[]
  tags: string[]
}

interface PromptTemplateSelectorProps {
  onSelectTemplate?: (template: PromptTemplate) => void
  onUseTemplate?: (template: PromptTemplate) => void
  selectedTemplateId?: string
  compact?: boolean
}

const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Templates', count: 0 },
  { id: 'general', name: 'General Purpose', count: 0 },
  { id: 'coding', name: 'Development', count: 0 },
  { id: 'creative', name: 'Creative Writing', count: 0 },
  { id: 'analysis', name: 'Data Analysis', count: 0 },
  { id: 'business', name: 'Business', count: 0 }
]

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'general-assistant',
    name: 'General Assistant',
    description: 'A helpful AI assistant for general questions and tasks',
    category: 'general',
    icon: MessageSquare,
    content: `You are a helpful, harmless, and honest AI assistant. 

Your primary goals:
- Provide accurate and helpful information
- Be concise but thorough in your responses
- Ask clarifying questions when needed
- Admit when you don't know something
- Be respectful and professional

User query: {user_input}

Please provide a helpful response to the user's question or request.`,
    variables: ['user_input'],
    tags: ['general', 'assistant', 'helpful']
  },
  {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    description: 'Expert code review and improvement suggestions',
    category: 'coding',
    icon: Code,
    content: `You are an expert code reviewer with deep knowledge of software engineering best practices.

Please review the following {language} code and provide:

1. **Overall Assessment**: Rate the code quality (1-10) and provide a brief summary
2. **Issues Found**: List any bugs, security vulnerabilities, or problems
3. **Improvements**: Suggest specific improvements for better performance, readability, or maintainability
4. **Best Practices**: Highlight any violations of coding standards or best practices
5. **Refactored Code**: If significant improvements are needed, provide a refactored version

Code to review:
\`\`\`{language}
{code_input}
\`\`\`

Additional context: {context}`,
    variables: ['language', 'code_input', 'context'],
    tags: ['coding', 'review', 'technical', 'analysis']
  },
  {
    id: 'creative-writer',
    name: 'Creative Writing Assistant',
    description: 'Help with creative writing, storytelling, and content creation',
    category: 'creative',
    icon: PenTool,
    content: `You are a creative writing assistant with expertise in storytelling, character development, and engaging content creation.

Writing Task: {writing_type}
Genre/Style: {genre}
Target Audience: {audience}
Length: {length}

Specific Request: {writing_prompt}

Additional Requirements:
{requirements}

Please create engaging, well-structured content that matches the specified style and requirements. Focus on:
- Compelling storytelling
- Rich character development (if applicable)
- Appropriate tone for the target audience
- Clear structure and pacing
- Creative and original ideas`,
    variables: ['writing_type', 'genre', 'audience', 'length', 'writing_prompt', 'requirements'],
    tags: ['creative', 'writing', 'storytelling', 'content']
  },
  {
    id: 'data-analyst',
    name: 'Data Analysis Expert',
    description: 'Comprehensive data analysis and insights generation',
    category: 'analysis',
    icon: BarChart,
    content: `You are a senior data analyst with expertise in statistical analysis, data visualization, and business intelligence.

Data Analysis Request:
Data Type: {data_type}
Analysis Goal: {analysis_goal}
Business Context: {business_context}

Data to analyze:
{data_input}

Please provide a comprehensive analysis including:

1. **Executive Summary**: Key findings and insights in 2-3 sentences
2. **Data Overview**: Brief description of the dataset and any initial observations
3. **Key Findings**: 3-5 most important discoveries from the data
4. **Trends and Patterns**: Identify significant trends, correlations, or anomalies
5. **Statistical Insights**: Relevant statistical measures and their interpretations
6. **Visualizations**: Recommend appropriate charts/graphs to represent the findings
7. **Business Implications**: What these findings mean for the business
8. **Recommendations**: Actionable next steps based on the analysis
9. **Limitations**: Any data quality issues or analysis limitations

Format your response clearly with headers and bullet points for easy reading.`,
    variables: ['data_type', 'analysis_goal', 'business_context', 'data_input'],
    tags: ['analysis', 'data', 'business', 'insights', 'statistics']
  },
  {
    id: 'meeting-summarizer',
    name: 'Meeting Summarizer',
    description: 'Extract key points and action items from meeting transcripts',
    category: 'business',
    icon: FileText,
    content: `You are an expert meeting facilitator and note-taker. Please analyze the following meeting transcript and provide a comprehensive summary.

Meeting Details:
- Meeting Type: {meeting_type}
- Date: {meeting_date}
- Participants: {participants}
- Duration: {duration}

Meeting Transcript:
{transcript}

Please provide a structured summary including:

## Meeting Summary

**Purpose**: {meeting_purpose}

### Key Discussion Points
- List the main topics discussed
- Include important details and context

### Decisions Made
- Document all decisions reached during the meeting
- Include who made each decision

### Action Items
| Task | Assigned To | Deadline | Priority |
|------|-------------|----------|----------|
| [Task description] | [Person] | [Date] | [High/Medium/Low] |

### Next Steps
- Outline planned follow-up actions
- Schedule any required future meetings

### Additional Notes
- Any other important information
- Unresolved issues or parking lot items

**Next Meeting**: [Date/Time if scheduled]`,
    variables: ['meeting_type', 'meeting_date', 'participants', 'duration', 'meeting_purpose', 'transcript'],
    tags: ['business', 'meetings', 'summary', 'productivity']
  },
  {
    id: 'email-composer',
    name: 'Professional Email Composer',
    description: 'Craft professional emails for various business scenarios',
    category: 'business',
    icon: MessageSquare,
    content: `You are a professional communication expert. Please compose a {email_type} email with the following details:

**Email Context:**
- Recipient: {recipient}
- Relationship: {relationship}
- Purpose: {purpose}
- Tone: {tone}
- Urgency: {urgency}

**Key Points to Include:**
{key_points}

**Specific Requirements:**
{requirements}

Please compose a well-structured, professional email that:
- Uses an appropriate subject line
- Opens with a suitable greeting
- Clearly communicates the purpose
- Includes all key points
- Ends with an appropriate closing
- Maintains the requested tone throughout

**Subject:** [Compelling subject line]

**Email Body:**
[Compose the complete email]

**Additional Notes:** [Any follow-up suggestions or alternative approaches]`,
    variables: ['email_type', 'recipient', 'relationship', 'purpose', 'tone', 'urgency', 'key_points', 'requirements'],
    tags: ['business', 'communication', 'email', 'professional']
  }
]

// Update category counts
TEMPLATE_CATEGORIES.forEach(category => {
  if (category.id === 'all') {
    category.count = PROMPT_TEMPLATES.length
  } else {
    category.count = PROMPT_TEMPLATES.filter(t => t.category === category.id).length
  }
})

const PromptTemplateSelector = ({
  onSelectTemplate,
  onUseTemplate,
  selectedTemplateId,
  compact = false
}: PromptTemplateSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; template?: PromptTemplate }>({
    isOpen: false
  })

  const filteredTemplates = selectedCategory === 'all' 
    ? PROMPT_TEMPLATES 
    : PROMPT_TEMPLATES.filter(t => t.category === selectedCategory)

  const handleTemplateClick = (template: PromptTemplate) => {
    onSelectTemplate?.(template)
  }

  const handleUseTemplate = (template: PromptTemplate) => {
    onUseTemplate?.(template)
  }

  const handlePreview = (template: PromptTemplate) => {
    setPreviewModal({ isOpen: true, template })
  }

  return (
    <>
      <Card>
        <CardHeader 
          title="Prompt Templates"
          subtitle="Choose from pre-built templates to get started quickly"
        />
        
        <CardContent className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_CATEGORIES.map(category => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? 'info' : 'outline'}
                className="cursor-pointer transition-colors"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name} ({category.count})
              </Badge>
            ))}
          </div>

          {/* Templates Grid */}
          <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            {filteredTemplates.map(template => {
              const IconComponent = template.icon
              const isSelected = selectedTemplateId === template.id
              
              return (
                <div
                  key={template.id}
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-all
                    ${isSelected 
                      ? 'border-light-accent dark:border-dark-accent bg-light-accent/10 dark:bg-dark-accent/10' 
                      : 'border-light-border dark:border-dark-border hover:border-light-accent dark:hover:border-dark-accent'
                    }
                  `}
                  onClick={() => handleTemplateClick(template)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 p-2 bg-light-muted dark:bg-dark-muted rounded-lg">
                      <IconComponent className="w-5 h-5 text-light-accent dark:text-dark-accent" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-light-primary dark:text-dark-primary mb-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-light-secondary dark:text-dark-secondary mb-3">
                        {template.description}
                      </p>
                      
                      {/* Variables */}
                      {template.variables.length > 0 && (
                        <div className="mb-3">
                          <span className="text-xs font-medium text-light-primary dark:text-dark-primary">
                            Variables:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.variables.map(variable => (
                              <code key={variable} className="text-xs bg-light-muted dark:bg-dark-muted px-1 py-0.5 rounded">
                                {`{${variable}}`}
                              </code>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.map(tag => (
                          <Badge key={tag} variant="outline" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreview(template)
                          }}
                          icon={<Eye className="w-3 h-3" />}
                        >
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUseTemplate(template)
                          }}
                          icon={<Plus className="w-3 h-3" />}
                        >
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-light-secondary dark:text-dark-secondary">
              No templates found in this category.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <Modal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false })}
        title={`Template Preview: ${previewModal.template?.name}`}
        size="lg"
      >
        {previewModal.template && (
          <div className="space-y-4">
            <div className="bg-light-muted dark:bg-dark-muted rounded-lg p-4">
              <h4 className="font-medium text-light-primary dark:text-dark-primary mb-2">
                Description
              </h4>
              <p className="text-light-secondary dark:text-dark-secondary">
                {previewModal.template.description}
              </p>
            </div>

            <div className="bg-light-panel dark:bg-dark-panel border border-light-border dark:border-dark-border rounded-lg p-4">
              <h4 className="font-medium text-light-primary dark:text-dark-primary mb-3">
                Template Content
              </h4>
              <pre className="whitespace-pre-wrap text-sm text-light-primary dark:text-dark-primary overflow-x-auto">
                {previewModal.template.content}
              </pre>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-light-primary dark:text-dark-primary mb-2">
                  Variables
                </h4>
                <div className="space-y-1">
                  {previewModal.template.variables.map(variable => (
                    <code key={variable} className="block text-xs bg-light-muted dark:bg-dark-muted px-2 py-1 rounded">
                      {`{${variable}}`}
                    </code>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-light-primary dark:text-dark-primary mb-2">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-1">
                  {previewModal.template.tags.map(tag => (
                    <Badge key={tag} variant="outline" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setPreviewModal({ isOpen: false })}
          >
            Close
          </Button>
          <Button
            onClick={() => {
              if (previewModal.template) {
                handleUseTemplate(previewModal.template)
                setPreviewModal({ isOpen: false })
              }
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Use This Template
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

export default PromptTemplateSelector 