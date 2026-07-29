import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getCurrentUser, getEmployee, getTodayAttendance, getAttendance, getEmployeeLeaveRequests, getHolidays, getTimesheets } from "../services/dataService";
import { CalendarCheck, PiggyBank, Clock, Home, Activity } from "lucide-react";

function EmployeeDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [employee, setEmployee] = useState(null);
  const [leaveData, setLeaveData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const empid = user?.employeeId || "EMP1001";
      const empData = await getEmployee(empid);
      setEmployee(empData);
      
      const reqs = await getEmployeeLeaveRequests(empid);
      setLeaveData(reqs || []);
    }
    fetchData();
  }, [user?.employeeId]);

  const todayAtt = getTodayAttendance(user?.employeeId);
  const attRecords = getAttendance(user?.employeeId);
  const holidays = getHolidays();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const presentDays = attRecords.filter(a => a.status === 'Present').length;
  const absentDays = attRecords.filter(a => a.status === 'Absent').length;
  const totalDays = attRecords.filter(a => a.status !== 'Weekend').length;
  
  const getWorkingDaysInMonth = (year, month) => {
    let count = 0;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i).getDay();
      if (d !== 0 && d !== 6) count++;
    }
    return count;
  };

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const expectedWorkingHours = getWorkingDaysInMonth(currentYear, currentMonth) * 8;

  const calculateDays = (start, end, duration) => {
    if (!start || !end) return 1;
    if (duration === 'Half Day') return 0.5;
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e - s);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const defaultLeaves = { annual: 18, sick: 12, personal: 5, wfh: 10 };
  let annualUsed = 0, sickUsed = 0, personalUsed = 0, wfhUsed = 0;
  let pendingLeaves = 0, approvedLeaves = 0;

  leaveData.forEach(l => {
    if (l.status === 'Pending') pendingLeaves++;
    if (l.status === 'Approved') {
      const days = calculateDays(l.fromDate || l.startDate, l.toDate || l.endDate, l.duration);
      if (l.leaveType?.includes('WFH') || l.wfh) {
        wfhUsed += days;
      } else {
        approvedLeaves++;
        if (l.leaveType?.includes('Sick')) sickUsed += days;
        else if (l.leaveType?.includes('Personal')) personalUsed += days;
        else annualUsed += days;
      }
    }
  });

  const leaveBalDynamic = {
    annual: defaultLeaves.annual,
    sick: defaultLeaves.sick,
    personal: defaultLeaves.personal,
    wfh: defaultLeaves.wfh,
    annualUsed,
    sickUsed,
    personalUsed,
    wfhUsed
  };

  const allTimesheets = getTimesheets();
  const myTimesheets = allTimesheets.filter(t => (t.empid === user?.employeeId || t.empid === "EMP1001" || t.employeeId === user?.employeeId));
  
  let hasDataForMonth = false;
  let attendedHours = 0;

  myTimesheets.forEach(t => {
    let isCurrentMonth = false;
    if (t.period === 'Monthly') {
       if (parseInt(t.month) === currentMonth + 1 && parseInt(t.year) === currentYear) isCurrentMonth = true;
    } else if (t.customStartDate) {
       const tsd = new Date(t.customStartDate);
       if (tsd.getMonth() === currentMonth && tsd.getFullYear() === currentYear) isCurrentMonth = true;
    }
    
    if (isCurrentMonth) {
       hasDataForMonth = true;
       if (t.status === 'Approved') {
         attendedHours += parseFloat(t.hours || 0);
       }
    }
  });

  leaveData.forEach(l => {
    if (!l.fromDate && !l.startDate) return;
    const ld = new Date(l.fromDate || l.startDate);
    if (ld.getMonth() === currentMonth && ld.getFullYear() === currentYear) {
      hasDataForMonth = true;
      if (l.status === 'Approved') {
        const days = calculateDays(l.fromDate || l.startDate, l.toDate || l.endDate, l.duration);
        attendedHours += (days * 8);
      }
    }
  });

  const attendanceDynamicPct = expectedWorkingHours > 0 ? Math.min(100, Math.round((attendedHours / expectedWorkingHours) * 100)) : 0;

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

          <div className="row g-3 mb-2">
            <div className="col-12">
              <div className="card-dashboard p-3 h-100">
                <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)", fontSize: "0.95rem" }}>
                  <i className="bi bi-person-badge me-2" style={{ color: "var(--primary)" }} />
                  Employee Information
                </h5>
                <div className="row g-2">
                  <div className="col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-2 py-1 px-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", minHeight: "46px" }}>
                      <i className="bi bi-person" style={{ color: "var(--primary)", fontSize: "1.05rem", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <small style={{ color: "var(--gray-500)", fontSize: "0.6rem", display: "block", textTransform: "uppercase" }}>Name</small>
                        <span className="fw-semibold d-block text-truncate" style={{ fontSize: "0.8rem" }}>{employee?.FullName || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-2 py-1 px-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", minHeight: "46px" }}>
                      <i className="bi bi-person-vcard" style={{ color: "var(--primary)", fontSize: "1.05rem", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <small style={{ color: "var(--gray-500)", fontSize: "0.6rem", display: "block", textTransform: "uppercase" }}>Employee ID</small>
                        <span className="fw-semibold d-block text-truncate" style={{ fontSize: "0.8rem" }}>{employee?.empid || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-2 py-1 px-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", minHeight: "46px" }}>
                      <i className="bi bi-briefcase" style={{ color: "var(--primary)", fontSize: "1.05rem", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <small style={{ color: "var(--gray-500)", fontSize: "0.6rem", display: "block", textTransform: "uppercase" }}>Role</small>
                        <span className="fw-semibold d-block text-truncate" style={{ fontSize: "0.8rem" }}>{employee?.Role || employee?.Designation || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-2 py-1 px-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", minHeight: "46px" }}>
                      <i className="bi bi-building" style={{ color: "var(--primary)", fontSize: "1.05rem", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <small style={{ color: "var(--gray-500)", fontSize: "0.6rem", display: "block", textTransform: "uppercase" }}>Department</small>
                        <span className="fw-semibold d-block text-truncate" style={{ fontSize: "0.8rem" }}>{employee?.Department || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-2 py-1 px-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", minHeight: "46px" }}>
                      <i className="bi bi-envelope" style={{ color: "var(--primary)", fontSize: "1.05rem", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <small style={{ color: "var(--gray-500)", fontSize: "0.6rem", display: "block", textTransform: "uppercase" }}>Email</small>
                        <span className="fw-semibold d-block text-truncate" style={{ fontSize: "0.8rem" }} title={employee?.Email}>{employee?.Email || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-2 py-1 px-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", minHeight: "46px" }}>
                      <i className="bi bi-telephone" style={{ color: "var(--primary)", fontSize: "1.05rem", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <small style={{ color: "var(--gray-500)", fontSize: "0.6rem", display: "block", textTransform: "uppercase" }}>Phone</small>
                        <span className="fw-semibold d-block text-truncate" style={{ fontSize: "0.8rem" }}>{employee?.Phone || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-2 py-1 px-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", minHeight: "46px" }}>
                      <i className="bi bi-person-up" style={{ color: "var(--primary)", fontSize: "1.05rem", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <small style={{ color: "var(--gray-500)", fontSize: "0.6rem", display: "block", textTransform: "uppercase" }}>Manager</small>
                        <span className="fw-semibold d-block text-truncate" style={{ fontSize: "0.8rem" }}>{employee?.Manager || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-2 py-1 px-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", minHeight: "46px" }}>
                      <i className="bi bi-check-circle" style={{ color: employee?.Status === 'Active' ? 'var(--success)' : 'var(--gray-400)', fontSize: "1.05rem", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <small style={{ color: "var(--gray-500)", fontSize: "0.6rem", display: "block", textTransform: "uppercase" }}>Status</small>
                        <span className={`fw-semibold d-block text-truncate ${employee?.Status === 'Active' ? 'text-success' : ''}`} style={{ fontSize: "0.8rem" }}>{employee?.Status || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-xl-3 col-md-6">
              <div className="stat-card card-dashboard d-flex align-items-center gap-2 h-100" style={{ background: "#eff6ff", padding: "0.5rem 0.75rem", borderRadius: "12px", minHeight: "62px" }}>
                <div className="stat-icon" style={{ background: "#3b82f6", width: 28, height: 28, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", flexShrink: 0 }}>
                  <CalendarCheck size={14} color="white" />
                </div>
                <div className="d-flex flex-column justify-content-center" style={{ minWidth: 0, paddingRight: "4px" }}>
                  <div className="stat-label text-truncate" style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--gray-600)", marginBottom: "1px", lineHeight: 1.1 }}>Attendance</div>
                  {hasDataForMonth ? (
                    <>
                      <div className="stat-value text-truncate" style={{ color: "#1e3a8a", fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.1 }}>{attendanceDynamicPct}%</div>
                      <small className="text-truncate" style={{ color: "var(--gray-500)", fontSize: "0.6rem", fontWeight: 500, lineHeight: 1.1 }}>{attendedHours}/{expectedWorkingHours} hrs</small>
                    </>
                  ) : (
                    <div className="stat-value" style={{ color: "var(--gray-500)", fontSize: "0.6rem", fontWeight: 500, lineHeight: 1.1, whiteSpace: "normal" }}>No attendance data available</div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="stat-card card-dashboard d-flex align-items-center gap-2 h-100" style={{ background: "#ecfdf5", position: "relative", overflow: "hidden", padding: "0.5rem 0.75rem", borderRadius: "12px", minHeight: "62px" }}>
                <div className="stat-icon" style={{ background: "#10b981", width: 28, height: 28, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", flexShrink: 0 }}>
                  <PiggyBank size={14} color="white" />
                </div>
                <div className="d-flex flex-column justify-content-center" style={{ flex: 1, minWidth: 0 }}>
                  <div className="stat-label text-truncate" style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--gray-600)", marginBottom: "1px", lineHeight: 1.1 }}>Leave Balance</div>
                  <div className="stat-value d-flex align-items-baseline gap-1 text-truncate" style={{ color: "#064e3b", fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.1 }}>
                    {(leaveBalDynamic.annual - leaveBalDynamic.annualUsed) + (leaveBalDynamic.sick - leaveBalDynamic.sickUsed) + (leaveBalDynamic.personal - leaveBalDynamic.personalUsed)}
                    <span style={{ fontSize: "0.55rem", color: "var(--gray-500)", fontWeight: 500 }}>remaining</span>
                  </div>
                  <div className="progress mt-1 mb-1" style={{ height: "3px", borderRadius: "10px", background: "#d1fae5" }}>
                    <div className="progress-bar" style={{ width: `${((leaveBalDynamic.annualUsed + leaveBalDynamic.sickUsed + leaveBalDynamic.personalUsed) / (leaveBalDynamic.annual + leaveBalDynamic.sick + leaveBalDynamic.personal) * 100)}%`, background: "#10b981", borderRadius: "10px" }} />
                  </div>
                  <small className="text-truncate" style={{ color: "var(--gray-500)", fontSize: "0.6rem", fontWeight: 500, lineHeight: 1.1 }}>
                    {leaveBalDynamic.annualUsed + leaveBalDynamic.sickUsed + leaveBalDynamic.personalUsed} used of {leaveBalDynamic.annual + leaveBalDynamic.sick + leaveBalDynamic.personal}
                  </small>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="stat-card card-dashboard d-flex align-items-center gap-2 h-100" style={{ background: "#fffbeb", padding: "0.5rem 0.75rem", borderRadius: "12px", minHeight: "62px" }}>
                <div className="stat-icon" style={{ background: "#f59e0b", width: 28, height: 28, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", flexShrink: 0 }}>
                  <Clock size={14} color="white" />
                </div>
                <div className="d-flex flex-column justify-content-center" style={{ minWidth: 0 }}>
                  <div className="stat-label text-truncate" style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--gray-600)", marginBottom: "1px", lineHeight: 1.1 }}>Pending Leaves</div>
                  <div className="stat-value text-truncate" style={{ color: "#78350f", fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.1 }}>{pendingLeaves}</div>
                  <small className="text-truncate" style={{ color: "var(--gray-500)", fontSize: "0.6rem", fontWeight: 500, lineHeight: 1.1 }}>awaiting approval</small>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="stat-card card-dashboard d-flex align-items-center gap-2 h-100" style={{ background: "#f5f3ff", position: "relative", overflow: "hidden", padding: "0.5rem 0.75rem", borderRadius: "12px", minHeight: "62px" }}>
                <div className="stat-icon" style={{ background: "#8b5cf6", width: 28, height: 28, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", flexShrink: 0 }}>
                  <Home size={14} color="white" />
                </div>
                <div className="d-flex flex-column justify-content-center" style={{ flex: 1, minWidth: 0 }}>
                  <div className="stat-label text-truncate" style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--gray-600)", marginBottom: "1px", lineHeight: 1.1 }}>WFH Balance</div>
                  <div className="stat-value d-flex align-items-baseline gap-1 text-truncate" style={{ color: "#4c1d95", fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.1 }}>
                    {leaveBalDynamic.wfh - leaveBalDynamic.wfhUsed}
                    <span style={{ fontSize: "0.55rem", color: "var(--gray-500)", fontWeight: 500 }}>remaining</span>
                  </div>
                  <div className="progress mt-1 mb-1" style={{ height: "3px", borderRadius: "10px", background: "#ede9fe" }}>
                    <div className="progress-bar" style={{ width: `${(leaveBalDynamic.wfhUsed / leaveBalDynamic.wfh * 100)}%`, background: "#8b5cf6", borderRadius: "10px" }} />
                  </div>
                  <small className="text-truncate" style={{ color: "var(--gray-500)", fontSize: "0.6rem", fontWeight: 500, lineHeight: 1.1 }}>{leaveBalDynamic.wfhUsed} used of {leaveBalDynamic.wfh}</small>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="stat-card card-dashboard d-flex flex-column justify-content-center h-100" style={{ background: "#f8fafc", padding: "0.5rem 0.75rem", borderRadius: "12px", minHeight: "62px" }}>
                <div className="d-flex align-items-center gap-1 mb-1">
                  <div className="stat-icon" style={{ background: "#64748b", width: 20, height: 20, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "white", borderRadius: "50%", flexShrink: 0 }}>
                    <Activity size={10} />
                  </div>
                  <div className="stat-label fw-bold text-truncate" style={{ fontSize: "0.7rem", color: "var(--gray-800)", lineHeight: 1.1 }}>Timesheets</div>
                </div>
                <div className="mb-1 d-flex flex-column gap-0" style={{ lineHeight: 1.1 }}>
                  <div className="text-truncate" style={{ fontSize: "0.6rem", color: "var(--gray-600)" }}>Hours This Month: <span className="fw-bold" style={{ color: "var(--gray-800)" }}>0 hrs</span></div>
                  <div className="text-truncate" style={{ fontSize: "0.6rem", color: "var(--gray-600)" }}>Pending Timesheets: <span className="fw-bold" style={{ color: "var(--gray-800)" }}>0</span></div>
                </div>
                <button className="btn btn-primary btn-sm w-100" onClick={() => navigate('/timesheets')} style={{ fontSize: "0.6rem", padding: "0.15rem 0.4rem", lineHeight: 1.2 }}>
                  Go to Timesheets
                </button>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;
