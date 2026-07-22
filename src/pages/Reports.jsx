import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getEmployeeReport, getManagerReport, getDepartmentReport, getLeaveReport, getExpenseReport } from "../services/dataService";

const reportTypes = [
  "Employee",
  "Manager",
  "Department",
  "Leave",
  "Expense"
];

function Reports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Employee");
  const [toast, setToast] = useState(null);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [department, setDepartment] = useState("All");
  
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setErrorMsg("");
      setReportData([]);
      setCurrentPage(1);
      
      try {
        let data = [];
        if (activeTab === "Employee") data = await getEmployeeReport();
        else if (activeTab === "Manager") data = await getManagerReport();
        else if (activeTab === "Department") data = await getDepartmentReport();
        else if (activeTab === "Leave") data = await getLeaveReport();
        else if (activeTab === "Expense") data = await getExpenseReport();
        
        setReportData(data || []);
      } catch (err) {
        console.error("Failed to load report data", err);
        setErrorMsg("Failed to load report data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [activeTab]);

  const showToast = (message) => {
    setToast({ message, type: "success" });
    setTimeout(() => setToast(null), 3000);
  };

  const getStatusBadge = (status) => {
    if (!status) return "-";
    const s = status.toString().toLowerCase();
    if (s === 'active' || s === 'present' || s === 'approved' || s === 'verified' || s === 'joined' || s === 'accepted') {
      return <span className="badge-status badge-approved">{status}</span>;
    } else if (s === 'inactive' || s === 'absent' || s === 'rejected' || s === 'declined') {
      return <span className="badge-status badge-rejected">{status}</span>;
    } else if (s === 'pending' || s === 'late') {
      return <span className="badge-status badge-pending">{status}</span>;
    }
    return <span className="badge bg-light text-secondary border px-2 py-1">{status}</span>;
  };

  const columnsConfig = {
    "Employee": [
      { key: "id", label: "Employee ID", extract: r => r.empid || r.id || r.EmployeeId || "-" },
      { key: "name", label: "Full Name", extract: r => r.FullName || r.name || "-" },
      { key: "dept", label: "Department", extract: r => r.Department || r.department || "-" },
      { key: "desig", label: "Designation", extract: r => r.Designation || r.role || "-" },
      { key: "email", label: "Email", extract: r => r.Email || r.email || "-" },
      { key: "phone", label: "Phone", extract: r => r.Phone || r.phone || r.EmergencyContactPhone || "-" },
      { key: "status", label: "Status", extract: r => r.Status || r.status || "Active", isBadge: true },
      { key: "join", label: "Joining Date", extract: r => r.JoiningDate || r.joiningDate || "-" },
    ],
    "Manager": [
      { key: "id", label: "Manager ID", extract: r => r.ManagerId || r.empid || r.id || "-" },
      { key: "name", label: "Full Name", extract: r => r.FullName || r.name || "-" },
      { key: "dept", label: "Department", extract: r => r.Department || r.department || "-" },
      { key: "desig", label: "Designation", extract: r => r.Designation || r.role || "-" },
      { key: "email", label: "Email", extract: r => r.Email || r.email || "-" },
      { key: "phone", label: "Phone", extract: r => r.Phone || r.phone || r.EmergencyContactPhone || "-" },
      { key: "empCount", label: "Number of Employees", extract: r => r.EmployeeCount || r.employeeCount || r.employeeCount?.N || r.EmployeeCount?.N || "0" },
      { key: "status", label: "Status", extract: r => r.Status || r.status || "Active", isBadge: true },
    ],
    "Department": [
      { key: "name", label: "Department Name", extract: r => r.Name || r.name || r.DepartmentName || r.departmentName || "-" },
      { key: "head", label: "Department Head", extract: r => r.Head || r.head || r.Manager || r.ManagerName || r.managerName || "-" },
      { key: "total", label: "Number of Employees", extract: r => r.EmployeeCount || r.employeeCount || r.TotalEmployees || "0" },
      { key: "active", label: "Active Employees", extract: r => r.ActiveEmployees || r.activeEmployees || "0" },
      { key: "inactive", label: "Inactive Employees", extract: r => r.InactiveEmployees || r.inactiveEmployees || "0" },
    ],
    "Leave": [
      { key: "name", label: "Employee Name", extract: r => r.EmployeeName || r.employeeName || r.FullName || "-" },
      { key: "id", label: "Employee ID", extract: r => r.EmployeeId || r.employeeId || r.empid || "-" },
      { key: "type", label: "Leave Type", extract: r => r.LeaveType || r.leaveType || r.type || "-" },
      { key: "from", label: "From Date", extract: r => r.StartDate || r.startDate || r.fromDate || "-" },
      { key: "to", label: "To Date", extract: r => r.EndDate || r.endDate || r.toDate || "-" },
      { key: "days", label: "Total Days", extract: r => r.TotalDays || r.totalDays || r.days || "-" },
      { key: "status", label: "Status", extract: r => r.Status || r.status || "-", isBadge: true },
      { key: "approvedBy", label: "Approved By", extract: r => r.ApprovedBy || r.approvedBy || r.Manager || "-" },
    ],
    "Expense": [
      { key: "id", label: "Expense ID", extract: r => r.ExpenseId || r.expenseId || r.expid || r.id || "-" },
      { key: "name", label: "Employee Name", extract: r => r.EmployeeName || r.employeeName || r.FullName || "-" },
      { key: "cat", label: "Category", extract: r => r.Category || r.category || r.expenseType || r.type || "-" },
      { key: "amount", label: "Amount", extract: r => r.Amount || r.amount || "0" },
      { key: "date", label: "Date", extract: r => r.Date || r.date || r.expenseDate || "-" },
      { key: "status", label: "Status", extract: r => r.Status || r.status || "-", isBadge: true },
      { key: "approvedBy", label: "Approved By", extract: r => r.ApprovedBy || r.approvedBy || r.Manager || "-" },
    ]
  };

  const currentColumns = columnsConfig[activeTab] || [];

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Convert raw objects to an array of rows to make searching and sorting easier
  const mappedData = useMemo(() => {
    return reportData.map(row => {
      const mappedRow = {};
      currentColumns.forEach(col => {
        mappedRow[col.key] = col.extract(row);
      });
      mappedRow._original = row;
      return mappedRow;
    });
  }, [reportData, currentColumns]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return mappedData;
    const lowerSearch = searchTerm.toLowerCase();
    return mappedData.filter(row => {
      return currentColumns.some(col => {
        const val = row[col.key];
        return val && val.toString().toLowerCase().includes(lowerSearch);
      });
    });
  }, [mappedData, searchTerm, currentColumns]);

  const sortedData = useMemo(() => {
    const sortableItems = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key] || "";
        const bVal = b[sortConfig.key] || "";
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      <Sidebar role="admin" onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} />
      
      <div className="main-content">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="page-content bg-light" style={{ minHeight: "calc(100vh - 70px)" }}>
          <div className="section-header d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold mb-1">Organization Reports</h4>
              <p className="text-muted mb-0">Generate and export comprehensive organizational data.</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn-custom-outline d-flex align-items-center gap-2" onClick={() => showToast(`Exported ${activeTab} Report as PDF`)}>
                <i className="bi bi-file-earmark-pdf" style={{ color: "var(--danger)" }} /> Export PDF
              </button>
              <button className="btn-custom-outline d-flex align-items-center gap-2" onClick={() => showToast(`Exported ${activeTab} Report as Excel`)}>
                <i className="bi bi-file-earmark-excel" style={{ color: "var(--success)" }} /> Export Excel
              </button>
            </div>
          </div>

          <div className="card-dashboard p-3 mb-4 d-flex flex-wrap align-items-center gap-3 bg-white shadow-sm rounded-4 border-0">
            <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: "250px" }}>
              <i className="bi bi-calendar-range text-muted"></i>
              <input type="date" className="form-control form-control-sm border-0 bg-light" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              <span className="text-muted small px-1">to</span>
              <input type="date" className="form-control form-control-sm border-0 bg-light" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            
            <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: "200px" }}>
              <i className="bi bi-building text-muted"></i>
              <select className="form-select form-select-sm border-0 bg-light" value={department} onChange={e => setDepartment(e.target.value)}>
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: "200px" }}>
              <i className="bi bi-file-earmark-text text-muted"></i>
              <select className="form-select form-select-sm border-0 bg-light" value={activeTab} onChange={e => {setActiveTab(e.target.value); setSearchTerm("");}}>
                {reportTypes.map((type) => (
                  <option key={type} value={type}>{type} Report</option>
                ))}
              </select>
            </div>
            
            <button className="btn-custom-primary btn-sm px-4">
              Apply Filters
            </button>
          </div>

          <div className="card-dashboard border-0 shadow-sm rounded-4 bg-white h-100">
            <div className="card-header bg-white border-0 pt-4 pb-3 px-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
              <h5 className="fw-bold mb-0 text-dark">
                {activeTab} Data <span className="badge bg-primary bg-opacity-10 text-primary ms-2 rounded-pill px-3 py-1 fs-6 fw-semibold">{filteredData.length} Records</span>
              </h5>
              <div className="search-box position-relative" style={{ width: "300px" }}>
                <i className="bi bi-search position-absolute text-muted" style={{ left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
                <input 
                  type="text" 
                  className="form-control shadow-sm border-0 bg-light" 
                  style={{ padding: "0.5rem 1rem 0.5rem 2.5rem", borderRadius: "8px", fontSize: "0.9rem" }} 
                  placeholder={`Search ${activeTab.toLowerCase()}s...`} 
                  value={searchTerm} 
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                />
              </div>
            </div>
            
            <div className="card-body p-0">
              {isLoading ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : errorMsg ? (
                <div className="text-center py-5">
                  <i className="bi bi-exclamation-triangle-fill text-danger fs-1 mb-3 d-block"></i>
                  <h6 className="text-danger fw-semibold">{errorMsg}</h6>
                </div>
              ) : sortedData.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-folder-x text-muted fs-1 mb-3 d-block opacity-50"></i>
                  <h6 className="text-muted fw-semibold">No Records Found</h6>
                </div>
              ) : (
                <div className="table-responsive" style={{ overflow: "hidden" }}>
                  <table className="table-custom table table-hover align-middle mb-0">
                    <thead style={{ background: "var(--gray-50)", borderTop: "1px solid var(--gray-200)", borderBottom: "1px solid var(--gray-200)" }}>
                      <tr>
                        {currentColumns.map((col) => (
                          <th 
                            key={col.key} 
                            style={{ padding: "1rem", cursor: "pointer", userSelect: "none" }}
                            onClick={() => handleSort(col.key)}
                          >
                            <div className="d-flex align-items-center gap-2">
                              {col.label}
                              {sortConfig.key === col.key && (
                                <i className={`bi bi-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} text-primary`} style={{ fontSize: "0.8rem" }}></i>
                              )}
                              {sortConfig.key !== col.key && (
                                <i className="bi bi-arrow-up-down text-muted opacity-25" style={{ fontSize: "0.8rem" }}></i>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {currentColumns.map((col, cellIndex) => (
                            <td key={col.key} className={cellIndex === 0 ? "fw-semibold" : ""}>
                              {col.isBadge ? getStatusBadge(row[col.key]) : row[col.key]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {sortedData.length > 0 && !isLoading && !errorMsg && (
              <div className="card-footer bg-white border-0 pt-3 pb-4 px-4 d-flex justify-content-between align-items-center">
                <span className="text-muted small">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} records
                </span>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-sm btn-outline-secondary px-3" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-secondary px-3" 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default Reports;
