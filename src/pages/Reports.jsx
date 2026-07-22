import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const reportTypes = [
  "Employee",
  "Department",
  "Leave",
  "Expense"
];

const reportData = {
  "Employee": {
    columns: ["Emp ID", "Name", "Department", "Role", "Joining Date", "Status"],
    rows: [
      ["EMP001", "John Doe", "Engineering", "Senior Developer", "12 Jan 2023", "Active"],
      ["EMP002", "Jane Smith", "Marketing", "Marketing Manager", "15 Mar 2023", "Active"],
      ["EMP003", "Rajesh Kumar", "Sales", "Sales Executive", "01 Jun 2023", "Active"],
      ["EMP004", "Anita Desai", "HR", "HR Generalist", "10 Aug 2023", "Active"],
      ["EMP005", "Michael Brown", "Finance", "Accountant", "20 Sep 2023", "Inactive"],
    ]
  },
  "Department": {
    columns: ["Dept ID", "Department", "Head", "Employee Count", "Budget Utilized", "Status"],
    rows: [
      ["DEP001", "Engineering", "Rajesh Kumar", "45", "78%", "Active"],
      ["DEP002", "Marketing", "Sophia Williams", "22", "65%", "Active"],
      ["DEP003", "Sales", "David Brown", "30", "82%", "Active"],
      ["DEP004", "Human Resources", "Alice Smith", "18", "45%", "Active"],
      ["DEP005", "Finance", "Michael Johnson", "12", "50%", "Active"],
    ]
  },
  "Leave": {
    columns: ["Emp ID", "Name", "Leave Type", "From", "To", "Days", "Status"],
    rows: [
      ["EMP001", "John Doe", "Annual Leave", "10 Jul 2026", "14 Jul 2026", "5", "Approved"],
      ["EMP003", "Rajesh Kumar", "Sick Leave", "05 Jul 2026", "06 Jul 2026", "2", "Approved"],
      ["EMP005", "Michael Brown", "Personal", "20 Jul 2026", "20 Jul 2026", "1", "Pending"],
      ["EMP008", "David Lee", "Annual Leave", "01 Aug 2026", "10 Aug 2026", "10", "Rejected"],
    ]
  },
  "Expense": {
    columns: ["Exp ID", "Emp Name", "Category", "Date", "Amount", "Status"],
    rows: [
      ["EXP1001", "John Doe", "Travel", "01 Jul 2026", "$450.00", "Approved"],
      ["EXP1002", "Jane Smith", "Equipment", "03 Jul 2026", "$1,200.00", "Approved"],
      ["EXP1003", "Rajesh Kumar", "Meals", "05 Jul 2026", "$85.00", "Pending"],
      ["EXP1004", "Anita Desai", "Software", "06 Jul 2026", "$299.99", "Pending"],
      ["EXP1005", "Sunil Verma", "Travel", "07 Jul 2026", "$800.00", "Rejected"],
    ]
  }
};

const globalStats = [
  { label: "Total Employees", value: "156", icon: "bi-people", color: "#3b82f6", bg: "#eff6ff" },
  { label: "Total Departments", value: "6", icon: "bi-building", color: "#10b981", bg: "#ecfdf5" },
  { label: "Total Leave Requests", value: "45", icon: "bi-calendar-minus", color: "#f59e0b", bg: "#fffbeb" },
  { label: "Total Expense Claims", value: "24", icon: "bi-currency-dollar", color: "#8b5cf6", bg: "#f5f3ff" },
];

function Reports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Employee");
  const [toast, setToast] = useState(null);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [department, setDepartment] = useState("All");

  const currentReport = reportData[activeTab];

  const showToast = (message) => {
    setToast({ message, type: "success" });
    setTimeout(() => setToast(null), 3000);
  };

  const getStatusBadge = (status) => {
    const s = status.toLowerCase();
    if (s === 'active' || s === 'present' || s === 'approved' || s === 'verified' || s === 'joined' || s === 'accepted') {
      return <span className="badge-status badge-approved">{status}</span>;
    } else if (s === 'inactive' || s === 'absent' || s === 'rejected' || s === 'declined') {
      return <span className="badge-status badge-rejected">{status}</span>;
    } else if (s === 'pending' || s === 'late') {
      return <span className="badge-status badge-pending">{status}</span>;
    }
    return <span className="badge bg-light text-secondary border px-2 py-1">{status}</span>;
  };

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
        
        <div className="page-content">
          <div className="section-header">
            <div>
              <h4>Organization Reports</h4>
              <p>Generate and export comprehensive organizational data.</p>
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

          <div className="card-dashboard p-3 mb-4 d-flex flex-wrap align-items-center gap-3" style={{ background: "var(--white)" }}>
            <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: "250px" }}>
              <i className="bi bi-calendar-range" style={{ color: "var(--gray-500)" }}></i>
              <input type="date" className="form-control form-control-sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              <span className="text-muted small">to</span>
              <input type="date" className="form-control form-control-sm" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            
            <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: "200px" }}>
              <i className="bi bi-building" style={{ color: "var(--gray-500)" }}></i>
              <select className="form-select form-select-sm" value={department} onChange={e => setDepartment(e.target.value)}>
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: "200px" }}>
              <i className="bi bi-file-earmark-text" style={{ color: "var(--gray-500)" }}></i>
              <select className="form-select form-select-sm" value={activeTab} onChange={e => setActiveTab(e.target.value)}>
                {reportTypes.map((type) => (
                  <option key={type} value={type}>{type} Report</option>
                ))}
              </select>
            </div>
            
            <button className="btn-custom-primary btn-sm px-4">
              Apply Filters
            </button>
          </div>



          <div className="row g-3 mb-4">
            {globalStats.map((s) => (
              <div key={s.label} className="col-xl-3 col-md-6">
                <div className="stat-card card-dashboard d-flex align-items-center gap-3 h-100" style={{ background: s.bg }}>
                  <div className="stat-icon flex-shrink-0" style={{ background: s.color, width: 44, height: 44, fontSize: "1.2rem", margin: 0 }}>
                    <i className={`bi ${s.icon}`} />
                  </div>
                  <div className="overflow-hidden">
                    <div className="stat-label text-truncate">{s.label}</div>
                    <div className="stat-value text-truncate" style={{ color: s.color, fontSize: "1.5rem" }}>{s.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card-dashboard p-4">
            <h5 className="fw-bold mb-4" style={{ color: "var(--gray-800)" }}>
              {activeTab} Data
            </h5>
            <div className="table-responsive">
              <table className="table-custom table table-hover">
                <thead>
                  <tr>
                    {currentReport.columns.map((col, i) => (
                      <th key={i}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentReport.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className={cellIndex === 0 ? "fw-semibold" : ""}>
                          {cellIndex === row.length - 1 && (cell === 'Active' || cell === 'Inactive' || cell === 'Present' || cell === 'Absent' || cell === 'Late' || cell === 'Approved' || cell === 'Pending' || cell === 'Rejected' || cell === 'Verified' || cell === 'Joined' || cell === 'Accepted' || cell === 'Declined') 
                            ? getStatusBadge(cell) 
                            : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default Reports;
