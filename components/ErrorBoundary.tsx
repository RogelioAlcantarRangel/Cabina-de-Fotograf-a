import React, { ReactNode, ErrorInfo, Component } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * 
 * Captura errores durante la renderización de componentes hijos
 * Muestra UI amigable y permite recuperación
 */
class ErrorBoundary extends Component<Props, State> {
  props!: Props;
  state!: State;
  
  declare setState: (state: Partial<State> | ((prevState: State, props: Props) => Partial<State>), callback?: () => void) => void;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    if (process.env.NODE_ENV === 'development') {
      console.error('Error capturado por ErrorBoundary:', error);
      console.error('Error Info:', errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          <div className="max-w-md w-full mx-4">
            <div className="bg-gray-800/80 border border-red-500/30 rounded-lg p-8 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                <h1 className="text-xl font-bold text-white">¡Algo salió mal!</h1>
              </div>

              <p className="text-gray-300 mb-4 leading-relaxed">
                Parece que la aplicación encontró un error inesperado. 
                Por favor, intenta recargar la página.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 bg-black/50 rounded p-4 border border-gray-700">
                  <p className="text-xs font-mono text-gray-400 mb-2 font-semibold">
                    Error Details:
                  </p>
                  <p className="text-xs font-mono text-red-400 break-words mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo?.componentStack && (
                    <>
                      <p className="text-xs font-mono text-gray-400 mt-3 font-semibold">
                        Component Stack:
                      </p>
                      <pre className="text-xs font-mono text-gray-400 overflow-auto max-h-40 whitespace-pre-wrap break-words">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reintentar
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Recargar Página
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-6 text-center">
                Si el problema persiste, contacta con soporte
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
