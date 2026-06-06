import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivateRoute } from "../ui/PrivateRoute";
import Layout from "../components/Layout/Layout";
import Dashboard from "../features/dashboard/Pages/Dashboard";
import Certificates from "../features/certificates/Pages/Certificates";
import Invoices from "../pages/Invoices";
import Login from "../pages/Login";
import Logout from "../pages/Logout";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/certificates"
            element={
              <PrivateRoute>
                <Certificates />
              </PrivateRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <PrivateRoute>
                <Invoices />
              </PrivateRoute>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
