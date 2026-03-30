import type { Metadata } from 'next';
import '../styles/globals.css';
import { RootLayoutClient } from './layout-client';

export const metadata: Metadata = {
  title: 'MarketStock AI Platform',
  description: 'Premium AI-powered financial landing and login',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
