"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type Branding = {
  logo?: string | null;
  primaryColor?: string | null;
  favicon?: string | null;
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<Branding>({});
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setLoggedIn(true);
      fetch(`${API}/api/branding`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => setBranding(data))
        .catch(() => {});
    }
  }, []);

  const primaryColor = branding.primaryColor ?? "#000";

  return (
    <html lang="en">
      <head>
        <link rel="icon" href={branding.favicon ?? "/favicon.ico"} />
      </head>
      <body style={{
        margin: 0,
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "#fafafa",
        color: "#111",
      }}>
        {loggedIn && (
          <header style={{
            background: primaryColor,
            color: "#fff",
            padding: "0.75rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {branding.logo && <img src={branding.logo} alt="" style={{ height: 28 }} />}
              {!branding.logo && <strong>Flux</strong>}
            </div>
            <nav style={{ display: "flex", gap: "1rem", fontSize: "0.9rem" }}>
              <a href="/" style={{ color: "#fff", textDecoration: "none" }}>Home</a>
              <a href="/links" style={{ color: "#fff", textDecoration: "none" }}>Links</a>
            </nav>
          </header>
        )}
        <main style={{ maxWidth: 720, margin: "0 auto", padding: "1.5rem" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
