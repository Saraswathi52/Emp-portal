import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const initialDepartments = [
  { id: "DEP001", name: "Software Development", head: "John Doe", employees: 45, location: "Hyderabad", status: "Active" },
  { id: "DEP002", name: "Human Resources", head: "Alice Smith", employees: 18, location: "Hyderabad", status: "Active" },
  { id: "DEP003", name: "Finance", head: "Michael Johnson", employees: 12, location: "Bengaluru", status: "Active" },
  { id: "DEP004", name: "Marketing", head: "Sophia Williams", employees: 22, location: "Chennai", status: "Active" },
  { id: "DEP005", name: "Sales", head: "David Brown", employees: 30, location: "Mumbai", status: "Active" },
  { id: "DEP006", name: "Administration", head: "Admin User", employees: 8, location: "Hyderabad", status: "Active" },
];

function Departments() {
  const [userRole] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored).role.toLowerCase() : "employee";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [departments, setDepartments] = useState(initialDepartments);
  const [showForm, setShowForm] = useState(false);
  const [newDept, setNewDept] = useState({ name: "", head: "", location: "", status: "Active" });
  const [toast, setToast] = useState(null);

  const handleAdd = (e) => {
    e.preventDefault();
    const newId = `DEP00${departments.length + 1}`;
    setDepartments([...departments, { id: newId, ...newDept, employees: 0 }]);
    setShowForm(false);
    setNewDept({ name: "", head: "", location: "", status: "Active" });
    setToast({ message: "Department added successfully!", type: "success" });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = (id) => {
    const dept = departments.find(d => d.id === id);
    if (dept && dept.employees > 0) {
      alert("Cannot delete this department because employees are assigned to it. Please move the employees to another department first.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this department?")) {
      setDepartments(departments.filter(d => d.id !== id));
      setToast({ message: "Department deleted!", type: "success" });
      setTimeout(() => setToast(null), 3000);
    }
  };
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const locations = [...new Set(departments.map(d => d.location))];

  const filtered = departments.filter(d => {
    const ms = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.id.toLowerCase().includes(searchTerm.toLowerCase());
    const ml = filterLocation === "All" || d.location === filterLocation;
    const ms2 = filterStatus === "All" || d.status === filterStatus;
    return ms && ml && ms2;
  });

  const stats = [
    { label: "Total Departments", value: departments.length, icon: "bi-building", color: "#3b82f6", bg: "#eff6ff" },
    { label: "Total Employees", value: departments.reduce((acc, d) => acc + d.employees, 0), icon: "bi-people", color: "#10b981", bg: "#ecfdf5" },
    { label: "Active Departments", value: departments.filter(d => d.status === "Active").length, icon: "bi-check-circle", color: "#f59e0b", bg: "#fffbeb" },
    { label: "Office Locations", value: locations.length, icon: "bi-geo-alt", color: "#8b5cf6", bg: "#f5f3ff" },
  ];

  return (
    <div className="dashboard-wrapper">
      {toast && (
        <div className="toast-message">
          <div className="alert alert-success d-flex align-items-center gap-2 shadow-sm" style={{ borderRadius: "10px", border: "none", padding: "0.75rem 1.25rem" }}>
            <i className="bi bi-check-circle" />
            {toast.message}
          </div>
        </div>
      )}
      <Sidebar role={userRole} onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} />
      <div className="main-content">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="page-content">
          <div className="section-header">
            <div>
              <h4>Department Management</h4>
              <p>Manage all company departments.</p>
            </div>
            <button className="btn-custom-primary d-flex align-items-center gap-2" onClick={() => setShowForm(true)}>
              <i className="bi bi-plus-lg" /> Add Department
            </button>
          </div>

          <div className="row g-3 mb-4">
            {stats.map((s) => (
              <div key={s.label} className="col-xl-3 col-md-6">
                <div className="stat-card card-dashboard d-flex align-items-center gap-3" style={{ background: s.bg }}>
                  <div className="stat-icon" style={{ background: s.color, width: 44, height: 44, fontSize: "1.2rem", margin: 0 }}>
                    <i className={`bi ${s.icon}`} />
                  </div>
                  <div>
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value" style={{ color: s.color, fontSize: "1.5rem" }}>{s.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card-dashboard p-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
              <div className="search-box">
                <i className="bi bi-search" />
                <input type="text" className="form-control" placeholder="Search departments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="d-flex gap-2 align-items-center">
                <i className="bi bi-funnel" style={{ color: "var(--gray-400)" }} />
                <select className="form-select" style={{ width: "auto", borderRadius: "50px", fontSize: "0.85rem", padding: "0.35rem 2rem 0.35rem 0.75rem" }} value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
                  <option value="All">All Locations</option>
                  {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
                <select className="form-select" style={{ width: "auto", borderRadius: "50px", fontSize: "0.85rem", padding: "0.35rem 2rem 0.35rem 0.75rem" }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table-custom table table-hover">
                <thead>
                  <tr>
                    <th>Department ID</th>
                    <th>Department Name</th>
                    <th>Department Manager</th>
                    <th>Employees</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4" style={{ color: "var(--gray-400)" }}>
                        <i className="bi bi-building" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }} />
                        No departments found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((dept) => (
                      <tr key={dept.id}>
                        <td><span style={{ color: "var(--primary)", fontWeight: 600 }}>{dept.id}</span></td>
                        <td className="fw-semibold">{dept.name}</td>
                        <td>{dept.head}</td>
                        <td>
                          <span className={`badge-status ${dept.employees === 0 ? "" : "badge-pending"}`} style={dept.employees === 0 ? { background: "var(--gray-500)", color: "#fff", border: "none" } : {}}>
                            <i className="bi bi-people me-1" />{dept.employees}
                          </span>
                        </td>
                        <td>{dept.location}</td>
                        <td>
                          <span className={`badge-status ${dept.status === "Active" ? "badge-approved" : "badge-rejected"}`}>
                            {dept.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns justify-content-center">
                            <button className="btn-custom-primary d-flex align-items-center gap-1" style={{ padding: "0.3rem 0.7rem", fontSize: "0.78rem" }} onClick={() => {}}>
                              <i className="bi bi-pencil" /> Edit
                            </button>
                            <button className="btn-custom-danger d-flex align-items-center gap-1" style={{ padding: "0.3rem 0.7rem", fontSize: "0.78rem" }} onClick={() => handleDelete(dept.id)}>
                              <i className="bi bi-trash" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {showForm && (
        <div className="popup-overlay" onClick={() => setShowForm(false)}>
          <div className="popup-box form-custom" onClick={e => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <button className="close-btn" onClick={() => setShowForm(false)}>
              <i className="bi bi-x-lg"></i>
            </button>
            <h4 className="fw-bold mb-4">Add New Department</h4>
            <form onSubmit={handleAdd}>
              <div className="mb-3">
                <label className="form-label">Department Name</label>
                <input type="text" className="form-control" required value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label">Department Head</label>
                <input type="text" className="form-control" required value={newDept.head} onChange={e => setNewDept({...newDept, head: e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label">Location</label>
                <input type="text" className="form-control" required value={newDept.location} onChange={e => setNewDept({...newDept, location: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="form-label">Status</label>
                <select className="form-select" value={newDept.status} onChange={e => setNewDept({...newDept, status: e.target.value})}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-light" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-custom-primary px-4">Save Department</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Departments;
