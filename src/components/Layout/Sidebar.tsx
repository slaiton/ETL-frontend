import React from "react";
import { sidebarStyles } from "./layout.styles";
import { Link } from "react-router-dom";
import { Home, FileText,DollarSign ,LogOut } from "lucide-react";


const modules = [
  { label: "Dashboard", path: "/", icon: <Home size={18} /> },
  { label: "Dashboard", path: "/", icon: <Home size={18} /> },
  { label: "Certificados", path: "/certificates", icon: <FileText size={18} /> },
  { label: "Facturas", path: "/invoices", icon: <DollarSign size={18} /> },
  { path: "/logout", label: "Cerrar Sesión", icon: <LogOut size={18} /> }
];

const Sidebar: React.FC<{ open?: boolean; onLinkClick?: () => void }> = ({
  open = false,
  onLinkClick
}) => {

  const sidebarDynamic = {
    ...sidebarStyles.sidebar,
    transform: open ? "translateX(0)" : "translateX(-100%)",
  };

 return (
    <aside style={sidebarDynamic}>

      <div style={sidebarStyles.sidebarLogoContainer}>
        <img
          src="/tf2.png" // desde public se carga así
          alt="Logo"
          style={sidebarStyles.sidebarLogo}
        />
      </div>

      {modules.map((item) => {

        // Aquí definimos si este item es activo
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            style={{ textDecoration: "none" }}
            onClick={onLinkClick}
          >
            <div
              style={{
                ...sidebarStyles.navItem,
                ...(isActive ? sidebarStyles.navItemActive : {}),
              }}
            >
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