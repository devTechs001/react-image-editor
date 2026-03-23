// frontend/src/components/ui/ErrorBoundary.jsx
import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, errorId: Date.now() };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Store error details
    this.setState({
      error,
      errorInfo,
      errorId: Date.now()
    });

    // Log to external service if needed
    this.logError(error, errorInfo);
  }

  logError = (error, errorInfo) => {
    try {
      // Log to console with detailed information
      console.group('🚨 React Error Boundary - Error Details');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Error Boundary State:', this.state);
      console.groupEnd();

      // Check for common issues
      if (error.message && error.message.includes('useState')) {
        console.warn('⚠️ Detected useState error - Possible React version mismatch or browser extension interference');
      }
      
      if (error.message && error.message.includes('null')) {
        console.warn('⚠️ Detected null reference error - Check component imports and React availability');
      }

      // Store error in localStorage for debugging
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        errorInfo: {
          componentStack: errorInfo.componentStack,
          errorBoundary: errorInfo.errorBoundary,
          errorBoundaryStack: errorInfo.errorBoundaryStack
        },
        userAgent: navigator.userAgent,
        url: window.location.href,
        reactVersion: React.version
      };

      const existingErrors = JSON.parse(localStorage.getItem('react_errors') || '[]');
      existingErrors.push(errorLog);
      
      // Keep only last 10 errors
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10);
      }
      
      localStorage.setItem('react_errors', JSON.stringify(existingErrors));
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  };

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleClearErrors = () => {
    localStorage.removeItem('react_errors');
    this.handleRetry();
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return (
        <div className="min-h-screen bg-red-50 border-2 border-red-200 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
            {/* Error Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-red-900">Something went wrong</h1>
                <p className="text-red-600">React encountered an error and couldn't render this component</p>
              </div>
            </div>

            {/* Error Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={this.handleRetry}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              
              <button
                onClick={this.handleReload}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <span>Reload Page</span>
              </button>
              
              <button
                onClick={this.handleClearErrors}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Bug className="w-4 h-4" />
                <span>Clear Errors</span>
              </button>
            </div>

            {/* Error Details */}
            {isDevelopment && this.state.error && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Details (Development Mode)</h2>
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium text-gray-700">Error Message:</h3>
                      <pre className="mt-1 p-3 bg-red-50 text-red-800 rounded text-sm overflow-auto">
                        {this.state.error.message}
                      </pre>
                    </div>
                    
                    {this.state.error.stack && (
                      <div>
                        <h3 className="font-medium text-gray-700">Stack Trace:</h3>
                        <pre className="mt-1 p-3 bg-gray-100 text-gray-800 rounded text-xs overflow-auto max-h-40">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    
                    {this.state.errorInfo && this.state.errorInfo.componentStack && (
                      <div>
                        <h3 className="font-medium text-gray-700">Component Stack:</h3>
                        <pre className="mt-1 p-3 bg-blue-50 text-blue-800 rounded text-xs overflow-auto max-h-40">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* Debugging Information */}
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-800 mb-2">Debugging Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Error ID:</strong> {this.state.errorId}</div>
                    <div><strong>User Agent:</strong> {navigator.userAgent}</div>
                    <div><strong>URL:</strong> {window.location.href}</div>
                    <div><strong>React Version:</strong> {React.version}</div>
                    <div><strong>Environment:</strong> {process.env.NODE_ENV}</div>
                  </div>
                </div>

                {/* Common Solutions */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">Common Solutions</h3>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li>• Check browser console for additional error messages</li>
                    <li>• Try disabling browser extensions temporarily</li>
                    <li>• Clear browser cache and reload</li>
                    <li>• Check if React versions are consistent</li>
                    <li>• Verify all imports are correct</li>
                    <li>• Try using a different browser</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Production Error */}
            {!isDevelopment && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-2">Production Error</h3>
                <p className="text-gray-600 mb-3">
                  An unexpected error occurred. The error has been logged and our team will investigate.
                </p>
                <div className="space-y-2 text-sm">
                  <div><strong>Error ID:</strong> {this.state.errorId}</div>
                  <div><strong>Time:</strong> {new Date().toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for using error boundary
export function useErrorBoundary() {
  const getErrors = () => {
    try {
      return JSON.parse(localStorage.getItem('react_errors') || '[]');
    } catch {
      return [];
    }
  };

  const clearErrors = () => {
    localStorage.removeItem('react_errors');
  };

  const hasRecentErrors = () => {
    const errors = getErrors();
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return errors.some(error => new Date(error.timestamp).getTime() > fiveMinutesAgo);
  };

  return {
    getErrors,
    clearErrors,
    hasRecentErrors
  };
}

export default ErrorBoundary;
