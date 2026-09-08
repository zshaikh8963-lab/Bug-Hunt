import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-mono">
          <div className="max-w-lg w-full p-8 rounded-2xl border border-rose-500/40 bg-slate-900/90 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-2xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-slate-100">Interface Recovery</h2>
            <p className="text-xs text-slate-400">
              An unexpected display issue occurred. Click below to refresh your tournament session.
            </p>
            <pre className="p-3 rounded-lg bg-slate-950 text-[11px] text-rose-300 text-left overflow-x-auto max-h-32 border border-slate-800">
              {this.state.error?.toString() || 'Unknown runtime error'}
            </pre>
            <div className="pt-2 flex gap-3 justify-center">
              <button
                onClick={() => {
                  localStorage.removeItem('bughunt_admin_token');
                  window.location.hash = '#admin';
                  window.location.reload();
                }}
                className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition"
              >
                Reset Admin & Reload
              </button>
              <button
                onClick={() => {
                  window.location.hash = '';
                  window.location.reload();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
