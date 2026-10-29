import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CelebrAI ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          role="alert" 
          aria-live="assertive"
          className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6 text-center"
        >
          <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-[#E9E2D8] shadow-lg">
            <div className="w-14 h-14 mx-auto mb-4 bg-[#FEE2E2] text-[#E11D48] rounded-full flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-serif font-bold text-[#2E1065] mb-2">
              Something went unexpected
            </h1>
            <p className="text-sm text-[#6B7280] mb-6">
              CelebrAI encountered a temporary rendering issue. Your event data in local storage remains safely preserved.
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2E1065] hover:bg-[#4C1D95] text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
              aria-label="Reload application"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
