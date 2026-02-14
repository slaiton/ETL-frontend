import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivateRoute } from "../ui/PrivateRoute";
import Layout from "../components/Layout/Layout";
import Dashboard from "../pages/Dashboard";
import Certificates from "../pages/Certificates";
import Login from "../pages/Login";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
             />
          <Route path="/login" element={<Login />} />
          <Route path="/certificates" element={
            <PrivateRoute>
              <Certificates />
            </PrivateRoute>
            } />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}