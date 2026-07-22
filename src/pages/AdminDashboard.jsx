import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Users, UserCheck, Building, UserPlus } from "lucide-react";
import { getAdminEmployees, getAdminDepartments } from "../services/dataService";

function AdminDashboard() {
  const navigate = useNavigate();
  const [user] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [metrics, setMetrics] = useState({ totalEmps: 0, activeEmps: 0, totalDepts: 0, newEmps: 0 });
  const [departments, setDepartments] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const emps = await getAdminEmployees();
        const deptsData = await getAdminDepartments();
        
        const active = emps.filter(e => {
            const s = e.Status?.S || e.status?.S || e.Status || e.status;
            return s !== "Inactive";
        }).length;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const newEmps = emps.filter(e => {
            const joinDateStr = e.JoiningDate?.S || e.joiningDate?.S || e.JoiningDate || e.joiningDate;
            if (!joinDateStr) return false;
            const jd = new Date(joinDateStr);
            return jd.getMonth() === currentMonth && jd.getFullYear() === currentYear;
        }).length;
        
        const fallbackDepts = Array.from(new Set(emps.map(e => e.Department?.S || e.Department || e.department?.S || e.department))).filter(d => d && d !== "-");
        
        setMetrics({
          totalEmps: emps.length,
          activeEmps: active,
          totalDepts: deptsData.length > 0 ? deptsData.length : fallbackDepts.length,
          newEmps: newEmps
        });

        const formattedDepts = deptsData.length > 0 
          ? deptsData.map(d => ({
              name: d.Name || d.name || d.id,
              head: d.Head || d.head || d.Manager || "Not Assigned",
              count: d.EmployeeCount || d.employees || 0
            }))
          : fallbackDepts.map(d => ({
              name: d,
              head: "Not Assigned",
              count: emps.filter(e => {
                 const dep = e.Department?.S || e.Department || e.department?.S || e.department;
                 return dep === d;
              }).length
          }));
        setDepartments(formattedDepts);

        const sortedEmps = [...emps].sort((a, b) => {
            const d1Str = a.JoiningDate?.S || a.JoiningDate || a.joiningDate?.S || a.joiningDate || 0;
            const d2Str = b.JoiningDate?.S || b.JoiningDate || b.joiningDate?.S || b.joiningDate || 0;
            return new Date(d2Str) - new Date(d1Str);
        });
        
        setRecentUsers(sortedEmps.slice(0, 5).map(e => ({
            id: e.empid?.S || e.empid || e.id?.S || e.id,
            name: e.FullName?.S || e.FullName || e.name?.S || e.name,
            dept: e.Department?.S || e.Department || e.department?.S || e.department || "-",
            joined: e.JoiningDate?.S || e.JoiningDate || e.joiningDate?.S || e.joiningDate || "Recently"
        })));

        setRecentActivities(sortedEmps.slice(0, 6).map((e, index) => ({
            id: index + 1,
            empName: e.FullName?.S || e.FullName || e.name?.S || e.name,
            action: "was added as a new employee",
            dept: e.Department?.S || e.Department || e.department?.S || e.department || "-",
            date: new Date(e.JoiningDate?.S || e.JoiningDate || e.joiningDate?.S || e.joiningDate || Date.now() - index * 3600000),
            icon: "bi-person-plus-fill",
            color: "var(--success)",
            bg: "#ecfdf5"
        })));

      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    }
    loadData();
  }, []);

  const stats = [
    { label: "Total Employees", value: metrics.totalEmps, icon: Users, color: "#3b82f6", bg: "#eff6ff" },
    { label: "Active Employees", value: metrics.activeEmps, icon: UserCheck, color: "#10b981", bg: "#ecfdf5" },
    { label: "Total Departments", value: metrics.totalDepts, icon: Building, color: "#f59e0b", bg: "#fffbeb" },
    { label: "New This Month", value: metrics.newEmps, icon: UserPlus, color: "#8b5cf6", bg: "#f5f3ff" },
  ];

  const timeAgo = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Recently";
    const seconds = Math.floor((new Date() - d) / 1000);
    if (seconds < 60) return "Just now";
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
          <div className="section-header mb-5">
            <div className="text-start">
              <h3 className="fw-bold mb-1" style={{ color: "var(--gray-900)" }}>Admin Dashboard</h3>
              <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
                Manage employees, departments, reports, and monitor overall system activity.
              </p>
            </div>
          </div>

          <div className="row g-3 mb-4">
            {stats.map((s) => (
              <div key={s.label} className="col-xl-3 col-md-6">
                <div className="stat-card card-dashboard d-flex align-items-center gap-3 h-100" style={{ background: s.bg }}>
                  <div className="stat-icon" style={{ background: s.color, width: 44, height: 44, margin: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <s.icon size={22} color="#fff" />
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
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0" style={{ color: "var(--gray-800)" }}>
                    <i className="bi bi-clock-history me-2" style={{ color: "var(--secondary)" }} />
                    Recent Activities
                  </h5>
                  <a href="#" className="text-primary text-decoration-none small fw-medium" onClick={(e) => e.preventDefault()}>
                    View All <i className="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
                <div className="d-flex flex-column flex-grow-1 justify-content-between">
                  {recentActivities.slice(0, 5).map((activity, index, arr) => (
                    <div key={activity.id} className={`d-flex align-items-center gap-3 py-2 ${index !== arr.length - 1 ? 'border-bottom' : ''}`} style={{ minHeight: "60px" }}>
                      <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "36px", height: "36px", color: activity.color, background: activity.bg }}>
                        <i className={`bi ${activity.icon}`} style={{ fontSize: "1.1rem" }} />
                      </div>
                      <div className="flex-grow-1 d-flex flex-column justify-content-center">
                        <div className="text-dark d-flex align-items-center flex-wrap gap-2 mb-1" style={{ fontSize: "0.9rem", lineHeight: 1.2 }}>
                          <span className="fw-bold">{activity.empName}</span> 
                          <span className="text-muted">{activity.action}</span>
                          {activity.dept && <span className="badge bg-light text-secondary border px-2 py-1 ms-1" style={{ fontSize: "0.65rem", fontWeight: 600 }}>{activity.dept}</span>}
                        </div>
                        <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: "0.75rem" }}>
                          <i className="bi bi-clock"></i> {timeAgo(activity.date)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-lg-12 d-flex">
              <div className="card-dashboard p-4 h-100 w-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0" style={{ color: "var(--gray-800)" }}>
                    <i className="bi bi-person-plus me-2" style={{ color: "var(--success)" }} />
                    Recently Added Employees
                  </h5>
                </div>
                <div className="table-responsive flex-grow-1">
                  <table className="table-custom table mb-0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Employee ID</th>
                        <th>Department</th>
                        <th>Joining Date</th>
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
                <div className="mt-4 text-center">
                  <button className="btn-custom-primary d-inline-flex align-items-center justify-content-center gap-2" style={{ minWidth: "200px" }} onClick={() => navigate("/employees")}>
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
