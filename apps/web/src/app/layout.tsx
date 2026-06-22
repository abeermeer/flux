import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flux — Enterprise URL Shortener",
  description:
    "Enterprise-grade link management with custom domains, white-label branding, team workspaces, and advanced analytics.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-gray-50 text-gray-900 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
