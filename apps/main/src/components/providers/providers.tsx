"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./theme-provider";

const defaultThemeProps = {
  attribute: "class" as const,
  defaultTheme: "system",
  enableSystem: true,
  disableTransitionOnChange: true,
};

export function Providers({ children }: { children: React.ReactNode }) {
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
      <ThemeProvider {...defaultThemeProps}>{children}</ThemeProvider>
    </QueryClientProvider>
  );
}
