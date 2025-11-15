import type { CSSProperties } from "react";

export const layoutStyles = {
   container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    minHeight: "100vh",
    background: "#111827",
  } as CSSProperties,

  sidebar: {
    width: "240px",
    background: "#ffffffff",
    color: "white",
    padding: "20px 15px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    position: "fixed",
    left: 0,
    top: 0,
    height: "100%",
    transition: "transform .3s ease",
    zIndex: 20,
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

  navItem: {
    padding: "12px 15px",
    borderRadius: "8px",
    cursor: "pointer",
    background: "rgba(255,255,255,0.05)",
    transition: "0.15s",
  } as CSSProperties,

  navItemHover: {
    background: "rgba(255,255,255,0.15)",
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

};