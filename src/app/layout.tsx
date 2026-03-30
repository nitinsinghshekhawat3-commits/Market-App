import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'MarketStock AI Platform',
  description: 'Premium AI-powered financial landing and login',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
