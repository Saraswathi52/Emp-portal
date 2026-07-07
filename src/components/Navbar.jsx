import { useNavigate } from "react-router-dom";
import { getEmployee } from "../services/dataService";

function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  
  let userData = {};
  try {
    userData = JSON.parse(localStorage.getItem("user")) || {};
  } catch (e) {
    userData = {};
  }
  
  const employee = getEmployee(userData?.employeeId);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getName = () => employee?.name || userData?.name || "User";
  const getRole = () => employee?.designation || employee?.role || userData?.role || "Role";
  const getInitial = () => {
    const n = getName();
    return n ? n.charAt(0).toUpperCase() : "U";
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
          <div className="d-flex align-items-center">
            <button
              className="btn d-flex align-items-center gap-2 border-0"
              onClick={() => navigate("/profile")}
              type="button"
              style={{ background: "var(--gray-50)", borderRadius: "50px 0 0 50px", padding: "0.35rem 0.5rem 0.35rem 1rem" }}
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
                {getInitial()}
              </div>
              <span className="d-none d-sm-inline" style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--gray-700)" }}>
                {getName()}
              </span>
            </button>
            <button
              className="btn border-0 dropdown-toggle-split"
              data-bs-toggle="dropdown"
              type="button"
              style={{ background: "var(--gray-50)", borderRadius: "0 50px 50px 0", padding: "0.35rem 0.75rem 0.35rem 0.25rem" }}
            >
              <i className="bi bi-chevron-down" style={{ fontSize: "0.7rem", color: "var(--gray-400)" }} />
            </button>
          </div>
          <ul className="dropdown-menu dropdown-menu-end shadow-sm" style={{ borderRadius: "10px", border: "1px solid var(--gray-200)", padding: "0.5rem", minWidth: "280px" }}>
            <li className="px-3 py-2">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 700 }}>
                  {getInitial()}
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">{getName()}</h6>
                  <small className="text-muted">{getRole()}</small>
                </div>
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--gray-600)" }}>
                <div className="mb-1"><i className="bi bi-person-vcard me-2" style={{ color: "var(--primary)" }} />{employee?.id || userData?.employeeId || 'ID not available'}</div>
                <div className="mb-1"><i className="bi bi-envelope me-2" style={{ color: "var(--primary)" }} />{employee?.email || 'Email not available'}</div>
                <div className="mb-1"><i className="bi bi-telephone me-2" style={{ color: "var(--primary)" }} />{employee?.phone || 'Phone not available'}</div>
                <div className="mb-1"><i className="bi bi-building me-2" style={{ color: "var(--primary)" }} />{employee?.department || 'Department not available'}</div>
                <div><i className="bi bi-geo-alt me-2" style={{ color: "var(--primary)" }} />{employee?.location || 'Location not available'}</div>
              </div>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => navigate("/profile")} style={{ borderRadius: "6px", fontSize: "0.88rem" }}>
                <i className="bi bi-person" /> View Full Profile
              </button>
            </li>
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
