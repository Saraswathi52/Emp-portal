import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const roles = [
  {
    role: "employee",
    title: "Employee",
    icon: "bi-person-badge",
    color: "#2563eb",
    desc: "View profile, apply leave & manage expenses",
  },
  {
    role: "manager",
    title: "Manager",
    icon: "bi-people",
    color: "#8b5cf6",
    desc: "Approve requests & manage your team",
  },
  {
    role: "admin",
    title: "Admin",
    icon: "bi-shield-check",
    color: "#059669",
    desc: "Manage employees & system settings",
  },
];

const features = [
  { icon: "bi-person-check-fill", bg: "#eff6ff", color: "#2563eb", title: "Role-Based Access", desc: "Tailored dashboards and permissions for Employees, Managers, and Admins." },
  { icon: "bi-lightning-charge-fill", bg: "#f5f3ff", color: "#8b5cf6", title: "Faster Approvals", desc: "Streamlined workflows that cut leave and expense approval time in half." },
  { icon: "bi-folder-check", bg: "#f0fdf4", color: "#10b981", title: "Secure Documents", desc: "Centralized storage with controlled access for all employee documents." },
  { icon: "bi-bar-chart-fill", bg: "#fef2f2", color: "#ef4444", title: "Employee Records", desc: "Complete digital history of employee info, roles, and activity logs." },
  { icon: "bi-clock-history", bg: "#fffbeb", color: "#f59e0b", title: "Real-Time Tracking", desc: "Live updates on leave requests, expenses, and approval statuses." },
  { icon: "bi-shield-lock-fill", bg: "#f0f9ff", color: "#0ea5e9", title: "Reliable & Secure", desc: "Enterprise-grade security with encryption and access controls built in." },
];

