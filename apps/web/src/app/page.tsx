"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const features = [
  {
    title: "Custom Domains",
    desc: "Bring your own domain with DNS TXT verification. Keep your brand front and center on every link.",
    icon: "🌐",
  },
  {
    title: "Team Workspaces",
    desc: "Role-based access for admin, editor, and viewer. Collaborate without compromising control.",
    icon: "👥",
  },
  {
    title: "White-Label Branding",
    desc: "Your logo, your colors, your favicon. The dashboard looks like it's yours — because it is.",
    icon: "🎨",
  },
  {
    title: "A/B Split Testing",
    desc: "Route traffic to multiple destinations with percentage-based splits. Optimize your campaigns in real time.",
    icon: "📊",
  },
  {
    title: "Geo & Device Targeting",
    desc: "Send users to different URLs based on country, device type, or browser. One link, many paths.",
    icon: "🌍",
  },
  {
    title: "Enterprise Security",
    desc: "SAML SSO, audit logs, API keys with scoped permissions, and abuse protection built in.",
    icon: "🔒",
  },
];

const stats = [
  { value: "10M+", label: "Links shortened" },
  { value: "99.99%", label: "Uptime SLA" },
  { value: "5K+", label: "Teams using Flux" },
  { value: "<5ms", label: "Average redirect" },
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError("");
    setShortUrl("");
    try {
      const body: Record<string, string> = { url };
      if (slug) body.slug = slug;
      const res = await fetch(`${API}/api/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to shorten URL");
      }
      const data = await res.json();
      setShortUrl(data.shortUrl ?? `${window.location.origin}/${data.shortCode}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-brand-600">Flux</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
            <a href="#features" className="hover:text-gray-900">Features</a>
            <a href="#pricing" className="hover:text-gray-900">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sign in
            </a>
            <a
              href="/signup"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Get started
            </a>
          </div>
        </div>
      </header>

      <section className="px-6 pt-24 pb-16 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Shorten links.{" "}
            <span className="text-brand-600">Own your brand.</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            Enterprise-grade link management with custom domains, team workspaces,
            and advanced targeting — without the enterprise price tag.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row"
          >
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a long URL..."
              required
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none"
            />
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Custom slug (optional)"
              className="rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none sm:w-40"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? "Shortening..." : "Shorten"}
            </button>
          </form>

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}

          {shortUrl && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              <span className="font-medium">Done:</span>
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {shortUrl}
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(shortUrl)}
                className="ml-2 rounded bg-green-200 px-2 py-1 text-xs font-medium hover:bg-green-300"
              >
                Copy
              </button>
            </div>
          )}

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-400">
            <span className="flex items-center gap-1">🔒 Free for up to 100 links</span>
            <span className="flex items-center gap-1">⚡ No credit card required</span>
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-gray-200 bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Everything enterprises need
          </h2>
          <p className="mt-4 text-center text-gray-600">
            Built for teams that need reliability, control, and scale.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-gray-200 p-6 transition hover:border-brand-200 hover:shadow-sm"
              >
                <span className="text-2xl">{f.icon}</span>
                <h3 className="mt-4 font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-bold text-brand-600">{s.value}</p>
                <p className="mt-2 text-sm text-gray-600">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t border-gray-200 bg-brand-600 px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-white">
          Start shortening links today
        </h2>
        <p className="mt-4 text-lg text-brand-200">
          Free tier included. Upgrade when you outgrow it.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <a
            href="/signup"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-700 hover:bg-gray-100"
          >
            Get started free
          </a>
          <a
            href="/pricing"
            className="rounded-lg border border-white px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            View pricing
          </a>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Flux. All rights reserved.
          </span>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-700">Features</a>
            <a href="/pricing" className="hover:text-gray-700">Pricing</a>
            <a href="#" className="hover:text-gray-700">Privacy</a>
            <a href="#" className="hover:text-gray-700">Terms</a>
          </div>
        </div>
      </footer>
    </>
  );
}
