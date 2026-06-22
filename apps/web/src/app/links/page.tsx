"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type Link = {
  id: string;
  shortCode: string;
  destination: string;
  clickCount: number;
  createdAt: string;
};

export default function LinksPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
    if (!t) { setLoading(false); return; }
    fetch(`${API}/api/links`, {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((r) => r.json())
      .then((data) => setLinks(data.links ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-brand-600">Flux</span>
          </a>
          <nav className="flex items-center gap-4 text-sm font-medium text-gray-600">
            <a href="/links" className="text-gray-900">Links</a>
            <a href="/" className="hover:text-gray-900">Home</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900">Your Links</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage all your shortened links in one place.
        </p>

        {!token ? (
          <div className="mt-12 text-center">
            <p className="text-gray-600">Sign in to see your links.</p>
            <a
              href="/login"
              className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Sign in
            </a>
          </div>
        ) : loading ? (
          <p className="mt-12 text-center text-gray-500">Loading...</p>
        ) : links.length === 0 ? (
          <p className="mt-12 text-center text-gray-500">No links yet. Shorten your first one!</p>
        ) : (
          <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">Short URL</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Destination</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Clicks</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Created</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-brand-600">
                      {link.shortCode}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-gray-600">
                      {link.destination}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{link.clickCount}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
