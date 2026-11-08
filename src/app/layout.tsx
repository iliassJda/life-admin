import type { Metadata, Viewport } from 'next';
import { Archivo } from 'next/font/google';
import { site } from '@/lib/core/site';
import './globals.css';
import './station.css';

// One family for the whole product; its width axis does the work of a second face.
const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  axes: ['wdth'],
});

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
};

export const viewport: Viewport = {
  themeColor: '#0a0b0c',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${archivo.variable} h-full antialiased`}>
      <body className="station flex min-h-full flex-col">{children}</body>
    </html>
  );
}
