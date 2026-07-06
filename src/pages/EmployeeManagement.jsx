import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function EmployeeManagement() {
  const [userRole] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored).role.toLowerCase() : "employee";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [employees, setEmployees] = useState([
    { id: "EMP1001", name: "John Doe", department: "IT", role: "Employee" },
    { id: "EMP1002", name: "Alice Smith", department: "HR", role: "Manager" },
    { id: "EMP1003", name: "David Lee", department: "Finance", role: "Employee" },
    { id: "EMP1004", name: "Sarah Wilson", department: "Marketing", role: "Employee" },
    { id: "EMP1005", name: "Mike Johnson", department: "IT", role: "Employee" },
  ]);

  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [department, setDepartment] = useState("");
  const [empRole, setEmpRole] = useState("");
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const perPage = 5;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setEmployeeId("");
    setEmployeeName("");
    setDepartment("");
    setEmpRole("");
    setEditId(null);
    setErrors({});
  };

  const handleSave = () => {
    const newErrors = {};
    if (!employeeId.trim()) newErrors.employeeId = true;
    if (!employeeName.trim()) newErrors.employeeName = true;
    if (!department.trim()) newErrors.department = true;
    if (!empRole.trim()) newErrors.empRole = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newEmployee = { id: employeeId.trim(), name: employeeName.trim(), department: department.trim(), role: empRole.trim() };

    if (editId) {
      setEmployees(employees.map(emp => emp.id === editId ? newEmployee : emp));
      showToast("Employee updated successfully!");
    } else {
      if (employees.some(e => e.id === employeeId.trim())) {
        showToast("Employee ID already exists", "warning");
        return;
      }
      setEmployees([...employees, newEmployee]);
      showToast("Employee added successfully!");
    }

    resetForm();
    setShowForm(false);
    setCurrentPage(1);
  };

  const handleDelete = (id) => {
    setEmployees(employees.filter(emp => emp.id !== id));
    showToast("Employee removed", "warning");
  };

  const handleEdit = (emp) => {
    setEmployeeId(emp.id);
    setEmployeeName(emp.name);
    setDepartment(emp.department);
    setEmpRole(emp.role);
    setEditId(emp.id);
    setShowForm(true);
    setErrors({});
  };

  const departments = [...new Set(employees.map(e => e.department))];
  const filtered = employees.filter(e => {
    const ms = e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.department.toLowerCase().includes(searchTerm.toLowerCase());
    const md = filterDept === "All" || e.department === filterDept;
    return ms && md;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="dashboard-wrapper">
      {toast && (
        <div className="toast-message">
          <div className={`alert alert-${toast.type === "warning" ? "warning" : "success"} d-flex align-items-center gap-2 shadow-sm`} style={{ borderRadius: "10px", border: "none", padding: "0.75rem 1.25rem" }}>
            <i className={`bi ${toast.type === "warning" ? "bi-exclamation-circle" : "bi-check-circle"}`} />
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
              <h4>Employee Management</h4>
              <p>{employees.length} employees in the system</p>
            </div>
            <button
              className={`btn-custom-${showForm ? "danger" : "primary"} d-flex align-items-center gap-2`}
              onClick={() => { setShowForm(!showForm); if (!showForm) resetForm(); }}
            >
              <i className={`bi ${showForm ? "bi-x-lg" : "bi-person-plus"}`} />
              {showForm ? "Cancel" : "Add Employee"}
            </button>
          </div>

          {showForm && (
            <div className="card-dashboard p-4 mb-4">
              <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)" }}>
                <i className={`bi ${editId ? "bi-pencil-square" : "bi-person-plus"} me-2`} style={{ color: "var(--primary)" }} />
                {editId ? "Edit Employee" : "New Employee"}
              </h5>
              <div className="row g-3 form-custom">
                <div className="col-md-3">
                  <label className="form-label">Employee ID</label>
                  <input type="text" className={`form-control ${errors.employeeId ? "is-invalid" : ""}`} placeholder="EMP1001" value={employeeId} onChange={(e) => { setEmployeeId(e.target.value); setErrors({ ...errors, employeeId: false }); }} disabled={!!editId} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Full Name</label>
                  <input type="text" className={`form-control ${errors.employeeName ? "is-invalid" : ""}`} placeholder="John Doe" value={employeeName} onChange={(e) => { setEmployeeName(e.target.value); setErrors({ ...errors, employeeName: false }); }} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Department</label>
                  <input type="text" className={`form-control ${errors.department ? "is-invalid" : ""}`} placeholder="IT, HR, Finance..." value={department} onChange={(e) => { setDepartment(e.target.value); setErrors({ ...errors, department: false }); }} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Role</label>
                  <select className={`form-select ${errors.empRole ? "is-invalid" : ""}`} value={empRole} onChange={(e) => { setEmpRole(e.target.value); setErrors({ ...errors, empRole: false }); }}>
                    <option value="">Select Role</option>
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="col-12">
                  <button className="btn-custom-primary d-flex align-items-center gap-2" onClick={handleSave}>
                    <i className={`bi ${editId ? "bi-arrow-repeat" : "bi-save"}`} />
                    {editId ? "Update Employee" : "Save Employee"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="card-dashboard p-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
              <div className="search-box">
                <i className="bi bi-search" />
                <input type="text" className="form-control" placeholder="Search employees..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
              </div>
              <div className="d-flex gap-2 align-items-center">
                <i className="bi bi-funnel" style={{ color: "var(--gray-400)" }} />
                <select className="form-select" style={{ width: "auto", borderRadius: "50px", fontSize: "0.85rem", padding: "0.35rem 2rem 0.35rem 0.75rem" }} value={filterDept} onChange={(e) => { setFilterDept(e.target.value); setCurrentPage(1); }}>
                  <option value="All">All Departments</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table-custom table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4" style={{ color: "var(--gray-400)" }}>
                        <i className="bi bi-people" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }} />
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    paginated.map((emp) => (
                      <tr key={emp.id}>
                        <td><span style={{ color: "var(--primary)", fontWeight: 600 }}>{emp.id}</span></td>
                        <td className="fw-semibold">{emp.name}</td>
                        <td><span className="badge-status badge-uploaded">{emp.department}</span></td>
                        <td>{emp.role}</td>
                        <td>
                          <div className="action-btns justify-content-center">
                            <button className="btn-custom-outline d-flex align-items-center gap-1" style={{ padding: "0.3rem 0.7rem", fontSize: "0.78rem" }} onClick={() => handleEdit(emp)}>
                              <i className="bi bi-pencil" /> Edit
                            </button>
                            <button className="btn-custom-danger d-flex align-items-center gap-1" style={{ padding: "0.3rem 0.7rem", fontSize: "0.78rem" }} onClick={() => handleDelete(emp.id)}>
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

            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3 pt-3" style={{ borderTop: "1px solid var(--gray-100)" }}>
                <small style={{ color: "var(--gray-500)" }}>
                  Showing {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
                </small>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}><i className="bi bi-chevron-left" /></button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <li key={p} className={`page-item ${p === currentPage ? "active" : ""}`}>
                        <button className="page-link" onClick={() => setCurrentPage(p)}>{p}</button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}><i className="bi bi-chevron-right" /></button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeManagement;
