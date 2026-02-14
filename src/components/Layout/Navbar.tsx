import React, { useEffect, useState } from "react";
import { layoutStyles } from "./layout.styles";

interface StoredUser {
  id?: number;
  name?: string;
  email?: string;
}

const Navbar: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser({ name: storedUser }); // por si lo guardaste como string plano
      }
    }
  }, []);

  const displayName = user?.name || user?.email || "Usuario";

  return (
    <header style={layoutStyles.navbar}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <button
          onClick={onMenuClick}
          style={{
            display: "block",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            color: "#000",
            background: "transparent",
          }}
          className="mobile-menu-btn"
        >
          ☰
        </button>

        <h3 style={{ marginLeft: "10px" }}>Dashboard de Indicadores</h3>
      </div>

      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        <span style={{ fontWeight: 500 }}>{displayName}</span>

        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            displayName
          )}&background=1e3a8a&color=fff`}
          alt="avatar"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
          }}
        />
      </div>
    </header>
  );
};

export default Navbar;