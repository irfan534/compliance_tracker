import type { Metadata } from 'next';
import { ReactNode } from 'react';
import '@/styles/globals.css';
import { AppSettingsProvider } from '@/components/providers/app-settings-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';

export const metadata: Metadata = {
  title: 'Tracking',
  description: 'Enterprise Compliance Certificate Manager',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="%231D1D1F"/><path d="M8 16.5l5 5 11-11" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppSettingsProvider>{children}</AppSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
