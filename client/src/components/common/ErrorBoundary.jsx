import { Component } from 'react';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Frontend Crash caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0e1a] px-4 text-center">
          <div className="max-w-md w-full border border-[var(--color-border)] rounded-2xl p-8 glass space-y-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl mx-auto bg-[var(--color-error-muted)] text-[var(--color-error)]">
              <HiOutlineExclamationTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Something went wrong</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">
                The application encountered an unexpected error. Try refreshing the page.
              </p>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <pre className="font-mono text-left text-xs p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg overflow-auto max-h-40 leading-relaxed text-[var(--color-error)]">
                {this.state.error.toString()}
              </pre>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-bold rounded-xl transition-colors duration-200 cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
