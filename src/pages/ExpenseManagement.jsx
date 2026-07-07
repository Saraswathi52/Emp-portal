import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getCurrentUser, getEmployee, getExpenses, getAllExpenses, addExpense, updateExpenseStatus, deleteExpense, getNextExpenseId } from "../services/dataService";

function ExpenseManagement() {
  const user = getCurrentUser();
  const [role] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored).role.toLowerCase() : "employee";
  });
  const empId = user?.employeeId || 'EMP001';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const myExpenses = getExpenses(empId);
  const allExpenses = getAllExpenses();
  const isManagerOrAdmin = role === 'manager' || role === 'admin';
  const displayExpenses = isManagerOrAdmin ? allExpenses : myExpenses;

  const [expenseType, setExpenseType] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('');
  const [meeting, setMeeting] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [receiptName, setReceiptName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const perPage = 5;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setExpenseType('');
    setAmount('');
    setDate('');
    setDescription('');
    setProject('');
    setMeeting('');
    setPaymentMode('');
    setReceipt(null);
    setReceiptName('');
    setErrors({});
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setReceipt(ev.target.result);
        setReceiptName(file.name);
        showToast('Receipt uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const newErrors = {};
    if (!expenseType) newErrors.expenseType = true;
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = true;
    if (!date) newErrors.date = true;
    if (!description.trim()) newErrors.description = true;
    if (!paymentMode) newErrors.paymentMode = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newExpense = {
      id: getNextExpenseId(),
      employeeId: empId,
      employeeName: user?.name || empId,
      expenseType,
      amount: parseFloat(amount),
      date,
      description: description.trim(),
      project: project.trim() || 'General',
      meeting: meeting.trim() || '',
      paymentMode,
      status: 'Pending',
      receipt,
      receiptName,
      submittedOn: new Date().toISOString().split('T')[0],
    };

    addExpense(newExpense);
    resetForm();
    setShowForm(false);
    setCurrentPage(1);
    showToast('Expense submitted successfully!');
  };

  const handleApprove = (id) => {
    updateExpenseStatus(id, 'Approved');
    showToast('Expense approved');
  };

  const handleReject = (id) => {
    updateExpenseStatus(id, 'Rejected');
    showToast('Expense rejected', 'warning');
  };

  const handleDelete = (id) => {
    deleteExpense(id);
    showToast('Expense deleted', 'warning');
  };

  const expenseTypes = [...new Set(allExpenses.map(e => e.expenseType))];
  const filtered = displayExpenses.filter(e => {
    const ms = e.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.expenseType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.project?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employeeName?.toLowerCase().includes(searchTerm.toLowerCase());
    const mf = filterStatus === 'All' || e.status === filterStatus;
    const mt = filterType === 'All' || e.expenseType === filterType;
    return ms && mf && mt;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const totalAmount = displayExpenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
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
              <h4>Expense Management</h4>
              <p>{isManagerOrAdmin ? 'Manage all expense claims' : 'Track and manage your expenses'}</p>
            </div>
            {!isManagerOrAdmin && (
              <button className={`btn-custom-${showForm ? "danger" : "primary"} d-flex align-items-center gap-2`} onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}>
                <i className={`bi ${showForm ? "bi-x-lg" : "bi-plus-lg"}`} />
                {showForm ? "Cancel" : "Submit Expense"}
              </button>
            )}
          </div>

          <div className="row g-3 mb-4">
            {[
              { label: "Total Expenses", value: displayExpenses.length, icon: "bi-receipt", color: "#3b82f6", bg: "#eff6ff" },
              { label: "Pending Claims", value: displayExpenses.filter(e => e.status === 'Pending').length, icon: "bi-clock", color: "#f59e0b", bg: "#fffbeb" },
              { label: "Approved", value: displayExpenses.filter(e => e.status === 'Approved').length, icon: "bi-check-circle", color: "#10b981", bg: "#ecfdf5" },
              { label: "Total Amount", value: `₹${totalAmount.toLocaleString()}`, icon: "bi-currency-rupee", color: "#8b5cf6", bg: "#f5f3ff" },
            ].map((s) => (
              <div key={s.label} className="col-6 col-xl-3">
                <div className="stat-card card-dashboard d-flex align-items-center gap-3" style={{ background: s.bg }}>
                  <div className="stat-icon" style={{ background: s.color, width: 40, height: 40, fontSize: "1.1rem", margin: 0 }}>
                    <i className={`bi ${s.icon}`} />
                  </div>
                  <div>
                    <div className="stat-label" style={{ fontSize: "0.7rem" }}>{s.label}</div>
                    <div className="stat-value" style={{ color: s.color, fontSize: "1.3rem" }}>{s.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showForm && !isManagerOrAdmin && (
            <div className="card-dashboard p-4 mb-4">
              <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)" }}>
                <i className="bi bi-receipt me-2" style={{ color: "var(--primary)" }} />
                New Expense Claim
              </h5>
              <div className="row g-3 form-custom">
                <div className="col-md-4">
                  <label className="form-label">Expense Type</label>
                  <select className={`form-select ${errors.expenseType ? "is-invalid" : ""}`} value={expenseType} onChange={(e) => { setExpenseType(e.target.value); setErrors({ ...errors, expenseType: false }); }}>
                    <option value="">Select Type</option>
                    <option value="Travel">Travel</option>
                    <option value="Food">Food & Dining</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Transport">Transport</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Fuel">Fuel</option>
                    <option value="Internet">Internet & Communication</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Amount (₹)</label>
                  <input type="number" className={`form-control ${errors.amount ? "is-invalid" : ""}`} placeholder="2500" value={amount}
                    onChange={(e) => { setAmount(e.target.value); setErrors({ ...errors, amount: false }); }} min="0" step="0.01" />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Date</label>
                  <input type="date" className={`form-control ${errors.date ? "is-invalid" : ""}`} value={date}
                    onChange={(e) => { setDate(e.target.value); setErrors({ ...errors, date: false }); }}
                    onFocus={(e) => e.currentTarget.showPicker?.()} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Description</label>
                  <textarea className={`form-control ${errors.description ? "is-invalid" : ""}`} rows="2" placeholder="Describe the expense" value={description}
                    onChange={(e) => { setDescription(e.target.value); setErrors({ ...errors, description: false }); }} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Project</label>
                  <input type="text" className="form-control" placeholder="Project name" value={project}
                    onChange={(e) => setProject(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Meeting (optional)</label>
                  <input type="text" className="form-control" placeholder="Meeting name" value={meeting}
                    onChange={(e) => setMeeting(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Payment Mode</label>
                  <select className={`form-select ${errors.paymentMode ? "is-invalid" : ""}`} value={paymentMode} onChange={(e) => { setPaymentMode(e.target.value); setErrors({ ...errors, paymentMode: false }); }}>
                    <option value="">Select Payment Mode</option>
                    <option value="Cash">Cash</option>
                    <option value="Corporate Card">Corporate Card</option>
                    <option value="Personal Card">Personal Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Receipt/Invoice</label>
                  <label className="d-flex align-items-center gap-2 p-2" style={{ border: "1.5px dashed var(--gray-300)", borderRadius: "var(--radius-sm)", cursor: "pointer", background: "var(--gray-50)" }}>
                    <i className="bi bi-cloud-upload" style={{ color: "var(--primary)", fontSize: "1.2rem" }} />
                    <div>
                      <div style={{ fontSize: "0.82rem", color: "var(--gray-600)" }}>{receiptName || 'Upload receipt (PDF/Image)'}</div>
                      <small style={{ color: "var(--gray-400)", fontSize: "0.7rem" }}>Max 5MB</small>
                    </div>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx" onChange={handleReceiptUpload} style={{ display: 'none' }} />
                  </label>
                </div>
                <div className="col-md-4 d-flex align-items-end justify-content-end">
                  <button className="btn-custom-primary d-flex align-items-center gap-2" onClick={handleSave}>
                    <i className="bi bi-send" /> Submit Expense
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="card-dashboard p-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
              <h5 className="fw-bold mb-0" style={{ color: "var(--gray-800)", fontSize: "0.95rem" }}>
                <i className="bi bi-list-check me-2" style={{ color: "var(--primary)" }} />
                {isManagerOrAdmin ? 'All Expense Claims' : 'Expense History'}
              </h5>
              <div className="d-flex gap-2 align-items-center flex-wrap">
                <div className="search-box" style={{ maxWidth: 200 }}>
                  <i className="bi bi-search" />
                  <input type="text" className="form-control" placeholder="Search..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                </div>
                <select className="form-select" style={{ width: "auto", borderRadius: "50px", fontSize: "0.85rem", padding: "0.35rem 2rem 0.35rem 0.75rem" }} value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}>
                  <option value="All">All Types</option>
                  {expenseTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
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
                    <th>Expense ID</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Project</th>
                    <th>Meeting</th>
                    <th>Payment</th>
                    <th>Receipt</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={isManagerOrAdmin ? 12 : 11} className="text-center py-4" style={{ color: "var(--gray-400)" }}>
                        <i className="bi bi-wallet2" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }} />
                        No expenses found
                      </td>
                    </tr>
                  ) : (
                    paginated.map((exp) => (
                      <tr key={exp.id}>
                        {isManagerOrAdmin && <td className="fw-semibold">{exp.employeeName || exp.employeeId}</td>}
                        <td className="fw-semibold">{exp.id}</td>
                        <td><span className="badge-status badge-uploaded">{exp.expenseType}</span></td>
                        <td className="fw-bold" style={{ color: "var(--gray-700)" }}>₹{parseFloat(exp.amount).toLocaleString()}</td>
                        <td style={{ fontSize: "0.82rem" }}>{exp.date}</td>
                        <td style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={exp.description}>{exp.description}</td>
                        <td><span className="badge-status" style={{ background: "#e0f2fe", color: "#075985", fontSize: "0.7rem" }}>{exp.project}</span></td>
                        <td>{exp.meeting || <span style={{ color: "var(--gray-400)" }}>—</span>}</td>
                        <td style={{ fontSize: "0.8rem" }}>{exp.paymentMode}</td>
                        <td>
                          {exp.receipt ? (
                            <a href={exp.receipt} download={exp.receiptName} className="btn btn-sm btn-custom-outline" style={{ padding: "0.2rem 0.5rem", fontSize: "0.72rem" }}>
                              <i className="bi bi-paperclip" /> View
                            </a>
                          ) : (
                            <span style={{ color: "var(--gray-400)", fontSize: "0.75rem" }}>—</span>
                          )}
                        </td>
                        <td><span className={statusBadge(exp.status)}>{exp.status}</span></td>
                        <td>
                          <div className="action-btns justify-content-center">
                            {isManagerOrAdmin && exp.status === "Pending" ? (
                              <>
                                <button className="btn-custom-success d-flex align-items-center gap-1" style={{ padding: "0.3rem 0.7rem", fontSize: "0.78rem" }} onClick={() => handleApprove(exp.id)}>
                                  <i className="bi bi-check-lg" />
                                </button>
                                <button className="btn-custom-danger d-flex align-items-center gap-1" style={{ padding: "0.3rem 0.7rem", fontSize: "0.78rem" }} onClick={() => handleReject(exp.id)}>
                                  <i className="bi bi-x-lg" />
                                </button>
                              </>
                            ) : isManagerOrAdmin ? (
                              <span style={{ color: "var(--gray-400)", fontSize: "0.8rem" }}>
                                <i className={`bi ${exp.status === "Approved" ? "bi-check-circle-fill text-success" : "bi-x-circle-fill text-danger"} me-1`} />
                              </span>
                            ) : exp.status === "Pending" ? (
                              <span style={{ color: "var(--gray-400)", fontSize: "0.85rem" }}>
                                <i className="bi bi-hourglass-split me-1" /> Awaiting
                              </span>
                            ) : (
                              <span style={{ color: "var(--gray-400)", fontSize: "0.85rem" }}>
                                <i className={`bi ${exp.status === "Approved" ? "bi-check-circle-fill text-success" : "bi-x-circle-fill text-danger"} me-1`} />
                              </span>
                            )}
                            {!isManagerOrAdmin && (
                              <button className="btn-custom-danger d-flex align-items-center gap-1" style={{ padding: "0.3rem 0.5rem", fontSize: "0.72rem" }} onClick={() => handleDelete(exp.id)}>
                                <i className="bi bi-trash" />
                              </button>
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
      </div>
    </div>
  );
}

export default ExpenseManagement;
