"use client";

export default function BotaoTentarDeNovo() {
  return (
    <button onClick={() => location.reload()}
      style={{ padding: "12px 24px", background: "#FF6600", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
      Tentar de novo
    </button>
  );
}
