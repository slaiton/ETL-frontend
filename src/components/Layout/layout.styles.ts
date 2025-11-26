import type { CSSProperties } from "react";

export const layoutStyles = {
   container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    minHeight: "100vh",
    background: "#111827",
  } as CSSProperties,


  main: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    width: "100%",
  } as CSSProperties,
  navbar: {
    height: "60px",
    background: "white",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
      alignItems: "center",
    padding: "0 20px",
    color: "#000"
  },

  content: {
    padding: "20px",
    overflowY: "auto",
  } as CSSProperties,

  footer: {
    marginTop: "auto",
    padding: "15px 20px",
    background: "#1f2937",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    textAlign: "center",
  } as CSSProperties,

  footerText: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#9ca3af",
  },

  sidebarLogoContainer: {
  width: "100%",
  padding: "20px 0",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderBottom: "1px solid #2a2a33",
  
  marginBottom: "10px",
} as CSSProperties,

sidebarLogo: {
  width: "120px",  // Ajusta tamaño
  objectFit: "contain",
  borderRadius: "25px",
} as CSSProperties,

};

export const sidebarStyles = {
    sidebar: {
    width: "250px",
    height: "100vh",
    background: "linear-gradient(180deg, #223245 0%, #0a203aff 100%)",
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 100,
    overflowY: "auto",
    paddingTop: "10px",
    boxShadow: "2px 0 10px rgba(0,0,0,0.4)",
    transition: "transform 0.3s ease",
  }  as CSSProperties,

  sidebarLogoContainer: {
    width: "100%",
    padding: "25px 0",
    display: "flex",
    justifyContent: "center",
    borderBottom: "1px solid #2a2a33",
    marginBottom: "10px",
  }  as CSSProperties,

  sidebarLogo: {
    width: "130px",
    objectFit: "contain",
    borderRadius: "30px",
    opacity: 0.9,
  }  as CSSProperties,

  menuContainer: {
    display: "flex",
    flexDirection: "column",
    padding: "10px 0",
  }  as CSSProperties,

  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 20px",
    margin: "4px 12px",
    borderRadius: "8px",
    color: "#d0d0d7",
    cursor: "pointer",
    transition: "all 0.25s ease",
    fontSize: "15px",
  }  as CSSProperties,

  navItemActive: {
    background: "#27272f",
    color: "#ffffff",
    fontWeight: 600,
    boxShadow: "inset 0 0 8px rgba(255,255,255,0.1)",
  }  as CSSProperties,

  navIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.8,
  }  as CSSProperties,

  navItemHover: {
    background: "#1e1e25",
  }  as CSSProperties,
}