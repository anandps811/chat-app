import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
// simple id generator to avoid extra dependency
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9);

type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  toast: (opts: { title: string; description?: string; variant?: ToastVariant }) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((opts: { title: string; description?: string; variant?: ToastVariant }) => {
    const id = genId();
    setToasts((t) => [...t, { id, ...opts }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-6 bottom-6 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-sm w-full rounded-lg p-4 shadow-lg border transition-all transform-gpu ` +
              (t.variant === 'success'
                ? 'bg-white text-black border-green-200'
                : t.variant === 'error'
                ? 'bg-white text-black border-red-200'
                : 'bg-white text-black border-slate-200')}
          >
            <div className="font-semibold">{t.title}</div>
            {t.description && <div className="text-sm text-slate-600 mt-1">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastProvider;
