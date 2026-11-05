"use client";

import { ThemeProvider } from "next-themes";
import { AppFeedback } from "@/components/layout/AppFeedback";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <AppFeedback />
    </ThemeProvider>
  );
}
