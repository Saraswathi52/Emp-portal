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
        <button
          className="btn d-flex align-items-center gap-2 border-0"
          onClick={() => navigate("/profile")}
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
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
