import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, House, LogOut, Menu } from "lucide-react";
import BrandLogo from "../../shared/brand/BrandLogo";
import { useAuth } from "../../shared/context/AuthContext";
import { getFullName, getInitials } from "../../shared/utils/userProfile";

interface NavbarProps {
  onMenuClick: () => void;
  sidebarOpen?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, sidebarOpen = false }) => {
  const { user, homePage } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú de usuario con clic afuera o Escape
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const fullName = getFullName(user);
  const initials = getInitials(user);
  const roleName = user?.role_name;

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          type="button"
          className="icon-btn"
          onClick={onMenuClick}
          aria-label="Abrir menú"
          aria-expanded={sidebarOpen}
        >
          <Menu size={22} />
        </button>
        <Link to={homePage} className="topbar__brand" aria-label="Ir al inicio">
          <BrandLogo tone="onLight" height={36} />
        </Link>
      </div>

      <div ref={menuRef} className="user-menu">
        <button
          type="button"
          className="user-chip"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`Menú de usuario: ${fullName}`}
        >
          <span className="avatar">{initials}</span>
          <span className="user-chip__text">
            <span className="user-chip__name">{fullName}</span>
            {roleName && <span className="user-chip__role">{roleName}</span>}
          </span>
          <ChevronDown size={16} className="user-chip__chevron" />
        </button>

        {open && (
          <div className="user-dropdown" role="menu">
            <div className="user-dropdown__header">
              <span className="avatar avatar--lg">{initials}</span>
              <div className="user-dropdown__identity">
                <div className="user-dropdown__name">{fullName}</div>
                {user?.email && user.email !== fullName && (
                  <div className="user-dropdown__email">{user.email}</div>
                )}
                {roleName && <span className="role-badge">{roleName}</span>}
              </div>
            </div>
            <div className="user-dropdown__actions">
              <Link to="/home" className="menu-item" role="menuitem" onClick={() => setOpen(false)}>
                <House size={16} /> Inicio
              </Link>
              <Link to="/logout" className="menu-item menu-item--danger" role="menuitem">
                <LogOut size={16} /> Cerrar sesión
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
