import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getCurrentUser, getEmployee, getTodayAttendance, getAttendance, getLeaveBalances, getLeaveRequests, getHolidays } from "../services/dataService";

function EmployeeDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const employee = getEmployee(user?.employeeId);
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
              <h4>Welcome back, {employee?.name || 'Employee'}!</h4>
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
                  <div className="col-md-3 col-6">
                    <div className="d-flex align-items-center gap-2 p-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)" }}>
                      <i className="bi bi-person" style={{ color: "var(--primary)", fontSize: "1.1rem" }} />
                      <div><small style={{ color: "var(--gray-500)", fontSize: "0.65rem", display: "block" }}>Name</small><span className="fw-semibold" style={{ fontSize: "0.85rem" }}>{employee?.name || '—'}</span></div>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div className="d-flex align-items-center gap-2 p-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)" }}>
                      <i className="bi bi-person-vcard" style={{ color: "var(--primary)", fontSize: "1.1rem" }} />
                      <div><small style={{ color: "var(--gray-500)", fontSize: "0.65rem", display: "block" }}>Employee ID</small><span className="fw-semibold" style={{ fontSize: "0.85rem" }}>{employee?.id || '—'}</span></div>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div className="d-flex align-items-center gap-2 p-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)" }}>
                      <i className="bi bi-briefcase" style={{ color: "var(--primary)", fontSize: "1.1rem" }} />
                      <div><small style={{ color: "var(--gray-500)", fontSize: "0.65rem", display: "block" }}>Role</small><span className="fw-semibold" style={{ fontSize: "0.85rem" }}>{employee?.role || employee?.designation || '—'}</span></div>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div className="d-flex align-items-center gap-2 p-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)" }}>
                      <i className="bi bi-building" style={{ color: "var(--primary)", fontSize: "1.1rem" }} />
                      <div><small style={{ color: "var(--gray-500)", fontSize: "0.65rem", display: "block" }}>Department</small><span className="fw-semibold" style={{ fontSize: "0.85rem" }}>{employee?.department || '—'}</span></div>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div className="d-flex align-items-center gap-2 p-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)" }}>
                      <i className="bi bi-envelope" style={{ color: "var(--primary)", fontSize: "1.1rem" }} />
                      <div><small style={{ color: "var(--gray-500)", fontSize: "0.65rem", display: "block" }}>Email</small><span className="fw-semibold" style={{ fontSize: "0.85rem" }}>{employee?.email || '—'}</span></div>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div className="d-flex align-items-center gap-2 p-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)" }}>
                      <i className="bi bi-telephone" style={{ color: "var(--primary)", fontSize: "1.1rem" }} />
                      <div><small style={{ color: "var(--gray-500)", fontSize: "0.65rem", display: "block" }}>Phone</small><span className="fw-semibold" style={{ fontSize: "0.85rem" }}>{employee?.phone || '—'}</span></div>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div className="d-flex align-items-center gap-2 p-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)" }}>
                      <i className="bi bi-person-up" style={{ color: "var(--primary)", fontSize: "1.1rem" }} />
                      <div><small style={{ color: "var(--gray-500)", fontSize: "0.65rem", display: "block" }}>Manager</small><span className="fw-semibold" style={{ fontSize: "0.85rem" }}>{employee?.manager || '—'}</span></div>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div className="d-flex align-items-center gap-2 p-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)" }}>
                      <i className="bi bi-check-circle" style={{ color: employee?.status === 'Active' ? 'var(--success)' : 'var(--gray-400)', fontSize: "1.1rem" }} />
                      <div><small style={{ color: "var(--gray-500)", fontSize: "0.65rem", display: "block" }}>Status</small><span className={`fw-semibold ${employee?.status === 'Active' ? 'text-success' : ''}`} style={{ fontSize: "0.85rem" }}>{employee?.status || '—'}</span></div>
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
              <div className="stat-card card-dashboard d-flex align-items-center gap-3" style={{ background: "#eff6ff" }}>
                <div className="stat-icon" style={{ background: "#3b82f6", width: 44, height: 44, fontSize: "1.2rem", margin: 0 }}>
                  <i className="bi bi-calendar-check" />
                </div>
                <div>
                  <div className="stat-label">Attendance</div>
                  <div className="stat-value" style={{ color: "#3b82f6", fontSize: "1.5rem" }}>{attendancePct}%</div>
                  <small style={{ color: "var(--gray-400)", fontSize: "0.7rem" }}>{presentDays}/{totalDays} days</small>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="stat-card card-dashboard d-flex align-items-center gap-3" style={{ background: "#ecfdf5", position: "relative", overflow: "hidden" }}>
                <div className="stat-icon" style={{ background: "#10b981", width: 44, height: 44, fontSize: "1.2rem", margin: 0 }}>
                  <i className="bi bi-piggy-bank" />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="stat-label">Leave Balance</div>
                  <div className="stat-value d-flex align-items-baseline gap-1" style={{ color: "#10b981", fontSize: "1.5rem" }}>
                    {(leaveBal.annual - leaveBal.annualUsed) + (leaveBal.sick - leaveBal.sickUsed) + (leaveBal.personal - leaveBal.personalUsed)}
                    <span style={{ fontSize: "0.65rem", color: "var(--gray-400)", fontWeight: 400 }}>remaining</span>
                  </div>
                  <div className="progress" style={{ height: "3px", borderRadius: "10px", background: "#d1fae5", marginTop: "6px", marginBottom: "4px" }}>
                    <div className="progress-bar" style={{ width: `${((leaveBal.annualUsed + leaveBal.sickUsed + leaveBal.personalUsed) / (leaveBal.annual + leaveBal.sick + leaveBal.personal) * 100)}%`, background: "#10b981", borderRadius: "10px" }} />
                  </div>
                  <small style={{ color: "var(--gray-400)", fontSize: "0.7rem" }}>{leaveBal.annual - leaveBal.annualUsed} Annual | {leaveBal.sick - leaveBal.sickUsed} Sick | {leaveBal.personal - leaveBal.personalUsed} Personal</small>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="stat-card card-dashboard d-flex align-items-center gap-3" style={{ background: "#fffbeb" }}>
                <div className="stat-icon" style={{ background: "#f59e0b", width: 44, height: 44, fontSize: "1.2rem", margin: 0 }}>
                  <i className="bi bi-clock" />
                </div>
                <div>
                  <div className="stat-label">Pending Leaves</div>
                  <div className="stat-value" style={{ color: "#f59e0b", fontSize: "1.5rem" }}>{pendingLeaves}</div>
                  <small style={{ color: "var(--gray-400)", fontSize: "0.7rem" }}>{approvedLeaves} approved</small>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="stat-card card-dashboard d-flex align-items-center gap-3" style={{ background: "#f5f3ff", position: "relative", overflow: "hidden" }}>
                <div className="stat-icon" style={{ background: "#8b5cf6", width: 44, height: 44, fontSize: "1.2rem", margin: 0 }}>
                  <i className="bi bi-house-door" />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="stat-label">WFH Balance</div>
                  <div className="stat-value d-flex align-items-baseline gap-1" style={{ color: "#8b5cf6", fontSize: "1.5rem" }}>
                    {leaveBal.wfh - leaveBal.wfhUsed}
                    <span style={{ fontSize: "0.65rem", color: "var(--gray-400)", fontWeight: 400 }}>remaining</span>
                  </div>
                  <div className="progress" style={{ height: "3px", borderRadius: "10px", background: "#ede9fe", marginTop: "6px", marginBottom: "4px" }}>
                    <div className="progress-bar" style={{ width: `${(leaveBal.wfhUsed / leaveBal.wfh * 100)}%`, background: "#8b5cf6", borderRadius: "10px" }} />
                  </div>
                  <small style={{ color: "var(--gray-400)", fontSize: "0.7rem" }}>{leaveBal.wfhUsed} used of {leaveBal.wfh}</small>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-7">
              <div className="card-dashboard p-4 h-100">
                <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)" }}>
                  <i className="bi bi-bar-chart me-2" style={{ color: "var(--primary)" }} />
                  Overall Employee Overview
                </h5>
                <div className="row g-3">
                  {[
                    { label: 'Working Days (Last 7)', value: `${presentDays}/${totalDays}`, icon: 'bi-check-circle', color: '#10b981', bg: '#ecfdf5' },
                    { label: 'Leaves Taken', value: leaveBal.annualUsed + leaveBal.sickUsed + leaveBal.personalUsed, icon: 'bi-calendar-x', color: '#f59e0b', bg: '#fffbeb' },
                    { label: 'WFH Days Used', value: leaveBal.wfhUsed, icon: 'bi-house-door', color: '#8b5cf6', bg: '#f5f3ff' },
                    { label: 'Upcoming Holidays', value: upcomingHolidays.length, icon: 'bi-star', color: '#3b82f6', bg: '#eff6ff' },
                  ].map((s) => (
                    <div key={s.label} className="col-sm-6">
                      <div className="d-flex align-items-center gap-3 p-3" style={{ background: s.bg, borderRadius: "var(--radius-sm)" }}>
                        <div style={{ width: 40, height: 40, borderRadius: "10px", background: s.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>
                          <i className={`bi ${s.icon}`} />
                        </div>
                        <div>
                          <div style={{ fontSize: "0.7rem", color: "var(--gray-500)", fontWeight: 600, textTransform: "uppercase" }}>{s.label}</div>
                          <div className="fw-bold" style={{ fontSize: "1.1rem", color: s.color }}>{s.value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {upcomingHolidays.length > 0 && (
                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--gray-100)" }}>
                    <small className="fw-semibold" style={{ color: "var(--gray-600)" }}>Upcoming Holidays:</small>
                    {upcomingHolidays.map(h => (
                      <div key={h.date} className="d-flex justify-content-between align-items-center mt-1" style={{ fontSize: "0.82rem" }}>
                        <span style={{ color: "var(--gray-600)" }}>{h.name}</span>
                        <small style={{ color: "var(--gray-400)" }}>{new Date(h.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="col-lg-5">
              <div className="card-dashboard p-4 h-100">
                <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)" }}>
                  <i className="bi bi-activity me-2" style={{ color: "var(--primary)" }} />
                  Recent Leave Activity
                </h5>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {leaveReqs.slice(-4).reverse().map((l) => {
                    const statusColor = l.status === 'Approved' ? 'var(--success)' : l.status === 'Rejected' ? 'var(--danger)' : 'var(--warning)';
                    return (
                      <div key={l.leaveId} className="d-flex align-items-start gap-3 p-2" style={{ borderBottom: "1px solid var(--gray-100)" }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: statusColor, marginTop: 6, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: "0.85rem", color: "var(--gray-700)" }}>
                            {l.leaveType} {l.wfh ? '(WFH)' : l.halfDay ? '(Half Day)' : ''} — {l.startDate === l.endDate ? l.startDate : `${l.startDate} to ${l.endDate}`}
                          </div>
                          <small style={{ color: "var(--gray-400)" }}>{l.reason} | <span style={{ color: statusColor }}>{l.status}</span></small>
                        </div>
                      </div>
                    );
                  })}
                  {leaveReqs.length === 0 && (
                    <div className="text-center py-4" style={{ color: "var(--gray-400)" }}>
                      <i className="bi bi-inbox" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }} />
                      No leave activity
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <button className="btn-custom-outline w-100 d-flex align-items-center justify-content-center gap-2" onClick={() => navigate("/leave")}>
                    <i className="bi bi-calendar-check" /> View All Leaves
                  </button>
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
