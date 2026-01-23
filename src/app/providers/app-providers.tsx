import { QueryProvider } from "./query-provider";
import { BrowserRouter } from "react-router-dom";
import type { ReactNode } from "react";

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <QueryProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryProvider>
  );
};