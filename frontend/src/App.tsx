import { Routes, Route } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import Layout from '@/components/layout/Layout'
import LLMPlayground from '@/pages/LLMPlayground'
import PromptManagement from '@/pages/PromptManagement'
import RAGBuilder from '@/pages/RAGBuilder'
import OpenSearchManager from '@/pages/OpenSearchManager'
import RAGTracker from '@/pages/RAGTracker'
import Monitoring from '@/pages/Monitoring'
import Evaluation from '@/pages/Evaluation'
import ABTesting from '@/pages/ABTesting'

function App() {
  const { theme } = useTheme()

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-dark-bg text-dark-primary' 
        : 'bg-light-bg text-light-primary'
    }`}>
      <Layout>
        <Routes>
          <Route path="/" element={<LLMPlayground />} />
          <Route path="/playground" element={<LLMPlayground />} />
          <Route path="/prompts" element={<PromptManagement />} />
          <Route path="/rag-builder" element={<RAGBuilder />} />
          <Route path="/opensearch" element={<OpenSearchManager />} />
          <Route path="/rag-tracker" element={<RAGTracker />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/evaluation" element={<Evaluation />} />
          <Route path="/ab-testing" element={<ABTesting />} />
          {/* 404 fallback */}
          <Route path="*" element={<LLMPlayground />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default App 