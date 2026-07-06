import { useNavigate } from "react-router-dom";

function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="navbar-custom d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn d-lg-none p-1"
          onClick={onToggleSidebar}
          style={{ color: "#475569", fontSize: "1.3rem" }}
        >
          <i className="bi bi-list" />
        </button>
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-buildings" style={{ color: "var(--primary)", fontSize: "1.5rem" }} />
          <span className="fw-bold" style={{ fontSize: "1.1rem", color: "var(--gray-800)" }}>
            SHAHO
          </span>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        <div className="dropdown">
          <button
            className="btn d-flex align-items-center gap-2 border-0"
            data-bs-toggle="dropdown"
            style={{ background: "var(--gray-50)", borderRadius: "50px", padding: "0.35rem 0.75rem 0.35rem 1rem" }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--primary)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.8rem",
              }}
            >
              {(userData.name || "U").charAt(0).toUpperCase()}
            </div>
            <span className="d-none d-sm-inline" style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--gray-700)" }}>
              {userData.name || "User"}
            </span>
            <i className="bi bi-chevron-down" style={{ fontSize: "0.7rem", color: "var(--gray-400)" }} />
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow-sm" style={{ borderRadius: "10px", border: "1px solid var(--gray-200)", padding: "0.5rem" }}>
            <li>
              <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => navigate("/profile")} style={{ borderRadius: "6px", fontSize: "0.88rem" }}>
                <i className="bi bi-person" /> Profile
              </button>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item d-flex align-items-center gap-2 text-danger" onClick={handleLogout} style={{ borderRadius: "6px", fontSize: "0.88rem" }}>
                <i className="bi bi-box-arrow-right" /> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
