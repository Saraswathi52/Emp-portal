import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getCurrentUser, getEmployee, getLeaveBalances, getLeaveRequests, getAllLeaveRequests, addLeaveRequest, updateLeaveStatus, getHolidays, getNextLeaveId } from "../services/dataService";

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
    const leave = leaves.find(l => dateStr >= l.startDate && dateStr <= l.endDate && l.status !== 'Rejected');
    if (leave) {
      if (leave.wfh) classes.push('wfh');
      else classes.push('leave');
    }
    return classes.join(' ');
  };

  const getDayContent = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const holiday = holidays.find(h => h.date === dateStr);
    const leave = leaves.find(l => dateStr >= l.startDate && dateStr <= l.endDate && l.status !== 'Rejected');
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
      <div className="calendar-legend d-flex flex-wrap gap-3 mt-2 pt-2 justify-content-center" style={{ borderTop: "1px solid var(--gray-100)" }}>
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
  const employee = getEmployee(user?.employeeId);
  const empId = user?.employeeId || 'EMP001';
  const [role] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored).role.toLowerCase() : "employee";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allLeaves = getLeaveRequests(empId);
  const leaveBal = getLeaveBalances(empId);
  const holidays = getHolidays();
  const allRequests = getAllLeaveRequests();

  const isManagerOrAdmin = role === 'manager' || role === 'admin';

  const [showForm, setShowForm] = useState(false);
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
  const perPage = 5;

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

  const handleApply = () => {
    const newErrors = {};
    if (!startDate) newErrors.startDate = true;
    if (!endDate) newErrors.endDate = true;
    if (!reason.trim()) newErrors.reason = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newLeave = {
      leaveId: getNextLeaveId(),
      employeeId: empId,
      employeeName: employee?.name || empId,
      leaveType,
      startDate,
      endDate,
      reason: reason.trim(),
      status: 'Pending',
      halfDay,
      wfh,
      appliedOn: new Date().toISOString().split('T')[0],
    };

    addLeaveRequest(newLeave);
    resetForm();
    setShowForm(false);
    setCurrentPage(1);
    showToast(wfh ? 'WFH request submitted successfully!' : 'Leave applied successfully!');
  };

  const handleApprove = (leaveId) => {
    updateLeaveStatus(leaveId, 'Approved');
    showToast('Leave approved');
  };

  const handleReject = (leaveId) => {
    updateLeaveStatus(leaveId, 'Rejected');
    showToast('Leave rejected', 'warning');
  };

  const displayLeaves = isManagerOrAdmin ? allRequests : allLeaves;
  const filtered = displayLeaves.filter(l => {
    const ms = l.leaveId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.leaveType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.employeeName?.toLowerCase().includes(searchTerm.toLowerCase());
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
              <div className="col-lg-7">
                <div className="card-dashboard p-4">
                  <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)", fontSize: "0.95rem" }}>
                    <i className="bi bi-piggy-bank me-2" style={{ color: "var(--primary)" }} />
                    Leave Balance
                  </h5>
                  <div className="row g-2">
                    {[
                      { label: 'Annual Leave', used: leaveBal.annualUsed, total: leaveBal.annual, color: '#3b82f6' },
                      { label: 'Sick Leave', used: leaveBal.sickUsed, total: leaveBal.sick, color: '#10b981' },
                      { label: 'Personal Leave', used: leaveBal.personalUsed, total: leaveBal.personal, color: '#f59e0b' },
                      { label: 'WFH Days', used: leaveBal.wfhUsed, total: leaveBal.wfh, color: '#8b5cf6' },
                    ].map((b) => {
                      const remaining = b.total - b.used;
                      const pct = b.total > 0 ? (b.used / b.total) * 100 : 0;
                      return (
                        <div key={b.label} className="col-sm-6">
                          <div
  className="p-3 shadow-sm"
  style={{
    background: "#ffffff",
    borderRadius: "16px",
    border: `1px solid ${b.color}30`,
    transition: "0.3s ease"
  }}
>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small style={{ color: "var(--gray-500)", fontSize: "0.72rem", fontWeight: 600 }}>{b.label}</small>
                              <small style={{ color: b.color, fontWeight: 700, fontSize: "0.8rem" }}>{remaining} left</small>
                            </div>
                            <div className="progress" style={{ height: "10px", borderRadius: "20px", background: "#e5e7eb", overflow: "hidden",marginTop: "10px",marginBottom: "8px" }}>
                             <div className="progress-bar" style={{ width: `${pct}%`, background: b.color, borderRadius: "20px"  }} />
                            </div>
                            <small style={{ color: "var(--gray-400)", fontSize: "0.68rem" }}>{b.used} used of {b.total}</small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div className="card-dashboard p-4">
                  <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)", fontSize: "0.95rem" }}>
                    <i className="bi bi-star me-2" style={{ color: "var(--warning)" }} />
                    Public Holidays
                  </h5>
                  <div style={{ maxHeight: 180, overflowY: "auto" }}>
                    {holidays.sort((a, b) => new Date(a.date) - new Date(b.date)).map(h => (
                     <div
  key={h.date}
  className="d-flex justify-content-between align-items-center p-2 mb-2"
  style={{
    background: "#f8fafc",
    borderRadius: "10px",
    border: "1px solid #e5e7eb"
  }}
>
                       <span
  style={{
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#1e293b"
  }}
>
                        <i
  className="bi bi-calendar-event me-2"
  style={{
    color: "#2563eb",
    fontSize: "0.9rem"
  }}
/>
                          {h.name}
                        </span>
                        <small style={{ color: "var(--gray-400)" }}>
                          {new Date(h.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </small>
                      </div>
                    ))}
                  </div>
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
                      onFocus={(e) => e.currentTarget.showPicker?.()} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">To Date</label>
                    <input type="date" className={`form-control ${errors.endDate ? "is-invalid" : ""}`} value={endDate}
                      onChange={(e) => { setEndDate(e.target.value); setErrors({ ...errors, endDate: false }); }}
                      onFocus={(e) => e.currentTarget.showPicker?.()} />
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
                          onChange={(e) => setHalfDay(e.target.checked)} disabled={wfh} />
                        <label className="form-check-label" htmlFor="halfDay" style={{ fontSize: "0.88rem" }}>Half Day</label>
                      </div>
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="wfh" checked={wfh}
                          onChange={(e) => { setWfh(e.target.checked); if (e.target.checked) { setHalfDay(false); setLeaveType('WFH'); } }} />
                        <label className="form-check-label" htmlFor="wfh" style={{ fontSize: "0.88rem" }}>Work From Home</label>
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
            <div className="col-lg-8">
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
                        <th>From</th>
                        <th>To</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4" style={{ color: "var(--gray-400)" }}>
                            <i className="bi bi-inbox" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }} />
                            No leave requests found
                          </td>
                        </tr>
                      ) : (
                        paginated.map((leave) => (
                          <tr key={leave.leaveId}>
                            {isManagerOrAdmin && <td className="fw-semibold">{leave.employeeName || leave.employeeId}</td>}
                            <td>
                              {leave.wfh ? (
                                <span className="badge-status" style={{ background: "#fef3c7", color: "#92400e" }}><i className="bi bi-house-door me-1" />WFH</span>
                              ) : (
                                <span className="badge-status badge-uploaded">{leave.leaveType}</span>
                              )}
                              {leave.halfDay && <span className="badge-status ms-1" style={{ background: "#e0f2fe", color: "#075985" }}>Half</span>}
                            </td>
                            <td>{leave.startDate}</td>
                            <td>{leave.endDate}</td>
                            <td>{leave.reason}</td>
                            <td><span className={statusBadge(leave.status)}>{leave.status}</span></td>
                            <td>
                              <div className="action-btns justify-content-center">
                                {(isManagerOrAdmin || role === 'employee') && leave.status === "Pending" && isManagerOrAdmin ? (
                                  <>
                                    <button className="btn-custom-success d-flex align-items-center gap-1" style={{ padding: "0.3rem 0.7rem", fontSize: "0.78rem" }} onClick={() => handleApprove(leave.leaveId)}>
                                      <i className="bi bi-check-lg" /> Approve
                                    </button>
                                    <button className="btn-custom-danger d-flex align-items-center gap-1" style={{ padding: "0.3rem 0.7rem", fontSize: "0.78rem" }} onClick={() => handleReject(leave.leaveId)}>
                                      <i className="bi bi-x-lg" /> Reject
                                    </button>
                                  </>
                                ) : leave.status === "Pending" ? (
                                  <span style={{ color: "var(--warning)", fontSize: "0.85rem" }}>
                                    <i className="bi bi-hourglass-split me-1" /> Awaiting
                                  </span>
                                ) : (
                                  <span style={{ color: "var(--gray-400)", fontSize: "0.85rem" }}>
                                    <i className={`bi ${leave.status === "Approved" ? "bi-check-circle-fill text-success" : "bi-x-circle-fill text-danger"} me-1`} />
                                    {leave.status}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
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

            <div className="col-lg-4">
              <div className="card-dashboard p-4">
                <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)", fontSize: "0.95rem" }}>
                  <i className="bi bi-calendar3 me-2" style={{ color: "var(--primary)" }} />
                  Leave Calendar
                </h5>
                <LeaveCalendar
                  leaves={allLeaves}
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
                      const leave = allLeaves.find(l => selectedDate >= l.startDate && selectedDate <= l.endDate && l.status !== 'Rejected');
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
    </div>
  );
}

export default Leave;
