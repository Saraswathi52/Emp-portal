import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getCurrentUser, getEmployee, getTodayAttendance, getAttendance, getLeaveBalances, getLeaveRequests, getHolidays } from "../services/dataService";

function EmployeeDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    async function fetchEmp() {
      const data = await getEmployee(user?.employeeId || "EMP1001");
      setEmployee(data);
    }
    fetchEmp();
  }, [user?.employeeId]);
  const todayAtt = getTodayAttendance(user?.employeeId);
  const leaveBal = getLeaveBalances(user?.employeeId);
  const leaveReqs = getLeaveRequests(user?.employeeId);
  const attRecords = getAttendance(user?.employeeId);
  const holidays = getHolidays();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const presentDays = attRecords.filter(a => a.status === 'Present').length;
  const absentDays = attRecords.filter(a => a.status === 'Absent').length;
  const totalDays = attRecords.filter(a => a.status !== 'Weekend').length;
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  const pendingLeaves = leaveReqs.filter(l => l.status === 'Pending').length;
  const approvedLeaves = leaveReqs.filter(l => l.status === 'Approved').length;

  const calcHours = (inTime, outTime) => {
    if (!inTime || !outTime) return '—';
    const [inH, inM] = inTime.replace(/\s?(AM|PM)/, '').split(':').map(Number);
    const [outH, outM] = outTime.replace(/\s?(AM|PM)/, '').split(':').map(Number);
    let inH24 = inTime.includes('PM') && inH !== 12 ? inH + 12 : inH;
    let outH24 = outTime.includes('PM') && outH !== 12 ? outH + 12 : outH;
    if (inTime.includes('AM') && inH === 12) inH24 = 0;
    if (outTime.includes('AM') && outH === 12) outH24 = 0;
    const diff = (outH24 * 60 + outM) - (inH24 * 60 + inM);
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h}h ${m}m`;
  };

  const totalHours = calcHours(todayAtt?.checkIn, todayAtt?.checkOut);

  const upcomingHolidays = holidays.filter(h => new Date(h.date) >= today).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 3);

  return (
    <div className="dashboard-wrapper">
      <Sidebar role="employee" onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} />
      <div className="main-content">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="page-content">
          <div className="section-header">
            <div>
              <h4>Welcome back, {employee?.FullName || 'Employee'}!</h4>
              <p>{todayStr}</p>
            </div>

          </div>

          <div className="row g-3 mb-4">
            <div className="col-xl-8">
              <div className="card-dashboard p-4 h-100">
                <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)" }}>
                  <i className="bi bi-person-badge me-2" style={{ color: "var(--primary)" }} />
                  Employee Information
                </h5>
                <div className="row g-3">
                  <div className="col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-3 p-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", minHeight: "56px" }}>
                      <i className="bi bi-person" style={{ color: "var(--primary)", fontSize: "1.2rem", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <small style={{ color: "var(--gray-500)", fontSize: "0.65rem", display: "block", textTransform: "uppercase" }}>Name</small>
                        <span className="fw-semibold d-block text-truncate" style={{ fontSize: "0.85rem" }}>{employee?.FullName || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-3 p-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", minHeight: "56px" }}>
                      <i className="bi bi-person-vcard" style={{ color: "var(--primary)", fontSize: "1.2rem", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <small style={{ color: "var(--gray-500)", fontSize: "0.65rem", display: "block", textTransform: "uppercase" }}>Employee ID</small>
                        <span className="fw-semibold d-block text-truncate" style={{ fontSize: "0.85rem" }}>{employee?.empid || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-3 p-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", minHeight: "56px" }}>
                      <i className="bi bi-briefcase" style={{ color: "var(--primary)", fontSize: "1.2rem", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <small style={{ color: "var(--gray-500)", fontSize: "0.65rem", display: "block", textTransform: "uppercase" }}>Role</small>
                        <span className="fw-semibold d-block text-truncate" style={{ fontSize: "0.85rem" }}>{employee?.Role || employee?.Designation || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-3 p-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", minHeight: "56px" }}>
                      <i className="bi bi-building" style={{ color: "var(--primary)", fontSize: "1.2rem", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <small style={{ color: "var(--gray-500)", fontSize: "0.65rem", display: "block", textTransform: "uppercase" }}>Department</small>
                        <span className="fw-semibold d-block text-truncate" style={{ fontSize: "0.85rem" }}>{employee?.Department || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-3 p-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", minHeight: "56px" }}>
                      <i className="bi bi-envelope" style={{ color: "var(--primary)", fontSize: "1.2rem", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <small style={{ color: "var(--gray-500)", fontSize: "0.65rem", display: "block", textTransform: "uppercase" }}>Email</small>
                        <span className="fw-semibold d-block text-truncate" style={{ fontSize: "0.85rem" }} title={employee?.Email}>{employee?.Email || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-3 p-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", minHeight: "56px" }}>
                      <i className="bi bi-telephone" style={{ color: "var(--primary)", fontSize: "1.2rem", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <small style={{ color: "var(--gray-500)", fontSize: "0.65rem", display: "block", textTransform: "uppercase" }}>Phone</small>
                        <span className="fw-semibold d-block text-truncate" style={{ fontSize: "0.85rem" }}>{employee?.Phone || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-3 p-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", minHeight: "56px" }}>
                      <i className="bi bi-person-up" style={{ color: "var(--primary)", fontSize: "1.2rem", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <small style={{ color: "var(--gray-500)", fontSize: "0.65rem", display: "block", textTransform: "uppercase" }}>Manager</small>
                        <span className="fw-semibold d-block text-truncate" style={{ fontSize: "0.85rem" }}>{employee?.Manager || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-3 p-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", minHeight: "56px" }}>
                      <i className="bi bi-check-circle" style={{ color: employee?.Status === 'Active' ? 'var(--success)' : 'var(--gray-400)', fontSize: "1.2rem", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <small style={{ color: "var(--gray-500)", fontSize: "0.65rem", display: "block", textTransform: "uppercase" }}>Status</small>
                        <span className={`fw-semibold d-block text-truncate ${employee?.Status === 'Active' ? 'text-success' : ''}`} style={{ fontSize: "0.85rem" }}>{employee?.Status || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4">
              <div className="card-dashboard p-4 h-100">
                <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)" }}>
                  <i className="bi bi-clock-history me-2" style={{ color: "var(--primary)" }} />
                  Today's Attendance
                </h5>
                <div className="text-center mb-3">
                  <div style={{ fontSize: "2.5rem", fontWeight: 700, color: todayAtt?.checkIn ? "var(--success)" : "var(--gray-400)" }}>
                    {totalHours}
                  </div>
                  <small style={{ color: "var(--gray-500)" }}>Total Working Hours</small>
                </div>
                <div className="d-flex justify-content-around mt-2">
                  <div className="text-center">
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: todayAtt?.checkIn ? "var(--primary)" : "var(--gray-400)" }}>
                      {todayAtt?.checkIn || '—'}
                    </div>
                    <small style={{ color: "var(--gray-500)", fontSize: "0.75rem" }}>Check In</small>
                  </div>
                  <div className="text-center">
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: todayAtt?.checkOut ? "var(--success)" : "var(--gray-400)" }}>
                      {todayAtt?.checkOut || '—'}
                    </div>
                    <small style={{ color: "var(--gray-500)", fontSize: "0.75rem" }}>Check Out</small>
                  </div>
                </div>
                <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--gray-100)" }}>
                  <span className={`badge-status ${todayAtt?.status === 'Present' ? 'badge-approved' : todayAtt?.status === 'Absent' ? 'badge-rejected' : 'badge-pending'}`}>
                    {todayAtt?.status || 'Not Marked'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-xl-3 col-md-6">
              <div className="stat-card card-dashboard d-flex align-items-center gap-2 h-100" style={{ background: "#eff6ff", padding: "1rem" }}>
                <div className="stat-icon" style={{ background: "#3b82f6", width: 38, height: 38, fontSize: "1rem", margin: 0 }}>
                  <i className="bi bi-calendar-check" />
                </div>
                <div>
                  <div className="stat-label" style={{ fontSize: "0.7rem" }}>Attendance</div>
                  <div className="stat-value" style={{ color: "#3b82f6", fontSize: "1.25rem" }}>{attendancePct}%</div>
                  <small style={{ color: "var(--gray-400)", fontSize: "0.65rem" }}>{presentDays}/{totalDays} days</small>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="stat-card card-dashboard d-flex align-items-center gap-2 h-100" style={{ background: "#ecfdf5", position: "relative", overflow: "hidden", padding: "1rem" }}>
                <div className="stat-icon" style={{ background: "#10b981", width: 38, height: 38, fontSize: "1rem", margin: 0 }}>
                  <i className="bi bi-piggy-bank" />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="stat-label" style={{ fontSize: "0.7rem" }}>Leave Balance</div>
                  <div className="stat-value d-flex align-items-baseline gap-1" style={{ color: "#10b981", fontSize: "1.25rem" }}>
                    {(leaveBal.annual - leaveBal.annualUsed) + (leaveBal.sick - leaveBal.sickUsed) + (leaveBal.personal - leaveBal.personalUsed)}
                    <span style={{ fontSize: "0.6rem", color: "var(--gray-400)", fontWeight: 400 }}>remaining</span>
                  </div>
                  <div className="progress" style={{ height: "3px", borderRadius: "10px", background: "#d1fae5", marginTop: "4px", marginBottom: "4px" }}>
                    <div className="progress-bar" style={{ width: `${((leaveBal.annualUsed + leaveBal.sickUsed + leaveBal.personalUsed) / (leaveBal.annual + leaveBal.sick + leaveBal.personal) * 100)}%`, background: "#10b981", borderRadius: "10px" }} />
                  </div>
                  <small style={{ color: "var(--gray-400)", fontSize: "0.65rem" }}>{leaveBal.annual - leaveBal.annualUsed} Ann | {leaveBal.sick - leaveBal.sickUsed} Sic | {leaveBal.personal - leaveBal.personalUsed} Per</small>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="stat-card card-dashboard d-flex align-items-center gap-2 h-100" style={{ background: "#fffbeb", padding: "1rem" }}>
                <div className="stat-icon" style={{ background: "#f59e0b", width: 38, height: 38, fontSize: "1rem", margin: 0 }}>
                  <i className="bi bi-clock" />
                </div>
                <div>
                  <div className="stat-label" style={{ fontSize: "0.7rem" }}>Pending Leaves</div>
                  <div className="stat-value" style={{ color: "#f59e0b", fontSize: "1.25rem" }}>{pendingLeaves}</div>
                  <small style={{ color: "var(--gray-400)", fontSize: "0.65rem" }}>{approvedLeaves} approved</small>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="stat-card card-dashboard d-flex align-items-center gap-2 h-100" style={{ background: "#f5f3ff", position: "relative", overflow: "hidden", padding: "1rem" }}>
                <div className="stat-icon" style={{ background: "#8b5cf6", width: 38, height: 38, fontSize: "1rem", margin: 0 }}>
                  <i className="bi bi-house-door" />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="stat-label" style={{ fontSize: "0.7rem" }}>WFH Balance</div>
                  <div className="stat-value d-flex align-items-baseline gap-1" style={{ color: "#8b5cf6", fontSize: "1.25rem" }}>
                    {leaveBal.wfh - leaveBal.wfhUsed}
                    <span style={{ fontSize: "0.6rem", color: "var(--gray-400)", fontWeight: 400 }}>remaining</span>
                  </div>
                  <div className="progress" style={{ height: "3px", borderRadius: "10px", background: "#ede9fe", marginTop: "4px", marginBottom: "4px" }}>
                    <div className="progress-bar" style={{ width: `${(leaveBal.wfhUsed / leaveBal.wfh * 100)}%`, background: "#8b5cf6", borderRadius: "10px" }} />
                  </div>
                  <small style={{ color: "var(--gray-400)", fontSize: "0.65rem" }}>{leaveBal.wfhUsed} used of {leaveBal.wfh}</small>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;
