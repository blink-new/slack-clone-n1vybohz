import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  showError?: boolean
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.warn('Error caught by boundary:', error, errorInfo)
    
    // Store error info for display
    this.setState({ errorInfo })
    
    // Check if it's a common initialization error
    if (error.message.includes('Cannot access') || 
        error.message.includes('before initialization') ||
        error.message.includes('ReferenceError') ||
        error.message.includes('temporal dead zone') ||
        error.stack?.includes('before initialization') ||
        error.stack?.includes('Cannot access')) {
      console.warn('Detected initialization error, attempting recovery...')
      // Try to recover after a delay to allow proper initialization
      setTimeout(() => {
        console.log('Attempting error boundary recovery...')
        this.setState({ hasError: false, error: undefined, errorInfo: undefined })
      }, 2000) // Delay for better recovery
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // If fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback
      }

      // If showError is false, just return null (hide the error)
      if (this.props.showError === false) {
        return null
      }

      // Show a user-friendly error message
      return (
        <div className="flex items-center justify-center min-h-[200px] p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                <span>Something went wrong</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We encountered an error while loading this component. This might be a temporary issue.
              </p>
              
              {this.state.error && (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer hover:text-foreground">
                    Error details
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              
              <Button 
                onClick={this.handleRetry}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}