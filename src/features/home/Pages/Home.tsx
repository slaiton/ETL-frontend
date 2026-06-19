import { Link } from "react-router-dom";
import {
  BarChart3, FileText, DollarSign, Users, Shield,
  ArrowRight, Clock, TrendingUp, LayoutDashboard, SlidersHorizontal,
} from "lucide-react";
import { useAuth } from "../../../shared/context/AuthContext";
import type { ModuleKey } from "../../../models/roles.model";

/* ── Accesos directos ──────────────────────────────────────────────── */
interface Shortcut {
  module: ModuleKey;
  label: string;
  desc: string;
  path: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  accent: string;
  bg: string;
  border: string;
}

const SHORTCUTS: Shortcut[] = [
  {
    module: "dashboard", label: "Dashboard", desc: "Indicadores y métricas del sistema",
    path: "/", Icon: BarChart3,
    accent: "#60A5FA", bg: "rgba(37,99,235,0.08)", border: "rgba(37,99,235,0.2)",
  },
  {
    module: "certificates", label: "Certificados", desc: "Consulta y gestión de certificados",
    path: "/certificates", Icon: FileText,
    accent: "#34D399", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)",
  },
  {
    module: "invoices", label: "Facturas", desc: "Reporte y seguimiento de facturas",
    path: "/invoices", Icon: DollarSign,
    accent: "#FBBF24", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)",
  },
  {
    module: "users", label: "Usuarios", desc: "Administración de cuentas de usuario",
    path: "/users", Icon: Users,
    accent: "#A78BFA", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)",
  },
  {
    module: "roles", label: "Roles", desc: "Control de perfiles y permisos de acceso",
    path: "/roles", Icon: Shield,
    accent: "#F87171", bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.2)",
  },
];

/* ── Changelog estático ────────────────────────────────────────────── */
interface Update {
  title: string;
  desc: string;
  detail: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  accent: string;
  bg: string;
  border: string;
  tag: string;
  tagBg: string;
  tagColor: string;
  date: string;
}

const UPDATES: Update[] = [
  {
    title: "Nuevo módulo de usuarios",
    desc: "Gestión completa de cuentas desde el panel",
    detail:
      "Creación, edición y desactivación de usuarios con asignación de roles. " +
      "Visualización del perfil, estado y fecha de registro directamente desde la tabla.",
    Icon: Users,
    accent: "#A78BFA",
    bg: "rgba(124,58,237,0.08)",
    border: "rgba(124,58,237,0.22)",
    tag: "Nuevo",
    tagBg: "rgba(124,58,237,0.15)",
    tagColor: "#C4B5FD",
    date: "Jun 2026",
  },
  {
    title: "Home interactivo",
    desc: "Página de inicio personalizada por perfil de usuario",
    detail:
      "Accesos directos filtrados según los permisos del rol activo. " +
      "El administrador puede definir qué página se muestra al ingresar al sistema para cada rol.",
    Icon: LayoutDashboard,
    accent: "#34D399",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.22)",
    tag: "Nuevo",
    tagBg: "rgba(16,185,129,0.15)",
    tagColor: "#6EE7B7",
    date: "Jun 2026",
  },
  {
    title: "Control de roles y gestión de permisos",
    desc: "Sistema RBAC con matriz de accesos y página de inicio por rol",
    detail:
      "Creación y edición de roles con asignación granular de módulos. " +
      "Vista en tarjetas y matriz interactiva. Cada rol define su propia página de aterrizaje tras el login.",
    Icon: Shield,
    accent: "#60A5FA",
    bg: "rgba(37,99,235,0.08)",
    border: "rgba(37,99,235,0.22)",
    tag: "Mejora",
    tagBg: "rgba(37,99,235,0.15)",
    tagColor: "#93C5FD",
    date: "Jun 2026",
  },
  {
    title: "Nuevos filtros y consulta de certificados",
    desc: "Búsqueda avanzada por fecha, estado, guía y cliente",
    detail:
      "Filtros combinados en el módulo de certificados con paginación dinámica. " +
      "Consulta por rango de fechas, número de guía, cliente y estado de facturación.",
    Icon: SlidersHorizontal,
    accent: "#FBBF24",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.22)",
    tag: "Mejora",
    tagBg: "rgba(245,158,11,0.12)",
    tagColor: "#FDE68A",
    date: "Jun 2026",
  },
];

