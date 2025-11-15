import React, { useState } from "react";
import { layoutStyles } from "./layout.styles";
// import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div style={layoutStyles.container}>
      {/* <Sidebar open={sidebarOpen} /> */}
      <div style={layoutStyles.main}>
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div style={layoutStyles.content}>{children}</div>
        <Footer/>
      </div>
    </div>
  );
};

export default Layout;