import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function AdminDashboard() {
  const navigate = useNavigate();
  const [user] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = [
    { label: "Total Employees", value: "156", icon: "bi-people", color: "#3b82f6", bg: "#eff6ff" },
    { label: "Active Today", value: "142", icon: "bi-person-check", color: "#10b981", bg: "#ecfdf5" },
    { label: "On Leave", value: "8", icon: "bi-calendar-x", color: "#f59e0b", bg: "#fffbeb" },
    { label: "Open Positions", value: "12", icon: "bi-briefcase", color: "#ef4444", bg: "#fef2f2" },
  ];

  const departments = [
    { name: "Engineering", head: "Rajesh Kumar", count: 45 },
    { name: "Design", head: "Neha Gupta", count: 18 },
    { name: "Marketing", head: "Vikram Singh", count: 22 },
    { name: "Sales", head: "Anita Desai", count: 30 },
    { name: "HR", head: "Sunil Verma", count: 12 },
    { name: "Finance", head: "Deepak Joshi", count: 15 },
  ];

  const recentUsers = [
    { id: "EMP0156", name: "New User", dept: "Engineering", joined: "Today" },
    { id: "EMP0155", name: "Test Account", dept: "QA", joined: "Yesterday" },
    { id: "EMP0154", name: "John Doe", dept: "Marketing", joined: "2 days ago" },
  ];

  return (
    <div className="dashboard-wrapper">
        <Sidebar role="admin" onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} />
      <div className="main-content">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="page-content">
          <div className="section-header">
            <div>
              <h4>Welcome, {user?.name || "Admin"}!</h4>
              <p>Admin Dashboard</p>
            </div>
            <button className="btn-custom-primary d-flex align-items-center gap-2" onClick={() => navigate("/employees")}>
              <i className="bi bi-gear" /> Manage Employees
            </button>
          </div>

          <div className="row g-3 mb-4">
            {stats.map((s) => (
              <div key={s.label} className="col-xl-3 col-md-6">
                <div className="stat-card card-dashboard d-flex align-items-center gap-3" style={{ background: s.bg }}>
                  <div className="stat-icon" style={{ background: s.color, width: 44, height: 44, fontSize: "1.2rem", margin: 0 }}>
                    <i className={`bi ${s.icon}`} />
                  </div>
                  <div>
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value" style={{ color: s.color, fontSize: "1.5rem" }}>{s.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card-dashboard p-4">
                <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)" }}>
                  <i className="bi bi-building me-2" style={{ color: "var(--primary)" }} />
                  Departments
                </h5>
                <div className="table-responsive">
                  <table className="table-custom table">
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Head</th>
                        <th className="text-end">Employees</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map((d, i) => (
                        <tr key={i}>
                          <td className="fw-semibold">{d.name}</td>
                          <td>{d.head}</td>
                          <td className="text-end">
                            <span className="badge-status badge-pending">{d.count}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card-dashboard p-4">
                <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)" }}>
                  <i className="bi bi-person-plus me-2" style={{ color: "var(--success)" }} />
                  Recent Users
                </h5>
                <div className="table-responsive">
                  <table className="table-custom table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Dept</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((u, i) => (
                        <tr key={i}>
                          <td style={{ color: "var(--primary)", fontWeight: 600 }}>{u.id}</td>
                          <td className="fw-semibold">{u.name}</td>
                          <td>{u.dept}</td>
                          <td>
                            <span className={`badge-status ${u.joined === "Today" ? "badge-approved" : "badge-pending"}`}>
                              {u.joined}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3">
                  <button className="btn-custom-primary d-flex align-items-center gap-2" onClick={() => navigate("/employees")}>
                    <i className="bi bi-person-lines-fill" /> View All Employees
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
