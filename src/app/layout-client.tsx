'use client';

import { AppProvider } from '../context/AppContext';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>{children}</AppProvider>
  );
}
