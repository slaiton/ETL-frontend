import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import Dashboard from "../pages/Dashboard";
import Certificates from "../pages/Certificates";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/certificates" element={<Certificates />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}