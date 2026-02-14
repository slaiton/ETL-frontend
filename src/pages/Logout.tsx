import { useEffect } from "react";
import { logout } from "../api/auth";

const Logout = () => {
  useEffect(() => {
    logout();
  }, []);

  return <p>Cerrando sesión...</p>; 
};

export default Logout;