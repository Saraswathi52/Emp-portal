import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function Dashboard() {
  const [role] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored).role.toLowerCase() : "employee";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const features = [
    { label: "My Profile", icon: "bi-person-badge", path: "/profile", color: "#2563eb" },
    { label: "Leave Management", icon: "bi-calendar-check", path: "/leave", color: "#8b5cf6" },
    { label: "Expense Management", icon: "bi-wallet2", path: "/expenses", color: "#10b981" },
    { label: "Documents", icon: "bi-folder2-open", path: "/documents", color: "#f59e0b" },
  ];

  return (
    <div className="dashboard-wrapper">
        <Sidebar role={role} onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} />
      <div className="main-content">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="page-content">
          <div className="section-header">
            <div>
              <h4>Dashboard</h4>
              <p>Overview of your workspace</p>
            </div>
          </div>

          <div className="row g-4">
            {features.map((f) => (
              <div key={f.path} className="col-md-3 col-sm-6">
                <div
                  className="card-dashboard p-4 text-center"
                  style={{ cursor: "pointer", height: "100%" }}
                  onClick={() => navigate(f.path)}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)"; }}
                >
                  <div style={{ width: 56, height: 56, borderRadius: "14px", background: `${f.color}15`, color: f.color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: "0.75rem" }}>
                    <i className={`bi ${f.icon}`} />
                  </div>
                  <h6 className="fw-bold mb-0" style={{ color: "var(--gray-700)" }}>{f.label}</h6>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
