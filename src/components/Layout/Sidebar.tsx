import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  House, LayoutDashboard, TrendingUp, FileText, FileSearch, FileX,
  Receipt, Users, ShieldCheck, LogOut, X,
} from "lucide-react";
import { useAuth } from "../../shared/context/AuthContext";
import type { ModuleKey } from "../../models/roles.model";
import BrandLogo from "../../shared/brand/BrandLogo";
import { getFullName, getInitials } from "../../shared/utils/userProfile";
import { useTheme } from "../../shared/theme/theme";

interface NavItem {
  label: string;
  path: string;
  Icon: React.ComponentType<{ size?: number }>;
  /** null = siempre visible; con varios basta con uno */
  module: ModuleKey | readonly ModuleKey[] | null;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Inicio",                    path: "/home",                      Icon: House,           module: null },
  { label: "Dashboard",                 path: "/",                          Icon: LayoutDashboard, module: "dashboard" },
  { label: "Reportes",                  path: "/reports",                   Icon: TrendingUp,      module: "reports" },
  { label: "Certificados",              path: "/certificates",              Icon: FileText,        module: "certificates" },
  { label: "Certificados cliente",      path: "/certificates/basic",        Icon: FileSearch,      module: ["certificates_basic", "certificates"] },
  { label: "Anulación de certificados", path: "/certificates/cancellation", Icon: FileX,           module: "certificates" },
  { label: "Facturas",                  path: "/invoices",                  Icon: Receipt,         module: "invoices" },
  { label: "Usuarios",                  path: "/users",                     Icon: Users,           module: "users" },
  { label: "Roles",                     path: "/roles",                     Icon: ShieldCheck,     module: "roles" },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open = false, onClose }) => {
  const { hasAccess, user } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();

  const visible = NAV_ITEMS.filter((item) => item.module === null || hasAccess(item.module));

  return (
    <aside
      className={`sidebar${open ? " is-open" : ""}`}
      aria-label="Menú principal"
      aria-hidden={!open}
      inert={!open}
    >
      <div className="sidebar__header">
        <BrandLogo tone={theme === "dark" ? "onDark" : "onLight"} height={34} />
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar menú">
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar__nav">
        <p className="sidebar__section">Menú</p>
        {visible.map(({ label, path, Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              className={`sidebar__link${isActive ? " is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <span className="avatar">{getInitials(user)}</span>
          <div className="sidebar__user-text">
            <div className="sidebar__user-name">{getFullName(user)}</div>
            <div className="sidebar__user-meta">
              {user?.client?.name ?? user?.role_name ?? user?.email}
            </div>
          </div>
          <Link to="/logout" className="icon-btn sidebar__logout" aria-label="Cerrar sesión" title="Cerrar sesión">
            <LogOut size={18} />
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
