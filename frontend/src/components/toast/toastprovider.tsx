"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { ToastVariant, ToastItem } from "./toast";
import Toast from "./toast";

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant = "info", duration = 4000) => {
      const id = `toast-${++counter.current}`;

      setToasts((prev) => [...prev, { id, message, variant, duration }]);

      timers.current[id] = setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      {mounted &&
        createPortal(
          <div
            aria-live="polite"
            aria-label="Notifikasi"
            className="pointer-events-none fixed top-6 right-6 z-[9999] flex flex-col gap-3"
          >
            {toasts.map((toast) => (
              <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast harus digunakan di dalam <ToastProvider>");
  }
  return ctx;
}
