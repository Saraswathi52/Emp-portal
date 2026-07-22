import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Users, UserCheck, Calendar, DollarSign, UserPlus, Building, CheckCircle, FileText, Bell, Clock, Eye, Activity, UserMinus, UserX } from "lucide-react";

function Monitor() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const metrics = [
    { label: "Total Employees", value: "124", status: "+12 this month", icon: Users, color: "#3b82f6", bg: "#eff6ff" },
    { label: "Active Employees", value: "118", status: "95% active rate", icon: UserCheck, color: "#10b981", bg: "#ecfdf5" },
    { label: "Pending Leave Requests", value: "8", status: "Requires action", icon: Calendar, color: "#f59e0b", bg: "#fffbeb" },
    { label: "Pending Expense Claims", value: "15", status: "$2,450 total", icon: DollarSign, color: "#8b5cf6", bg: "#f3e8ff" },
  ];

  const recentActivities = [
    { id: "ACT-001", action: "Employee Added", description: "John Doe was added to Software Development", time: "10 mins ago", icon: UserPlus, color: "#3b82f6", bg: "#eff6ff" },
    { id: "ACT-002", action: "Leave Approved", description: "Alice Smith's sick leave approved by HR", time: "1 hour ago", icon: CheckCircle, color: "#10b981", bg: "#ecfdf5" },
    { id: "ACT-003", action: "Expense Submitted", description: "Michael Johnson submitted travel expense", time: "2 hours ago", icon: FileText, color: "#f59e0b", bg: "#fffbeb" },
    { id: "ACT-004", action: "Department Created", description: "New 'Data Science' department created", time: "5 hours ago", icon: Building, color: "#8b5cf6", bg: "#f3e8ff" },
    { id: "ACT-005", action: "Employee Updated", description: "Sophia Williams updated contact info", time: "1 day ago", icon: UserCheck, color: "#3b82f6", bg: "#eff6ff" },
    { id: "ACT-006", action: "Expense Approved", description: "David Brown's equipment expense approved", time: "1 day ago", icon: DollarSign, color: "#10b981", bg: "#ecfdf5" },
  ];

  const pendingRequests = [
    { id: "REQ-001", type: "Pending Leave Requests", user: "John Doe", date: "Oct 24 - Oct 26", status: "Pending" },
    { id: "REQ-002", type: "Pending Expense Claims", user: "Alice Smith", date: "$450.00 (Travel)", status: "Pending" },
    { id: "REQ-003", type: "Pending Leave Requests", user: "David Brown", date: "Nov 01 - Nov 05", status: "Pending" },
    { id: "REQ-004", type: "Pending Expense Claims", user: "Michael Johnson", date: "$120.00 (Meals)", status: "Pending" },
  ];

  return (
    <div className="dashboard-wrapper">
      <Sidebar role={user?.role?.toLowerCase() || "admin"} onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} />
      <div className="main-content">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="page-content">
          <div className="section-header">
            <div>
              <h4>Monitor Application</h4>
              <p>Overview of employees, requests, and recent activities</p>
            </div>
          </div>

          <div className="row g-3 mb-4">
            {metrics.map((m, index) => (
              <div key={index} className="col-xl-3 col-md-6">
                <div className="stat-card card-dashboard d-flex align-items-center gap-3 h-100" style={{ background: m.bg, border: "none" }}>
                  <div className="stat-icon" style={{ background: m.color, width: 44, height: 44, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", color: "#fff" }}>
                    <m.icon size={22} />
                  </div>
                  <div>
                    <h3 className="mb-0 fw-bold" style={{ fontSize: "1.25rem", color: "var(--gray-800)" }}>{m.value}</h3>
                    <div className="text-muted" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{m.label}</div>
                    <div style={{ fontSize: "0.75rem", color: m.color, marginTop: "2px", fontWeight: 500 }}>{m.status}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4 mb-4">
            <div className="col-lg-8">
              <div className="card-dashboard p-4 h-100">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "var(--gray-800)" }}>
                  <Activity size={20} color="var(--primary)" />
                  Recent Activities
                </h5>
                <div className="table-responsive">
                  <table className="table-custom table mb-0">
                    <thead>
                      <tr>
                        <th>Activity</th>
                        <th>Description</th>
                        <th className="text-end">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivities.map((act) => (
                        <tr key={act.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div style={{ background: act.bg, color: act.color, padding: "6px", borderRadius: "8px", display: "flex" }}>
                                <act.icon size={16} />
                              </div>
                              <span className="fw-semibold">{act.action}</span>
                            </div>
                          </td>
                          <td className="text-muted small">{act.description}</td>
                          <td className="text-end text-muted small"><Clock size={12} className="me-1" />{act.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card-dashboard p-4 h-100">
                <h5 className="fw-bold mb-4" style={{ color: "var(--gray-800)" }}>Employee Status</h5>
                
                <div className="d-flex flex-column gap-3">
                  {[
                    { name: "Active Employees", count: "118", color: "#10b981", icon: UserCheck },
                    { name: "Employees On Leave", count: "4", color: "#f59e0b", icon: UserMinus },
                    { name: "Inactive Employees", count: "2", color: "#ef4444", icon: UserX },
                  ].map((status, i) => (
                    <div key={i} className="d-flex align-items-center justify-content-between p-3 rounded" style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)" }}>
                      <div className="d-flex align-items-center gap-2">
                        <status.icon size={16} color={status.color} />
                        <span className="fw-semibold text-dark" style={{ fontSize: "0.85rem" }}>{status.name}</span>
                      </div>
                      <span className="badge" style={{ background: `${status.color}20`, color: status.color, border: `1px solid ${status.color}40`, padding: "4px 8px" }}>
                        {status.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-7">
              <div className="card-dashboard p-4 h-100">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "var(--gray-800)" }}>
                  <Clock size={20} color="var(--primary)" />
                  Pending Requests
                </h5>
                <div className="table-responsive">
                  <table className="table-custom table mb-0">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Employee</th>
                        <th>Details</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingRequests.map((req) => (
                        <tr key={req.id}>
                          <td>
                            <span className={`badge-status ${req.type === 'Pending Leave Requests' ? 'badge-pending' : 'badge-approved'}`}>
                              {req.type}
                            </span>
                          </td>
                          <td className="fw-semibold">{req.user}</td>
                          <td className="text-muted small">{req.date}</td>
                          <td className="text-end">
                            <button className="btn btn-sm btn-light d-inline-flex align-items-center gap-1" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                              <Eye size={12} /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card-dashboard p-4 h-100">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "var(--gray-800)" }}>
                  <Bell size={20} color="var(--primary)" />
                  Recent Notifications
                </h5>
                <div className="d-flex flex-column gap-3">
                  {[
                    { title: "Employee Added", desc: "John Doe joined Software Development.", time: "Today, 9:00 AM", color: "#3b82f6" },
                    { title: "New Department", desc: "Data Science department is now active.", time: "Yesterday, 2:30 PM", color: "#8b5cf6" },
                    { title: "Leave Approved", desc: "Alice Smith's sick leave was approved.", time: "Yesterday, 1:15 PM", color: "#10b981" },
                    { title: "Expense Submitted", desc: "Michael Johnson submitted an expense claim.", time: "Oct 20, 10:15 AM", color: "#f59e0b" },
                  ].map((notif, i) => (
                    <div key={i} className="d-flex gap-3 pb-3" style={{ borderBottom: i !== 3 ? "1px solid var(--gray-200)" : "none" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: notif.color, marginTop: "6px", flexShrink: 0 }}></div>
                      <div>
                        <div className="fw-bold" style={{ fontSize: "0.85rem", color: "var(--gray-800)" }}>{notif.title}</div>
                        <div className="text-muted" style={{ fontSize: "0.75rem", marginBottom: "4px" }}>{notif.desc}</div>
                        <div className="text-muted" style={{ fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={10} /> {notif.time}
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

export default Monitor;
