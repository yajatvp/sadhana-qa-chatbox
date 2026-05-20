import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KBUF Sadhana Q/A',
  description:
    'Ask questions about KBUF sadhanas and receive guidance based on authentic teachings.',
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
