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
      <body className="h-full bg-[#FAF8F5] text-stone-900 antialiased selection:bg-amber-500/30 selection:text-amber-950">
        <AppProvider>
          <AppLayout>{children}</AppLayout>
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              className: "border border-amber-300 bg-white text-stone-900 shadow-xl rounded-2xl p-4 font-sans text-xs font-semibold",
              style: {
                borderRadius: "20px",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                boxShadow: "0 12px 32px -4px rgba(0, 0, 0, 0.08), 0 0 16px rgba(245, 158, 11, 0.12)",
                background: "#FFFFFF",
                color: "#1C1917",
              },
            }}
          />
        </AppProvider>
      </body>
    </html>
  );
}
