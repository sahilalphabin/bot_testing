import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/context/DataContext";
import { ThemeProvider } from "next-themes";
import { Navigation } from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EvalBot AI - Advanced Chatbot Evaluation Platform",
  description: "Professional chatbot response evaluation using cutting-edge ML/NLP algorithms and Gemini AI analysis. Compare, analyze, and optimize your AI assistants with confidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <DataProvider>
            <div className="min-h-screen flex bg-[--color-background] text-[--color-foreground]">
              <Navigation />
              <main className="flex-1 min-w-0 bg-[--color-background]">{children}</main>
            </div>
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
