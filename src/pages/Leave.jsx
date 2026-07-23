import { useState, useCallback, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getCurrentUser, getEmployee, getLeaveBalances, getLeaveRequests, getAllLeaveRequests, addLeaveRequest, updateLeaveStatus, getHolidays, getNextLeaveId, submitLeaveRequestApi, deleteLeaveRequestApi, deleteLeaveRequestLocal, getManagerLeaveRequests, getEmployeeLeaveRequests, updateManagerLeaveStatus } from "../services/dataService";

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function LeaveCalendar({ leaves, holidays, selectedDate, onSelectDate }) {
  const [viewDate, setViewDate] = useState(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const getDayClass = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    const classes = ['calendar-day'];

    if (selectedDate === dateStr) classes.push('selected');
    if (date.toDateString() === today.toDateString()) classes.push('today');
    if (dayOfWeek === 0 || dayOfWeek === 6) classes.push('weekend');
    if (holidays.find(h => h.date === dateStr)) classes.push('holiday');
    const leave = leaves.find(l => dateStr >= (l.startDate || l.fromDate) && dateStr <= (l.endDate || l.toDate) && l.status !== 'Rejected');
    if (leave) {
      if (leave.wfh) classes.push('wfh');
      else classes.push('leave');
    }
    return classes.join(' ');
  };

  const getDayContent = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const holiday = holidays.find(h => h.date === dateStr);
    const leave = leaves.find(l => dateStr >= (l.startDate || l.fromDate) && dateStr <= (l.endDate || l.toDate) && l.status !== 'Rejected');
    if (holiday) return <span title={holiday.name} className="holiday-dot">H</span>;
    if (leave?.wfh) return <span title="WFH" className="wfh-dot">W</span>;
    if (leave) return <span title={`${leave.leaveType} - ${leave.status}`} className="leave-dot">L</span>;
    return null;
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} className="calendar-day empty" />);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push(
      <div key={d} className={getDayClass(d)} onClick={() => onSelectDate(dateStr)}>
        <span className="day-num">{d}</span>
        <div className="day-indicators">{getDayContent(d)}</div>
      </div>
    );
  }

  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <button className="btn btn-sm btn-link" onClick={prevMonth}><i className="bi bi-chevron-left" /></button>
        <span className="fw-bold">{MONTHS[month]} {year}</span>
        <button className="btn btn-sm btn-link" onClick={nextMonth}><i className="bi bi-chevron-right" /></button>
      </div>
      <div className="calendar-grid">
        {DAYS.map(d => <div key={d} className="calendar-day-header">{d}</div>)}
        {cells}
      </div>
      <div className="calendar-legend d-flex flex-wrap gap-3 mt-1 pt-1 justify-content-center" style={{ borderTop: "1px solid var(--gray-100)" }}>
        <span><span className="legend-dot" style={{ background: "#dbeafe" }} /> Leave</span>
        <span><span className="legend-dot" style={{ background: "#fef3c7" }} /> WFH</span>
        <span><span className="legend-dot" style={{ background: "#f3e8ff" }} /> Holiday</span>
        <span><span className="legend-dot" style={{ background: "#e2e8f0" }} /> Weekend</span>
      </div>
    </div>
  );
}

