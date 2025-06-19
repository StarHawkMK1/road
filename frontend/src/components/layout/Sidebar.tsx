import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  ChevronLeft, 
  ChevronRight,
  MessageSquare,
  FileText,
  Settings,
  Activity,
  TestTube,
  Search,
  Database,
  BarChart3,
  GitBranch,
  Zap,
  Workflow
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MenuItem {
  id: string
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  isAvailable: boolean
  comingSoon?: boolean
}

const menuItems: MenuItem[] = [
  {
    id: 'playground',
    label: 'LLM Playground',
    path: '/playground',
    icon: MessageSquare,
    isAvailable: true
  },
  {
    id: 'prompts',
    label: 'Prompt Management',
    path: '/prompts',
    icon: FileText,
    isAvailable: true
  },
  {
    id: 'rag-builder',
    label: 'RAG Builder',
    path: '/rag-builder',
    icon: Workflow,
    isAvailable: true
  },
  {
    id: 'opensearch',
    label: 'OpenSearch Manager',
    path: '/opensearch',
    icon: Search,
    isAvailable: false,
    comingSoon: true
  },
  {
    id: 'rag-tracker',
    label: 'RAG Tracker',
    path: '/rag-tracker',
    icon: Activity,
    isAvailable: false,
    comingSoon: true
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    path: '/monitoring',
    icon: BarChart3,
    isAvailable: false,
    comingSoon: true
  },
  {
    id: 'evaluation',
    label: 'Evaluation',
    path: '/evaluation',
    icon: TestTube,
    isAvailable: false,
    comingSoon: true
  },
  {
    id: 'ab-testing',
    label: 'A/B Testing',
    path: '/ab-testing',
    icon: GitBranch,
    isAvailable: false,
    comingSoon: true
  }
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className={cn(
      'sidebar flex flex-col transition-all duration-300 ease-in-out',
      isCollapsed ? 'sidebar-width-collapsed' : 'sidebar-width'
    )}>
      {/* Logo and toggle */}
      <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-light-accent to-light-highlight dark:from-dark-accent dark:to-dark-highlight rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gradient">ROAD</span>
          </div>
        )}
        
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-light-secondary dark:text-dark-secondary" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-light-secondary dark:text-dark-secondary" />
          )}
        </button>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          const isDisabled = !item.isAvailable

          if (isDisabled) {
            return (
              <div
                key={item.id}
                className={cn(
                  'menu-item menu-item-disabled relative group',
                  isCollapsed ? 'justify-center' : ''
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="ml-3 truncate">{item.label}</span>
                    {item.comingSoon && (
                      <span className="ml-auto px-2 py-1 text-xs bg-light-highlight/20 dark:bg-dark-highlight/20 text-light-highlight dark:text-dark-highlight rounded">
                        Soon
                      </span>
                    )}
                  </>
                )}
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="tooltip left-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.label}
                    {item.comingSoon && ' (Coming Soon)'}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                'menu-item',
                isActive ? 'menu-item-active' : 'menu-item-inactive',
                isCollapsed ? 'justify-center' : '',
                'group relative'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 truncate">{item.label}</span>
              )}
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="tooltip left-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.label}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Version info */}
      {!isCollapsed && (
        <div className="p-4 border-t border-light-border dark:border-dark-border">
          <div className="text-xs text-light-secondary dark:text-dark-secondary">
            <div>ROAD Platform</div>
            <div>Version 1.0.0</div>
            <div className="mt-1">Phase 1 - MVP</div>
          </div>
        </div>
      )}
    </div>
  )
} 