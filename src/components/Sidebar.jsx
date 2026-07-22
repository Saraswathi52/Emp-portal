import { Link, useLocation, useNavigate } from "react-router-dom";
import { Gauge, CalendarCheck, Wallet, FolderOpen, Users, Building, FileBarChart, X, LogOut, Activity } from "lucide-react";

const menuConfig = {
  employee: [
    { label: "Dashboard", path: "/employee-dashboard", icon: Gauge },
    { label: "Leave Management", path: "/leave", icon: CalendarCheck },
    { label: "Expense Management", path: "/expenses", icon: Wallet },
    { label: "Documents", path: "/documents", icon: FolderOpen },
  ],
  manager: [
    { label: "Dashboard", path: "/manager-dashboard", icon: Gauge },
    { label: "Employees", path: "/employees", icon: Users },
    { label: "Leave Management", path: "/leave", icon: CalendarCheck },
    { label: "Expense Management", path: "/expenses", icon: Wallet },
    { label: "Documents", path: "/documents", icon: FolderOpen },
  ],
  admin: [
    { label: "Dashboard", path: "/admin-dashboard", icon: Gauge },
    { label: "Employees", path: "/employees", icon: Users },
    { label: "Departments", path: "/departments", icon: Building },
    { label: "Documents", path: "/documents", icon: FolderOpen },
    { label: "Monitor Application", path: "/monitor", icon: Activity },
    { label: "Reports", path: "/reports", icon: FileBarChart },
  ],
};

function Sidebar({ role = "employee", onClose, isOpen = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const items = menuConfig[role] || menuConfig.employee;
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      <div className={`sidebar${isOpen ? " show" : ""}`}>
        <div className="sidebar-brand d-flex align-items-center gap-2">
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            <Users size={20} />
          </div>
          <div>
            <div className="fw-bold text-white" style={{ fontSize: "1rem" }}>PeopleCore</div>
            <div style={{ fontSize: "0.7rem", color: "var(--gray-400)", marginTop: "-2px" }}>{roleLabel} Panel</div>
          </div>
          <button className="btn d-lg-none text-white ms-auto p-0" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="sidebar-menu">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${isActive ? "active" : ""}`}
                onClick={onClose}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="sidebar-divider" />
        <div className="sidebar-item text-danger" onClick={handleLogout} style={{ cursor: "pointer" }}>
          <LogOut size={18} />
          Logout
        </div>
      </div>
    </>
  );
}

export default Sidebar;