function Leave() {
  const user = getCurrentUser();
  const empId = user?.employeeId || 'EMP001';
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    async function fetchEmp() {
      const data = await getEmployee(empId);
      setEmployee(data);
    }
    fetchEmp();
  }, [empId]);

  const [role, setRole] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored).role.toLowerCase() : "employee";
  });

  const [userName] = useState(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const u = JSON.parse(stored);
      return u.FullName || u.fullName || u.name || u.empid || "Manager";
    }
    return "Manager";
  });

  const leaveBal = getLeaveBalances(empId);
  const holidays = getHolidays();
  const upcomingHolidays = holidays
    .filter(h => h.name !== 'Ambedkar Jayanti' && h.name !== 'Independence Day')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const isManagerOrAdmin = role === 'manager' || role === 'admin';

  const [managerLeaves, setManagerLeaves] = useState([]);
  const [employeeLeaves, setEmployeeLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [showAllHolidays, setShowAllHolidays] = useState(false);
  const [leaveType, setLeaveType] = useState('Annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [halfDay, setHalfDay] = useState(false);
  const [wfh, setWfh] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewLeave, setViewLeave] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const perPage = 5;

  useEffect(() => {
    fetchLeaves();
  }, [isManagerOrAdmin, empId]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      if (isManagerOrAdmin) {
        console.log(`Fetching manager leaves for: ${empId}`);
        const data = await getManagerLeaveRequests(empId);
        console.log("Manager Leaves fetched:", data);
        setManagerLeaves(data || []);
      } else {
        console.log(`Fetching employee leaves for: ${empId}`);
        const data = await getEmployeeLeaveRequests(empId);
        console.log("Employee Leaves fetched:", data);
        setEmployeeLeaves(data || []);
      }
    } catch (e) {
      console.error("Error fetching leaves", e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setLeaveType('Annual');
    setStartDate('');
    setEndDate('');
    setReason('');
    setHalfDay(false);
    setWfh(false);
    setErrors({});
  };

  const handleApply = async () => {
    const newErrors = {};
    if (!startDate) newErrors.startDate = true;
    if (!endDate) newErrors.endDate = true;
    if (!reason.trim()) newErrors.reason = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check for overlapping leaves
    const hasOverlap = employeeLeaves.some(l => {
      if (l.status === 'Rejected') return false;
      const lStart = l.fromDate || l.startDate;
      const lEnd = l.toDate || l.endDate;
      return (startDate <= lEnd) && (endDate >= lStart);
    });

    if (hasOverlap) {
      showToast("You have already applied for leave during these dates.", "warning");
      return;
    }

    const now = new Date();
    const appliedOnStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const uniqueLeaveId = `LV${now.getTime()}`;

    const newLeave = {
      leave_id: uniqueLeaveId,
      empid: empId,
      employeeName: employee?.name || employee?.FullName || empId,
      leaveType: wfh ? 'WFH' : (leaveType.includes('Leave') ? leaveType : `${leaveType} Leave`),
      fromDate: startDate,
      toDate: endDate,
      reason: reason.trim(),
      duration: halfDay ? 'Half Day' : 'Full Day',
      status: 'Pending',
      appliedOn: appliedOnStr,

      // Keep old fields for local UI compatibility until fully refactored, or update UI to use new fields
      leaveId: uniqueLeaveId,
      employeeId: empId,
      startDate: startDate,
      endDate: endDate,
      halfDay: halfDay,
      wfh: wfh
    };

    try {
      await submitLeaveRequestApi(newLeave);
      showToast(wfh ? 'WFH request submitted successfully!' : 'Leave applied successfully!');
      fetchLeaves();
    } catch (e) {
      console.warn("API failed", e);
      showToast('Failed to apply leave. Please try again.', 'warning');
    }

    resetForm();
    setShowForm(false);
    setCurrentPage(1);
  };

  const handleDelete = async (leave) => {
    if (!window.confirm("Are you sure you want to delete this leave request?")) return;

    console.log("[handleDelete] Selected leave object:", leave);
    const leaveIdToDelete = leave.leave_id || leave.leaveId;
    console.log("[handleDelete] leave_id being sent:", leaveIdToDelete);

    if (!leaveIdToDelete) {
      showToast('Error: Leave ID is missing', 'warning');
      return;
    }

    try {
      await deleteLeaveRequestApi(leaveIdToDelete);
      showToast('Leave request deleted successfully');
      fetchLeaves();
    } catch (e) {
      console.error("[handleDelete] Delete failed:", e);
      showToast('Failed to delete leave request. Please try again.', 'warning');
    }
  };

  const handleApprove = async (leave) => {
    console.log("Leave Object:", leave);
    console.log("Leave ID:", leave.leave_id);
    const leaveId = leave.leave_id || leave.leaveId;
    if (!leaveId) {
      showToast('Error: Leave ID is missing', 'warning');
      return;
    }
    try {
      await updateManagerLeaveStatus(leaveId, 'Approved', userName);
      showToast('Leave approved');
      fetchLeaves();
    } catch (error) {
      showToast('Failed to approve leave', 'warning');
    }
  };

  const handleReject = async (leave) => {
    console.log("Leave Object:", leave);
    console.log("Leave ID:", leave.leave_id);
    const leaveId = leave.leave_id || leave.leaveId;
    if (!leaveId) {
      showToast('Error: Leave ID is missing', 'warning');
      return;
    }
    try {
      await updateManagerLeaveStatus(leaveId, 'Rejected', userName);
      showToast('Leave rejected', 'warning');
      fetchLeaves();
    } catch (error) {
      showToast('Failed to reject leave', 'warning');
    }
  };

  const displayLeaves = isManagerOrAdmin ? managerLeaves : employeeLeaves;
  const filtered = displayLeaves.filter(l => {
    const lId = (l.leaveId || l.leave_id || '').toLowerCase();
    const lType = (l.leaveType || '').toLowerCase();
    const lReason = (l.reason || '').toLowerCase();
    const lEmpId = (l.employeeId || l.empid || '').toLowerCase();
    const lEmpName = (l.employeeName || '').toLowerCase();
    const lStatus = (l.status || '').toLowerCase();
    
    const sDate = l.startDate || l.fromDate;
    const eDate = l.endDate || l.toDate;
    const sDateStr = sDate ? new Date(sDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toLowerCase() : '';
    const eDateStr = eDate ? new Date(eDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toLowerCase() : '';

    const search = searchTerm.toLowerCase();

    const ms = lId.includes(search) ||
      lType.includes(search) ||
      lReason.includes(search) ||
      lEmpId.includes(search) ||
      lEmpName.includes(search) ||
      lStatus.includes(search) ||
      sDateStr.includes(search) ||
      eDateStr.includes(search);
      
    const mf = filterStatus === 'All' || l.status === filterStatus;
    return ms && mf;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const pendingCount = displayLeaves.filter(l => l.status === 'Pending').length;
  const approvedCount = displayLeaves.filter(l => l.status === 'Approved').length;
  const rejectedCount = displayLeaves.filter(l => l.status === 'Rejected').length;

  const totalLeaveBal = (leaveBal.annual - leaveBal.annualUsed) + (leaveBal.sick - leaveBal.sickUsed) + (leaveBal.personal - leaveBal.personalUsed);

  const statusBadge = (status) => {
    const map = { Pending: "badge-pending", Approved: "badge-approved", Rejected: "badge-rejected" };
    return `badge-status ${map[status] || "badge-pending"}`;
  };

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
      <Sidebar role={role} onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} />
      <div className="main-content">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="page-content">
          <div className="section-header">
            <div>
              <h4>Leave Management</h4>
              <p>{isManagerOrAdmin ? 'Manage all leave requests' : 'Apply and track your leave requests'}</p>
            </div>
            {!isManagerOrAdmin && (
              <button
                className="btn-custom-primary d-flex align-items-center gap-2"
                onClick={() => setShowForm(true)}
              >
                <i className="bi bi-plus-lg" />
                Apply Leave
              </button>
            )}
          </div>

          <div className="row g-3 mb-4">
            {[
              { label: "Pending", value: pendingCount, color: "#f59e0b", bg: "#fffbeb", icon: "bi-clock" },
              { label: "Approved", value: approvedCount, color: "#10b981", bg: "#ecfdf5", icon: "bi-check-circle" },
              { label: "Rejected", value: rejectedCount, color: "#ef4444", bg: "#fef2f2", icon: "bi-x-circle" },
              { label: "Total", value: displayLeaves.length, color: "#3b82f6", bg: "#eff6ff", icon: "bi-calculator" },
            ].map((s) => (
              <div key={s.label} className="col-6 col-xl-3">
                <div
                  className="stat-card card-dashboard d-flex align-items-center "
                  style={{
                    background: s.bg,
                    borderLeft: `5px solid ${s.color}`,
                    padding: "22px",
                    transition: "0.3s",
                    cursor: "pointer",
                  }}
                >
                  <div
                    className="stat-icon"
                    style={{
                      background: s.color,
                      width: 52,
                      height: 52,
                      fontSize: "1.3rem",
                      marginRight: "18px",
                      flexShrink: 0,
                    }}
                  >
                    <i className={`bi ${s.icon}`} />
                  </div>
                  <div className="flex-grow-1 ms-3">

                    <div
                      className="stat-label"
                      style={{
                        fontSize: "0.75rem",
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginBottom: "6px"
                      }}
                    >
                      {s.label}
                    </div>

                    <div
                      className="stat-value"
                      style={{
                        color: s.color,
                        fontSize: "2rem",
                        fontWeight: "700",
                        lineHeight: "1"
                      }}
                    >
                      {s.value}
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>

          {!isManagerOrAdmin && (
            <div className="row g-3 mb-4">
              <div className="col-lg-6 d-flex">
                <div className="card-dashboard p-4 flex-fill">
                  <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)", fontSize: "0.95rem" }}>
                    <i className="bi bi-piggy-bank me-2" style={{ color: "var(--primary)" }} />
                    Leave Balance
                  </h5>
                  <div className="row g-3">
                    {[
                      { label: 'Annual Leave', used: leaveBal.annualUsed, total: leaveBal.annual, color: '#3b82f6', bg: '#eff6ff', icon: 'bi-sun' },
                      { label: 'Sick Leave', used: leaveBal.sickUsed, total: leaveBal.sick, color: '#10b981', bg: '#ecfdf5', icon: 'bi-heart-pulse' },
                      { label: 'Personal Leave', used: leaveBal.personalUsed, total: leaveBal.personal, color: '#f59e0b', bg: '#fffbeb', icon: 'bi-person' },
                      { label: 'WFH Days', used: leaveBal.wfhUsed, total: leaveBal.wfh, color: '#8b5cf6', bg: '#f5f3ff', icon: 'bi-house-door' },
                    ].map((b) => {
                      const remaining = b.total - b.used;
                      const pct = b.total > 0 ? (b.used / b.total) * 100 : 0;
                      return (
                        <div key={b.label} className="col-sm-6">
                          <div className="leave-bal-card" style={{
                            background: "#fff",
                            borderRadius: "16px",
                            border: `1px solid ${b.color}20`,
                            padding: "1.25rem 1.25rem 1rem",
                            transition: "all 0.3s ease",
                            cursor: "default",
                            position: "relative",
                            overflow: "hidden",
                          }}
                            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 8px 25px ${b.color}20`; e.currentTarget.style.transform = 'translateY(-3px)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}>
                            <div className="d-flex align-items-center gap-3 mb-3">
                              <div style={{
                                width: 46, height: 46, borderRadius: "14px",
                                background: b.bg, color: b.color,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "1.25rem", flexShrink: 0
                              }}>
                                <i className={`bi ${b.icon}`} />
                              </div>
                              <div>
                                <div style={{ fontSize: "0.72rem", color: "var(--gray-500)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>
                                  {b.label}
                                </div>
                                <div style={{ fontSize: "1.65rem", fontWeight: 700, color: b.color, lineHeight: 1.2 }}>
                                  {remaining}
                                  <span style={{ fontSize: "0.65rem", color: "var(--gray-400)", fontWeight: 400, marginLeft: "6px" }}>remaining</span>
                                </div>
                              </div>
                            </div>
                            <div className="progress" style={{ height: "7px", borderRadius: "10px", background: "#e5e7eb", overflow: "hidden", marginBottom: "6px" }}>
                              <div className="progress-bar" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${b.color}, ${b.color}cc)`, borderRadius: "10px", transition: "width 0.6s ease" }} />
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <small style={{ color: "var(--gray-400)", fontSize: "0.7rem" }}>{b.used} used</small>
                              <small style={{ color: "var(--gray-400)", fontSize: "0.7rem" }}>{b.total} total</small>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="col-lg-6 d-flex">
                <div
                  className="card-dashboard p-4 flex-fill d-flex flex-column"
                  onClick={() => setShowAllHolidays(true)}
                  style={{
                    height: "430px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)" }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)" }}
                >
                  <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)", fontSize: "0.95rem" }}>
                    <i className="bi bi-calendar-event me-2" style={{ color: "var(--warning)" }} />
                    Public Holidays
                    <span style={{
                      float: "right",
                      background: "#f1f5f9", color: "#64748b",
                      fontSize: "0.68rem", fontWeight: 600,
                      padding: "2px 10px", borderRadius: "20px",
                    }}>
                      {upcomingHolidays.length} holidays
                    </span>
                  </h5>
                  <div
                    style={{
                      maxHeight: "360px",
                      overflowY: "scroll",
                      overflowX: "hidden",
                      paddingRight: "6px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {(() => {
                      const sorted = [...upcomingHolidays];
                      const today = new Date(); today.setHours(0, 0, 0, 0);
                      const nextIdx = sorted.findIndex(h => new Date(h.date) >= today);
                      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      return sorted.slice(0, 5).map((h, idx) => {
                        const d = new Date(h.date);
                        const isNext = idx === nextIdx;
                        const month = months[d.getMonth()];
                        const day = d.getDate();
                        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                        return (
                          <div key={h.date}
                            style={{
                              display: "flex", alignItems: "center", gap: "14px",
                              padding: "12px 14px",
                              background: isNext ? "#fffbeb" : "#fff",
                              borderRadius: "14px",
                              border: isNext ? "1.5px solid #f59e0b" : "1px solid #e5e7eb",
                              transition: "all 0.25s ease",
                              cursor: "default",
                              position: "relative",
                              overflow: "hidden",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateX(4px)" }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateX(0)" }}>
                            <div style={{
                              display: "flex", flexDirection: "column", alignItems: "center",
                              minWidth: "50px", padding: "6px 0",
                              background: isNext ? "#f59e0b" : "#f1f5f9",
                              borderRadius: "10px",
                              color: isNext ? "#fff" : "#475569",
                              flexShrink: 0,
                            }}>
                              <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: 1 }}>{month}</span>
                              <span style={{ fontSize: "1.25rem", fontWeight: 800, lineHeight: 1.2 }}>{day}</span>
                              <span style={{ fontSize: "0.55rem", fontWeight: 600, textTransform: "uppercase", lineHeight: 1 }}>{dayName}</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1e293b", marginBottom: "2px" }}>{h.name}</div>
                              <small style={{ color: "#94a3b8", fontSize: "0.72rem" }}>
                                <i className="bi bi-calendar3 me-1" style={{ fontSize: "0.65rem" }} />
                                {d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                              </small>
                            </div>
                            {isNext && (
                              <span style={{
                                background: "#f59e0b", color: "#fff",
                                fontSize: "0.58rem", fontWeight: 700,
                                padding: "3px 10px", borderRadius: "20px",
                                textTransform: "uppercase", letterSpacing: "0.5px",
                                position: "absolute", top: "-6px", right: "10px",
                                boxShadow: "0 2px 6px rgba(245,158,11,0.4)",
                              }}>
                                <i className="bi bi-arrow-up me-1" style={{ fontSize: "0.55rem" }} />Next
                              </span>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {showAllHolidays && (
            <div className="modal-overlay" onClick={() => setShowAllHolidays(false)}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
                <button className="modal-close-btn" onClick={() => setShowAllHolidays(false)}>
                  <i className="bi bi-x-lg" />
                </button>
                <div className="text-center mb-4">
                  <div className="modal-icon">
                    <i className="bi bi-calendar-event" style={{ color: "var(--warning)" }} />
                  </div>
                  <h4 className="modal-title">Public Holidays</h4>
                  <p className="modal-subtitle">All public holidays for the year</p>
                </div>
                <div style={{ maxHeight: "420px", overflowY: "auto", paddingRight: "4px" }}>
                  {(() => {
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const sorted = [...upcomingHolidays];
                    const today = new Date(); today.setHours(0, 0, 0, 0);
                    const nextIdx = sorted.findIndex(h => new Date(h.date) >= today);
                    return sorted.map((h, idx) => {
                      const d = new Date(h.date);
                      const isNext = idx === nextIdx;
                      const month = months[d.getMonth()];
                      const day = d.getDate();
                      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                      return (
                        <div key={h.date}
                          style={{
                            display: "flex", alignItems: "center", gap: "14px",
                            padding: "12px 14px",
                            background: isNext ? "#fffbeb" : "#fff",
                            borderRadius: "14px",
                            border: isNext ? "1.5px solid #f59e0b" : "1px solid #e5e7eb",
                            marginBottom: "8px",
                            position: "relative",
                            overflow: "hidden",
                          }}>
                          <div style={{
                            display: "flex", flexDirection: "column", alignItems: "center",
                            minWidth: "50px", padding: "6px 0",
                            background: isNext ? "#f59e0b" : "#f1f5f9",
                            borderRadius: "10px",
                            color: isNext ? "#fff" : "#475569",
                            flexShrink: 0,
                          }}>
                            <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: 1 }}>{month}</span>
                            <span style={{ fontSize: "1.25rem", fontWeight: 800, lineHeight: 1.2 }}>{day}</span>
                            <span style={{ fontSize: "0.55rem", fontWeight: 600, textTransform: "uppercase", lineHeight: 1 }}>{dayName}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1e293b", marginBottom: "2px" }}>{h.name}</div>
                            <small style={{ color: "#94a3b8", fontSize: "0.72rem" }}>
                              <i className="bi bi-calendar3 me-1" style={{ fontSize: "0.65rem" }} />
                              {d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </small>
                          </div>
                          {isNext && (
                            <span style={{
                              background: "#f59e0b", color: "#fff",
                              fontSize: "0.58rem", fontWeight: 700,
                              padding: "3px 10px", borderRadius: "20px",
                              textTransform: "uppercase", letterSpacing: "0.5px",
                              position: "absolute", top: "-6px", right: "10px",
                              boxShadow: "0 2px 6px rgba(245,158,11,0.4)",
                            }}>
                              <i className="bi bi-arrow-up me-1" style={{ fontSize: "0.55rem" }} />Next
                            </span>
                          )}
                        </div>
                      );
                    })
                  })()}
                </div>
              </div>
            </div>
          )}

          {showForm && !isManagerOrAdmin && (
            <div className="modal-overlay" onClick={() => { setShowForm(false); resetForm(); }}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={() => { setShowForm(false); resetForm(); }}>
                  <i className="bi bi-x-lg" />
                </button>
                <div className="text-center mb-4">
                  <div className="modal-icon">
                    <i className="bi bi-calendar-plus" />
                  </div>
                  <h4 className="modal-title">Apply Leave</h4>
                  <p className="modal-subtitle">Submit your leave request</p>
                </div>
                <div className="row g-3 form-custom">
                  <div className="col-md-4">
                    <label className="form-label">Leave Type</label>
                    <select className="form-select" value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                      <option value="Annual">Annual Leave</option>
                      <option value="Sick">Sick Leave</option>
                      <option value="Personal">Personal Leave</option>
                      <option value="WFH">Work From Home (WFH)</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">From Date</label>
                    <input type="date" className={`form-control ${errors.startDate ? "is-invalid" : ""}`} value={startDate}
                      onChange={(e) => { setStartDate(e.target.value); setErrors({ ...errors, startDate: false }); }}
                      onFocus={(e) => e.currentTarget.showPicker?.()} min={new Date().toISOString().split("T")[0]} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">To Date</label>
                    <input type="date" className={`form-control ${errors.endDate ? "is-invalid" : ""}`} value={endDate}
                      onChange={(e) => { setEndDate(e.target.value); setErrors({ ...errors, endDate: false }); }}
                      onFocus={(e) => e.currentTarget.showPicker?.()} min={startDate || new Date().toISOString().split("T")[0]} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Reason</label>
                    <textarea className={`form-control ${errors.reason ? "is-invalid" : ""}`} rows="2" placeholder="Enter reason for leave" value={reason}
                      onChange={(e) => { setReason(e.target.value); setErrors({ ...errors, reason: false }); }} />
                  </div>
                  <div className="col-12">
                    <div className="d-flex gap-4">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="halfDay" checked={halfDay}
                          onChange={(e) => setHalfDay(e.target.checked)} />
                        <label className="form-check-label" htmlFor="halfDay" style={{ fontSize: "0.88rem" }}>Half Day</label>
                      </div>
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="fullDay" checked={!halfDay}
                          onChange={(e) => setHalfDay(!e.target.checked)} />
                        <label className="form-check-label" htmlFor="fullDay" style={{ fontSize: "0.88rem" }}>Full Day</label>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 d-flex gap-3 mt-2">
                    <button className="btn-custom-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2" onClick={handleApply}>
                      <i className="bi bi-send" /> Submit Application
                    </button>
                    <button className="btn-custom-secondary d-flex align-items-center justify-content-center gap-2" onClick={() => { setShowForm(false); resetForm(); }}>
                      <i className="bi bi-x-lg" /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="row g-4">
            <div className="col-xl-9 col-lg-8">
              <div className="card-dashboard p-4">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                  <h5 className="fw-bold mb-0" style={{ color: "var(--gray-800)", fontSize: "0.95rem" }}>
                    <i className="bi bi-list-check me-2" style={{ color: "var(--primary)" }} />
                    {isManagerOrAdmin ? 'All Leave Requests' : 'Leave History'}
                  </h5>
                  <div className="d-flex gap-2 align-items-center">
                    <div className="search-box" style={{ maxWidth: 220 }}>
                      <i className="bi bi-search" />
                      <input type="text" className="form-control" placeholder="Search leaves..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                    </div>
                    <select className="form-select" style={{ width: "auto", borderRadius: "50px", fontSize: "0.85rem", padding: "0.35rem 2rem 0.35rem 0.75rem" }} value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
                      <option value="All">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table-custom table">
                    <thead>
                      <tr>
                        {isManagerOrAdmin && <th>Employee</th>}
                        <th>Type</th>
                        <th style={{ minWidth: "120px" }}>From Date</th>
                        <th style={{ minWidth: "120px" }}>To Date</th>
                        <th style={{ minWidth: "150px" }}>Reason</th>
                        <th>Status</th>
                        {isManagerOrAdmin ? <th style={{ width: "1%", whiteSpace: "nowrap" }}>Actions</th> : <th style={{ width: "1%", whiteSpace: "nowrap" }}>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </td>
                        </tr>
                      ) : paginated.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4" style={{ color: "var(--gray-400)" }}>
                            <i className="bi bi-inbox" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }} />
                            No leave requests found
                          </td>
                        </tr>
                      ) : (
                        paginated.map((leave, index) => {
                          const sDate = leave.startDate || leave.fromDate;
                          const eDate = leave.endDate || leave.toDate;
                          return (
                          <tr key={leave.leaveId || leave.leave_id || index}>
                            {isManagerOrAdmin && <td className="fw-semibold">{leave.employeeName || leave.employeeId || leave.empid}</td>}
                            <td>
                              {leave.wfh ? (
                                <span className="badge-status" style={{ background: "#fef3c7", color: "#92400e" }}>
                                  <i className="bi bi-house-door me-1" /> WFH
                                </span>
                              ) : (
                                <span className="badge-status" style={{ background: "#dbeafe", color: "#1e40af" }}>{leave.leaveType}</span>
                              )}
                            </td>
                            <td style={{ whiteSpace: "nowrap" }}>
                              {sDate ? new Date(sDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                            </td>
                            <td style={{ whiteSpace: "nowrap" }}>
                              {eDate ? new Date(eDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                            </td>
                            <td>
                              {leave.halfDay && !(leave.reason || '').toLowerCase().startsWith('half day')
                                ? `Half Day - ${leave.reason || ''}`
                                : leave.reason || '-'}
                            </td>
                            <td>
                              <span
                                className={statusBadge(leave.status)}
                                style={{ cursor: "pointer", transition: "all 0.2s" }}
                                onDoubleClick={() => setViewLeave(leave)}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                title="Double-click to view details"
                              >
                                {leave.status}
                              </span>
                            </td>
                            {isManagerOrAdmin ? (
                              <td>
                                <div className="action-btns d-flex flex-nowrap gap-2">
                                  {leave.status === "Pending" ? (
                                    <>
                                      <button className="btn-custom-success d-flex align-items-center justify-content-center shadow-sm rounded" style={{ width: "32px", height: "32px", padding: 0 }} onClick={(e) => { e.stopPropagation(); handleApprove(leave); }} title="Approve">
                                        <i className="bi bi-check-lg" style={{ fontSize: "1.1rem" }} />
                                      </button>
                                      <button className="btn-custom-danger d-flex align-items-center justify-content-center shadow-sm rounded" style={{ width: "32px", height: "32px", padding: 0 }} onClick={(e) => { e.stopPropagation(); handleReject(leave); }} title="Reject">
                                        <i className="bi bi-x-lg" style={{ fontSize: "1.1rem" }} />
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-muted" style={{ fontSize: "0.85rem" }}>—</span>
                                  )}
                                </div>
                              </td>
                            ) : (
                              <td>
                                <div className="action-btns d-flex flex-nowrap gap-2">
                                  {leave.status === "Pending" ? (
                                    <button className="btn-custom-danger d-flex align-items-center justify-content-center shadow-sm rounded" style={{ width: "32px", height: "32px", padding: 0 }} onClick={(e) => { e.stopPropagation(); handleDelete(leave); }} title="Delete Request">
                                      <i className="bi bi-trash" style={{ fontSize: "1.1rem" }} />
                                    </button>
                                  ) : (
                                    <span className="text-muted" style={{ fontSize: "0.85rem" }}>—</span>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })
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

            <div className="col-xl-3 col-lg-4">
              <div className="card-dashboard p-3 sticky-top" style={{ top: '80px', zIndex: 1 }}>
                <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)", fontSize: "0.95rem" }}>
                  <i className="bi bi-calendar3 me-2" style={{ color: "var(--primary)" }} />
                  Leave Calendar
                </h5>
                <LeaveCalendar
                  leaves={displayLeaves}
                  holidays={holidays}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
                {selectedDate && (
                  <div className="mt-2 p-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", fontSize: "0.82rem" }}>
                    <strong>Selected: </strong>
                    {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    {(() => {
                      const holiday = holidays.find(h => h.date === selectedDate);
                      const leave = displayLeaves.find(l => selectedDate >= (l.startDate || l.fromDate) && selectedDate <= (l.endDate || l.toDate) && l.status !== 'Rejected');
                      const day = new Date(selectedDate).getDay();
                      if (holiday) return <span className="ms-2 badge-status" style={{ background: "#f3e8ff", color: "#6d28d9" }}>{holiday.name}</span>;
                      if (leave?.wfh) return <span className="ms-2 badge-status" style={{ background: "#fef3c7", color: "#92400e" }}>WFH</span>;
                      if (leave) return <span className={`ms-2 ${statusBadge(leave.status)}`}>{leave.leaveType}</span>;
                      if (day === 0 || day === 6) return <span className="ms-2 badge-status" style={{ background: "#e2e8f0", color: "#475569" }}>Weekend</span>;
                      return <span className="ms-2 badge-status badge-approved">Working Day</span>;
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {viewLeave && (
        <div className="modal-backdrop" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 1050, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setViewLeave(null)}>
          <div className="card-dashboard p-4" style={{ width: "90%", maxWidth: "500px", zIndex: 1060 }} onClick={e => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-info-circle me-2" style={{ color: "var(--primary)" }}></i>
                Leave Details
              </h5>
              <button className="btn btn-sm btn-light" onClick={() => setViewLeave(null)}><i className="bi bi-x-lg"></i></button>
            </div>

            <div className="d-flex flex-column gap-2">
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-muted small">Employee:</span>
                <span className="fw-semibold">{viewLeave.employeeName || viewLeave.employeeId} ({viewLeave.employeeId})</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-muted small">Leave Type:</span>
                <span className="fw-semibold">{viewLeave.wfh ? "WFH" : viewLeave.leaveType} {viewLeave.halfDay ? "(Half Day)" : ""}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-muted small">Duration:</span>
                <span className="fw-semibold">{viewLeave.startDate || viewLeave.fromDate} to {viewLeave.endDate || viewLeave.toDate}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-muted small">Status:</span>
                <span className={statusBadge(viewLeave.status)}>{viewLeave.status}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-muted small">Applied On:</span>
                <span className="fw-semibold">{viewLeave.appliedOn || '—'}</span>
              </div>
              <div className="pt-2">
                <span className="text-muted small d-block mb-1">Reason:</span>
                <div className="p-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", fontSize: "0.9rem" }}>
                  {viewLeave.reason || 'No reason provided'}
                </div>
              </div>
            </div>

            <div className="mt-4 d-flex justify-content-end gap-2">
              <button className="btn btn-sm btn-custom-outline" onClick={() => setViewLeave(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leave;
