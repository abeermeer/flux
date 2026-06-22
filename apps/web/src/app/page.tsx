export default function Home() {
  return (
    <main style={{ padding: "2rem", maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Flux</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Enterprise link management platform.
      </p>

      <form style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <input
          type="url"
          placeholder="Paste a long URL..."
          style={{ padding: "0.75rem", borderRadius: 6, border: "1px solid #ccc" }}
        />
        <input
          type="text"
          placeholder="Custom slug (optional)"
          style={{ padding: "0.75rem", borderRadius: 6, border: "1px solid #ccc" }}
        />
        <button
          type="submit"
          style={{
            padding: "0.75rem",
            borderRadius: 6,
            border: "none",
            background: "#000",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Shorten
        </button>
      </form>
    </main>
  );
}
