import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3, FileText, DollarSign, Users, Shield,
  ArrowRight, Clock, TrendingUp,
} from "lucide-react";
import { useAuth } from "../../../shared/context/AuthContext";
import type { ModuleKey } from "../../../models/roles.model";
import { getCertificates } from "../../../api/certificates";

interface Shortcut {
  key: ModuleKey;
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
    key: "dashboard", label: "Dashboard", desc: "Indicadores y métricas del sistema",
    path: "/", Icon: BarChart3,
    accent: "#60A5FA", bg: "rgba(37,99,235,0.08)", border: "rgba(37,99,235,0.2)",
  },
  {
    key: "certificates", label: "Certificados", desc: "Consulta y gestión de certificados",
    path: "/certificates", Icon: FileText,
    accent: "#34D399", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)",
  },
  {
    key: "invoices", label: "Facturas", desc: "Reporte y seguimiento de facturas",
    path: "/invoices", Icon: DollarSign,
    accent: "#FBBF24", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)",
  },
  {
    key: "users", label: "Usuarios", desc: "Administración de cuentas de usuario",
    path: "/users", Icon: Users,
    accent: "#A78BFA", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)",
  },
  {
    key: "roles", label: "Roles", desc: "Control de perfiles y permisos de acceso",
    path: "/roles", Icon: Shield,
    accent: "#F87171", bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.2)",
  },
];

export default function Home() {
  const { hasAccess } = useAuth();
  const userName = localStorage.getItem("user") ?? "usuario";
  const [recentCerts, setRecentCerts] = useState<any[]>([]);
  const [certsLoading, setCertsLoading] = useState(false);

  const accessible = SHORTCUTS.filter(s => hasAccess(s.key));

  useEffect(() => {
    if (!hasAccess("certificates")) return;
    setCertsLoading(true);
    getCertificates({ per_page: 5, page: 1 })
      .then(res => setRecentCerts(res?.data ?? []))
      .catch(() => setRecentCerts([]))
      .finally(() => setCertsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
  const today = new Date().toLocaleDateString("es-CO", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div style={{ padding: "28px 24px", fontFamily: "Inter, Arial, sans-serif", color: "#E5E7EB", maxWidth: 1080 }}>

      {/* Greeting */}
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

      {/* Accesos directos */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <ArrowRight size={15} color="#6B7280" />
          <span style={{
            fontSize: 11, fontWeight: 700, color: "#6B7280",
            textTransform: "uppercase", letterSpacing: "0.07em",
          }}>
            Accesos directos
          </span>
        </div>

        {accessible.length === 0 ? (
          <div style={{
            color: "#4B5563", fontSize: 14, padding: "28px",
            background: "rgba(255,255,255,0.02)", borderRadius: 12,
            border: "1px dashed rgba(255,255,255,0.07)", textAlign: "center",
          }}>
            No tienes módulos asignados. Contacta al administrador.
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(195px, 1fr))",
            gap: 14,
          }}>
            {accessible.map(({ key, label, desc, path, Icon, accent, bg, border }) => (
              <Link key={key} to={path} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    background: bg, border: `1px solid ${border}`,
                    borderRadius: 14, padding: "18px 16px",
                    display: "flex", flexDirection: "column", gap: 10,
                    transition: "transform .15s, box-shadow .15s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px rgba(0,0,0,0.25)`;
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
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#F9FAFB", marginBottom: 4 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.45 }}>
                      {desc}
                    </div>
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 4,
                    fontSize: 11, color: accent, fontWeight: 600, marginTop: 2,
                  }}>
                    Ir al módulo <ArrowRight size={11} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Últimas actualizaciones */}
      <section>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Clock size={15} color="#6B7280" />
          <span style={{
            fontSize: 11, fontWeight: 700, color: "#6B7280",
            textTransform: "uppercase", letterSpacing: "0.07em",
          }}>
            Últimas actualizaciones
          </span>
        </div>

        <div style={{
          background: "rgba(15,23,42,0.75)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14, overflow: "hidden",
        }}>
          {!hasAccess("certificates") ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#4B5563", fontSize: 14 }}>
              Sin acceso a actualizaciones recientes
            </div>
          ) : certsLoading ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#6B7280", fontSize: 13 }}>
              Cargando...
            </div>
          ) : recentCerts.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#4B5563", fontSize: 14 }}>
              No hay registros recientes
            </div>
          ) : (
            recentCerts.map((cert, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 20px",
                  borderBottom: i < recentCerts.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                  background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FileText size={15} color="#34D399" />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#E5E7EB", marginBottom: 2 }}>
                    Certificado {cert.certificate ?? `#${i + 1}`}
                  </div>
                  <div style={{ fontSize: 11, color: "#6B7280" }}>
                    {cert.waybill ? `Guía: ${cert.waybill}` : "Sin número de guía"}
                    {cert.start_date
                      ? ` · ${new Date(cert.start_date).toLocaleDateString("es-CO")}`
                      : ""}
                  </div>
                </div>

                {cert.is_invoiced !== undefined && (
                  <span style={{
                    fontSize: 11, fontWeight: 600, borderRadius: 999,
                    padding: "3px 9px", flexShrink: 0,
                    background: cert.is_invoiced
                      ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                    color: cert.is_invoiced ? "#34D399" : "#FBBF24",
                    border: `1px solid ${cert.is_invoiced
                      ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}`,
                  }}>
                    {cert.is_invoiced ? "Facturado" : "Pendiente"}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {hasAccess("certificates") && recentCerts.length > 0 && (
          <div style={{ marginTop: 12, textAlign: "right" }}>
            <Link to="/certificates" style={{
              fontSize: 12, color: "#34D399", fontWeight: 600, textDecoration: "none",
            }}>
              Ver todos los certificados →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
