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
    { label: "Active Employees", value: "152", icon: "bi-person-check", color: "#10b981", bg: "#ecfdf5" },
    { label: "Total Departments", value: "6", icon: "bi-building", color: "#f59e0b", bg: "#fffbeb" },
    { label: "New This Month", value: "12", icon: "bi-person-plus", color: "#8b5cf6", bg: "#f5f3ff" },
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

  const recentActivities = [
    { id: 1, empName: "John Doe", action: "was added as a new employee", dept: "Engineering", date: new Date(Date.now() - 3600000), icon: "bi-person-plus-fill", color: "var(--success)", bg: "#ecfdf5" },
    { id: 2, empName: "Jane Smith", action: "updated department details", dept: "Marketing", date: new Date(Date.now() - 7200000), icon: "bi-building-gear", color: "var(--warning)", bg: "#fffbeb" },
    { id: 3, empName: "Rajesh Kumar", action: "uploaded a new document", dept: "Engineering", date: new Date(Date.now() - 86400000), icon: "bi-file-earmark-arrow-up-fill", color: "var(--primary)", bg: "#eff6ff" },
    { id: 4, empName: "Anita Desai", action: "profile information updated", dept: "Sales", date: new Date(Date.now() - 172800000), icon: "bi-person-gear", color: "#0dcaf0", bg: "#e0f8fd" },
    { id: 5, empName: "Sunil Verma", action: "created a new department", dept: "AI Research", date: new Date(Date.now() - 259200000), icon: "bi-building-add", color: "#8b5cf6", bg: "#f5f3ff" },
    { id: 6, empName: "Neha Gupta", action: "approved a leave request", dept: "Design", date: new Date(Date.now() - 345600000), icon: "bi-check-circle-fill", color: "var(--success)", bg: "#ecfdf5" },
  ];

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 86400;
    if (interval >= 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + " mins ago";
    return "Just now";
  };

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
          </div>

          <div className="row g-3 mb-4">
            {stats.map((s) => (
              <div key={s.label} className="col-xl-3 col-md-6">
                <div className="stat-card card-dashboard d-flex align-items-center gap-3 h-100" style={{ background: s.bg }}>
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

          <div className="row g-4 mb-4">
            <div className="col-lg-6 d-flex">
              <div className="card-dashboard p-4 h-100 w-100 d-flex flex-column">
                <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)" }}>
                  <i className="bi bi-building me-2" style={{ color: "var(--primary)" }} />
                  Departments
                </h5>
                <div className="table-responsive flex-grow-1">
                  <table className="table-custom table mb-0">
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Head</th>
                        <th className="text-end">Employees</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.slice(0, 5).map((d, i) => (
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

            <div className="col-lg-6 d-flex">
              <div className="card-dashboard p-4 h-100 w-100 d-flex flex-column">
                <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)" }}>
                  <i className="bi bi-person-plus me-2" style={{ color: "var(--success)" }} />
                  Recently Added Employees
                </h5>
                <div className="table-responsive flex-grow-1">
                  <table className="table-custom table mb-0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>ID</th>
                        <th>Dept</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.slice(0, 5).map((u, i) => (
                        <tr key={i}>
                          <td className="fw-semibold">{u.name}</td>
                          <td style={{ color: "var(--primary)", fontWeight: 600 }}>{u.id}</td>
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
                <div className="mt-3 pt-2">
                  <button className="btn-custom-primary w-100 d-flex align-items-center justify-content-center gap-2" onClick={() => navigate("/employees")}>
                    <i className="bi bi-person-lines-fill" /> View All Employees
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-lg-4 d-flex">
              <div className="card-dashboard p-4 h-100 w-100 d-flex flex-column">
                <h5 className="fw-bold mb-4" style={{ color: "var(--gray-800)" }}>
                  <i className="bi bi-pie-chart me-2" style={{ color: "var(--primary)" }} />
                  Organization Summary
                </h5>
                <div className="d-flex flex-column gap-3 flex-grow-1 justify-content-center">
                  <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ background: "var(--gray-50)" }}>
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-success opacity-75" style={{ width: "8px", height: "8px" }}></div>
                      <span className="text-dark fw-medium small">Active Employees</span>
                    </div>
                    <span className="fw-bold text-dark">152</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ background: "var(--gray-50)" }}>
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-danger opacity-75" style={{ width: "8px", height: "8px" }}></div>
                      <span className="text-dark fw-medium small">Inactive Employees</span>
                    </div>
                    <span className="fw-bold text-dark">4</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ background: "var(--gray-50)" }}>
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-warning opacity-75" style={{ width: "8px", height: "8px" }}></div>
                      <span className="text-dark fw-medium small">Total Departments</span>
                    </div>
                    <span className="fw-bold text-dark">6</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center p-3 rounded-3 bg-light border">
                    <span className="text-muted fw-medium small">Total Documents</span>
                    <span className="fw-bold text-primary">1,245</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-8 d-flex">
              <div className="card-dashboard p-4 pb-3 h-100 w-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0" style={{ color: "var(--gray-800)" }}>
                    <i className="bi bi-clock-history me-2" style={{ color: "var(--secondary)" }} />
                    Recent Activities
                  </h5>
                  <a href="#" className="text-primary text-decoration-none small fw-medium" onClick={(e) => e.preventDefault()}>
                    View All Activities <i className="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
                <div className="d-flex flex-column flex-grow-1 justify-content-between">
                  {recentActivities.slice(0, 6).map((activity, index, arr) => (
                    <div key={activity.id} className={`d-flex align-items-center gap-3 py-3 ${index !== arr.length - 1 ? 'border-bottom' : ''}`} style={{ minHeight: "76px" }}>
                      <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "42px", height: "42px", color: activity.color, background: activity.bg }}>
                        <i className={`bi ${activity.icon}`} style={{ fontSize: "1.2rem" }} />
                      </div>
                      <div className="flex-grow-1 d-flex flex-column justify-content-center">
                        <div className="text-dark d-flex align-items-center flex-wrap gap-2 mb-1" style={{ fontSize: "0.95rem", lineHeight: 1.2 }}>
                          <span className="fw-bold">{activity.empName}</span> 
                          <span className="text-muted">{activity.action}</span>
                          {activity.dept && <span className="badge bg-light text-secondary border px-2 py-1 ms-1" style={{ fontSize: "0.7rem", fontWeight: 600 }}>{activity.dept}</span>}
                        </div>
                        <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: "0.78rem" }}>
                          <i className="bi bi-clock"></i> {timeAgo(activity.date)}
                        </div>
                      </div>
                    </div>
                  ))}
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
