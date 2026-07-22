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
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pendingUser, setPendingUser] = useState(null);

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
      if (role === 'admin') {
        const { getAdminProfile } = await import('../services/dataService');
        userProfile = await getAdminProfile(employeeId.trim());
      } else if (role === 'manager') {
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
      // Currently, it accepts any password as long as the role matches (like before).
      
      const tempPasswordPattern = `${employeeId.trim()}@123`;
      if (password === tempPasswordPattern) {
        setPendingUser(userProfile);
        setShowChangePassword(true);
        return;
      }
      
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrors({});
    if (newPassword.length < 6) {
      setErrors({ newPassword: "Password must be at least 6 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match." });
      return;
    }

    try {
      const updatedUser = { ...pendingUser, Password: newPassword };
      if (role === 'admin') {
        const { updateAdminProfile } = await import('../services/dataService');
        await updateAdminProfile(employeeId.trim(), updatedUser);
      } else if (role === 'manager') {
        const { updateManagerProfile } = await import('../services/dataService');
        await updateManagerProfile(employeeId.trim(), updatedUser);
      } else {
        const { saveEmployee } = await import('../services/dataService');
        await saveEmployee(updatedUser);
      }

      localStorage.setItem("user", JSON.stringify({
        employeeId: employeeId.trim(),
        role: roleLabel,
        name: updatedUser.FullName || updatedUser.name || employeeId.trim(),
      }));

      const paths = {
        employee: "/employee-dashboard",
        manager: "/manager-dashboard",
        admin: "/admin-dashboard",
      };
      navigate(paths[role] || "/employee-dashboard");
    } catch (err) {
      console.error(err);
      setErrors({ submit: "Failed to update password. Please try again." });
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
            <i className={`bi ${showChangePassword ? "bi-key" : (roleIcon[role] || "bi-person")}`} />
          </div>
          <h4 className="login-title">{showChangePassword ? "Change Password" : `${roleLabel} Login`}</h4>
          <p className="login-subtitle">
            {showChangePassword ? "Please set a new password for your account to continue." : `Welcome back! Please enter your ${roleLabel.toLowerCase()} credentials.`}
          </p>
        </div>

        {showChangePassword ? (
          <form onSubmit={handleChangePassword} className="form-custom">
            <div className="mb-4">
              <label className="form-label">New Password</label>
              <div className="input-group-custom">
                <i className="bi bi-lock"></i>
                <input
                  type="password"
                  className={`form-control ${errors.newPassword ? "is-invalid" : ""}`}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setErrors({ ...errors, newPassword: null }); }}
                />
              </div>
              {errors.newPassword && <div className="invalid-feedback d-block">{errors.newPassword}</div>}
            </div>

            <div className="mb-4">
              <label className="form-label">Confirm New Password</label>
              <div className="input-group-custom">
                <i className="bi bi-lock-fill"></i>
                <input
                  type="password"
                  className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors({ ...errors, confirmPassword: null }); }}
                />
              </div>
              {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword}</div>}
              {errors.submit && <div className="invalid-feedback d-block text-center mt-3">{errors.submit}</div>}
            </div>

            <button type="submit" className="btn-custom-primary w-100 d-flex justify-content-center align-items-center gap-2">
              <i className="bi bi-check2-circle"></i> Save & Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="form-custom">
            <div className="mb-4">
              <label className="form-label">Employee ID</label>
              <div className="input-group-custom">
                <i className="bi bi-person"></i>
                <input
                  type="text"
                  className={`form-control ${errors.employeeId ? "is-invalid" : ""}`}
                  placeholder={`Enter your ${roleLabel} ID`}
                  value={employeeId}
                  onChange={(e) => { setEmployeeId(e.target.value); setErrors({ ...errors, employeeId: null }); }}
                />
              </div>
              {errors.employeeId && <div className="invalid-feedback d-block">{errors.employeeId}</div>}
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label mb-0">Password</label>
              </div>
              <div className="input-group-custom">
                <i className="bi bi-lock"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: null }); }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn btn-link p-0 ms-2"
                  tabIndex="-1"
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} style={{ color: "var(--gray-400)" }} />
                </button>
              </div>
              {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
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

            <button type="submit" className="btn-custom-primary w-100 d-flex justify-content-center align-items-center gap-2">
              <i className="bi bi-box-arrow-in-right"></i> Sign In
            </button>
          </form>
        )}

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