function Home() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  return (
    <div className="page-bg home-page">

      <nav className="header">

  <div className="logo">
    <i className="bi bi-people-fill"></i>
    <span>PeopleCore</span>
  </div>

  <div className="nav-links">

    <a
  href="#"
  style={{
    color: "#2563eb",
    fontWeight: "600",
  }}
>
  Home
</a>

    <a
      href="#about"
      onClick={(e) => {
        e.preventDefault();
        document
          .getElementById("about")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }}
    >
      About
    </a>

    <button
      className="btn btn-primary px-4"
      onClick={() => setShowPopup(true)}
    >
      Login
    </button>

  </div>

</nav>

      <div className="hero-section">
        <div className="hero-badge">
          <i className="bi bi-people-fill me-2"></i>
          Welcome to PeopleCore
        </div>

        <h1 className="hero-title">
          Smart Employee <span className="text-primary">Management</span>
        </h1>

        <p className="hero-description">
          Securely manage employees, leave requests, expenses, documents and approvals
          from one centralized platform. Empowering your workforce with efficiency.
        </p>

        <div className="hero-actions">
          <button
            className="btn btn-primary btn-lg px-5 py-3"
            onClick={() => setShowPopup(true)}
          >
            <i className="bi bi-box-arrow-in-right me-2"></i>
            Get Started
          </button>
          <button
            className="btn btn-outline-secondary btn-lg px-5 py-3"
            onClick={() => {
              document
                .getElementById("about")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <i className="bi bi-info-circle me-2"></i>
            Learn More
          </button>
        </div>
      </div>

{showWelcome && (
  <div
    className="popup-overlay"
    onClick={() => setShowWelcome(false)}
  >
    <div
      className="popup-box"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="close-btn"
        onClick={() => setShowWelcome(false)}
      >
        <i className="bi bi-x-lg"></i>
      </button>

      <div className="text-center">

        <i
          className="bi bi-people-fill"
          style={{
            fontSize: "60px",
            color: "#2563eb",
          }}
        ></i>

        <h2 className="mt-3 fw-bold">
          Welcome to PeopleCore
        </h2>

        <p className="text-muted">
          Employee Management Portal
        </p>

      </div>

      <hr />

      <h5 className="mb-3 fw-bold">
  Getting Started
</h5>

<p className="text-muted">
  Welcome! If you're accessing PeopleCore for the first time,
  follow these steps:
</p>

<ul className="list-unstyled mt-4">

  <li className="mb-3">
    <i className="bi bi-person-check-fill text-primary me-2"></i>
    Contact your HR or Administrator
  </li>

  <li className="mb-3">
    <i className="bi bi-key-fill text-primary me-2"></i>
    Receive your Employee ID and Password
  </li>

  <li className="mb-3">
    <i className="bi bi-box-arrow-in-right text-primary me-2"></i>
    Click <strong>Continue to Login</strong>
  </li>

  <li className="mb-3">
    <i className="bi bi-person-badge-fill text-primary me-2"></i>
    Select your role (Employee, Manager, or Admin)
  </li>

  <li className="mb-3">
    <i className="bi bi-speedometer2 text-primary me-2"></i>
    Sign in and access your dashboard
  </li>

</ul>
      <div className="text-center mt-4">

        <button
          className="btn btn-primary px-5"
          onClick={() => {
            setShowWelcome(false);
            setShowPopup(true);
          }}
        >
          Proceed to Login
        </button>

      </div>

    </div>
  </div>
)}
<div
  className="container py-5" style={{ scrollMarginTop: "100px", paddingTop: "5rem" }}
  id="about"
  style={{ scrollMarginTop: "100px" }}
>

  <div className="text-center mb-5">

    <h2 className="fw-bold">
      About PeopleCore
    </h2>
    <div style={{
      width: "60px", height: "4px", background: "var(--primary)",
      borderRadius: "2px", margin: "0 auto 1.5rem"
    }} />
    <p style={{ color: "var(--gray-600)", fontSize: "1.1rem", maxWidth: "700px", margin: "0 auto", lineHeight: "1.7" }}>
    PeopleCore centralizes leave, expenses, records, and documents into a single professional platform — empowering employees, managers, and admins to work faster and smarter.
    </p>

  </div>

 <div className="container pb-5">

  <div className="text-center mb-5">
    <h2 className="fw-bold">
      Why Choose PeopleCore?
    </h2>

    <p className="text-muted">
      Purpose-built to streamline HR operations with security, speed, and simplicity.
    </p>
  </div>

  <div className="row g-4">

    {features.map((f) => (
      <div key={f.title} className="col-md-4">
        <div className="feature-card">
          <div className="feature-icon-box" style={{ background: f.bg, color: f.color }}>
            <i className={`bi ${f.icon}`}></i>
          </div>
          <h5>{f.title}</h5>
          <p>{f.desc}</p>
        </div>
      </div>
    ))}

  </div>

</div>
</div>

<footer
  style={{
    width: "100%",
    marginTop: "60px",
    background: "#0f172a",
    color: "#fff",
    padding: "40px 20px",
  }}
>
  <div className="container">

    <div className="row">

      <div className="col-md-4 mb-4">
        <h4 className="fw-bold">
          <i className="bi bi-people-fill me-2"></i>
          PeopleCore
        </h4>

        <p style={{ color: "#cbd5e1" }}>
          Employee Management Portal designed to simplify
          employee operations, approvals, document management,
          and daily HR activities.
        </p>
      </div>

      <div className="col-md-4 mb-4">
        <h5>Quick Links</h5>

        <ul className="list-unstyled">

          <li>
            <a href="#" className="text-decoration-none text-light">
              Home
            </a>
          </li>

          <li>
            <a
              href="#about"
              className="text-decoration-none text-light"
            >
              About
            </a>
          </li>

          <li>
            <a
              href="#"
              className="text-decoration-none text-light"
              onClick={() => setShowPopup(true)}
            >
              Login
            </a>
          </li>

        </ul>
      </div>

      <div className="col-md-4 mb-4">

        <h5>Contact</h5>

        <p>
          <i className="bi bi-envelope-fill me-2"></i>
          support@peoplecore.com
        </p>

        <p>
          <i className="bi bi-telephone-fill me-2"></i>
          +91 98765 43210
        </p>

      </div>

    </div>

    <hr style={{ borderColor: "#334155" }} />

    <div className="text-center">

      Ac 2026 PeopleCore Employee Management Portal

      <br />

      <small style={{ color: "#94a3b8" }}>
        All Rights Reserved.
      </small>

    </div>

  </div>
</footer>

      {showPopup && (

        <div
          className="popup-overlay"
          onClick={() => setShowPopup(false)}
        >

          <div
            className="popup-box"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="close-btn"
              onClick={() => setShowPopup(false)}
            >
              <i className="bi bi-x-lg"></i>
            </button>

            <h3 className="text-center fw-bold">
              Select Your Role
            </h3>

            <p
              className="text-center text-muted mb-4"
              style={{ fontSize: "14px" }}
            >
              Select how you want to access the portal.
            </p>

            {roles.map((r) => (

              <div
                key={r.role}
                className="role-card"
              >

                <div className="d-flex align-items-center">

                  <div
                    className="role-icon"
                    style={{
                      background: `${r.color}15`,
                      color: r.color,
                    }}
                  >
                    <i className={`bi ${r.icon}`}></i>
                  </div>

                  <div className="ms-3">

                    <h6 className="mb-1 fw-bold">
                      {r.title}
                    </h6>

                    <small className="text-muted">
                      {r.desc}
                    </small>

                  </div>

                </div>

                <button
                  className="btn text-white"
                  style={{
                    background: r.color,
                    minWidth: "90px",
                  }}
                  onClick={() => navigate(`/login/${r.role}`)}
                >
                  Login
                </button>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>
  );
}

export default Home;
