import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sadhana Guide — Spiritual Q&A',
  description:
    'Ask questions about spiritual sadhana practices and receive guidance based on authentic teachings.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
