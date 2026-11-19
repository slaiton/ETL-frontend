import React, { useCallback, useContext, useEffect, useState } from "react";
import { layoutStyles } from "./layout.styles";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { AuthContext } from "../../shared/context/AuthContext";
import "./Layout.css";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useContext(AuthContext) || {};

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  /* Con el sidebar abierto: Escape lo cierra y se bloquea el scroll del fondo */
  useEffect(() => {
    if (!sidebarOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    const prevOverflow = document.body.style.overflow;

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [sidebarOpen]);

  return (
    <div style={layoutStyles.container}>
      {isAuthenticated && (
        <>
          {/* Clic fuera del sidebar (sobre el fondo) lo cierra */}
          <div
            className={`sidebar-backdrop${sidebarOpen ? " is-open" : ""}`}
            onClick={closeSidebar}
            aria-hidden="true"
          />
          <Sidebar open={sidebarOpen} onClose={closeSidebar} />
        </>
      )}

      <div style={layoutStyles.main}>
        {isAuthenticated && (
          <Navbar
            sidebarOpen={sidebarOpen}
            onMenuClick={() => setSidebarOpen((v) => !v)}
          />
        )}
        <div style={layoutStyles.content}>{children}</div>
        {/* El login trae su propio pie; el footer solo va dentro de la app */}
        {isAuthenticated && <Footer />}
      </div>
    </div>
  );
};

export default Layout;
