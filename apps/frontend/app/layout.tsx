import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { GlobalSearchProvider } from "@/components/global-search";
import { ScrollLockFix } from "@/components/scroll-lock-fix";
import "./globals.css";

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tracelet",
  description: "Tracelet frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.variable} suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ScrollLockFix />
          <GlobalSearchProvider>{children}</GlobalSearchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
