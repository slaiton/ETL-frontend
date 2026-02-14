import React, { useEffect, useRef, useState } from "react";
import { layoutStyles } from "./layout.styles";

interface StoredUser {
  id?: number;
  name?: string;
  email?: string;
}

const Navbar: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser({ name: storedUser });
      }
    }
  }, []);

  // cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.name || user?.email || "Usuario";

  return (
    <header style={layoutStyles.navbar}>
      <button
        onClick={onMenuClick}
        style={{
          padding: "8px 12px",
          borderRadius: "6px",
          border: "none",
          fontSize: "20px",
          cursor: "pointer",
          background: "transparent",
        }}
        className="mobile-menu-btn"
      >
        ☰
      </button>

      <div
        ref={dropdownRef}
        style={{ position: "relative" }}
      >
        <img
          onClick={() => setOpen(!open)}
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            displayName
          )}&background=1e3a8a&color=fff`}
          alt="avatar"
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            cursor: "pointer",
          }}
        />

        {open && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "48px",
              background: "#fff",
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              borderRadius: "10px",
              padding: "12px",
              minWidth: "180px",
              zIndex: 100,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                marginBottom: "8px",
                wordBreak: "break-word",
              }}
            >
              {displayName}
            </div>

            <button
              style={{
                width: "100%",
                padding: "8px",
                border: "none",
                background: "#f3f4f6",
                borderRadius: "6px",
                cursor: "pointer",
              }}
              onClick={() => {
                localStorage.removeItem("user");
                window.location.href = "/logout";
              }}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;