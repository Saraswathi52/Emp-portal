import { Link, useLocation, useNavigate } from "react-router-dom";

const menuConfig = {
  employee: [
    { label: "Dashboard", path: "/employee-dashboard", icon: "bi-speedometer2" },
    { label: "Leave Management", path: "/leave", icon: "bi-calendar-check" },
    { label: "Expense Management", path: "/expenses", icon: "bi-wallet2" },
    { label: "Documents", path: "/documents", icon: "bi-folder2-open" },
  ],
  manager: [
    { label: "Dashboard", path: "/manager-dashboard", icon: "bi-speedometer2" },
    { label: "Employees", path: "/employees", icon: "bi-people" },
    { label: "Leave Management", path: "/leave", icon: "bi-calendar-check" },
    { label: "Expense Management", path: "/expenses", icon: "bi-wallet2" },
    { label: "Documents", path: "/documents", icon: "bi-folder2-open" },
  ],
  admin: [
    { label: "Dashboard", path: "/admin-dashboard", icon: "bi-speedometer2" },
    { label: "Employees", path: "/employees", icon: "bi-people" },
    { label: "Leave Management", path: "/leave", icon: "bi-calendar-check" },
    { label: "Expense Management", path: "/expenses", icon: "bi-wallet2" },
    { label: "Documents", path: "/documents", icon: "bi-folder2-open" },
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
              fontSize: "1.2rem",
            }}
          >
            <i className="bi bi-buildings" />
          </div>
          <div>
            <div className="fw-bold text-white" style={{ fontSize: "1rem" }}>SHAHO</div>
            <div style={{ fontSize: "0.7rem", color: "var(--gray-400)", marginTop: "-2px" }}>{roleLabel} Panel</div>
          </div>
          <button className="btn d-lg-none text-white ms-auto p-0" onClick={onClose}>
            <i className="bi bi-x-lg" style={{ fontSize: "1rem" }} />
          </button>
        </div>

        <div className="sidebar-menu">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${isActive ? "active" : ""}`}
                onClick={onClose}
              >
                <i className={`bi ${item.icon}`} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="sidebar-divider" />
        <div className="sidebar-item text-danger" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right" />
          Logout
        </div>
      </div>
    </>
  );
}

export default Sidebar;
