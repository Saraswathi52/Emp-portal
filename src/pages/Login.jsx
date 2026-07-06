import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import "../App.css";

function Login() {
  const navigate = useNavigate();
  const { role } = useParams();

  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");

  const users = [
    {
      employeeId: "EMP1001",
      password: "emp123",
      role: "Employee",
    },
    {
      employeeId: "MGR1001",
      password: "mgr123",
      role: "Manager",
    },
    {
      employeeId: "ADM1001",
      password: "admin123",
      role: "Admin",
    },
  ];

  const handleLogin = () => {
    if (employeeId.trim() === "" || password.trim() === "") {
      alert("Please enter Employee ID and Password");
      return;
    }

    const user = users.find(
      (u) =>
        u.employeeId === employeeId.trim() &&
        u.password === password.trim() &&
        u.role.toLowerCase() === role
    );

    if (!user) {
      alert("Invalid Credentials or Wrong Role");
      return;
    }

    if (user.role === "Employee") {
      navigate("/employee-dashboard");
    } else if (user.role === "Manager") {
      navigate("/manager-dashboard");
    } else if (user.role === "Admin") {
      navigate("/admin-dashboard");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <Header />

        <h2>
          {role.charAt(0).toUpperCase() + role.slice(1)} Login
        </h2>

        <br />

        <input
          type="text"
          placeholder="Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />
        <br />

        <button onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;