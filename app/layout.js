import { Sora } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next"

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata = {
  title: "IntraAi — AI Mock Interview Platform",
  description: "Ace every interview with AI-powered real-time performance evaluation. Practice, get scored, and improve with personalized feedback.",
  keywords: ["mock interview", "AI interview", "interview practice", "job preparation", "IntraAi"],
  openGraph: {
    title: "IntraAi — AI Mock Interview Platform",
    description: "Ace every interview with AI-powered performance evaluation",
    type: "website",
    url: "https://intraai.vercel.app",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={sora.variable}>
        <head>
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
          <Toaster richColors position="top-center" />
          {children}
          <footer className="global-footer">© 2025 IntraAi. All rights reserved. Built with ❤️ in India.</footer>
        </body>
      </html>
    </ClerkProvider>
  );
}