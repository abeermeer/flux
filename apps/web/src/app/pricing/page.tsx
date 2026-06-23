export default function Pricing() {
  const tiers = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      desc: "For individuals and small teams getting started with link management.",
      features: [
        "1,000 links/month",
        "3 custom domains",
        "Basic analytics",
        "1 workspace",
        "Community support",
      ],
      cta: "Start free trial",
      featured: false,
    },
    {
      name: "Business",
      price: "$99",
      period: "/month",
      desc: "For growing teams that need advanced features and control.",
      features: [
        "10,000 links/month",
        "Unlimited custom domains",
        "Advanced analytics & insights",
        "Team workspaces (unlimited members)",
        "White-label branding",
        "A/B split testing",
        "API access",
        "Priority support",
      ],
      cta: "Start free trial",
      featured: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      desc: "For organizations that need dedicated infrastructure and compliance.",
      features: [
        "Unlimited links",
        "Custom SLA",
        "SAML SSO",
        "Audit logs",
        "Geo & device targeting",
        "Dedicated support engineer",
        "Custom integrations",
        "SOC 2 readiness",
      ],
      cta: "Contact sales",
      featured: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-brand-600">Flux</span>
          </a>
          <a href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            &larr; Back home
          </a>
        </div>
      </header>

      <section className="px-6 py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Simple, transparent pricing</h1>
        <p className="mt-4 text-lg text-gray-600">
          Start for free. Upgrade when you need more.
        </p>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl border p-8 text-left ${
                tier.featured
                  ? "border-brand-500 bg-white shadow-lg ring-2 ring-brand-500"
                  : "border-gray-200 bg-white"
              }`}
            >
              {tier.featured && (
                <span className="mb-4 inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                  Most popular
                </span>
              )}
              <h2 className="text-xl font-bold text-gray-900">{tier.name}</h2>
              <p className="mt-1 text-gray-600 text-sm">{tier.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                {tier.period && (
                  <span className="text-sm text-gray-500">{tier.period}</span>
                )}
              </div>
              <ul className="mt-6 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="h-4 w-4 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={tier.featured ? "/signup" : tier.name === "Enterprise" ? "/signup" : "/signup"}
                className={`mt-8 block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold ${
                  tier.featured
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : "border border-gray-300 text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Flux. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
