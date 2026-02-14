import React, { useContext, useEffect, useRef, useState } from "react";
import { layoutStyles } from "./layout.styles";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { AuthContext } from "../../shared/context/AuthContext";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useContext(AuthContext) || {};

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);
  return (
    <div style={layoutStyles.container}>
      {isAuthenticated && (      
      <Sidebar open={sidebarOpen} onLinkClick={() => setSidebarOpen(false)} />
      )}

      <div style={layoutStyles.main}>
        {isAuthenticated && (
          <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        )}
        <div style={layoutStyles.content}>{children}</div>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;