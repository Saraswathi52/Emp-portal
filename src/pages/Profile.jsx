import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function Profile() {
  return (
    <div>
      <Navbar />

      <div style={{ display: "flex" }}>
        <Sidebar />

        <div style={{ padding: "30px", flex: 1 }}>
          <h2>My Profile</h2>

          <hr />

          <p><strong>Employee ID:</strong> EMP001</p>
          <p><strong>Name:</strong> John Doe</p>
          <p><strong>Department:</strong> Software Development</p>
          <p><strong>Designation:</strong> Software Engineer</p>
          <p><strong>Email:</strong> john.doe@company.com</p>
          <p><strong>Phone:</strong> +91 9876543210</p>
          <p><strong>Joining Date:</strong> 15-Jan-2024</p>
          <p><strong>Location:</strong> Hyderabad</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;