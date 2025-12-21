
import React, { ErrorInfo, ReactNode } from 'react';
import * as Sentry from "@sentry/react";

interface Props {
  /**
   * Content to be rendered within the error boundary
   */
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary component to catch and handle UI crashes gracefully.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  // Explicitly declare state and props to resolve TypeScript errors where these inherited members are not recognized.
  public state: State;
  public props: Props;

  // Fix: Explicitly define the constructor and call super(props) to ensure that the compiler correctly recognizes inherited properties like 'this.props' and 'this.state'.
  constructor(props: Props) {
    super(props);
    // Initialize default state.
    this.state = {
      hasError: false
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('Uncaught error:', error, errorInfo);
    
    // 生产环境上报错误到Sentry
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error);
    }
  }

  public render(): ReactNode {
    // Access state and props from the class instance inherited from React.Component.
    const { hasError, error } = this.state;
    // Fix: Access children from 'this.props' which is now correctly recognized due to the constructor and super call.
    const { children } = this.props;
    
    if (hasError) {
      // Fallback UI when an error occurs
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-2xl font-black text-slate-800 mb-2">出错了，智慧中枢正在重启</h1>
          <p className="text-slate-500 mb-8 max-w-md">
            应用程序遇到了未预期的异常。别担心，您的资产数据是安全的。
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition-all"
          >
            刷新页面恢复
          </button>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-8 p-4 bg-slate-200 rounded-xl text-[10px] text-slate-500 max-w-full overflow-auto text-left">
              {error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    // Return children or null if no children are passed to the boundary.
    return children || null;
  }
}