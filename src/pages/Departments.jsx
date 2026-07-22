import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getAdminDepartments, getAdminEmployees, addAdminDepartment, updateAdminDepartment, deleteAdminDepartment } from "../services/dataService";

function Departments() {
  const [userRole] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored).role.toLowerCase() : "employee";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newDept, setNewDept] = useState({ departmentName: "", managerEmpId: "", location: "", status: "Active" });
  const [toast, setToast] = useState(null);
  const [editId, setEditId] = useState(null);

  const loadData = async () => {
    try {
      const fetchedDepts = await getAdminDepartments();
      const fetchedEmps = await getAdminEmployees();
      setEmployees(fetchedEmps);

      const formattedDepts = fetchedDepts.map(d => {
        return {
          depid: d.depid || `DEP-${Math.floor(Math.random()*1000)}`,
          departmentName: d.departmentName || d.name || "",
          managerName: d.managerName || "Not Assigned",
          managerEmpId: d.managerEmpId || "",
          designation: d.designation || "-",
          employeeCount: d.employeeCount !== undefined ? Number(d.employeeCount) : fetchedEmps.filter(e => {
            const eDept = String(e.Department?.S || e.Department || e.department?.S || e.department || "").toLowerCase().trim();
            const deptName = String(d.departmentName || d.name || "").toLowerCase().trim();
            return eDept === deptName || (eDept === "it" && deptName === "information technology");
          }).length,
          location: d.location || d.Location || "N/A",
          status: d.status || d.Status || "Active"
        };
      });
      
      setDepartments(formattedDepts);
    } catch (err) {
      console.error("Failed to load departments or employees:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateAdminDepartment(editId, newDept);
        setToast({ message: "Department updated successfully!", type: "success" });
      } else {
        await addAdminDepartment(newDept);
        setToast({ message: "Department added successfully!", type: "success" });
      }
      
      await loadData();
      setShowForm(false);
      setNewDept({ departmentName: "", managerEmpId: "", location: "", status: "Active" });
      setEditId(null);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Failed to save department", err);
      alert("Failed to save department. Please try again.");
    }
  };

  const handleEdit = (dept) => {
    setEditId(dept.depid);
    setNewDept({
      departmentName: dept.departmentName,
      managerEmpId: dept.managerEmpId,
      location: dept.location,
      status: dept.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const dept = departments.find(d => d.depid === id);
    if (dept && dept.employeeCount > 0) {
      alert("Cannot delete this department because employees are assigned to it. Please move the employees to another department first.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await deleteAdminDepartment(id);
        await loadData();
        setToast({ message: "Department deleted!", type: "success" });
        setTimeout(() => setToast(null), 3000);
      } catch (err) {
        console.error("Failed to delete department", err);
        alert("Failed to delete department. Please try again.");
      }
    }
  };
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const locations = [...new Set(departments.map(d => d.location))];

  const filtered = departments.filter(d => {
    const ms = d.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) || d.depid.toLowerCase().includes(searchTerm.toLowerCase());
    const ml = filterLocation === "All" || d.location === filterLocation;
    const ms2 = filterStatus === "All" || d.status === filterStatus;
    return ms && ml && ms2;
  });

  const stats = [
    { label: "Total Departments", value: departments.length, icon: "bi-building", color: "#3b82f6", bg: "#eff6ff" },
    { label: "Total Employees", value: departments.reduce((acc, d) => acc + d.employeeCount, 0), icon: "bi-people", color: "#10b981", bg: "#ecfdf5" },
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
                    <th>Manager Name</th>
                    <th>Manager ID</th>
                    <th>Designation</th>
                    <th>Employees</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4" style={{ color: "var(--gray-400)" }}>
                        <i className="bi bi-building" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }} />
                        No departments found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((dept) => (
                      <tr key={dept.depid}>
                        <td><span style={{ color: "var(--primary)", fontWeight: 600 }}>{dept.depid}</span></td>
                        <td className="fw-semibold">{dept.departmentName}</td>
                        <td>{dept.managerName}</td>
                        <td>{dept.managerEmpId}</td>
                        <td>{dept.designation}</td>
                        <td>
                          <span className={`badge-status ${dept.employeeCount === 0 ? "" : "badge-pending"}`} style={dept.employeeCount === 0 ? { background: "var(--gray-500)", color: "#fff", border: "none" } : {}}>
                            <i className="bi bi-people me-1" />{dept.employeeCount}
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
                            <button className="btn-custom-primary d-flex align-items-center gap-1" style={{ padding: "0.3rem 0.7rem", fontSize: "0.78rem" }} onClick={() => handleEdit(dept)}>
                              <i className="bi bi-pencil" /> Edit
                            </button>
                            <button className="btn-custom-danger d-flex align-items-center gap-1" style={{ padding: "0.3rem 0.7rem", fontSize: "0.78rem" }} onClick={() => handleDelete(dept.depid)}>
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
            <button className="close-btn" onClick={() => { setShowForm(false); setEditId(null); setNewDept({ departmentName: "", managerEmpId: "", location: "", status: "Active" }); }}>
              <i className="bi bi-x-lg"></i>
            </button>
            <h4 className="fw-bold mb-4">{editId ? "Edit Department" : "Add New Department"}</h4>
            <form onSubmit={handleAdd}>
              <div className="mb-3">
                <label className="form-label">Department Name</label>
                <input type="text" className="form-control" required value={newDept.departmentName} onChange={e => setNewDept({...newDept, departmentName: e.target.value})} disabled={!!editId} />
              </div>
              <div className="mb-3">
                <label className="form-label">Department Manager</label>
                <select className="form-select" required value={newDept.managerEmpId} onChange={e => setNewDept({...newDept, managerEmpId: e.target.value})}>
                  <option value="">Select Manager</option>
                  {employees
                    .filter(e => {
                      const role = e.Role?.S || e.role?.S || e.Role || e.role || "";
                      return role.toLowerCase() === "manager";
                    })
                    .map((m, i) => {
                      const mName = m.FullName?.S || m.name?.S || m.FullName || m.name || m.empid || m.id;
                      const mId = m.empid?.S || m.id?.S || m.empid || m.id;
                      return <option key={i} value={mId}>{mName} ({mId})</option>;
                    })
                  }
                </select>
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
                <button type="button" className="btn btn-light" onClick={() => { setShowForm(false); setEditId(null); setNewDept({ departmentName: "", managerEmpId: "", location: "", status: "Active" }); }}>Cancel</button>
                <button type="submit" className="btn-custom-primary px-4">{editId ? "Update Department" : "Save Department"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Departments;
