import { Receipt } from "lucide-react";
import { C, FONT_DISPLAY, ui } from "../shared/styles/ui";

export default function Invoices() {
  return (
    <div
      className="app-page"
      style={{
        ...ui.page,
        padding: "60px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
      }}
    >
      <div style={{ ...ui.iconTile, width: 56, height: 56, borderRadius: 16 }}>
        <Receipt size={26} />
      </div>
      <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "1.8rem", fontWeight: 800, color: C.ink, margin: 0 }}>Facturas</h2>
      <p style={{ color: C.muted, fontSize: "1rem", margin: 0 }}>
        Módulo en construcción — próximamente disponible.
      </p>
    </div>
  );
}
