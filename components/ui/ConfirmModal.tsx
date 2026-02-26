'use client';

import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'تأكيد',
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  variant = 'danger',
  loading = false,
}: ConfirmModalProps) {
  const iconColor = variant === 'danger' ? 'text-red-500' : variant === 'warning' ? 'text-yellow-500' : 'text-blue-500';
  const confirmVariant = variant === 'danger' ? 'danger' : variant === 'warning' ? 'warning' : 'primary';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnBackdrop={!loading}
    >
      <div className="flex flex-col items-center text-center py-2 gap-4">
        <div className={`p-3 rounded-full bg-opacity-10 ${variant === 'danger' ? 'bg-red-100' : variant === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
          <AlertTriangle className={`h-8 w-8 ${iconColor}`} />
        </div>
        <p className="text-gray-700 text-sm leading-relaxed">{message}</p>
      </div>
      <div className="flex gap-3 mt-4 justify-center">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-5 py-2 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 ${
            variant === 'danger' ? 'bg-red-600 hover:bg-red-700' :
            variant === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' :
            'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'جاري...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
