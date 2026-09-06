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
      <body className="h-full bg-[#08090d] text-charcoal antialiased selection:bg-saffron-200 selection:text-saffron-900">
        <AppProvider>
          <AppLayout>{children}</AppLayout>
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              className: "border border-saffron-200/90 bg-white/95 text-charcoal shadow-float rounded-2xl backdrop-blur-2xl p-4 font-sans text-xs font-semibold",
              style: {
                borderRadius: "20px",
                border: "1px solid rgba(226, 180, 140, 0.5)",
                boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.12), 0 0 15px rgba(217, 107, 39, 0.12)",
              },
            }}
          />
        </AppProvider>
      </body>
    </html>
  );
}
