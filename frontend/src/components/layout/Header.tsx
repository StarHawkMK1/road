import { Sun, Moon, Github, ExternalLink } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export default function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="h-16 bg-light-panel dark:bg-dark-panel border-b border-light-border dark:border-dark-border px-6 flex items-center justify-between">
      {/* Breadcrumb or page title will go here */}
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
          RAG Orchestration & Application Development
        </h1>
      </div>

      {/* Right side controls */}
      <div className="flex items-center space-x-4">
        {/* API Status indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-light-secondary dark:text-dark-secondary">
            API Connected
          </span>
        </div>

        {/* External links */}
        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors"
          title="API Documentation"
        >
          <ExternalLink className="w-5 h-5 text-light-secondary dark:text-dark-secondary" />
        </a>

        <a
          href="https://github.com/your-repo/road"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors"
          title="GitHub Repository"
        >
          <Github className="w-5 h-5 text-light-secondary dark:text-dark-secondary" />
        </a>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-light-secondary dark:text-dark-secondary" />
          ) : (
            <Moon className="w-5 h-5 text-light-secondary dark:text-dark-secondary" />
          )}
        </button>
      </div>
    </header>
  )
} 