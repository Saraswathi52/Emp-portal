import { useNavigate } from "react-router-dom";
import "../App.css";

const roles = [
  {
    role: "employee",
    title: "Employee",
    icon: "bi-person-badge",
    color: "#2563eb",
    desc: "View your profile, apply for leave, track expenses & documents",
  },
  {
    role: "manager",
    title: "Manager",
    icon: "bi-people",
    color: "#8b5cf6",
    desc: "Manage team, approve requests, oversee operations",
  },
  {
    role: "admin",
    title: "Admin",
    icon: "bi-shield-check",
    color: "#059669",
    desc: "Full system access, user management & configuration",
  },
];

function Home() {
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <div style={{ textAlign: "center", maxWidth: 800, width: "100%" }}>
        <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
          <i className="bi bi-buildings" style={{ fontSize: "2.5rem", color: "var(--primary)" }} />
          <h1 className="fw-bold" style={{ fontSize: "2.5rem", color: "var(--gray-800)", margin: 0 }}>
            SHAHO
          </h1>
        </div>
        <p style={{ color: "var(--gray-500)", fontSize: "1.1rem", marginBottom: "2.5rem" }}>
          Employee Management Portal
        </p>

        <div className="row g-4 justify-content-center">
          {roles.map((r) => (
            <div key={r.role} className="col-md-4 col-sm-6">
              <div
                className="card-dashboard p-4 text-center"
                style={{ cursor: "pointer", height: "100%" }}
                onClick={() => navigate(`/login/${r.role}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "16px",
                    background: `${r.color}15`,
                    color: r.color,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.8rem",
                    marginBottom: "1rem",
                  }}
                >
                  <i className={`bi ${r.icon}`} />
                </div>
                <h5 className="fw-bold mb-2" style={{ color: "var(--gray-800)" }}>{r.title}</h5>
                <p style={{ color: "var(--gray-500)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                  {r.desc}
                </p>
                <button
                  className="btn w-100 text-white fw-semibold"
                  style={{
                    background: r.color,
                    borderRadius: "8px",
                    padding: "0.55rem",
                    transition: "var(--transition)",
                  }}
                  onClick={() => navigate(`/login/${r.role}`)}
                >
                  <i className="bi bi-box-arrow-in-right me-2" />
                  {r.title} Login
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
