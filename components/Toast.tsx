'use client';

import { useCanvasStore, type ToastMessage } from '@/lib/store';

const toastStyles = {
  success: {
    bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
    icon: '✓',
    border: 'border-green-400',
  },
  error: {
    bg: 'bg-gradient-to-r from-red-500 to-rose-500',
    icon: '✕',
    border: 'border-red-400',
  },
  warning: {
    bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    icon: '⚠',
    border: 'border-yellow-400',
  },
  info: {
    bg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    icon: 'ℹ',
    border: 'border-blue-400',
  },
};

export function Toast() {
  const toasts = useCanvasStore((state) => state.toasts);
  const removeToast = useCanvasStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => {
        const style = toastStyles[toast.type];
        return (
          <div
            key={toast.id}
            className={`${style.bg} text-white px-5 py-3 rounded-xl shadow-2xl flex items-start gap-3 animate-slide-up border-2 ${style.border}`}
          >
            <span className="text-xl font-bold flex-shrink-0 mt-0.5">
              {style.icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{toast.title}</p>
              <p className="text-xs opacity-90 mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/80 hover:text-white flex-shrink-0 text-lg font-bold leading-none"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

