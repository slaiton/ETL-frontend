import { Shield, Users } from "lucide-react";
import { STATIC_ROLES } from "../../../models/users.model";

const ROLE_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: "rgba(239,68,68,0.1)",    text: "#FCA5A5", border: "rgba(239,68,68,0.25)"    },
  2: { bg: "rgba(59,130,246,0.1)",   text: "#93C5FD", border: "rgba(59,130,246,0.25)"   },
  3: { bg: "rgba(16,185,129,0.1)",   text: "#6EE7B7", border: "rgba(16,185,129,0.25)"   },
};

const ROLE_PERMISSIONS: Record<number, string[]> = {
  1: ["Dashboard", "Certificados", "Facturas", "Usuarios", "Roles"],
  2: ["Dashboard", "Certificados", "Facturas"],
  3: ["Dashboard", "Certificados"],
};

export default function RolesPage() {
  return (
    <div style={st.container}>

      {/* ── Header ─────────────────────────────────── */}
      <div style={st.pageHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={st.iconWrap}><Shield size={20} color="#A78BFA" /></div>
          <div>
            <h1 style={st.title}>Roles</h1>
            <p style={st.subtitle}>Perfiles de acceso del sistema</p>
          </div>
        </div>
      </div>

      {/* ── Info banner ────────────────────────────── */}
      <div style={st.infoBanner}>
        <Shield size={14} style={{ flexShrink: 0 }} />
        <span>
          Los roles se asignan al crear o editar un usuario. Cuando el backend exponga endpoints de gestión de roles, este módulo se actualizará con CRUD completo.
        </span>
      </div>

      {/* ── Cards ──────────────────────────────────── */}
      <div style={st.grid}>
        {STATIC_ROLES.map((role) => {
          const colors = ROLE_COLORS[role.id] ?? ROLE_COLORS[3];
          const perms = ROLE_PERMISSIONS[role.id] ?? [];
          return (
            <div key={role.id} style={st.card}>

              <div style={st.cardHeader}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: colors.bg, border: `1px solid ${colors.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Shield size={18} color={colors.text} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#F9FAFB" }}>{role.name}</div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>ID: {role.id}</div>
                </div>
              </div>

              {role.description && (
                <p style={st.cardDesc}>{role.description}</p>
              )}

              <div style={st.permSection}>
                <div style={st.permLabel}>Módulos con acceso</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {perms.map((p) => (
                    <span key={p} style={{
                      background: colors.bg, color: colors.text,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 999, padding: "3px 10px",
                      fontSize: 12, fontWeight: 500,
                    }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div style={st.cardFooter}>
                <Users size={13} color="#6B7280" />
                <span style={{ color: "#6B7280", fontSize: 12 }}>Asignado al crear usuarios</span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

const st: Record<string, React.CSSProperties> = {
  container: {
    padding: "24px", fontFamily: "Inter, Arial, sans-serif",
    color: "#e4e4e7", minHeight: "100vh",
  },
  pageHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 20,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
    background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 22, fontWeight: 800, color: "#F9FAFB", margin: 0 },
  subtitle: { fontSize: 13, color: "#6B7280", margin: "2px 0 0" },
  infoBanner: {
    display: "flex", alignItems: "flex-start", gap: 10,
    background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)",
    borderRadius: 10, padding: "12px 16px", color: "#C4B5FD",
    fontSize: 13, marginBottom: 24, lineHeight: 1.5,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 20,
  },
  card: {
    background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", gap: 14,
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  },
  cardHeader: { display: "flex", alignItems: "center", gap: 12 },
  cardDesc: { fontSize: 13, color: "#9CA3AF", lineHeight: 1.5, margin: 0 },
  permSection: { borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 14 },
  permLabel: { fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: "0.06em", textTransform: "uppercase" },
  cardFooter: {
    display: "flex", alignItems: "center", gap: 6,
    borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 12,
  },
};
