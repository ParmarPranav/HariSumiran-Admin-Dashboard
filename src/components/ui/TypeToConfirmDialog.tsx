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
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />
          <div className="text-xs text-rose-200 leading-relaxed">
            <p className="font-bold text-rose-100">Explicit Confirmation Required</p>
            <p className="mt-1 text-rose-300/80">{consequenceText}</p>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-400">
            Type <strong className="text-rose-400 font-mono font-bold underline">{confirmWord}</strong> to proceed:
          </label>
          <input
            type="text"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder={`Type "${confirmWord}" here`}
            className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-[#161B28] px-3.5 text-sm font-mono font-semibold tracking-wider text-white placeholder:text-gray-500 focus:border-rose-500/60 focus:outline-none"
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
