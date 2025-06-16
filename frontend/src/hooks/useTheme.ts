import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark', // Default to dark theme (devin.ai style)
      setTheme: (theme: Theme) => {
        set({ theme })
        updateDocumentClass(theme)
      },
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
        updateDocumentClass(newTheme)
      },
    }),
    {
      name: 'road-theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          updateDocumentClass(state.theme)
        }
      },
    }
  )
)

// Helper function to update document class
function updateDocumentClass(theme: Theme) {
  const root = window.document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
}

// Main hook for components
export const useTheme = () => {
  const { theme, setTheme, toggleTheme } = useThemeStore()
  
  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  }
}

// Initialize theme on first load
if (typeof window !== 'undefined') {
  // Check for system preference
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const storedTheme = localStorage.getItem('road-theme-storage')
  
  if (!storedTheme) {
    // If no stored theme, use system preference
    const initialTheme = systemPrefersDark ? 'dark' : 'light'
    useThemeStore.getState().setTheme(initialTheme)
  } else {
    // Apply stored theme
    const parsed = JSON.parse(storedTheme)
    updateDocumentClass(parsed.state.theme)
  }
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only auto-switch if user hasn't set a preference
    const hasStoredTheme = localStorage.getItem('road-theme-storage')
    if (!hasStoredTheme) {
      useThemeStore.getState().setTheme(e.matches ? 'dark' : 'light')
    }
  })
} 