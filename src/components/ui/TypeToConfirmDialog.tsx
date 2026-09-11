"use client";

import React, { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";

interface TypeToConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  consequenceText: string;
  confirmWord?: string;
  actionLabel?: string;
}

export function TypeToConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  consequenceText,
  confirmWord = "CONFIRM",
  actionLabel = "Proceed with Action",
}: TypeToConfirmDialogProps) {
  const [typedInput, setTypedInput] = useState("");
  const isMatch = typedInput.trim().toUpperCase() === confirmWord.toUpperCase();

  const handleConfirm = () => {
    if (isMatch) {
      onConfirm();
      setTypedInput("");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
          <div className="text-xs text-rose-900 leading-relaxed">
            <p className="font-bold text-rose-950">Explicit Confirmation Required</p>
            <p className="mt-1 text-rose-800">{consequenceText}</p>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-700">
            Type <strong className="text-rose-600 font-mono font-bold underline">{confirmWord}</strong> to proceed:
          </label>
          <input
            type="text"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder={`Type "${confirmWord}" here`}
            className="mt-1.5 h-10 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm font-mono font-semibold tracking-wider text-stone-900 placeholder:text-stone-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 shadow-xs"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="md"
            disabled={!isMatch}
            onClick={handleConfirm}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
