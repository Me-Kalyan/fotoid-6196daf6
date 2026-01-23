import React, { Component, ErrorInfo, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoCard } from "@/components/ui/neo-card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg"
          >
            <NeoCard className="p-8 text-center">
              {/* Error Icon */}
              <div className="w-20 h-20 mx-auto mb-6 bg-destructive/10 border-3 border-destructive flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>

              {/* Error Message */}
              <h1 className="font-heading text-3xl font-bold mb-3">
                Something went wrong
              </h1>
              <p className="text-muted-foreground mb-6">
                We're sorry, but something unexpected happened. Don't worry – your data is safe.
              </p>

              {/* Error Details (collapsed by default in production) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 p-4 bg-muted text-left border-2 border-primary overflow-auto max-h-40">
                  <div className="flex items-center gap-2 mb-2">
                    <Bug className="w-4 h-4" />
                    <span className="font-bold text-sm">Debug Info</span>
                  </div>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
                    {this.state.error.message}
                    {this.state.errorInfo?.componentStack && (
                      <>
                        {"\n\n"}Stack: {this.state.errorInfo.componentStack}
                      </>
                    )}
                  </pre>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <NeoButton onClick={this.handleRetry} variant="default">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </NeoButton>
                <NeoButton onClick={this.handleGoHome} variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </NeoButton>
              </div>

              {/* Help Text */}
              <p className="mt-6 text-sm text-muted-foreground">
                If this keeps happening,{" "}
                <a 
                  href="/contact" 
                  className="text-brand hover:underline font-medium"
                >
                  contact support
                </a>
              </p>
            </NeoCard>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary wrapper for functional components
export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
};
