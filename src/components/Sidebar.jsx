import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div
      style={{
        width: "220px",
        background: "#f5f5f5",
        padding: "20px",
        minHeight: "100vh",
      }}
    >
      <h3>Menu</h3>

      <p><Link to="/dashboard">Dashboard</Link></p>
      <p><Link to="/profile">My Profile</Link></p>
      <p><Link to="/employees">Employee Management</Link></p>
      <p><Link to="/leave">Leave Management</Link></p>
      <p><Link to="/expenses">Expense Management</Link></p>
      <p><Link to="/documents">Document Management</Link></p>
      <p><Link to="/">Logout</Link></p>
      
    </div>
  );
}

export default Sidebar;