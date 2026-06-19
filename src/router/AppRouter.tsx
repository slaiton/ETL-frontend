import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivateRoute } from "../ui/PrivateRoute";
import Layout from "../components/Layout/Layout";
import Dashboard from "../features/dashboard/Pages/Dashboard";
import Certificates from "../features/certificates/Pages/Certificates";
import UsersPage from "../features/users/Pages/Users";
import RolesPage from "../features/roles/Pages/Roles";
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

          <Route path="/" element={
            <PrivateRoute module="dashboard"><Dashboard /></PrivateRoute>
          } />
          <Route path="/certificates" element={
            <PrivateRoute module="certificates"><Certificates /></PrivateRoute>
          } />
          <Route path="/invoices" element={
            <PrivateRoute module="invoices"><Invoices /></PrivateRoute>
          } />
          <Route path="/users" element={
            <PrivateRoute module="users"><UsersPage /></PrivateRoute>
          } />
          <Route path="/roles" element={
            <PrivateRoute module="roles"><RolesPage /></PrivateRoute>
          } />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
