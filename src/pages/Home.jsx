import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f4f6f9",
      }}
    >
      <div
        style={{
          width: "400px",
          background: "#fff",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          textAlign: "center",
        }}
      >
        <h1>Employee Portal</h1>

        <p>Welcome to the Employee Portal Application</p>

        <br />

        <button
          onClick={() => navigate("/login/employee")}
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        >
          Employee Login
        </button>

        <button
          onClick={() => navigate("/login/manager")}
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        >
          Manager Login
        </button>

        <button
          onClick={() => navigate("/login/admin")}
          style={{ width: "100%", padding: "10px" }}
        >
          Admin Login
        </button>
      </div>
    </div>
  );
}

export default Home;