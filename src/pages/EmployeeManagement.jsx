import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getCurrentUser, getEmployees, getManagerEmployees, getAdminEmployees, addAdminEmployee, updateAdminEmployee, deleteAdminEmployee, addAdminManager, getAdminManagers } from "../services/dataService";

const designationMap = {
  "IT": ["Software Engineer", "Senior Software Engineer", "QA Engineer", "Technical Lead", "DevOps Engineer"],
  "Cloud": ["Cloud Engineer", "AWS Engineer", "Azure Engineer", "Cloud Architect"],
  "Finance": ["Accountant", "Financial Analyst", "Finance Executive", "Finance Manager"],
  "HR": ["HR Executive", "HR Manager", "Recruiter", "Talent Acquisition Specialist"],
  "Admin": ["Admin Executive", "Office Administrator", "Operations Executive"]
};

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
  const [designation, setDesignation] = useState("");
  const [manager, setManager] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [email, setEmail] = useState("");
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
        if (userRole === "admin") {
          const [emps, mgrs] = await Promise.all([
            getAdminEmployees().catch(err => {
              console.error("Failed to fetch employees", err);
              showToast("Failed to load some employee records", "warning");
              return [];
            }),
            getAdminManagers().catch(err => {
              console.error("Failed to fetch managers", err);
              showToast("Failed to load some manager records", "warning");
              return [];
            })
          ]);
          const combined = [...emps, ...mgrs];
          const uniqueEmps = Array.from(new Map(combined.map(item => [item.empid || item.id, item])).values());
          setEmployees(uniqueEmps);
          setEmployeeCount(uniqueEmps.length);
        } else if (userRole === "manager") {
          let emps = [];
          if (currentUser?.employeeId) {
            emps = await getManagerEmployees(currentUser.employeeId).catch(err => {
              console.error("Failed to fetch manager employees", err);
              showToast("Failed to fetch employees", "error");
              return [];
            });
          }
          setEmployees(emps);
          setEmployeeCount(emps.length);
        }
      } catch (err) {
        console.error("Failed to fetch employees", err);
        showToast("Failed to fetch employees", "error");
      } finally {
        setIsLoading(false);
      }
    }
    fetchEmployees();
    window.addEventListener('dataSync', fetchEmployees);
    return () => window.removeEventListener('dataSync', fetchEmployees);
  }, [userRole, currentUser?.employeeId]);

  const resetForm = () => {
    setEmployeeId("");
    setEmployeeName("");
    setDepartment("");
    setEmpRole("");
    setDesignation("");
    setManager("");
    setPhoneNumber("");
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setEmail("");
    setEditId(null);
    setErrors({});
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!employeeId.trim()) newErrors.employeeId = true;
    if (!employeeName.trim()) newErrors.employeeName = true;
    if (!department.trim()) newErrors.department = true;
    if (!empRole.trim()) newErrors.empRole = true;
    if (!designation.trim()) newErrors.designation = true;
    if (!phoneNumber.trim() || !/^\d{10}$/.test(phoneNumber)) newErrors.phoneNumber = true;
    if (empRole.trim() === "Employee" && !manager.trim()) newErrors.manager = true;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const isEmailDuplicate = employees.some(emp => {
      const empEmail = emp.Email?.S || emp.email?.S || emp.Email || emp.email;
      const id = emp.empid?.S || emp.id?.S || emp.empid || emp.id;
      return empEmail === email.trim() && id !== editId;
    });

    if (isEmailDuplicate) {
      showToast("Email address already exists", "warning");
      return;
    }

    if (userRole === "admin") {
      setIsLoading(true);
      try {
        const fullPayload = {
          empid: employeeId.trim(), Title: "", FullName: employeeName.trim(), DateOfBirth: "",
          BloodGroup: "", Phone: phoneNumber.trim(), Email: email.trim(), Address: "", Department: department.trim(),
          Designation: designation.trim(), JoiningDate: joiningDate, Manager: manager, Status: "Active", EmergencyContactName: "",
          EmergencyContactPhone: "", EmergencyContactRelation: "", Education: "", Skills: [],
          LinkedIn: "", GitHub: "", Role: empRole.trim(), Password: `${employeeId.trim()}@123`, profileImage: "",
          resume: "", resumeName: ""
        };

        if (editId) {
          await updateAdminEmployee(editId, fullPayload);
        } else {
          if (empRole.trim().toLowerCase() === "manager") {
            const managerPayload = {
              ...fullPayload,
              location: ""
            };
            await addAdminManager(managerPayload);
          } else {
            await addAdminEmployee(fullPayload);
          }
        }
        showToast(editId ? "Employee updated successfully!" : "Employee added successfully!");
        
        const [emps, mgrs] = await Promise.all([
          getAdminEmployees().catch(err => {
            console.error("Failed to fetch employees", err);
            showToast("Failed to load some employee records", "warning");
            return [];
          }),
          getAdminManagers().catch(err => {
            console.error("Failed to fetch managers", err);
            showToast("Failed to load some manager records", "warning");
            return [];
          })
        ]);
        const combined = [...emps, ...mgrs];
        const uniqueEmps = Array.from(new Map(combined.map(item => [item.empid || item.id, item])).values());
        setEmployees(uniqueEmps);
        setEmployeeCount(uniqueEmps.length);
      } catch (e) {
        console.error(e);
        let errorMsg = "Failed to save employee";
        if (e.response && e.response.data && e.response.data.message) {
          errorMsg = e.response.data.message;
        } else if (e.response && typeof e.response.data === 'string') {
          errorMsg = e.response.data;
        } else if (e.message) {
          errorMsg = e.message;
        }
        showToast(errorMsg, "error");
      } finally {
        setIsLoading(false);
      }
    } else {
      const newEmployee = { id: employeeId.trim(), name: employeeName.trim(), department: department.trim(), role: empRole.trim(), Designation: designation.trim(), Email: email.trim(), Phone: phoneNumber.trim(), JoiningDate: joiningDate, Manager: manager, Password: `${employeeId.trim()}@123`, Status: "Active" };

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
    }

    resetForm();
    setShowForm(false);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (userRole === "admin") {
      setIsLoading(true);
      try {
        await deleteAdminEmployee(id);
        showToast("Employee removed", "warning");
        
        const [emps, mgrs] = await Promise.all([
          getAdminEmployees().catch(err => {
            console.error("Failed to fetch employees", err);
            showToast("Failed to load some employee records", "warning");
            return [];
          }),
          getAdminManagers().catch(err => {
            console.error("Failed to fetch managers", err);
            showToast("Failed to load some manager records", "warning");
            return [];
          })
        ]);
        const combined = [...emps, ...mgrs];
        const uniqueEmps = Array.from(new Map(combined.map(item => [item.empid || item.id, item])).values());
        setEmployees(uniqueEmps);
        setEmployeeCount(uniqueEmps.length);
      } catch (e) {
        console.error(e);
        showToast("Failed to delete employee", "error");
      } finally {
        setIsLoading(false);
      }
    } else {
      setEmployees(employees.filter(emp => emp.id !== id && (emp.empid || emp.id) !== id));
      showToast("Employee removed", "warning");
    }
  };

  const handleEdit = (emp) => {
    setEmployeeName(emp.name || emp.FullName?.S || emp.FullName || "");
    setDepartment(emp.department || emp.Department?.S || emp.Department || "");
    setEmpRole(emp.role || emp.Role?.S || emp.Role || "");
    setDesignation(emp.Designation?.S || emp.Designation || "");
    setManager(emp.Manager?.S || emp.Manager || "");
    setPhoneNumber(emp.Phone?.S || emp.Phone || "");
    setJoiningDate(emp.JoiningDate?.S || emp.JoiningDate || new Date().toISOString().split('T')[0]);
    setEmail(emp.Email?.S || emp.email?.S || emp.Email || emp.email || "");
    setEditId(emp.id || emp.empid?.S || emp.empid);
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
          <div className="section-header mb-4">
            <div>
              <h3 className="fw-bold mb-1" style={{ color: "var(--gray-900)" }}>Employee Management</h3>
              <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>{userRole === "manager" ? employeeCount : visibleEmployees.length} employees in the system</p>
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

          <div className="row g-3 mb-4">
            <div className="col-xl-4 col-md-4">
              <div className="stat-card card-dashboard d-flex align-items-center gap-3 h-100" style={{ background: "#eff6ff", border: "none" }}>
                <div className="stat-icon" style={{ background: "#3b82f6", width: 44, height: 44, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "10px" }}>
                  <i className="bi bi-people" style={{ color: "#fff", fontSize: "1.2rem" }} />
                </div>
                <div>
                  <div className="stat-label" style={{ color: "var(--gray-600)", fontSize: "0.85rem", fontWeight: 600 }}>Total Employees</div>
                  <div className="stat-value" style={{ color: "#3b82f6", fontSize: "1.5rem", fontWeight: 700 }}>{visibleEmployees.length}</div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-md-4">
              <div className="stat-card card-dashboard d-flex align-items-center gap-3 h-100" style={{ background: "#ecfdf5", border: "none" }}>
                <div className="stat-icon" style={{ background: "#10b981", width: 44, height: 44, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "10px" }}>
                  <i className="bi bi-person-check" style={{ color: "#fff", fontSize: "1.2rem" }} />
                </div>
                <div>
                  <div className="stat-label" style={{ color: "var(--gray-600)", fontSize: "0.85rem", fontWeight: 600 }}>Active Employees</div>
                  <div className="stat-value" style={{ color: "#10b981", fontSize: "1.5rem", fontWeight: 700 }}>{visibleEmployees.filter(e => { const status = e.Status?.S || e.status?.S || e.Status || e.status; return status !== "Inactive"; }).length}</div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-md-4">
              <div className="stat-card card-dashboard d-flex align-items-center gap-3 h-100" style={{ background: "#fffbeb", border: "none" }}>
                <div className="stat-icon" style={{ background: "#f59e0b", width: 44, height: 44, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "10px" }}>
                  <i className="bi bi-building" style={{ color: "#fff", fontSize: "1.2rem" }} />
                </div>
                <div>
                  <div className="stat-label" style={{ color: "var(--gray-600)", fontSize: "0.85rem", fontWeight: 600 }}>Total Departments</div>
                  <div className="stat-value" style={{ color: "#f59e0b", fontSize: "1.5rem", fontWeight: 700 }}>
                    {new Set(visibleEmployees.map(e => e.Department?.S || e.department?.S || e.Department || e.department).filter(d => d && d !== "-")).size}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showForm && (
            <div className="card-dashboard p-4 mb-4">
              <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)" }}>
                <i className={`bi ${editId ? "bi-pencil-square" : "bi-person-plus"} me-2`} style={{ color: "var(--primary)" }} />
                {editId ? "Edit Employee" : "New Employee"}
              </h5>
              
              {(() => {
                const filteredManagers = employees.filter(e => {
                  const dept = e.Department?.S || e.department?.S || e.Department || e.department || "";
                  return dept === department;
                });
                return (
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
                  <select 
                    className={`form-select ${errors.department ? "is-invalid" : ""}`} 
                    value={department} 
                    onChange={(e) => { 
                      setDepartment(e.target.value); 
                      setDesignation("");
                      setErrors({ ...errors, department: false }); 
                    }}
                  >
                    <option value="">Select Department</option>
                    {Object.keys(designationMap).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Designation</label>
                  <select 
                    className={`form-select ${errors.designation ? "is-invalid" : ""}`} 
                    value={designation} 
                    onChange={(e) => { setDesignation(e.target.value); setErrors({ ...errors, designation: false }); }}
                    disabled={!department}
                  >
                    <option value="">Select Designation</option>
                    {department && designationMap[department] && designationMap[department].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Portal Role</label>
                  <select className={`form-select ${errors.empRole ? "is-invalid" : ""}`} value={empRole} onChange={(e) => { setEmpRole(e.target.value); setErrors({ ...errors, empRole: false }); }}>
                    <option value="">Select Role</option>
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Email Address</label>
                  <input type="email" className={`form-control ${errors.email ? "is-invalid" : ""}`} placeholder="employee@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: false }); }} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Manager</label>
                  <select className={`form-select ${errors.manager ? "is-invalid" : ""}`} value={manager} onChange={(e) => { setManager(e.target.value); setErrors({ ...errors, manager: false }); }} disabled={!department}>
                    <option value="">Select Manager</option>
                    {filteredManagers.map((m, i) => {
                      const mName = m.FullName?.S || m.name?.S || m.FullName || m.name;
                      return <option key={i} value={mName}>{mName}</option>;
                    })}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Phone Number</label>
                  <input type="text" className={`form-control ${errors.phoneNumber ? "is-invalid" : ""}`} placeholder="1234567890" value={phoneNumber} onChange={(e) => { setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10)); setErrors({ ...errors, phoneNumber: false }); }} />
                  {errors.phoneNumber && <small className="text-danger">Must be exactly 10 digits</small>}
                </div>
                <div className="col-md-3">
                  <label className="form-label">Joining Date</label>
                  <input type="date" className="form-control text-muted" value={joiningDate} disabled style={{ backgroundColor: "var(--gray-100)" }} />
                </div>
                <div className="col-12 mt-4">
                  <button className="btn-custom-primary d-flex align-items-center gap-2" onClick={handleSave}>
                    <i className={`bi ${editId ? "bi-arrow-repeat" : "bi-save"}`} />
                    {editId ? "Update Employee" : "Save Employee"}
                  </button>
                </div>
              </div>
              );
              })()}
            </div>
          )}

          <div className="card-dashboard p-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-4 mb-4">
              <div className="search-box position-relative" style={{ width: "350px", maxWidth: "100%" }}>
                <i className="bi bi-search position-absolute" style={{ left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-500)" }} />
                <input type="text" className="form-control shadow-sm" style={{ padding: "0.6rem 1rem 0.6rem 2.5rem", borderRadius: "8px", border: "1px solid var(--gray-200)", fontSize: "0.95rem" }} placeholder="Search employees..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
              </div>
              <div className="d-flex gap-2 align-items-center">
                <i className="bi bi-funnel" style={{ color: "var(--gray-500)", fontSize: "1.1rem" }} />
                <select className="form-select shadow-sm" style={{ width: "auto", borderRadius: "8px", fontSize: "0.95rem", padding: "0.6rem 2.5rem 0.6rem 1rem", border: "1px solid var(--gray-200)" }} value={filterDept} onChange={(e) => { setFilterDept(e.target.value); setCurrentPage(1); }}>
                  <option value="All">All Departments</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="table-responsive shadow-sm rounded-4 border" style={{ overflow: "hidden" }}>
              <table className="table-custom table table-hover align-middle mb-0">
                <thead style={{ background: "var(--gray-200)" }}>
                  <tr>
                    <th style={{ padding: "1rem" }}>Employee ID</th>
                    <th style={{ padding: "1rem" }}>Name</th>
                    <th style={{ padding: "1rem" }}>Department</th>
                    <th style={{ padding: "1rem" }}>Role</th>
                    <th className="text-center" style={{ padding: "1rem" }}>Actions</th>
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
                      const getInitials = (name) => {
                        if (!name || name === "-") return "?";
                        const parts = name.trim().split(" ");
                        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                        return name.substring(0, 2).toUpperCase();
                      };
                      const initials = getInitials(empName);
                      
                      // Generate a consistent color based on name string
                      const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];
                      const colorIndex = empName !== "-" ? empName.length % colors.length : 0;
                      const avatarBg = colors[colorIndex];

                      return (
                      <tr key={emp.empid?.S || index}>
                        <td><span style={{ color: "var(--primary)", fontWeight: 600 }}>{empId}</span></td>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            {emp.profileImage?.S || emp.profileImage ? (
                              <img src={emp.profileImage?.S || emp.profileImage} alt="profile" style={{width: 42, height: 42, borderRadius: "50%", objectFit: "cover", border: "2px solid #fff", boxShadow: "0 2px 4px rgba(0,0,0,0.08)"}}/>
                            ) : (
                              <div style={{width: 42, height: 42, borderRadius: "50%", background: avatarBg, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.95rem", fontWeight: 600, flexShrink: 0, boxShadow: "0 2px 4px rgba(0,0,0,0.08)"}}>
                                {initials}
                              </div>
                            )}
                            <span className="fw-semibold" style={{ fontSize: "0.95rem" }}>{empName}</span>
                          </div>
                        </td>
                        <td><span className="badge-status badge-uploaded">{empDept}</span></td>
                        <td>{empRole}</td>
                        <td>
                          <div className="action-btns justify-content-center d-flex gap-2">
                            {userRole === "manager" ? (
                              <button className="btn-custom-primary d-flex align-items-center gap-1" style={{ padding: "0.3rem 0.7rem", fontSize: "0.78rem" }} onClick={() => setViewEmployee(emp)}>
                                <i className="bi bi-eye" /> View
                              </button>
                            ) : (
                              <>
                                <button className="btn-custom-outline d-flex align-items-center justify-content-center gap-1" style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", borderRadius: "6px" }} onClick={() => handleEdit(emp)}>
                                  <i className="bi bi-pencil" /> Edit
                                </button>
                                <button className="btn-custom-danger d-flex align-items-center justify-content-center gap-1" style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", borderRadius: "6px" }} onClick={() => { if(window.confirm("Are you sure you want to delete this employee?")) handleDelete(empId); }}>
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
                  {viewEmployee.profileImage?.S || viewEmployee.profileImage ? (
                    <img src={viewEmployee.profileImage?.S || viewEmployee.profileImage} alt="profile" style={{width: 60, height: 60, borderRadius: "50%", objectFit: "cover"}}/>
                  ) : (
                    <div style={{width:60,height:60,borderRadius:"50%",background:"var(--primary)",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.5rem"}}>
                      {String(viewEmployee.FullName?.S || viewEmployee.name?.S || viewEmployee.FullName || viewEmployee.name || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h6 className="mb-0 fw-bold">{viewEmployee.FullName?.S || viewEmployee.name?.S || viewEmployee.FullName || viewEmployee.name}</h6>
                    <small className="text-muted">{viewEmployee.Designation?.S || viewEmployee.role?.S || viewEmployee.Designation || viewEmployee.role || 'Employee'}</small>
                  </div>
                </div>
                <div className="mb-2"><strong>ID:</strong> <span style={{color: "var(--primary)"}}>{viewEmployee.empid?.S || viewEmployee.id?.S || viewEmployee.empid || viewEmployee.id}</span></div>
                <div className="mb-2"><strong>Department:</strong> {viewEmployee.Department?.S || viewEmployee.department?.S || viewEmployee.Department || viewEmployee.department || '—'}</div>
                <div className="mb-2"><strong>Email:</strong> {viewEmployee.Email?.S || viewEmployee.email?.S || viewEmployee.Email || viewEmployee.email || '—'}</div>
                <div className="mb-2"><strong>Phone:</strong> {viewEmployee.Phone?.S || viewEmployee.phone?.S || viewEmployee.Phone || viewEmployee.phone || '—'}</div>
                <div className="mb-2"><strong>Location:</strong> {viewEmployee.Address?.S || viewEmployee.location?.S || viewEmployee.Address || viewEmployee.location || '—'}</div>
                <div className="mb-2"><strong>Status:</strong> <span className="badge-status badge-approved">{viewEmployee.Status?.S || viewEmployee.status?.S || viewEmployee.Status || viewEmployee.status || 'Active'}</span></div>
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
