import React from "react";
import { layoutStyles } from "./layout.styles";

const Navbar: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    return (
        <header style={layoutStyles.navbar}>

            <button
                onClick={onMenuClick}
                style={{
                    display: "none",
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
            <div>      <h3>Dashboard de Indicadores</h3>
            </div>

            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <span>Usuario</span>
                <img
                    src="https://ui-avatars.com/api/?name=User"
                    style={{ width: "32px", borderRadius: "50%" }}
                />
            </div>


        </header>
    );
};

export default Navbar;