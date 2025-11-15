import React from "react";
import { layoutStyles } from "./layout.styles";

const Footer: React.FC = () => {
  return (
    <footer style={layoutStyles.footer}>
      <p style={layoutStyles.footerText}>
        © {new Date().getFullYear()} Tecnologia Funcional — Todos los derechos reservados.
      </p>
    </footer>
  );
};

export default Footer;