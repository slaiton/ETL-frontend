import { Link } from "react-router-dom";
import {
  LayoutDashboard, TrendingUp, FileText, FileSearch, FileX,
  Receipt, Users, ShieldCheck, Building2,
} from "lucide-react";
import { useAuth } from "../../../shared/context/AuthContext";
import type { ModuleKey } from "../../../models/roles.model";
import { getFirstName } from "../../../shared/utils/userProfile";
import "./Home.css";

/* ── Aplicaciones del deck ─────────────────────────────────────────── */
interface AppShortcut {
  /** Con varios basta con tener acceso a alguno */
  module: ModuleKey | readonly ModuleKey[];
  label: string;
  desc: string;
  path: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  /** Degradado del ícono: de `accent` a `accent2` */
  accent: string;
  accent2: string;
}

const APPS: AppShortcut[] = [
  {
    module: "dashboard", label: "Dashboard", desc: "Indicadores y métricas del sistema",
    path: "/", Icon: LayoutDashboard, accent: "#60A5FA", accent2: "#2563EB",
  },
  {
    module: "reports", label: "Reportes", desc: "Generación y visualización de reportes",
    path: "/reports", Icon: TrendingUp, accent: "#F472B6", accent2: "#DB2777",
  },
  {
    module: "certificates", label: "Certificados", desc: "Consulta y gestión de certificados",
    path: "/certificates", Icon: FileText, accent: "#34D399", accent2: "#059669",
  },
  {
    module: ["certificates_basic", "certificates"], label: "Certificados cliente", desc: "Certificados de las pólizas del cliente",
    path: "/certificates/basic", Icon: FileSearch, accent: "#2DD4BF", accent2: "#0D9488",
  },
  {
    module: "certificates_cancellation", label: "Anulación de certificados", desc: "Proceso de anulación de certificados",
    path: "/certificates/cancellation", Icon: FileX, accent: "#F87171", accent2: "#DC2626",
  },
  {
    module: "invoices", label: "Facturas", desc: "Reporte y seguimiento de facturas",
    path: "/invoices", Icon: Receipt, accent: "#FBBF24", accent2: "#D97706",
  },
  {
    module: "users", label: "Usuarios", desc: "Administración de cuentas de usuario",
    path: "/users", Icon: Users, accent: "#A78BFA", accent2: "#7C3AED",
  },
  {
    module: "roles", label: "Roles", desc: "Control de perfiles y permisos de acceso",
    path: "/roles", Icon: ShieldCheck, accent: "#818CF8", accent2: "#4F46E5",
  },
];

/* ── Component ─────────────────────────────────────────────────────── */
export default function Home() {
  const { hasAccess, user } = useAuth();
  const firstName = getFirstName(user);

  const apps = APPS.filter(app => hasAccess(app.module));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
  const today = new Date().toLocaleDateString("es-CO", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="home">
      <header className="home__hero">
        <p className="home__date">{today}</p>
        <h1 className="home__greeting">
          {greeting},{" "}
          <span>{firstName}</span>
        </h1>
        {user?.client?.name && (
          <p className="home__client">
            <Building2 size={14} aria-hidden="true" />
            {user.client.name}
          </p>
        )}
        {apps.length > 0 && (
          <p className="home__sub">Selecciona una aplicación para comenzar</p>
        )}
      </header>

      {apps.length === 0 ? (
        <div className="home__empty">
          No tienes módulos asignados. Contacta al administrador.
        </div>
      ) : (
        <nav className="app-deck" aria-label="Aplicaciones">
          {apps.map(({ path, label, desc, Icon, accent, accent2 }, i) => (
            <Link
              key={path}
              to={path}
              className="app-deck__item"
              title={desc}
              style={{
                "--accent": accent,
                "--accent-2": accent2,
                "--i": i,
              } as React.CSSProperties}
            >
              <span className="app-deck__icon" aria-hidden="true">
                <Icon size={30} strokeWidth={1.9} />
              </span>
              <span className="app-deck__label">{label}</span>
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