/* ── Component ─────────────────────────────────────────────────────── */
export default function Home() {
  const { hasAccess } = useAuth();
  const userName = localStorage.getItem("user") ?? "usuario";

  const accessible = SHORTCUTS.filter(s => hasAccess(s.module));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
  const today = new Date().toLocaleDateString("es-CO", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div style={{ padding: "28px 24px", fontFamily: "Inter, Arial, sans-serif", color: "#E5E7EB", maxWidth: 1080 }}>

      {/* ── Greeting ─────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 36 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <TrendingUp size={24} color="#A78BFA" />
        </div>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#F9FAFB", margin: 0 }}>
            {greeting},{" "}
            <span style={{ color: "#A78BFA" }}>
              {userName.charAt(0).toUpperCase() + userName.slice(1)}
            </span>
          </h1>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "3px 0 0", textTransform: "capitalize" }}>
            {today}
          </p>
        </div>
      </div>

      {/* ── Accesos directos ─────────────────────────── */}
      <section style={{ marginBottom: 44 }}>
        <SectionTitle icon={<ArrowRight size={14} />} label="Accesos directos" />

        {accessible.length === 0 ? (
          <EmptyState text="No tienes módulos asignados. Contacta al administrador." />
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(195px, 1fr))",
            gap: 14,
          }}>
            {accessible.map(({ module, ...props }) => <ShortcutCard key={module} {...props} />)}
          </div>
        )}
      </section>

      {/* ── Últimas actualizaciones ───────────────────── */}
      <section>
        <SectionTitle icon={<Clock size={14} />} label="Últimas actualizaciones" />

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {UPDATES.map((u, i) => (
            <UpdateCard key={i} update={u} isLast={i === UPDATES.length - 1} />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────────────── */

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
      <span style={{ color: "#6B7280" }}>{icon}</span>
      <span style={{
        fontSize: 11, fontWeight: 700, color: "#6B7280",
        textTransform: "uppercase", letterSpacing: "0.07em",
      }}>
        {label}
      </span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{
      color: "#4B5563", fontSize: 14, padding: "28px",
      background: "rgba(255,255,255,0.02)", borderRadius: 12,
      border: "1px dashed rgba(255,255,255,0.07)", textAlign: "center",
    }}>
      {text}
    </div>
  );
}

function ShortcutCard({ label, desc, path, Icon, accent, bg, border }: Omit<Shortcut, "module">) {
  return (
    <Link to={path} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: bg, border: `1px solid ${border}`,
          borderRadius: 14, padding: "18px 16px",
          display: "flex", flexDirection: "column", gap: 10,
          transition: "transform .15s, box-shadow .15s",
          cursor: "pointer", height: "100%",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 10px 28px rgba(0,0,0,0.28)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        }}
      >
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: bg, border: `1px solid ${border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={18} color={accent} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#F9FAFB", marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.45 }}>{desc}</div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          fontSize: 11, color: accent, fontWeight: 600, marginTop: "auto",
        }}>
          Ir al módulo <ArrowRight size={11} />
        </div>
      </div>
    </Link>
  );
}

function UpdateCard({ update: u, isLast }: { update: Update; isLast: boolean }) {
  return (
    <div style={{
      display: "flex", gap: 0,
      borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.04)",
    }}>
      {/* Timeline line + dot */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 20, paddingRight: 0, width: 56, flexShrink: 0 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          background: u.bg, border: `1px solid ${u.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <u.Icon size={17} color={u.accent} />
        </div>
        {!isLast && (
          <div style={{
            width: 1, flex: 1, marginTop: 8,
            background: "rgba(255,255,255,0.05)",
          }} />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "18px 0 22px 14px" }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#F9FAFB" }}>{u.title}</span>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{u.desc}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, borderRadius: 999,
              padding: "3px 10px",
              background: u.tagBg, color: u.tagColor,
              border: `1px solid ${u.border}`,
              letterSpacing: "0.03em",
            }}>
              {u.tag}
            </span>
            <span style={{ fontSize: 11, color: "#4B5563" }}>{u.date}</span>
          </div>
        </div>

        {/* Detail text */}
        <p style={{
          fontSize: 13, color: "#9CA3AF", margin: 0,
          lineHeight: 1.6, maxWidth: 680,
        }}>
          {u.detail}
        </p>
      </div>
    </div>
  );
}
