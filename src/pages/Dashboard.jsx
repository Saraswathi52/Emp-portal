import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function Dashboard() {
  return (
    <div>
      <Navbar />

      <div style={{ display: "flex" }}>
        <Sidebar />

        <div style={{ padding: "30px", flex: 1 }}>
          <h2>Welcome, Employee!</h2>
          <p>This is your dashboard.</p>

          <hr />

          <h3>Features</h3>

          <ul>
            <li>My Profile</li>
            <li>Leave Management</li>
            <li>Payroll</li>
            <li>Announcements</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;