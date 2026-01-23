import { QueryProvider } from "./query-provider";
import type { ReactNode } from "react";

interface AppProviderProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProviderProps) => {
  return (
    <QueryProvider>
      {children}
    </QueryProvider>
  );
};