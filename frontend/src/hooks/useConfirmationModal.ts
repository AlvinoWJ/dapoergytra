import { useState, useCallback } from "react";

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  detail?: string;
  type: "danger" | "warning";
  confirmText: string;
  onConfirm: () => void;
}

const DEFAULT_STATE: ConfirmModalState = {
  isOpen: false,
  title: "",
  message: "",
  detail: undefined,
  type: "danger",
  confirmText: "Ya, Lanjutkan",
  onConfirm: () => {},
};

export function useConfirmModal() {
  const [modal, setModal] = useState<ConfirmModalState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(false);

  const confirm = useCallback((options: Omit<ConfirmModalState, "isOpen">) => {
    setModal({ ...options, isOpen: true });
  }, []);

  const close = useCallback(() => {
    setModal(DEFAULT_STATE);
    setLoading(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    try {
      await modal.onConfirm();
    } finally {
      setLoading(false);
      close();
    }
  }, [modal, close]);

  return { modal, loading, confirm, close, handleConfirm };
}
