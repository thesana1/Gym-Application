import { Archivo, Figtree } from 'next/font/google';
import { type ReactNode } from 'react';

import { APP_DESCRIPTION, APP_NAME } from '@/shared/const/app.const';
import { ThemeProvider } from '@/shared/providers/theme-provider';

import type { Metadata } from 'next';

import './globals.css';

// Figtree reads friendly at small sizes; Archivo's width axis gives condensed numerals like painted pool depth markers.
const figtree = Figtree({ variable: '--font-figtree', subsets: ['latin'] });
const archivo = Archivo({ variable: '--font-archivo', subsets: ['latin'], axes: ['wdth'] });

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${archivo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
