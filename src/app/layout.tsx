import type { Metadata } from 'next';
import './globals.css';
import { InterviewProvider } from '@/contexts/InterviewContext';

export const metadata: Metadata = {
  title: 'Tech Interview Trainer - 技術面接練習アプリ',
  description: '技術のわからない人が面接官役になって、エンジニア志望者の技術面接練習を支援するアプリ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased bg-white min-h-screen">
        <InterviewProvider>
          {children}
        </InterviewProvider>
      </body>
    </html>
  );
}
