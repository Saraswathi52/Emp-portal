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

function Home() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  return (
    <div className="login-page">

      {/* Navbar */}
      <nav className="header">

  <div className="logo">
    <i className="bi bi-buildings"></i>
    <span>SHAHO</span>
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

    <a
      href="#features"
      onClick={(e) => {
        e.preventDefault();
        document
          .getElementById("features")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }}
    >
      Features
    </a>

    <button
      className="btn btn-primary px-4"
      onClick={() => setShowPopup(true)}
    >
      Login
    </button>

  </div>

</nav>

      {/* Hero Section */}

      <div className="home-content">
        <p
  style={{
    color: "#2563eb",
    fontWeight: "600",
    letterSpacing: "2px",
    textTransform: "uppercase",
    marginBottom: "10px",
  }}
>
  Welcome to SHAHO
</p>

        <h1>Smart Employee Management</h1>

        <p>
          Securely manage employees, leave requests,
          expenses, documents and approvals from one place.
        </p>



      </div>

      {/* Features */}

      <div className="container mt-5" id="features">

        <div className="row g-4">

          <div className="col-md-3">
            <div className="feature-card">
              <i className="bi bi-calendar-check"></i>
              <h5>Leave Management</h5>
              <p>Apply, track and approve leave requests.</p>
            </div>
          </div>

          <div className="col-md-3">
            <div className="feature-card">
              <i className="bi bi-cash-stack"></i>
              <h5>Expense Management</h5>
              <p>Submit expenses with receipt uploads.</p>
            </div>
          </div>

          <div className="col-md-3">
            <div className="feature-card">
              <i className="bi bi-folder2-open"></i>
              <h5>Documents</h5>
              <p>Upload and manage employee documents.</p>
            </div>
          </div>

          <div className="col-md-3">
            <div className="feature-card">
              <i className="bi bi-people"></i>
              <h5>Employees</h5>
              <p>Manage employees and departments.</p>
            </div>
          </div>

        </div>

      </div>

      {/* Welcome Popup */}

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
          className="bi bi-buildings"
          style={{
            fontSize: "60px",
            color: "#2563eb",
          }}
        ></i>

        <h2 className="mt-3 fw-bold">
          Welcome to SHAHO
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
  Welcome! If you're accessing SHAHO for the first time,
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
  className="container py-5"
  id="about"
  style={{ scrollMarginTop: "100px" }}
>

  <div className="text-center mb-5">

    <h2 className="fw-bold">
      About SHAHO
    </h2>
    <p
      className="text-muted mx-auto"
      style={{ maxWidth: "800px", lineHeight: "1.8" }}    
    >
    SHAHO Employee Management Portal is a secure and user-friendly platform
    designed to simplify employee management. It enables employees,
    managers, and administrators to efficiently manage leave requests,
    expense claims, employee records, and official documents through a
    centralized system.
    </p>

  </div>

 <div className="container pb-5">

  <div className="text-center mb-5">
    <h2 className="fw-bold">
      Why Choose SHAHO?
    </h2>

    <p className="text-muted">
      Designed to simplify daily HR operations with a secure,
      efficient and user-friendly experience.
    </p>
  </div>

  <div className="row g-4">

    <div className="col-md-4">
      <div className="feature-card">
        <i className="bi bi-person-check-fill"></i>
        <h5>Role-Based Access</h5>
        <p>
          Dedicated access for Employees, Managers and Administrators.
        </p>
      </div>
    </div>

    <div className="col-md-4">
      <div className="feature-card">
        <i className="bi bi-lightning-charge-fill"></i>
        <h5>Faster Approvals</h5>
        <p>
          Speed up leave and expense approval workflows.
        </p>
      </div>
    </div>

    <div className="col-md-4">
      <div className="feature-card">
        <i className="bi bi-folder-check"></i>
        <h5>Secure Documents</h5>
        <p>
          Store and manage employee documents securely.
        </p>
      </div>
    </div>

    <div className="col-md-4">
      <div className="feature-card">
        <i className="bi bi-bar-chart-fill"></i>
        <h5>Employee Records</h5>
        <p>
          Maintain accurate employee information and history.
        </p>
      </div>
    </div>

    <div className="col-md-4">
      <div className="feature-card">
        <i className="bi bi-clock-history"></i>
        <h5>Real-Time Tracking</h5>
        <p>
          Monitor leave requests and expense status instantly.
        </p>
      </div>
    </div>

    <div className="col-md-4">
      <div className="feature-card">
        <i className="bi bi-shield-lock-fill"></i>
        <h5>Reliable & Secure</h5>
        <p>
          Built with security and reliability for everyday business use.
        </p>
      </div>
    </div>

  </div>

</div>
</div>
{/* Footer */}

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

      {/* Company */}
      <div className="col-md-4 mb-4">
        <h4 className="fw-bold">
          <i className="bi bi-buildings me-2"></i>
          SHAHO
        </h4>

        <p style={{ color: "#cbd5e1" }}>
          Employee Management Portal designed to simplify
          employee operations, approvals, document management,
          and daily HR activities.
        </p>
      </div>

      {/* Quick Links */}
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

      {/* Contact */}
      <div className="col-md-4 mb-4">

        <h5>Contact</h5>

        <p>
          <i className="bi bi-envelope-fill me-2"></i>
          support@shaho.com
        </p>

        <p>
          <i className="bi bi-telephone-fill me-2"></i>
          +91 98765 43210
        </p>

      </div>

    </div>

    <hr style={{ borderColor: "#334155" }} />

    <div className="text-center">

      © 2026 SHAHO Employee Management Portal

      <br />

      <small style={{ color: "#94a3b8" }}>
        All Rights Reserved.
      </small>

    </div>

  </div>
</footer>

      {/* Popup */}

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