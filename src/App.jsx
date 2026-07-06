import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Leave from "./pages/Leave";
import EmployeeManagement from "./pages/EmployeeManagement";
import ExpenseManagement from "./pages/ExpenseManagement";
import DocumentManagement from "./pages/DocumentManagement";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />

      <Route path="/login/:role" element={<Login />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/leave" element={<Leave />} />
      <Route path="/employees" element={<EmployeeManagement />} />
      <Route path="/expenses" element={<ExpenseManagement />} />
      <Route path="/documents" element={<DocumentManagement />} />

      <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
      <Route path="/manager-dashboard" element={<ManagerDashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />

    </Routes>
  );
}

export default App;