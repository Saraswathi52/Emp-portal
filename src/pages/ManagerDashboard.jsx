import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getCurrentUser, getAllLeaveRequests, getAllExpenses, getManagerEmployees } from "../services/dataService";
import { Users, CalendarDays, Wallet, Inbox } from "lucide-react";

function ManagerDashboard() {
  const user = getCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [employeesError, setEmployeesError] = useState("");
  const [allLeaves] = useState(() => getAllLeaveRequests());
  const [allExpenses, setAllExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const expenses = await getAllExpenses();
        setAllExpenses(expenses || []);
      } catch (error) {
        console.error("Failed to fetch expenses", error);
      }
      
      if (user?.employeeId) {
        try {
          const fetchedEmployees = await getManagerEmployees(user.employeeId);
          setEmployees(fetchedEmployees || []);
        } catch (error) {
          console.error("Failed to fetch manager employees", error);
          setEmployeesError("Unable to load employees");
        }
      }
      
      setIsLoading(false);
    }
    fetchData();
  }, [user?.employeeId]);

  const pendingLeaves = allLeaves.filter(l => l.status === 'Pending');
  const pendingExpenses = allExpenses.filter(e => e.status === 'Pending');
  const teamMembers = employees.filter(e => {
    const id = e.empid || e.id;
    return id !== user?.employeeId;
  });
  const pendingCount = pendingLeaves.length + pendingExpenses.length;

  // Stats for Today's Attendance
  const totalTeam = teamMembers.length || 1;
  const todayStr = new Date().toISOString().split('T')[0];
  const onLeaveToday = allLeaves.filter(l => l.status === 'Approved' && !l.wfh && todayStr >= l.startDate && todayStr <= l.endDate).length;
  const wfhToday = allLeaves.filter(l => l.status === 'Approved' && l.wfh && todayStr >= l.startDate && todayStr <= l.endDate).length;
  const absentToday = 0; // Fixed for now
  const presentToday = Math.max(0, teamMembers.length - onLeaveToday - wfhToday - absentToday);
  const attendancePercentage = Math.round(((presentToday + wfhToday) / totalTeam) * 100);

  // Generate a recent activities timeline from all requests
  const recentActivities = [
    ...allLeaves.map(l => ({
      id: `l-${l.leaveId}`,
      employeeName: l.employeeName || l.employeeId,
      type: 'Leave',
      action: l.status === 'Pending' ? 'applied for leave' : `had their leave ${l.status.toLowerCase()}`,
      date: new Date(l.appliedOn || 0),
      icon: "bi-calendar-event",
      color: "var(--warning)"
    })),
    ...allExpenses.map(e => ({
      id: `e-${e.id}`,
      employeeName: e.employeeName || e.employeeId,
      type: 'Expense',
      action: e.status === 'Pending' ? 'submitted an expense' : `had their expense ${e.status.toLowerCase()}`,
      date: new Date(e.date || e.submittedOn || 0),
      icon: "bi-wallet2",
      color: "var(--purple, #8b5cf6)"
    })),
  ].sort((a, b) => b.date - a.date).slice(0, 7);

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return "Just now";
  };

  if (isLoading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar role="manager" onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} />
        <div className="main-content d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar role="manager" onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} />
      <div className="main-content">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="page-content bg-light" style={{ minHeight: "calc(100vh - 70px)" }}>
          <div className="section-header d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold mb-1">Welcome, {user?.name || "Manager"}!</h4>
              <p className="text-muted mb-0">Overview of your team's status and activities.</p>
            </div>
          </div>

          {/* 4 Summary Cards */}
          <div className="row g-4 mb-4">
            {[
              { label: "Team Members", value: teamMembers.length, icon: Users, color: "#3b82f6", bg: "#eff6ff" },
              { label: "Pending Leaves", value: pendingLeaves.length, icon: CalendarDays, color: "#f59e0b", bg: "#fffbeb" },
              { label: "Pending Expenses", value: pendingExpenses.length, icon: Wallet, color: "#8b5cf6", bg: "#f5f3ff" },
              { label: "Total Approvals", value: pendingCount, icon: Inbox, color: "#10b981", bg: "#ecfdf5" },
            ].map((s) => (
              <div key={s.label} className="col-xl-3 col-md-6">
                <div className="card border-0 shadow-sm rounded-4 h-100 p-4 transition-hover" style={{ background: s.bg }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ background: s.color, width: "48px", height: "48px", color: "white", boxShadow: `0 4px 12px ${s.color}40` }}>
                      <s.icon size={24} />
                    </div>
                    <div>
                      <div className="text-muted small fw-semibold text-uppercase tracking-wider">{s.label}</div>
                      <div className="fw-bold mt-1" style={{ color: s.color, fontSize: "1.75rem", lineHeight: "1" }}>{s.value}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Widgets Grid */}
          <div className="row g-4">
            {/* Left Column Widgets */}
            <div className="col-lg-7">
              {/* Recent Activities Widget */}
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                  <h5 className="fw-bold mb-0 text-dark">
                    <i className="bi bi-clock-history text-secondary me-2" /> Recent Activities
                  </h5>
                </div>
                <div className="card-body p-4">
                  {recentActivities.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-activity fs-1 text-secondary mb-2 d-block" />
                      No recent activities recorded.
                    </div>
                  ) : (
                    <div className="position-relative ms-3 mt-2">
                      <div className="position-absolute h-100 border-start" style={{ left: "11px", borderColor: "var(--gray-200)", top: "10px", zIndex: 0 }}></div>
                      <div className="d-flex flex-column gap-4 position-relative" style={{ zIndex: 1 }}>
                        {recentActivities.map((activity) => (
                          <div key={activity.id} className="d-flex gap-3">
                            <div className="rounded-circle d-flex align-items-center justify-content-center bg-white shadow-sm" style={{ width: "24px", height: "24px", color: activity.color, border: `2px solid ${activity.color}` }}>
                              <i className={`bi ${activity.icon}`} style={{ fontSize: "0.7rem" }} />
                            </div>
                            <div>
                              <div className="fw-semibold text-dark" style={{ fontSize: "0.95rem" }}>
                                {activity.employeeName} <span className="text-muted fw-normal">{activity.action}</span>
                              </div>
                              <div className="text-muted small mt-1">
                                {timeAgo(activity.date)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column Widgets */}
            <div className="col-lg-5 d-flex flex-column gap-4">
              {/* Request Summary Widget */}
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                  <h6 className="fw-bold mb-0 text-dark text-uppercase tracking-wider">
                    <i className="bi bi-pie-chart text-primary me-2" /> Request Summary
                  </h6>
                </div>
                <div className="card-body p-4">
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ background: "var(--gray-50)" }}>
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle bg-warning opacity-75" style={{ width: "8px", height: "8px" }}></div>
                        <span className="text-dark fw-medium small">Pending Leaves</span>
                      </div>
                      <span className="fw-bold text-dark">{pendingLeaves.length}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ background: "var(--gray-50)" }}>
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle bg-purple opacity-75" style={{ width: "8px", height: "8px", backgroundColor: "#8b5cf6" }}></div>
                        <span className="text-dark fw-medium small">Pending Expenses</span>
                      </div>
                      <span className="fw-bold text-dark">{pendingExpenses.length}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center p-3 rounded-3 bg-light border">
                      <span className="text-muted fw-medium small">Total Resolved (All Time)</span>
                      <span className="fw-bold text-success">{allLeaves.length + allExpenses.length - pendingCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Status Widget */}
              <div className="card border-0 shadow-sm rounded-4 flex-grow-1">
                <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                  <h6 className="fw-bold mb-0 text-dark text-uppercase tracking-wider">
                    <i className="bi bi-person-lines-fill text-success me-2" /> Today's Attendance
                  </h6>
                </div>
                <div className="card-body p-4 mt-1">
                  <div className="d-flex flex-column gap-3">
                    
                    <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ background: "var(--gray-50)" }}>
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px", color: "var(--success)" }}>
                          <i className="bi bi-person-check-fill" />
                        </div>
                        <span className="text-dark fw-medium">Present Today</span>
                      </div>
                      <span className="fw-bold fs-5 text-success">{presentToday}</span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ background: "var(--gray-50)" }}>
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle bg-info bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px", color: "#0dcaf0" }}>
                          <i className="bi bi-house-door-fill" />
                        </div>
                        <span className="text-dark fw-medium">Work From Home</span>
                      </div>
                      <span className="fw-bold fs-5 text-info">{wfhToday}</span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ background: "var(--gray-50)" }}>
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle bg-warning bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px", color: "#f59e0b" }}>
                          <i className="bi bi-airplane-fill" />
                        </div>
                        <span className="text-dark fw-medium">On Leave</span>
                      </div>
                      <span className="fw-bold fs-5 text-danger">{onLeaveToday}</span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ background: "var(--gray-50)" }}>
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle bg-danger bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px", color: "var(--danger)" }}>
                          <i className="bi bi-x-circle-fill" />
                        </div>
                        <span className="text-dark fw-medium">Absent</span>
                      </div>
                      <span className="fw-bold fs-5 text-danger">{absentToday}</span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ background: "var(--gray-50)" }}>
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px", color: "var(--primary)" }}>
                          <i className="bi bi-bar-chart-fill" />
                        </div>
                        <span className="text-dark fw-medium">Attendance Rate (%)</span>
                      </div>
                      <span className="fw-bold fs-5 text-primary">{attendancePercentage}%</span>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Assigned Employees Table */}
          <div className="row g-4 mt-1 mb-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                  <h5 className="fw-bold mb-0 text-dark">
                    <i className="bi bi-people text-secondary me-2" /> Assigned Employees
                  </h5>
                </div>
                <div className="card-body p-4">
                  {employeesError ? (
                    <div className="alert alert-danger text-center" role="alert">
                      {employeesError}
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <div className="text-center py-5 text-muted border rounded bg-light">
                      <i className="bi bi-person-x fs-1 text-secondary mb-2 d-block" />
                      No employees assigned to this manager.
                    </div>
                  ) : (
                    <div className="table-responsive shadow-sm rounded border">
                      <table className="table-custom table table-hover align-middle mb-0">
                        <thead style={{ background: "var(--gray-200)" }}>
                          <tr>
                            <th style={{ padding: "1rem" }}>Employee ID</th>
                            <th style={{ padding: "1rem" }}>Name</th>
                            <th style={{ padding: "1rem" }}>Department</th>
                            <th style={{ padding: "1rem" }}>Designation</th>
                            <th style={{ padding: "1rem" }}>Email</th>
                            <th style={{ padding: "1rem" }}>Phone</th>
                            <th style={{ padding: "1rem" }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teamMembers.map((emp, index) => {
                            const empId = emp.empid || emp.id || "-";
                            const empName = emp.FullName || emp.name || "-";
                            const empDept = emp.Department || emp.department || "-";
                            const empDesig = emp.Designation || emp.role || "-";
                            const empEmail = emp.Email || emp.email || "-";
                            const empPhone = emp.Phone || emp.phone || "-";
                            const empStatus = emp.Status || emp.status || "Active";
                            
                            const getInitials = (name) => {
                              if (!name || name === "-") return "?";
                              const parts = name.trim().split(" ");
                              if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                              return name.substring(0, 2).toUpperCase();
                            };
                            const initials = getInitials(empName);
                            const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];
                            const colorIndex = empName !== "-" ? empName.length % colors.length : 0;
                            const avatarBg = colors[colorIndex];

                            return (
                              <tr key={empId + index}>
                                <td><span style={{ color: "var(--primary)", fontWeight: 600 }}>{empId}</span></td>
                                <td>
                                  <div className="d-flex align-items-center gap-3">
                                    {emp.profileImage ? (
                                      <img src={emp.profileImage} alt="profile" style={{width: 42, height: 42, borderRadius: "50%", objectFit: "cover", border: "2px solid #fff", boxShadow: "0 2px 4px rgba(0,0,0,0.08)"}}/>
                                    ) : (
                                      <div style={{width: 42, height: 42, borderRadius: "50%", background: avatarBg, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.95rem", fontWeight: 600, flexShrink: 0, boxShadow: "0 2px 4px rgba(0,0,0,0.08)"}}>
                                        {initials}
                                      </div>
                                    )}
                                    <span className="fw-semibold" style={{ fontSize: "0.95rem" }}>{empName}</span>
                                  </div>
                                </td>
                                <td><span className="badge-status badge-uploaded">{empDept}</span></td>
                                <td>{empDesig}</td>
                                <td>{empEmail}</td>
                                <td>{empPhone}</td>
                                <td>
                                  <span className={`badge-status ${empStatus.toLowerCase() === 'active' ? 'badge-approved' : 'badge-rejected'}`}>
                                    {empStatus}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;
