import type { ReactNode } from "react";
import { ui } from "../../shared/styles/ui";

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

/** Encabezado común de los módulos: ícono, título, subtítulo y acciones. */
export default function PageHeader({ icon, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <div style={ui.iconTile}>{icon}</div>
        <div style={{ minWidth: 0 }}>
          <h1 style={ui.title}>{title}</h1>
          {subtitle && <p style={ui.subtitle}>{subtitle}</p>}
        </div>
      </div>
      {actions && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}
