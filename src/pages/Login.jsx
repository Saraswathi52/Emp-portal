import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../App.css";

function Login() {
  const navigate = useNavigate();
  const { role } = useParams();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : "";

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!employeeId.trim()) newErrors.employeeId = "Employee ID is required";
    if (!password.trim()) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      let userProfile = null;
      if (role === 'manager') {
        const { getManagerProfile } = await import('../services/dataService');
        userProfile = await getManagerProfile(employeeId.trim());
      } else {
        const { getEmployee } = await import('../services/dataService');
        userProfile = await getEmployee(employeeId.trim());
      }

      if (!userProfile) {
        setErrors({ employeeId: "User not found or invalid ID" });
        return;
      }
      
      const actualRole = (userProfile.Role || userProfile.role || "").toLowerCase();
      
      if (actualRole !== role.toLowerCase()) {
        setErrors({ employeeId: `This user is not registered as ${roleLabel}. Please use the correct portal.` });
        return;
      }
      
      // If we had a real password check, it would go here.
      // Currently, it accepts any password as long as the role matches.
      
      localStorage.setItem("user", JSON.stringify({
        employeeId: employeeId.trim(),
        role: roleLabel,
        name: userProfile.FullName || userProfile.name || employeeId.trim(),
      }));

      const paths = {
        employee: "/employee-dashboard",
        manager: "/manager-dashboard",
        admin: "/admin-dashboard",
      };
      navigate(paths[role] || "/employee-dashboard");
    } catch (error) {
      console.error(error);
      setErrors({ employeeId: "An error occurred during login. Please try again." });
    }
  };

  const roleIcon = {
    employee: "bi-person-badge",
    manager: "bi-people",
    admin: "bi-shield-check",
  };

  return (
    <div className="page-bg login-page">
      <div className="login-card">
        <div className="text-center mb-4">
          <div className="login-icon">
            <i className={`bi ${roleIcon[role] || "bi-person"}`} />
          </div>
          <h4 className="login-title">{roleLabel} Login</h4>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="form-custom">
          <div className="mb-3">
            <label className="form-label">{roleLabel} ID</label>
            <div className="position-relative">
              <i className="bi bi-person" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)", zIndex: 5 }} />
              <input
                type="text"
                className={`form-control ps-5 ${errors.employeeId ? "is-invalid" : ""}`}
                placeholder={`Enter your ${roleLabel} ID`}
                value={employeeId}
                onChange={(e) => { setEmployeeId(e.target.value); setErrors({ ...errors, employeeId: "" }); }}
              />
              {errors.employeeId && <div className="invalid-feedback">{errors.employeeId}</div>}
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <div className="position-relative">
              <i className="bi bi-lock" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)", zIndex: 5 }} />
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control ps-5 pe-5 ${errors.password ? "is-invalid" : ""}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: "" }); }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 5, background: 'none', border: 'none', padding: 0 }}
                tabIndex="-1"
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} style={{ color: "var(--gray-400)" }} />
              </button>
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>
          </div>

          <div className="d-flex justify-content-end mb-3">
            <button
              type="button"
              className="btn btn-link p-0 text-decoration-none"
              style={{ fontSize: "0.85rem", color: "var(--primary)" }}
              onClick={() => alert("Password reset instructions have been sent to your registered email.")}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="btn-custom-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2">
            <i className="bi bi-box-arrow-in-right" />
            Sign In
          </button>
        </form>

        <div className="text-center mt-3">
          <button
            className="btn btn-link p-0 text-decoration-none"
            style={{ color: "var(--gray-500)", fontSize: "0.85rem" }}
            onClick={() => navigate("/")}
          >
            <i className="bi bi-arrow-left me-1" /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
