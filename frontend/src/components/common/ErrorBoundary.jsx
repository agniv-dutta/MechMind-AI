import React from 'react';
import { AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('UI ErrorBoundary:', error, info);
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="p-6 m-4 rounded-2xl border border-red-200 bg-red-50 text-red-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
        <div>
          <p className="font-bold text-sm">Something went wrong in this panel.</p>
          <p className="text-xs mt-1 opacity-80">{this.state.error?.message || 'Unknown error'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-3 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-300 hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
