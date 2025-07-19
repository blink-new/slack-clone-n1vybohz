import React from 'react'
import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ThemeProvider } from './components/ui/theme-provider'
import { AppLoadingFallback } from './components/AppLoadingFallback'
import './index.css'

// Lazy load App component to avoid initialization race conditions
const App = React.lazy(() => import('./App'))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="thread-ui-theme">
      <ErrorBoundary>
        <React.Suspense fallback={<AppLoadingFallback />}>
          <App />
        </React.Suspense>
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>,
) 