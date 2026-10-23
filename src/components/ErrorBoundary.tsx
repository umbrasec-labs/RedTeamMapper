import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  /** Changing this key resets the boundary (e.g. on route change). */
  resetKey?: string;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Static site: no telemetry endpoint. The fallback UI is the report.
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="mx-auto my-16 max-w-lg rounded-xl border border-ember/40 bg-ember/5 p-6">
        <div className="flex items-center gap-2 font-display text-lg font-bold text-fog-bright">
          <AlertTriangle aria-hidden className="h-5 w-5 text-ember" />
          This view failed to render
        </div>
        <p className="mt-2 text-sm">
          The rest of the mapper still works. Try another view from the sidebar, or reload the page.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-ink-950 p-3 font-mono text-2xs text-fog-dim">
          {this.state.error.message}
        </pre>
        <button type="button" className="btn mt-4" onClick={() => this.setState({ error: null })}>
          Try again
        </button>
      </div>
    );
  }
}
