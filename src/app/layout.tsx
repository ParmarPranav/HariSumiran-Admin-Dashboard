import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { CommandPalette } from "@/components/layout/CommandPalette";
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
      <body className="h-full bg-canvas text-charcoal antialiased selection:bg-saffron-200 selection:text-saffron-900">
        <AppProvider>
          <div className="flex h-full w-full overflow-hidden bg-canvas">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Application Column */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <Header />

              <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
                {children}
              </main>

              {/* Mobile Floating Glass Tab Bar */}
              <MobileNav />
            </div>

            {/* Global Command Palette (Cmd+K) */}
            <CommandPalette />

            {/* Sonner Toast Notifications */}
            <Toaster position="top-right" richColors closeButton />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
