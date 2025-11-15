import type { CSSProperties } from "react";

export const layoutStyles = {
  container: {
    display: "flex",
    height: "100vh",
    width: "100%",
    background: "rgba(29, 25, 25, 1)",
    overflow: "hidden",
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
    flex: 1,
    // marginLeft: "240px",
  },

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

};