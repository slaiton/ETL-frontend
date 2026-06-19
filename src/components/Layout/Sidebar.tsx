import React from "react";
import { sidebarStyles } from "./layout.styles";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BarChart3, FileText, DollarSign, Users, Shield, LogOut } from "lucide-react";
import { useAuth } from "../../shared/context/AuthContext";
import type { ModuleKey } from "../../models/roles.model";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  module: ModuleKey | null;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Inicio",       path: "/home",         icon: <LayoutDashboard size={18} />, module: null },
  { label: "Dashboard",    path: "/",             icon: <BarChart3 size={18} />,       module: "dashboard" },
  { label: "Certificados", path: "/certificates", icon: <FileText size={18} />,        module: "certificates" },
  { label: "Facturas",     path: "/invoices",     icon: <DollarSign size={18} />,      module: "invoices" },
  { label: "Usuarios",     path: "/users",        icon: <Users size={18} />,           module: "users" },
  { label: "Roles",        path: "/roles",        icon: <Shield size={18} />,          module: "roles" },
  { label: "Cerrar Sesión",path: "/logout",       icon: <LogOut size={18} />,          module: null },
];

const Sidebar: React.FC<{ open?: boolean; onLinkClick?: () => void }> = ({ open = false, onLinkClick }) => {
  const { hasAccess } = useAuth();
  const location = useLocation();

  const visible = NAV_ITEMS.filter((item) => item.module === null || hasAccess(item.module));

  return (
    <aside style={{ ...sidebarStyles.sidebar, transform: open ? "translateX(0)" : "translateX(-100%)" }}>
      <div style={sidebarStyles.sidebarLogoContainer}>
        <img src="/tf2.png" alt="Logo" style={sidebarStyles.sidebarLogo} />
      </div>

      {visible.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link key={item.path} to={item.path} style={{ textDecoration: "none" }} onClick={onLinkClick}>
            <div style={{ ...sidebarStyles.navItem, ...(isActive ? sidebarStyles.navItemActive : {}) }}>
              <span style={sidebarStyles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </aside>
  );
};

export default Sidebar;
