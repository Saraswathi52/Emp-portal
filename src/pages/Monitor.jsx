import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Users, UserCheck, Calendar, DollarSign, UserPlus, Building, CheckCircle, FileText, Bell, Clock, Eye, Activity, UserMinus, UserX } from "lucide-react";
import { getAdminEmployees, getAllLeaveRequests, getAllExpenses } from "../services/dataService";

function Monitor() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [metrics, setMetrics] = useState([
    { label: "Total Employees", value: "0", status: "Updated", icon: Users, color: "#3b82f6", bg: "#eff6ff" },
    { label: "Active Employees", value: "0", status: "Updated", icon: UserCheck, color: "#10b981", bg: "#ecfdf5" },
    { label: "Pending Leave Requests", value: "8", status: "Requires action", icon: Calendar, color: "#f59e0b", bg: "#fffbeb" },
    { label: "Pending Expense Claims", value: "15", status: "$2,450 total", icon: DollarSign, color: "#8b5cf6", bg: "#f3e8ff" },
  ]);

  const [recentActivities, setRecentActivities] = useState([]);
  const [employeeStatus, setEmployeeStatus] = useState([
    { name: "Active Employees", count: 0, color: "#10b981", icon: UserCheck },
    { name: "Employees On Leave", count: 0, color: "#f59e0b", icon: UserMinus },
    { name: "Inactive Employees", count: 0, color: "#ef4444", icon: UserX },
  ]);

  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const emps = await getAdminEmployees();
        
        // Fetch leave and expenses dynamically
        const leaves = getAllLeaveRequests();
        const expenses = await getAllExpenses();
        
        const pendingLeaves = leaves.filter(l => l.status === "Pending" || l.status?.S === "Pending" || l.Status === "Pending" || l.Status?.S === "Pending");
        const pendingExpenses = expenses.filter(e => e.status === "Pending" || e.status?.S === "Pending" || e.Status === "Pending" || e.Status?.S === "Pending");
        
        // Populate combined pending requests
        const combinedRequests = [];
        pendingLeaves.forEach(l => {
          const emp = emps.find(e => (e.empid?.S || e.empid || e.id?.S || e.id) === l.employeeId);
          const empName = emp ? (emp.FullName?.S || emp.FullName || emp.name?.S || emp.name) : l.employeeId;
          combinedRequests.push({
            id: l.leaveId || l.leave_id || `L-${Math.random()}`,
            type: "Pending Leave Requests",
            user: empName,
            date: `${l.startDate} - ${l.endDate}`,
            status: "Pending",
            timestamp: new Date(l.appliedOn || l.startDate || Date.now())
          });
        });
        
        pendingExpenses.forEach(e => {
          const emp = emps.find(emp => (emp.empid?.S || emp.empid || emp.id?.S || emp.id) === e.employeeId);
          const empName = emp ? (emp.FullName?.S || emp.FullName || emp.name?.S || emp.name) : e.employeeId;
          combinedRequests.push({
            id: e.id || `E-${Math.random()}`,
            type: "Pending Expense Claims",
            user: empName,
            date: `$${e.amount} (${e.expenseType})`,
            status: "Pending",
            timestamp: new Date(e.date || Date.now())
          });
        });
        
        combinedRequests.sort((a, b) => b.timestamp - a.timestamp);
        setPendingRequests(combinedRequests.slice(0, 5));

        const activeCount = emps.filter(e => {
            const s = e.Status?.S || e.status?.S || e.Status || e.status;
            return s === "Active";
        }).length;

        const inactiveCount = emps.filter(e => {
            const s = e.Status?.S || e.status?.S || e.Status || e.status;
            return s === "Inactive";
        }).length;

        const leaveCount = emps.filter(e => {
            const s = e.Status?.S || e.status?.S || e.Status || e.status;
            return s === "On Leave" || s === "Leave";
        }).length;

        setMetrics([
          { label: "Total Employees", value: emps.length.toString(), status: "Updated", icon: Users, color: "#3b82f6", bg: "#eff6ff" },
          { label: "Active Employees", value: activeCount.toString(), status: `${Math.round((activeCount/Math.max(emps.length, 1))*100)}% active rate`, icon: UserCheck, color: "#10b981", bg: "#ecfdf5" },
          { label: "Pending Leave Requests", value: pendingLeaves.length.toString(), status: pendingLeaves.length > 0 ? "Requires action" : "All caught up", icon: Calendar, color: "#f59e0b", bg: "#fffbeb" },
          { label: "Pending Expense Claims", value: pendingExpenses.length.toString(), status: pendingExpenses.length > 0 ? "Requires action" : "All caught up", icon: DollarSign, color: "#8b5cf6", bg: "#f3e8ff" },
        ]);

        setEmployeeStatus([
          { name: "Active Employees", count: activeCount, color: "#10b981", icon: UserCheck },
          { name: "Employees On Leave", count: leaveCount, color: "#f59e0b", icon: UserMinus },
          { name: "Inactive Employees", count: inactiveCount, color: "#ef4444", icon: UserX },
        ]);

        const sortedEmps = [...emps].sort((a, b) => {
            const d1Str = a.JoiningDate?.S || a.JoiningDate || a.joiningDate?.S || a.joiningDate || 0;
            const d2Str = b.JoiningDate?.S || b.JoiningDate || b.joiningDate?.S || b.joiningDate || 0;
            return new Date(d2Str) - new Date(d1Str);
        });

        setRecentActivities(sortedEmps.slice(0, 6).map((e, index) => {
            const empName = e.FullName?.S || e.FullName || e.name?.S || e.name;
            const dept = e.Department?.S || e.Department || e.department?.S || e.department || "-";
            const date = new Date(e.JoiningDate?.S || e.JoiningDate || e.joiningDate?.S || e.joiningDate || Date.now() - index * 3600000);
            
            return {
                id: `ACT-${index}`,
                action: "Employee Added",
                description: `${empName} was added to ${dept}`,
                time: date.toLocaleDateString(),
                icon: UserPlus,
                color: "#3b82f6",
                bg: "#eff6ff"
            };
        }));
      } catch (err) {
        console.error("Failed to fetch monitor data:", err);
      }
    }
    loadData();
  }, []);


  return (
    <div className="dashboard-wrapper">
      <Sidebar role={user?.role?.toLowerCase() || "admin"} onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} />
      <div className="main-content">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="page-content">
          <div className="section-header">
            <div>
              <h4>Monitor Application</h4>
              <p>Overview of employees, requests, and recent activities</p>
            </div>
          </div>

          <div className="row g-3 mb-4">
            {metrics.map((m, index) => (
              <div key={index} className="col-xl-3 col-md-6">
                <div className="stat-card card-dashboard d-flex align-items-center gap-3 h-100" style={{ background: m.bg, border: "none" }}>
                  <div className="stat-icon" style={{ background: m.color, width: 44, height: 44, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", color: "#fff" }}>
                    <m.icon size={22} />
                  </div>
                  <div>
                    <h3 className="mb-0 fw-bold" style={{ fontSize: "1.25rem", color: "var(--gray-800)" }}>{m.value}</h3>
                    <div className="text-muted" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{m.label}</div>
                    <div style={{ fontSize: "0.75rem", color: m.color, marginTop: "2px", fontWeight: 500 }}>{m.status}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4 mb-4">
            <div className="col-lg-8">
              <div className="card-dashboard p-4 h-100">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "var(--gray-800)" }}>
                  <Activity size={20} color="var(--primary)" />
                  Recent Activities
                </h5>
                <div className="table-responsive">
                  <table className="table-custom table mb-0">
                    <thead>
                      <tr>
                        <th>Activity</th>
                        <th>Description</th>
                        <th className="text-end">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivities.map((act) => (
                        <tr key={act.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div style={{ background: act.bg, color: act.color, padding: "6px", borderRadius: "8px", display: "flex" }}>
                                <act.icon size={16} />
                              </div>
                              <span className="fw-semibold">{act.action}</span>
                            </div>
                          </td>
                          <td className="text-muted small">{act.description}</td>
                          <td className="text-end text-muted small"><Clock size={12} className="me-1" />{act.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card-dashboard p-4 h-100">
                <h5 className="fw-bold mb-4" style={{ color: "var(--gray-800)" }}>Employee Status</h5>
                
                <div className="d-flex flex-column gap-3">
                  {employeeStatus.map((status, i) => (
                    <div key={i} className="d-flex align-items-center justify-content-between p-3 rounded" style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)" }}>
                      <div className="d-flex align-items-center gap-2">
                        <status.icon size={16} color={status.color} />
                        <span className="fw-semibold text-dark" style={{ fontSize: "0.85rem" }}>{status.name}</span>
                      </div>
                      <span className="badge" style={{ background: `${status.color}20`, color: status.color, border: `1px solid ${status.color}40`, padding: "4px 8px" }}>
                        {status.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-12">
              <div className="card-dashboard p-4 h-100">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "var(--gray-800)" }}>
                  <Clock size={20} color="var(--primary)" />
                  Pending Requests
                </h5>
                <div className="table-responsive">
                  <table className="table-custom table mb-0">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Employee</th>
                        <th>Details</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingRequests.map((req) => (
                        <tr key={req.id}>
                          <td>
                            <span className={`badge-status ${req.type === 'Pending Leave Requests' ? 'badge-pending' : 'badge-approved'}`}>
                              {req.type}
                            </span>
                          </td>
                          <td className="fw-semibold">{req.user}</td>
                          <td className="text-muted small">{req.date}</td>
                          <td className="text-end">
                            <button className="btn btn-sm btn-light d-inline-flex align-items-center gap-1" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                              <Eye size={12} /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Monitor;
