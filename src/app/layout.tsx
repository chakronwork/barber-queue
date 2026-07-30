import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ระบบจองคิวร้านตัดผม',
  description: 'Barber queue management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
