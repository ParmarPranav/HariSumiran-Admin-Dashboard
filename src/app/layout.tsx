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
          <Toaster position="top-right" richColors closeButton />
        </AppProvider>
      </body>
    </html>
  );
}
