import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "HariSumiran — Mandir Operations Platform",
  description: "Authenticated temple operations and seva management for HariPrabodham, Nadiad.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-[#08090d] text-charcoal antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <AppProvider>
          <AppLayout>{children}</AppLayout>
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              className: "border border-amber-400/30 bg-[#161B28] text-white shadow-2xl rounded-2xl backdrop-blur-2xl p-4 font-sans text-xs font-semibold",
              style: {
                borderRadius: "20px",
                border: "1px solid rgba(232, 176, 56, 0.3)",
                boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 20px rgba(232, 176, 56, 0.15)",
              },
            }}
          />
        </AppProvider>
      </body>
    </html>
  );
}
