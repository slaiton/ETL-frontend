import React from "react";
import { layoutStyles } from "./layout.styles";
import { Link } from "react-router-dom";

const modules = [
  { label: "Dashboard", path: "/" },
];

const Sidebar: React.FC<{ open?: boolean }> = ({ open = false }) => {
  const sidebarDynamic = {
    ...layoutStyles.sidebar,
    transform: open ? "translateX(0)" : "translateX(-100%)",
  };

  return (
    <aside style={sidebarDynamic}>
      {modules.map((item) => (
        <Link key={item.path} to={item.path} style={{ textDecoration: "none" }}>
          <div style={layoutStyles.navItem}>{item.label}</div>
        </Link>
      ))}
    </aside>
  );
};

export default Sidebar;