"use client";

import { Toaster } from "sonner";
import { ConfirmProvider } from "./Confirm";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <ConfirmProvider>
      {children}
      <Toaster position="top-right" richColors closeButton toastOptions={{ style: { fontFamily: "var(--font-sans)" } }} />
    </ConfirmProvider>
  );
}
