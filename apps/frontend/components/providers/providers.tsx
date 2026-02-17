"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { GlobalSearchProvider } from "@/components/global-search";
import { ScrollLockFix } from "@/components/scroll-lock-fix";

import { ThemeProvider } from "./theme-provider";

type ProvidersProps = {
  children: React.ReactNode;
  theme?: {
    attribute?: "class" | "data-theme";
    defaultTheme?: string;
    enableSystem?: boolean;
    disableTransitionOnChange?: boolean;
  };
};

const defaultThemeProps = {
  attribute: "class" as const,
  defaultTheme: "system",
  enableSystem: true,
  disableTransitionOnChange: true,
};

export function Providers({ children, theme: themeProps }: ProvidersProps) {
  const theme = { ...defaultThemeProps, ...themeProps };
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider {...theme}>
        <ScrollLockFix />
        <GlobalSearchProvider>{children}</GlobalSearchProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
