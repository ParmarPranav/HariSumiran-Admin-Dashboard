"use client";

import React, { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { QrCode, Camera, CheckCircle2, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedCode: string) => void;
  title?: string;
  subtitle?: string;
  sampleCodes?: { label: string; code: string }[];
}

export function QRScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  title = "Scan QR Identity / Pass",
  subtitle = "Align QR pass within the viewfinder box for instant check-in",
  sampleCodes = [
    { label: "Rameshbhai Patel (FAM-001)", code: "MEM-NAD-001" },
    { label: "Devansh Patel (Sound)", code: "MEM-NAD-003" },
    { label: "Mukeshbhai Shah", code: "MEM-NAD-004" },
    { label: "Hareshbhai Trivedi", code: "MEM-NAD-005" },
    { label: "Kiritbhai Desai", code: "MEM-NAD-006" },
  ],
}: QRScannerModalProps) {
  const [manualCode, setManualCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const handleSimulateScan = (code: string) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      onScanSuccess(code);
      toast.success("QR Code Verified", {
        description: `Successfully scanned code: ${code}`,
      });
      onClose();
    }, 600);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} subtitle={subtitle} maxWidth="md">
      <div className="space-y-5">
        {/* Scanner Viewfinder Box */}
        <div className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-primary-container/60 bg-surface-container-low p-6 text-center">
          {/* Laser scanning line animation */}
          <div className="pointer-events-none absolute inset-x-8 top-1/4 h-0.5 animate-bounce bg-gradient-to-r from-transparent via-primary-container to-transparent shadow-[0_0_8px_rgba(184,77,23,0.8)]" />

          {/* Corner brackets */}
          <div className="absolute left-6 top-6 h-6 w-6 border-l-2 border-t-2 border-primary-container" />
          <div className="absolute right-6 top-6 h-6 w-6 border-r-2 border-t-2 border-primary-container" />
          <div className="absolute bottom-6 left-6 h-6 w-6 border-b-2 border-l-2 border-primary-container" />
          <div className="absolute bottom-6 right-6 h-6 w-6 border-b-2 border-r-2 border-primary-container" />

          <div className="z-10 flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-soft">
              {isScanning ? (
                <CheckCircle2 className="h-7 w-7 text-emerald-600 animate-pulse" />
              ) : (
                <QrCode className="h-7 w-7 text-primary-container" />
              )}
            </div>
            <p className="text-sm font-semibold text-charcoal">
              {isScanning ? "Processing Scan..." : "Camera Viewfinder Active"}
            </p>
            <p className="text-xs text-charcoal-subtle">
              Live native scanner with automatic haptic feedback
            </p>
          </div>
        </div>

        {/* Quick Demo Test Bar */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs font-semibold text-charcoal-subtle">
            <Sparkles className="h-3.5 w-3.5 text-primary-container" />
            <span>Simulate Scanning Sample Member QR Codes:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sampleCodes.map((item) => (
              <button
                key={item.code}
                onClick={() => handleSimulateScan(item.code)}
                className="rounded-lg border border-hairline bg-surface-container-low px-2.5 py-1 text-xs font-medium text-charcoal hover:border-saffron-300 hover:bg-saffron-50 hover:text-saffron-700"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Code Input Fallback */}
        <div className="border-t border-hairline/70 pt-4">
          <label className="text-xs font-medium text-charcoal-subtle">Or Enter Member Code / Phone Manually:</label>
          <div className="mt-1.5 flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g. MEM-NAD-001 or 98250..."
              className="h-10 flex-1 rounded-xl border border-hairline bg-surface-container-lowest px-3.5 text-sm text-charcoal placeholder:text-charcoal-subtle/50 focus:border-saffron-400 focus:outline-none"
            />
            <Button
              size="md"
              disabled={!manualCode.trim()}
              onClick={() => handleSimulateScan(manualCode.trim())}
              leftIcon={<Search className="h-4 w-4" />}
            >
              Verify
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
