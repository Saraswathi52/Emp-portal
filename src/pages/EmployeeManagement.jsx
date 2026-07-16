import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getCurrentUser, getEmployees, getManagerEmployees } from "../services/dataService";

function EmployeeManagement() {
  const [userRole] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored).role.toLowerCase() : "employee";
  });
  const [currentUser] = useState(() => getCurrentUser());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [viewEmployee, setViewEmployee] = useState(null);

  const [employees, setEmployees] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    async function fetchEmployees() {
      setIsLoading(true);
      try {
        if (userRole === "manager") {
          const data = await getManagerEmployees(currentUser?.employeeId);
          setEmployees(Array.isArray(data?.employees) ? data.employees : []);
          setEmployeeCount(data?.employeeCount || (Array.isArray(data?.employees) ? data.employees.length : 0));
        } else {
          const data = getEmployees();
          setEmployees(Array.isArray(data) ? data : []);
          setEmployeeCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (err) {
        console.error("Failed to fetch employees", err);
        showToast("Failed to fetch employees", "error");
      } finally {
        setIsLoading(false);
      }
    }
    fetchEmployees();
  }, [userRole, currentUser?.employeeId]);

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

  const getSafeProp = (obj, prop1, prop2) => {
    if (!obj) return "";
    let val = obj[prop1] || obj[prop2];
    if (val && typeof val === "object") {
      if (val.S !== undefined) return val.S;
      if (val.N !== undefined) return val.N;
    }
    return val || "";
  };

  const departments = [...new Set(employees.map(e => getSafeProp(e, 'department', 'Department')).filter(Boolean))];

  let visibleEmployees = employees;
  // Let the backend handle filtering if manager, otherwise filter locally
  if (userRole === "manager") {
    // API should return only the manager's employees, so no need to filter by currentUser.employeeId here.
  }

  const filtered = visibleEmployees.filter(e => {
    const id = getSafeProp(e, 'id', 'empid');
    const name = getSafeProp(e, 'name', 'FullName');
    const dept = getSafeProp(e, 'department', 'Department');
    
    const ms = String(id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(dept).toLowerCase().includes(searchTerm.toLowerCase());
    const md = filterDept === "All" || String(dept) === filterDept;
    return ms && md;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="dashboard-wrapper">
      {toast && (
        <div className="toast-message" style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1055 }}>
          <div className={`alert alert-${toast.type === "error" ? "danger" : (toast.type === "warning" ? "warning" : "success")} d-flex align-items-center gap-2 shadow-sm`} style={{ borderRadius: "10px", border: "none", padding: "0.75rem 1.25rem" }}>
            <i className={`bi ${toast.type === "error" ? "bi-exclamation-triangle" : (toast.type === "warning" ? "bi-exclamation-circle" : "bi-check-circle")}`} />
            {toast.message}
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="modal-backdrop show" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 1050, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
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
              <p>{userRole === "manager" ? employeeCount : visibleEmployees.length} employees in the system</p>
            </div>
            {userRole !== "manager" && (
              <button
                className={`btn-custom-${showForm ? "danger" : "primary"} d-flex align-items-center gap-2`}
                onClick={() => { setShowForm(!showForm); if (!showForm) resetForm(); }}
              >
                <i className={`bi ${showForm ? "bi-x-lg" : "bi-person-plus"}`} />
                {showForm ? "Cancel" : "Add Employee"}
              </button>
            )}
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
                    paginated.map((emp, index) => {
                      if (!emp) return null;
                      const empId = emp.empid?.S || emp.id?.S || emp.empid || emp.id || "-";
                      const empName = emp.FullName?.S || emp.name?.S || emp.FullName || emp.name || "-";
                      const empDept = emp.Department?.S || emp.department?.S || emp.Department || emp.department || "-";
                      const empRole = emp.Designation?.S || emp.role?.S || emp.Designation || emp.role || "-";
                      return (
                      <tr key={emp.empid?.S || index}>
                        <td><span style={{ color: "var(--primary)", fontWeight: 600 }}>{empId}</span></td>
                        <td className="fw-semibold d-flex align-items-center gap-2">
                          {emp.profileImage?.S || emp.profileImage ? (
                            <img src={emp.profileImage?.S || emp.profileImage} alt="profile" style={{width: 30, height: 30, borderRadius: "50%", objectFit: "cover"}}/>
                          ) : (
                            <div style={{width:30,height:30,borderRadius:"50%",background:"var(--primary)",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.8rem",flexShrink:0}}>
                              {empName ? empName.charAt(0).toUpperCase() : '?'}
                            </div>
                          )}
                          {empName}
                        </td>
                        <td><span className="badge-status badge-uploaded">{empDept}</span></td>
                        <td>{empRole}</td>
                        <td>
                          <div className="action-btns justify-content-center">
                            {userRole === "manager" ? (
                              <button className="btn-custom-primary d-flex align-items-center gap-1" style={{ padding: "0.3rem 0.7rem", fontSize: "0.78rem" }} onClick={() => setViewEmployee(emp)}>
                                <i className="bi bi-eye" /> View
                              </button>
                            ) : (
                              <>
                                <button className="btn-custom-outline d-flex align-items-center gap-1" style={{ padding: "0.3rem 0.7rem", fontSize: "0.78rem" }} onClick={() => handleEdit(emp)}>
                                  <i className="bi bi-pencil" /> Edit
                                </button>
                                <button className="btn-custom-danger d-flex align-items-center gap-1" style={{ padding: "0.3rem 0.7rem", fontSize: "0.78rem" }} onClick={() => handleDelete(empId)}>
                                  <i className="bi bi-trash" /> Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )})
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

          {viewEmployee && (
            <div className="modal-backdrop" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 1050, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setViewEmployee(null)}>
              <div className="card-dashboard p-4" style={{ width: "90%", maxWidth: "500px", zIndex: 1060 }} onClick={e => e.stopPropagation()}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">Employee Details</h5>
                  <button className="btn btn-sm btn-light" onClick={() => setViewEmployee(null)}><i className="bi bi-x-lg"></i></button>
                </div>
                <div className="d-flex align-items-center gap-3 mb-4">
                  {viewEmployee.profileImage ? (
                    <img src={viewEmployee.profileImage} alt="profile" style={{width: 60, height: 60, borderRadius: "50%", objectFit: "cover"}}/>
                  ) : (
                    <div style={{width:60,height:60,borderRadius:"50%",background:"var(--primary)",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.5rem"}}>
                      {(viewEmployee.FullName || viewEmployee.name || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h6 className="mb-0 fw-bold">{viewEmployee.FullName || viewEmployee.name}</h6>
                    <small className="text-muted">{viewEmployee.Designation || viewEmployee.role || 'Employee'}</small>
                  </div>
                </div>
                <div className="mb-2"><strong>ID:</strong> <span style={{color: "var(--primary)"}}>{viewEmployee.empid || viewEmployee.id}</span></div>
                <div className="mb-2"><strong>Department:</strong> {viewEmployee.Department || viewEmployee.department || '—'}</div>
                <div className="mb-2"><strong>Email:</strong> {viewEmployee.Email || viewEmployee.email || '—'}</div>
                <div className="mb-2"><strong>Phone:</strong> {viewEmployee.Phone || viewEmployee.phone || '—'}</div>
                <div className="mb-2"><strong>Location:</strong> {viewEmployee.Address || viewEmployee.location || '—'}</div>
                <div className="mb-2"><strong>Status:</strong> <span className="badge-status badge-approved">{viewEmployee.Status || viewEmployee.status || 'Active'}</span></div>
                <div className="mt-3 text-end">
                  <button className="btn btn-sm btn-custom-outline" onClick={() => setViewEmployee(null)}>Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeManagement;
