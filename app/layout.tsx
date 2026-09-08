import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'TrendPrompt AI — Turn Trending Images Into AI Prompts',
  description: 'Upload any reference or trending image. AI analyzes visual composition, lighting, style, and camera angles to craft precise prompts for your own photos.',
  openGraph: {
    title: 'TrendPrompt AI — Turn Trending Images Into AI Prompts',
    description: 'Upload any reference or trending image. AI analyzes visual composition, lighting, style, and camera angles to craft precise prompts for your own photos.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrendPrompt AI — Turn Trending Images Into AI Prompts',
    description: 'Upload any reference or trending image. AI analyzes visual composition, lighting, style, and camera angles to craft precise prompts for your own photos.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-150">
        {children}
      </body>
    </html>
  );
}
