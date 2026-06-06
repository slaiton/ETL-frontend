import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#e4e4e7",
              background: "#111827",
              minHeight: "100dvh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
            }}
          >
            <h2 style={{ fontSize: "1.5rem", color: "#FF6384" }}>
              Algo salió mal
            </h2>
            <p style={{ color: "#9ca3af", maxWidth: "400px" }}>
              {this.state.error?.message ?? "Error inesperado en la aplicación."}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                background: "#2563EB",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Reintentar
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
