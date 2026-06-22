const tiers = [
  {
    name: "Starter",
    price: 29,
    features: ["1 custom domain", "3 team seats", "10,000 clicks/mo", "Basic analytics", "API access"],
  },
  {
    name: "Business",
    price: 99,
    popular: true,
    features: ["3 custom domains", "10 team seats", "100,000 clicks/mo", "Geo/device redirects", "Webhooks", "Advanced analytics"],
  },
  {
    name: "Enterprise",
    price: null,
    features: ["Unlimited domains", "Unlimited seats", "Unlimited clicks", "SAML SSO", "Audit logs", "SOC 2 compliance", "99.99% SLA", "Dedicated support"],
  },
];

export default function PricingPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1 style={{ fontSize: "2rem", textAlign: "center", marginBottom: "0.5rem" }}>
        Simple, transparent pricing
      </h1>
      <p style={{ textAlign: "center", color: "#666", marginBottom: "2rem" }}>
        Start free. Upgrade when you grow.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {tiers.map((tier) => (
          <div key={tier.name} style={{
            border: tier.popular ? "2px solid #000" : "1px solid #ddd",
            borderRadius: 12,
            padding: "1.5rem",
            position: "relative",
            background: tier.popular ? "#fff" : "#fafafa",
          }}>
            {tier.popular && (
              <span style={{
                position: "absolute",
                top: -12,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#000",
                color: "#fff",
                padding: "0.25rem 0.75rem",
                borderRadius: 999,
                fontSize: "0.8rem",
                fontWeight: 600,
              }}>
                Most Popular
              </span>
            )}
            <h2 style={{ fontSize: "1.2rem", margin: 0 }}>{tier.name}</h2>
            <p style={{ fontSize: "2rem", fontWeight: 700, margin: "1rem 0" }}>
              {tier.price ? `$${tier.price}/mo` : "Custom"}
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "1.5rem 0", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {tier.features.map((f) => (
                <li key={f} style={{ fontSize: "0.9rem", color: "#444" }}>✓ {f}</li>
              ))}
            </ul>
            <button style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: 8,
              border: "none",
              background: tier.popular ? "#000" : "#eee",
              color: tier.popular ? "#fff" : "#000",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "1rem",
            }}>
              {tier.price ? "Subscribe" : "Contact Sales"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
