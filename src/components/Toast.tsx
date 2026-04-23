import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FC,
  type ReactNode,
} from "react";

/* ─── Types ──────────────────────────────────────────────── */
type ToastType = "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

/* ─── Imperative toast store (works outside React) ───────── */
let nextId = 0;
let toasts: ToastItem[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function addToast(message: string, type: ToastType) {
  toasts = [...toasts, { id: ++nextId, message, type }];
  notify();
}

function removeToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

/**
 * Imperative toast API — callable from anywhere (React components,
 * Axios interceptors, QueryClient callbacks, etc.)
 */
export const toast = {
  success: (message: string) => addToast(message, "success"),
  error: (message: string) => addToast(message, "error"),
};

export const useToast = () => toast;

/* ─── Single Toast ───────────────────────────────────────── */
const TOAST_DURATION = 5000;

const Toast: FC<{ toast: ToastItem; onClose: (id: number) => void }> = ({
  toast: t,
  onClose,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(t.id), 300);
    }, TOAST_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [t.id, onClose]);

  const handleClose = () => {
    clearTimeout(timerRef.current);
    setIsExiting(true);
    setTimeout(() => onClose(t.id), 300);
  };

  const isError = t.type === "error";

  return (
    <div
      role="alert"
      className="hosted-auth-toast"
      style={{
        backgroundColor: isError
          ? "var(--auth-error-color, #d40000)"
          : "var(--auth-primary-bg, #7ec040)",
        animation: isExiting
          ? "hosted-auth-toast-slide-out 0.3s ease forwards"
          : "hosted-auth-toast-slide-in 0.3s ease forwards",
      }}
    >
      <span className="hosted-auth-toast__icon">{isError ? "✕" : "✓"}</span>

      <p className="hosted-auth-toast__message">{t.message}</p>

      <button
        type="button"
        onClick={handleClose}
        className="hosted-auth-toast__close"
        aria-label="Dismiss"
      >
        ×
      </button>

      <span
        className="hosted-auth-toast__progress"
        style={{
          animation: `hosted-auth-toast-progress ${TOAST_DURATION}ms linear forwards`,
          backgroundColor: "rgba(255,255,255,0.35)",
        }}
      />
    </div>
  );
};

/* ─── Provider (renders toast container) ─────────────────── */
export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const currentToasts = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => toasts,
  );

  const handleClose = useCallback((id: number) => removeToast(id), []);

  return (
    <>
      {children}

      {currentToasts.length > 0 && (
        <div
          className="hosted-auth-toast-container"
          style={{ position: "fixed", top: 24, left: 0, right: 0, zIndex: 9999 }}
        >
          {currentToasts.map((t) => (
            <div key={t.id} className="hosted-auth-toast-item-wrap">
              <Toast toast={t} onClose={handleClose} />
            </div>
          ))}
        </div>
      )}
    </>
  );
};
