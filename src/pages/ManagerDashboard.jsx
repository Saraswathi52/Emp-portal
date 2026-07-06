import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getCurrentUser, getEmployees, getAllLeaveRequests, getAllExpenses, updateLeaveStatus, updateExpenseStatus } from "../services/dataService";

function ManagerDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState(null);

  const employees = getEmployees();
  const allLeaves = getAllLeaveRequests();
  const allExpenses = getAllExpenses();

  const pendingLeaves = allLeaves.filter(l => l.status === 'Pending');
  const pendingExpenses = allExpenses.filter(e => e.status === 'Pending');
  const pendingCount = pendingLeaves.length + pendingExpenses.length;

  const teamMembers = employees.filter(e => e.id !== user?.employeeId);

  const mergedPending = [
    ...pendingLeaves.map(l => ({
      id: l.leaveId,
      employeeName: l.employeeName || l.employeeId,
      type: 'Leave',
      typeDetail: l.wfh ? 'WFH' : l.leaveType,
      detail: `${l.startDate} to ${l.endDate}${l.halfDay ? ' (Half Day)' : ''}`,
      amount: null,
      reason: l.reason,
      appliedOn: l.appliedOn,
      status: l.status,
      ref: l,
      kind: 'leave',
    })),
    ...pendingExpenses.map(e => ({
      id: e.id,
      employeeName: e.employeeName || e.employeeId,
      type: 'Expense',
      typeDetail: e.expenseType,
      detail: `₹${parseFloat(e.amount).toLocaleString()}`,
      amount: e.amount,
      reason: e.description,
      appliedOn: e.submittedOn,
      status: e.status,
      ref: e,
      kind: 'expense',
    })),
  ].sort((a, b) => new Date(b.appliedOn || 0) - new Date(a.appliedOn || 0));

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = (item) => {
    if (item.kind === 'leave') {
      updateLeaveStatus(item.id, 'Approved');
    } else {
      updateExpenseStatus(item.id, 'Approved');
    }
    showToast(`${item.type} request approved`);
    setRefreshKey(k => k + 1);
  };

  const handleReject = (item) => {
    if (item.kind === 'leave') {
      updateLeaveStatus(item.id, 'Rejected');
    } else {
      updateExpenseStatus(item.id, 'Rejected');
    }
    showToast(`${item.type} request rejected`, 'warning');
    setRefreshKey(k => k + 1);
  };

  const statusBadge = (status) => {
    const map = {
      Pending: "badge-pending",
      Approved: "badge-approved",
      Rejected: "badge-rejected",
    };
    return `badge-status ${map[status] || "badge-pending"}`;
  };

  return (
    <div className="dashboard-wrapper" key={refreshKey}>
      {toast && (
        <div className="toast-message">
          <div className={`alert alert-${toast.type === "warning" ? "warning" : "success"} d-flex align-items-center gap-2 shadow-sm`} style={{ borderRadius: "10px", border: "none", padding: "0.75rem 1.25rem" }}>
            <i className={`bi ${toast.type === "warning" ? "bi-exclamation-circle" : "bi-check-circle"}`} />
            {toast.message}
          </div>
        </div>
      )}
      <Sidebar role="manager" onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} />
      <div className="main-content">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="page-content">
          <div className="section-header">
            <div>
              <h4>Welcome, {user?.name || "Manager"}!</h4>
              <p>Manager Dashboard</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn-custom-outline d-flex align-items-center gap-2" onClick={() => navigate("/leave")}>
                <i className="bi bi-calendar-check" /> Leave Requests
              </button>
              <button className="btn-custom-primary d-flex align-items-center gap-2" onClick={() => navigate("/expenses")}>
                <i className="bi bi-wallet2" /> Expenses
              </button>
            </div>
          </div>

          <div className="row g-3 mb-4">
            {[
              { label: "Team Members", value: teamMembers.length, icon: "bi-people", color: "#3b82f6", bg: "#eff6ff" },
              { label: "Pending Approvals", value: pendingCount, icon: "bi-hourglass-split", color: "#f59e0b", bg: "#fffbeb" },
              { label: "Leave Requests", value: allLeaves.length, icon: "bi-calendar-check", color: "#10b981", bg: "#ecfdf5" },
              { label: "Expense Claims", value: allExpenses.length, icon: "bi-wallet2", color: "#8b5cf6", bg: "#f5f3ff" },
            ].map((s) => (
              <div key={s.label} className="col-xl-3 col-md-6">
                <div className="stat-card card-dashboard d-flex align-items-center gap-3" style={{ background: s.bg }}>
                  <div className="stat-icon" style={{ background: s.color, width: 44, height: 44, fontSize: "1.2rem", margin: 0 }}>
                    <i className={`bi ${s.icon}`} />
                  </div>
                  <div>
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value" style={{ color: s.color, fontSize: "1.5rem" }}>{s.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4">
            <div className="col-lg-7">
              <div className="card-dashboard p-4">
                <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)" }}>
                  <i className="bi bi-hourglass-split me-2" style={{ color: "var(--warning)" }} />
                  Pending Approvals
                  {pendingCount > 0 && (
                    <span className="ms-2 badge-status badge-pending" style={{ fontSize: "0.7rem" }}>{pendingCount} pending</span>
                  )}
                </h5>
                <div className="table-responsive">
                  <table className="table-custom table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Type</th>
                        <th>Details</th>
                        <th>Reason</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mergedPending.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4" style={{ color: "var(--gray-400)" }}>
                            <i className="bi bi-check2-all" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }} />
                            No pending approvals
                          </td>
                        </tr>
                      ) : (
                        mergedPending.map((item) => (
                          <tr key={`${item.kind}-${item.id}`}>
                            <td className="fw-semibold">{item.employeeName}</td>
                            <td>
                              {item.kind === 'leave' ? (
                                <span className="badge-status" style={{ background: "#dbeafe", color: "#1e40af" }}>
                                  <i className="bi bi-calendar-check me-1" />{item.typeDetail}
                                </span>
                              ) : (
                                <span className="badge-status" style={{ background: "#fef3c7", color: "#92400e" }}>
                                  <i className="bi bi-wallet2 me-1" />{item.typeDetail}
                                </span>
                              )}
                            </td>
                            <td style={{ fontSize: "0.85rem" }}>{item.detail}</td>
                            <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.reason}>
                              {item.reason || '—'}
                            </td>
                            <td style={{ fontSize: "0.8rem" }}>{item.appliedOn || '—'}</td>
                            <td><span className={statusBadge(item.status)}>{item.status}</span></td>
                            <td>
                              <div className="action-btns justify-content-center">
                                <button
                                  className="btn-custom-success d-flex align-items-center gap-1"
                                  style={{ padding: "0.3rem 0.7rem", fontSize: "0.78rem" }}
                                  onClick={() => handleApprove(item)}
                                >
                                  <i className="bi bi-check-lg" /> Approve
                                </button>
                                <button
                                  className="btn-custom-danger d-flex align-items-center gap-1"
                                  style={{ padding: "0.3rem 0.7rem", fontSize: "0.78rem" }}
                                  onClick={() => handleReject(item)}
                                >
                                  <i className="bi bi-x-lg" /> Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card-dashboard p-4">
                <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)" }}>
                  <i className="bi bi-people me-2" style={{ color: "var(--primary)" }} />
                  Team Members
                </h5>
                <div className="table-responsive">
                  <table className="table-custom table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="text-center py-4" style={{ color: "var(--gray-400)" }}>
                            <i className="bi bi-people" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }} />
                            No team members found
                          </td>
                        </tr>
                      ) : (
                        teamMembers.map((m) => (
                          <tr key={m.id}>
                            <td className="fw-semibold">{m.name}</td>
                            <td style={{ fontSize: "0.85rem" }}>{m.designation || m.role}</td>
                            <td style={{ fontSize: "0.85rem" }}>{m.department}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 d-flex gap-2">
                  <button className="btn-custom-primary d-flex align-items-center gap-1" onClick={() => navigate("/employees")}>
                    <i className="bi bi-person-plus" /> Manage Team
                  </button>
                </div>
              </div>

              <div className="card-dashboard p-4 mt-4">
                <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)" }}>
                  <i className="bi bi-graph-up me-2" style={{ color: "var(--success)" }} />
                  Request Summary
                </h5>
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex justify-content-between align-items-center p-3" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--gray-600)" }}>Total Leave Requests</span>
                    <span className="fw-bold" style={{ color: "var(--primary)", fontSize: "1.1rem" }}>{allLeaves.length}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center p-3" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--gray-600)" }}>Pending Leaves</span>
                    <span className="fw-bold" style={{ color: "var(--warning)", fontSize: "1.1rem" }}>{pendingLeaves.length}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center p-3" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--gray-600)" }}>Pending Expenses</span>
                    <span className="fw-bold" style={{ color: "var(--warning)", fontSize: "1.1rem" }}>{pendingExpenses.length}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center p-3" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--gray-600)" }}>Team Members</span>
                    <span className="fw-bold" style={{ color: "var(--success)", fontSize: "1.1rem" }}>{teamMembers.length}</span>
                  </div>
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
