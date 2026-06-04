"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Trash2, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ModalType = "danger" | "warning";

interface ConfirmationModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  detail?: string;
  confirmText?: string;
  cancelText?: string;
  type?: ModalType;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const CONFIG: Record<
  ModalType,
  {
    icon: React.ReactNode;
    iconBg: string;
    confirmClass: string;
  }
> = {
  danger: {
    icon: <Trash2 className="h-5 w-5 text-red-600" />,
    iconBg: "bg-red-100",
    confirmClass: "bg-red-600 hover:bg-red-700",
  },
  warning: {
    icon: <XCircle className="h-5 w-5 text-yellow-600" />,
    iconBg: "bg-yellow-100",
    confirmClass: "bg-yellow-500 hover:bg-yellow-600",
  },
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title = "Konfirmasi",
  message = "Apakah Anda yakin ingin melanjutkan?",
  detail,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  type = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onCancel]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const { icon, iconBg, confirmClass } = CONFIG[type];

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Top accent bar */}
        <div
          className={`h-1 w-full ${type === "danger" ? "bg-red-500" : "bg-yellow-400"}`}
        />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-5">
            <div className={`flex-shrink-0 rounded-xl p-2.5 ${iconBg}`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                {message}
              </p>
              {detail && (
                <p className="mt-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 truncate">
                  {detail}
                </p>
              )}
            </div>
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-shrink-0 rounded-lg p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={loading}
              className="rounded-xl px-4"
            >
              {cancelText}
            </Button>
            <Button
              size="sm"
              onClick={onConfirm}
              loading={loading}
              className={`rounded-xl px-4 text-white ${confirmClass}`}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
