import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Activity, Server, Database, Cloud, AlertTriangle, CheckCircle, Clock } from "lucide-react";

function Monitor() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const metrics = [
    { label: "System Health", value: "99.9%", status: "Optimal", icon: Activity, color: "#10b981", bg: "#ecfdf5" },
    { label: "API Gateway", value: "42ms", status: "Avg Latency", icon: Cloud, color: "#3b82f6", bg: "#eff6ff" },
    { label: "Lambda Functions", value: "24", status: "Active", icon: Server, color: "#8b5cf6", bg: "#f3e8ff" },
    { label: "DynamoDB Status", value: "Healthy", status: "Read/Write OK", icon: Database, color: "#f59e0b", bg: "#fffbeb" },
  ];

  const recentLogs = [
    { id: "LOG-001", service: "Lambda - getAdminProfile", status: "Success", time: "2 mins ago", duration: "120ms" },
    { id: "LOG-002", service: "DynamoDB - Query Employees", status: "Success", time: "5 mins ago", duration: "45ms" },
    { id: "LOG-003", service: "API Gateway - POST /auth", status: "Warning", time: "15 mins ago", duration: "850ms" },
    { id: "LOG-004", service: "S3 - Upload Document", status: "Success", time: "1 hour ago", duration: "320ms" },
    { id: "LOG-005", service: "Lambda - generateReport", status: "Error", time: "2 hours ago", duration: "TIMEOUT" },
  ];

  return (
    <div className="dashboard-wrapper">
      <Sidebar role={user?.role?.toLowerCase() || "admin"} onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} />
      <div className="main-content">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="page-content">
          <div className="section-header">
            <div>
              <h4>Application Monitor</h4>
              <p>System health, API metrics, and service logs</p>
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

          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card-dashboard p-4 h-100">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "var(--gray-800)" }}>
                  <Activity size={20} color="var(--primary)" />
                  Recent Service Logs
                </h5>
                <div className="table-responsive">
                  <table className="table-custom table mb-0">
                    <thead>
                      <tr>
                        <th>Log ID</th>
                        <th>Service Endpoint</th>
                        <th>Duration</th>
                        <th>Status</th>
                        <th className="text-end">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentLogs.map((log) => (
                        <tr key={log.id}>
                          <td style={{ color: "var(--primary)", fontWeight: 600 }}>{log.id}</td>
                          <td className="fw-semibold">{log.service}</td>
                          <td>{log.duration}</td>
                          <td>
                            <span className={`badge-status ${log.status === 'Success' ? 'badge-approved' : log.status === 'Warning' ? 'badge-pending' : 'badge-rejected'}`}>
                              {log.status === 'Success' && <CheckCircle size={12} className="me-1" />}
                              {log.status === 'Warning' && <AlertTriangle size={12} className="me-1" />}
                              {log.status === 'Error' && <AlertTriangle size={12} className="me-1" />}
                              {log.status}
                            </span>
                          </td>
                          <td className="text-end text-muted small"><Clock size={12} className="me-1" />{log.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card-dashboard p-4 h-100">
                <h5 className="fw-bold mb-4" style={{ color: "var(--gray-800)" }}>Infrastructure Status</h5>
                
                <div className="d-flex flex-column gap-3">
                  {[
                    { name: "Authentication (Cognito)", status: "Operational", color: "#10b981" },
                    { name: "API Gateway (ap-south-1)", status: "Operational", color: "#10b981" },
                    { name: "Lambda Compute Engine", status: "Degraded", color: "#f59e0b" },
                    { name: "DynamoDB Clusters", status: "Operational", color: "#10b981" },
                    { name: "S3 Storage Buckets", status: "Operational", color: "#10b981" },
                  ].map((service, i) => (
                    <div key={i} className="d-flex align-items-center justify-content-between p-3 rounded" style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)" }}>
                      <span className="fw-semibold text-dark" style={{ fontSize: "0.85rem" }}>{service.name}</span>
                      <span className="badge" style={{ background: `${service.color}20`, color: service.color, border: `1px solid ${service.color}40`, padding: "4px 8px" }}>
                        {service.status}
                      </span>
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
