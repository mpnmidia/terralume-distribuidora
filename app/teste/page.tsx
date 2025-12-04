export default function TestePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#020617",
        color: "#e5e7eb",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Rota /teste funcionando ✅</h1>
        <p style={{ fontSize: 14 }}>
          Se você está vendo esta página, o Next.js está ok. 
          O erro "Unsupported Server Component type: undefined" vem de outra rota.
        </p>
      </div>
    </div>
  );
}

