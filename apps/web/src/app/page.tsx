"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const ease = [0.21, 0.47, 0.32, 0.98] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const features = [
  {
    title: "Custom Domains",
    desc: "Connect your own domain with DNS TXT verification. Every link carries your brand, not ours.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.715-6.744m0 0A8.997 8.997 0 0 0 21 12a9 9 0 0 0-9-9 8.997 8.997 0 0 0-7.716 4.256m14.43 0A8.99 8.99 0 0 1 12 21a8.99 8.99 0 0 1-5.857-2.256m0 0A8.997 8.997 0 0 1 3 12a8.997 8.997 0 0 1 2.256-5.744m0 0a8.99 8.99 0 0 1 5.744-2.256" />
      </svg>
    ),
  },
  {
    title: "Team Workspaces",
    desc: "Admin, editor, and viewer roles. Collaborate on links without sharing passwords.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
  {
    title: "White-Label Branding",
    desc: "Replace everything — logo, colors, favicon. Your dashboard, your identity.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 0 2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128m0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
      </svg>
    ),
  },
  {
    title: "A/B Split Testing",
    desc: "Route traffic across destinations with percentage splits. See what converts before going all in.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
      </svg>
    ),
  },
  {
    title: "Geo & Device Rules",
    desc: "Send mobile users to your app, EU visitors to your GDPR page. One link, many rules.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.715-6.744m0 0A9 9 0 0 0 12 3a9 9 0 0 0-8.715 5.256m16.43 0A8.997 8.997 0 0 1 12 21a8.997 8.997 0 0 1-5.857-2.256m0 0A8.997 8.997 0 0 1 3 12a8.997 8.997 0 0 1 2.256-5.744m0 0A8.99 8.99 0 0 1 12 3" />
      </svg>
    ),
  },
  {
    title: "Enterprise Security",
    desc: "SAML SSO, audit logs, scoped API keys, and abuse protection. SOC 2 readiness included.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [apiOk, setApiOk] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`${API}/health`, { method: "HEAD" })
      .then(() => setApiOk(true))
      .catch(() => setApiOk(false));
  }, []);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError("");
    setShortUrl("");
    try {
      if (apiOk === false) throw new Error("Backend is not connected. Start the API server or deploy it.");
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
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <motion.a
            href="/"
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              F
            </div>
            <span className="text-lg font-bold text-gray-900">Flux</span>
          </motion.a>

          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
            <a href="#features" className="transition-colors hover:text-gray-900">Features</a>
            <a href="/pricing" className="transition-colors hover:text-gray-900">Pricing</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href="/login"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Sign in
            </a>
            <motion.a
              href="/signup"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Get started
            </motion.a>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center justify-center rounded-md p-2 text-gray-600 md:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="border-t border-gray-200 bg-white px-6 py-4 md:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="flex flex-col gap-4 text-sm font-medium text-gray-600">
                <a href="#features" className="hover:text-gray-900" onClick={() => setMobileOpen(false)}>Features</a>
                <a href="/pricing" className="hover:text-gray-900" onClick={() => setMobileOpen(false)}>Pricing</a>
                <hr className="border-gray-200" />
                <a href="/login" className="hover:text-gray-900" onClick={() => setMobileOpen(false)}>Sign in</a>
                <a href="/signup" className="rounded-lg bg-brand-600 px-4 py-2 text-center font-semibold text-white" onClick={() => setMobileOpen(false)}>Get started</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative overflow-hidden px-6 pt-32 pb-20 text-center"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-50/80 via-transparent to-transparent" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-brand-200/40 blur-3xl" />

        <motion.div
          className="relative mx-auto max-w-3xl"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.h1
            className="text-5xl font-bold tracking-tight text-gray-900 md:text-6xl lg:text-7xl"
            variants={fadeInUp}
            custom={0}
          >
            Shorten links.{" "}
            <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
              Own your brand.
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 text-lg leading-relaxed text-gray-600 md:text-xl"
            variants={fadeInUp}
            custom={1}
          >
            Custom domains, white-label branding, team workspaces, and
            advanced routing — without locking into a generic shortener.
          </motion.p>

          <motion.div
            className="mx-auto mt-10 max-w-xl"
            variants={fadeInUp}
            custom={2}
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste a long URL..."
                required
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm shadow-sm transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-200 focus:outline-none"
              />
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Custom slug"
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm shadow-sm transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-200 focus:outline-none sm:w-36"
              />
              <motion.button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-50"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? "Shortening..." : "Shorten"}
              </motion.button>
            </form>

            {apiOk === false && (
              <p className="mt-3 text-center text-xs text-amber-600">
                Backend not connected — shorten will fail until the API is deployed.
              </p>
            )}
          </motion.div>

          {error && (
            <motion.p
              className="mt-4 text-sm text-red-600"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.p>
          )}

          {shortUrl && (
            <motion.div
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 shadow-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="font-medium">Done:</span>
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                {shortUrl}
              </a>
              <motion.button
                onClick={() => navigator.clipboard.writeText(shortUrl)}
                className="ml-2 rounded bg-green-200 px-2 py-1 text-xs font-medium transition-colors hover:bg-green-300"
                whileHover={{ scale: 1.05 }}
              >
                Copy
              </motion.button>
            </motion.div>
          )}

          <motion.div
            className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-400"
            variants={fadeInUp}
            custom={3}
          >
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
              Free for up to 100 links
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 0 4.5 6h.75m14.25 0v-.75A.75.75 0 0 0 18.75 4.5H18M3.75 12.5v3.25m0 0h.75m-.75 0H3m15.75-3.25v3.25m0 0h.75m-.75 0H18" />
              </svg>
              No credit card required
            </span>
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.section
        id="features"
        className="border-t border-gray-200 bg-white px-6 py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
      >
        <motion.div variants={fadeInUp} custom={0}>
          <h2 className="text-center text-3xl font-bold text-gray-900 md:text-4xl">
            Everything enterprises need
          </h2>
          <p className="mt-4 text-center text-gray-600">
            Built for teams that need reliability, control, and scale.
          </p>
        </motion.div>

        <motion.div
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              className="group rounded-xl border border-gray-200 p-6 transition-colors hover:border-brand-200"
              variants={fadeInUp}
              whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(99, 102, 241, 0.15)" }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
                {f.icon}
              </div>
              <h3 className="mt-5 font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <section className="border-t border-gray-200 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 md:p-12">
            <div className="grid gap-8 text-center md:grid-cols-2">
              <div className="flex flex-col items-center justify-center border-b border-gray-200 pb-8 md:border-b-0 md:border-r md:pb-0 md:pr-8">
                <p className="text-sm font-medium uppercase tracking-widest text-gray-400">Capacity</p>
                <p className="mt-2 text-5xl font-bold text-brand-600">10M+</p>
                <p className="mt-1 text-sm text-gray-500">links per month per cluster</p>
              </div>
              <div className="flex flex-col items-center justify-center pt-8 md:pt-0 md:pl-8">
                <p className="text-sm font-medium uppercase tracking-widest text-gray-400">Performance</p>
                <p className="mt-2 text-5xl font-bold text-brand-600">&lt;5ms</p>
                <p className="mt-1 text-sm text-gray-500">average redirect latency</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <motion.section
        id="pricing"
        className="relative overflow-hidden border-t border-gray-200 bg-gray-900 px-6 py-24 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
      >
        <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />

        <motion.h2
          className="relative text-3xl font-bold text-white md:text-4xl"
          variants={fadeInUp}
        >
          Start shortening links today
        </motion.h2>
        <motion.p
          className="relative mt-4 text-lg text-gray-400"
          variants={fadeInUp}
          custom={1}
        >
          Free tier included. Upgrade when you outgrow it.
        </motion.p>
        <motion.div
          className="relative mt-8 flex items-center justify-center gap-4"
          variants={fadeInUp}
          custom={2}
        >
          <motion.a
            href="/signup"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-100"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Get started free
          </motion.a>
          <motion.a
            href="/pricing"
            className="rounded-lg border border-gray-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-gray-500"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            View pricing
          </motion.a>
        </motion.div>
      </motion.section>

      <footer className="border-t border-gray-200 bg-white px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-xs font-bold text-white">
              F
            </div>
            <span className="text-sm font-semibold text-gray-700">Flux</span>
          </div>
          <span className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Flux. All rights reserved.
          </span>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#features" className="transition-colors hover:text-gray-700">Features</a>
            <a href="/pricing" className="transition-colors hover:text-gray-700">Pricing</a>
          </div>
        </div>
      </footer>
    </>
  );
}
