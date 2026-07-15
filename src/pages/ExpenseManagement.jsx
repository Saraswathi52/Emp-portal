import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getCurrentUser, getExpenses, getAllExpenses, addExpense, updateExpenseStatus, deleteExpense, getNextExpenseId } from "../services/dataService";

function ExpenseManagement() {
  const user = getCurrentUser();
  const [role] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored).role.toLowerCase() : "employee";
  });
  const empId = user?.employeeId || 'EMP001';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const isManagerOrAdmin = role === 'manager' || role === 'admin';
  const [myExpenses, setMyExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
  const [refreshKey, setRefreshKey] = useState(0);
  const perPage = 7;

  useEffect(() => {
    // Force clear any stuck dummy expenses in the browser's local storage
    localStorage.removeItem('peoplecore_expenses');
    
    const fetchExpenses = async () => {
      setIsLoading(true);
      try {
        if (isManagerOrAdmin) {
          const data = await getAllExpenses();
          setAllExpenses(data || []);
        } else {
          const data = await getExpenses(empId);
          setMyExpenses(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch expenses", err);
      }
      setIsLoading(false);
    };
    fetchExpenses();
  }, [empId, isManagerOrAdmin, refreshKey]);

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
      console.log("Selected file name:", file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64Data = ev.target.result;
        console.log("Base64 string length:", base64Data.length);
        setReceipt(base64Data);
        setReceiptName(file.name);
        showToast('Receipt uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
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
      id: `EXP${Date.now()}`,
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

    try {
      console.log("POST Payload (New Expense):", newExpense);
      await addExpense(newExpense);
      resetForm();
      setShowForm(false);
      setCurrentPage(1);
      showToast('Expense submitted successfully!');
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error("Failed to save expense", err);
      showToast('Failed to submit expense', 'warning');
    }
  };

  const handleApprove = async (id, empid) => {
    try {
      console.log("PUT Payload: status=Approved for", id);
      await updateExpenseStatus(id, 'Approved', empid);
      showToast('Expense approved');
      setViewItem(null);
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error("Failed to approve expense", err);
      showToast('Failed to approve expense', 'warning');
    }
  };

  const handleReject = async (id, empid) => {
    try {
      console.log("PUT Payload: status=Rejected for", id);
      await updateExpenseStatus(id, 'Rejected', empid);
      showToast('Expense rejected', 'warning');
      setViewItem(null);
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error("Failed to reject expense", err);
      showToast('Failed to reject expense', 'warning');
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      console.error("Delete Error: expid is undefined");
      return;
    }
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        console.log("Attempting to delete expid:", id);
        console.log("Request URL: https://d1il4l97ib.execute-api.ap-south-1.amazonaws.com/expense/" + id);
        
        await deleteExpense(id);
        
        console.log("API response: Delete successful");
        showToast("Expense deleted successfully");
        setViewItem(null);
        // Instantly remove from React state
        setMyExpenses(prev => prev.filter(e => e.id !== id));
        setAllExpenses(prev => prev.filter(e => e.id !== id));
        setRefreshKey(k => k + 1);
      } catch (err) {
        console.error("Network or API Error during delete:", err);
        showToast("Failed to delete expense. Check console.", "warning");
      }
    }
  };

  const getStr = (v) => {
    if (v === null || v === undefined) return "";
    return String(v.S || v.N || v);
  };

  const expenseTypes = [...new Set(allExpenses.map(e => getStr(e.expenseType)))].filter(Boolean);
  const filtered = displayExpenses.filter(e => {
    const ms = getStr(e.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getStr(e.expenseType).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getStr(e.description).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getStr(e.project).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getStr(e.employeeName).toLowerCase().includes(searchTerm.toLowerCase());
    const mf = filterStatus === 'All' || getStr(e.status) === filterStatus;
    const mt = filterType === 'All' || getStr(e.expenseType) === filterType;
    return ms && mf && mt;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const totalAmount = displayExpenses.reduce((s, e) => s + (parseFloat(getStr(e.amount)) || 0), 0);
  
  const statusBadge = (status) => {
    const map = { Pending: "badge-pending", Approved: "badge-approved", Rejected: "badge-rejected" };
    return `badge-status ${map[status] || "badge-pending"}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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

      {/* View Details Modal */}
      {viewItem && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <style>{`
            .smooth-modal { animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            @keyframes modalFadeIn { 
              from { opacity: 0; transform: scale(0.95) translateY(-10px); } 
              to { opacity: 1; transform: scale(1) translateY(0); } 
            }
          `}</style>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg smooth-modal" style={{ borderRadius: "var(--radius-lg)" }}>
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">
                  Expense Details <span className="text-muted fs-6 ms-2">({getStr(viewItem.id)})</span>
                </h5>
                <button type="button" className="btn-close" onClick={() => setViewItem(null)}></button>
              </div>
              <div className="modal-body pt-3 pb-4">
                <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-4" style={{ background: "var(--gray-50)" }}>
                  <div className="avatar-circle" style={{ background: "var(--primary-100)", color: "var(--primary-700)", width: "56px", height: "56px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "bold" }}>
                    {getStr(viewItem.employeeName || viewItem.employeeId).charAt(0)}
                  </div>
                  <div>
                    <div className="fw-bold fs-5 text-dark">{getStr(viewItem.employeeName || viewItem.employeeId)}</div>
                    <div className="text-muted small">Employee</div>
                  </div>
                  <div className="ms-auto text-end">
                    <div className="mb-1"><span className={statusBadge(getStr(viewItem.status))}>{getStr(viewItem.status)}</span></div>
                    <div className="text-muted small">Submitted on {formatDate(getStr(viewItem.submittedOn || viewItem.date))}</div>
                  </div>
                </div>

                <div className="row g-4 mb-4">
                  <div className="col-sm-6 col-md-3">
                    <div className="text-muted small mb-1 text-uppercase tracking-wider">Amount</div>
                    <div className="fw-bold fs-4" style={{ color: "var(--gray-800)" }}>
                      ₹{parseFloat(getStr(viewItem.amount) || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-3">
                    <div className="text-muted small mb-1 text-uppercase tracking-wider">Category</div>
                    <div className="fw-semibold">
                      <span className="badge-status badge-uploaded px-2 py-1">{getStr(viewItem.expenseType || viewItem.category)}</span>
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-3">
                    <div className="text-muted small mb-1 text-uppercase tracking-wider">Date incurred</div>
                    <div className="fw-semibold text-dark">{formatDate(getStr(viewItem.date))}</div>
                  </div>
                  <div className="col-sm-6 col-md-3">
                    <div className="text-muted small mb-1 text-uppercase tracking-wider">Payment Method</div>
                    <div className="fw-semibold text-dark">
                      <i className="bi bi-credit-card me-2 text-muted" />{getStr(viewItem.paymentMode)}
                    </div>
                  </div>
                </div>

                <div className="row g-4">
                  <div className="col-md-7">
                    <div className="text-muted small mb-2 text-uppercase tracking-wider">Full Description</div>
                    <div className="p-3 bg-light rounded-3 border" style={{ fontSize: "0.95rem", color: "var(--gray-700)", minHeight: "80px" }}>
                      {getStr(viewItem.description) || "No description provided."}
                    </div>

                    <div className="row g-3 mt-2">
                      <div className="col-6">
                        <div className="text-muted small mb-1 text-uppercase tracking-wider">Project</div>
                        <div className="fw-semibold text-dark">{getStr(viewItem.project) || "—"}</div>
                      </div>
                      <div className="col-6">
                        <div className="text-muted small mb-1 text-uppercase tracking-wider">Meeting</div>
                        <div className="fw-semibold text-dark">{getStr(viewItem.meeting) || "—"}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-5">
                    <div className="text-muted small mb-2 text-uppercase tracking-wider">Receipt / Invoice</div>
                    {getStr(viewItem.receipt) ? (
                      <div className="border rounded-3 p-3 text-center bg-light">
                        {(getStr(viewItem.receipt).match(/\.(jpeg|jpg|gif|png)$/i) || (getStr(viewItem.fileName || viewItem.receiptName).match(/\.(jpeg|jpg|gif|png)$/i)) || getStr(viewItem.receipt).startsWith('data:image')) ? (
                          <img 
                            src={getStr(viewItem.receipt)} 
                            alt="Receipt" 
                            className="img-fluid rounded mb-3 shadow-sm" 
                            style={{ maxHeight: '150px', objectFit: 'contain' }} 
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <i className="bi bi-file-earmark-check text-success" style={{ fontSize: "2rem" }} />
                        )}
                        <div className="mt-2 fw-semibold text-truncate px-2" title={getStr(viewItem.fileName || viewItem.receiptName)}>
                          {getStr(viewItem.fileName || viewItem.receiptName) || "Receipt attached"}
                        </div>
                        <button 
                          onClick={() => {
                            try {
                              const base64Data = getStr(viewItem.receipt);
                              if (base64Data.startsWith('data:')) {
                                const a = document.createElement('a');
                                a.href = base64Data;
                                a.download = getStr(viewItem.fileName || viewItem.receiptName) || "receipt";
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                              } else {
                                window.open(base64Data, '_blank');
                              }
                            } catch (e) {
                              console.error("Download failed", e);
                            }
                          }}
                          className="btn btn-sm btn-outline-primary mt-3 px-4 rounded-pill">
                          <i className="bi bi-eye me-1" /> View / Download
                        </button>
                      </div>
                    ) : (
                      <div className="border rounded-3 p-4 text-center bg-light dashed-border">
                        <i className="bi bi-file-earmark-x text-muted" style={{ fontSize: "2rem" }} />
                        <div className="mt-2 text-muted small">No receipt provided</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {isManagerOrAdmin && viewItem.status === 'Pending' && (
                <div className="modal-footer border-top-0 pt-0 pb-4 justify-content-center gap-3">
                  <button className="btn btn-outline-danger px-4 rounded-pill" onClick={() => handleReject(viewItem.id)}>
                    <i className="bi bi-x-lg me-2" /> Reject
                  </button>
                  <button className="btn btn-success px-4 rounded-pill" style={{ background: "#10b981", border: "none" }} onClick={() => handleApprove(viewItem.id)}>
                    <i className="bi bi-check-lg me-2" /> Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Sidebar role={role} onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} />
      <div className="main-content">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="page-content bg-light" style={{ minHeight: "calc(100vh - 70px)" }}>
          <div className="section-header">
            <div>
              <h4 className="fw-bold mb-1">Expense Management</h4>
              <p className="text-muted mb-0">{isManagerOrAdmin ? 'Review and manage team expense claims.' : 'Track and manage your expenses.'}</p>
            </div>
            {!isManagerOrAdmin && (
              <button className={`btn-custom-${showForm ? "danger" : "primary"} d-flex align-items-center gap-2 rounded-pill px-4 shadow-sm`} onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}>
                <i className={`bi ${showForm ? "bi-x-lg" : "bi-plus-lg"}`} />
                {showForm ? "Cancel" : "Submit Expense"}
              </button>
            )}
          </div>

          <div className="row g-4 mb-4">
            {[
              { label: "Total Expenses", value: displayExpenses.length, icon: "bi-receipt", color: "#3b82f6", bg: "#eff6ff" },
              { label: "Pending Claims", value: displayExpenses.filter(e => e.status === 'Pending').length, icon: "bi-clock", color: "#f59e0b", bg: "#fffbeb" },
              { label: "Approved", value: displayExpenses.filter(e => e.status === 'Approved').length, icon: "bi-check-circle", color: "#10b981", bg: "#ecfdf5" },
              { label: "Total Amount", value: `₹${totalAmount.toLocaleString()}`, icon: "bi-currency-rupee", color: "#8b5cf6", bg: "#f5f3ff" },
            ].map((s) => (
              <div key={s.label} className="col-6 col-xl-3">
                <div className="card border-0 shadow-sm rounded-4 h-100 p-4 transition-hover" style={{ background: s.bg }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ background: s.color, width: "48px", height: "48px", color: "white", fontSize: "1.2rem", boxShadow: `0 4px 12px ${s.color}40` }}>
                      <i className={`bi ${s.icon}`} />
                    </div>
                    <div>
                      <div className="text-muted small fw-semibold text-uppercase tracking-wider">{s.label}</div>
                      <div className="fw-bold mt-1" style={{ color: s.color, fontSize: "1.5rem", lineHeight: "1" }}>{s.value}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showForm && !isManagerOrAdmin && (
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <h5 className="fw-bold mb-4 text-dark border-bottom pb-3">
                <i className="bi bi-receipt me-2 text-primary" />
                New Expense Claim
              </h5>
              <div className="row g-4 form-custom">
                <div className="col-md-4">
                  <label className="form-label text-muted small fw-semibold">Expense Type *</label>
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
                  <label className="form-label text-muted small fw-semibold">Amount (₹) *</label>
                  <input type="number" className={`form-control ${errors.amount ? "is-invalid" : ""}`} placeholder="2500" value={amount}
                    onChange={(e) => { setAmount(e.target.value); setErrors({ ...errors, amount: false }); }} min="0" step="1" />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-muted small fw-semibold">Date *</label>
                  <input type="date" className={`form-control ${errors.date ? "is-invalid" : ""}`} value={date}
                    onChange={(e) => { setDate(e.target.value); setErrors({ ...errors, date: false }); }}
                    onFocus={(e) => e.currentTarget.showPicker?.()} />
                </div>
                <div className="col-md-12">
                  <label className="form-label text-muted small fw-semibold">Description *</label>
                  <textarea className={`form-control ${errors.description ? "is-invalid" : ""}`} rows="2" placeholder="Briefly describe the business purpose of this expense" value={description}
                    onChange={(e) => { setDescription(e.target.value); setErrors({ ...errors, description: false }); }} />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-muted small fw-semibold">Project (Optional)</label>
                  <input type="text" className="form-control" placeholder="e.g. Q3 Marketing Campaign" value={project}
                    onChange={(e) => setProject(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-muted small fw-semibold">Meeting (Optional)</label>
                  <input type="text" className="form-control" placeholder="e.g. Client Lunch with ABC Corp" value={meeting}
                    onChange={(e) => setMeeting(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-muted small fw-semibold">Payment Mode *</label>
                  <select className={`form-select ${errors.paymentMode ? "is-invalid" : ""}`} value={paymentMode} onChange={(e) => { setPaymentMode(e.target.value); setErrors({ ...errors, paymentMode: false }); }}>
                    <option value="">Select Payment Mode</option>
                    <option value="Cash">Cash</option>
                    <option value="Corporate Card">Corporate Card</option>
                    <option value="Personal Card">Personal Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div className="col-md-8">
                  <label className="form-label text-muted small fw-semibold">Receipt/Invoice</label>
                  <label className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ border: "2px dashed var(--gray-300)", cursor: "pointer", background: "var(--gray-50)", transition: "all 0.2s" }}>
                    <div className="rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                      <i className="bi bi-cloud-arrow-up text-primary fs-5" />
                    </div>
                    <div>
                      <div className="fw-semibold text-dark" style={{ fontSize: "0.9rem" }}>{receiptName || 'Click to upload receipt (PDF/Image)'}</div>
                      <div className="text-muted mt-1" style={{ fontSize: "0.75rem" }}>Max file size: 5MB</div>
                    </div>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx" onChange={handleReceiptUpload} style={{ display: 'none' }} />
                  </label>
                </div>
                <div className="col-md-4 d-flex align-items-end justify-content-end pb-1">
                  <button className="btn btn-primary w-100 rounded-pill py-2 fw-semibold shadow-sm" style={{ background: "var(--primary)" }} onClick={handleSave}>
                    <i className="bi bi-send me-2" /> Submit Expense
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-2">
                <h5 className="fw-bold mb-0 text-dark">
                  <i className="bi bi-list-check me-2 text-primary" />
                  {isManagerOrAdmin ? 'All Expense Claims' : 'Expense History'}
                </h5>
                <div className="d-flex gap-2 align-items-center flex-wrap">
                  <div className="search-box position-relative" style={{ maxWidth: 220 }}>
                    <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ fontSize: "0.85rem" }} />
                    <input type="text" className="form-control rounded-pill ps-5 bg-light border-0" style={{ fontSize: "0.85rem", padding: "0.4rem 1rem" }} placeholder="Search expenses..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                  </div>
                  <select className="form-select rounded-pill bg-light border-0" style={{ width: "auto", fontSize: "0.85rem", padding: "0.4rem 2rem 0.4rem 1rem" }} value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}>
                    <option value="All">All Categories</option>
                    {expenseTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select className="form-select rounded-pill bg-light border-0" style={{ width: "auto", fontSize: "0.85rem", padding: "0.4rem 2rem 0.4rem 1rem" }} value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card-body p-0 mt-3">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-muted small text-uppercase tracking-wider">
                    <tr>
                      {isManagerOrAdmin && <th className="ps-4">Employee</th>}
                      <th className={!isManagerOrAdmin ? "ps-4" : ""}>ID</th>
                      <th>Category</th>
                      <th style={{ minWidth: "150px" }}>Description</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="border-top-0">
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={isManagerOrAdmin ? 7 : 6} className="text-center py-5 text-muted">
                          <i className="bi bi-wallet2 fs-1 text-secondary mb-3 d-block opacity-50" />
                          No expenses match your filters.
                        </td>
                      </tr>
                    ) : (
                      paginated.map((exp) => (
                        <tr key={exp.id} className="transition-hover" style={{ cursor: "pointer" }} onClick={() => setViewItem(exp)}>
                          {isManagerOrAdmin && (
                            <td className="ps-4 fw-semibold text-dark">
                              <div className="d-flex align-items-center gap-2">
                                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center text-primary fw-bold" style={{ width: "32px", height: "32px", fontSize: "0.8rem" }}>
                                  {((exp.employeeName?.S || exp.employeeName) || (exp.employeeId?.S || exp.employeeId))?.charAt(0)}
                                </div>
                                {(exp.employeeName?.S || exp.employeeName) || (exp.employeeId?.S || exp.employeeId)}
                              </div>
                            </td>
                          )}
                          <td className={!isManagerOrAdmin ? "ps-4 text-muted small" : "text-muted small"}>{exp.id?.S || exp.id}</td>
                          <td>
                            <span className="badge bg-light text-secondary border px-2 py-1">
                              {exp.expenseType?.S || exp.expenseType}
                            </span>
                          </td>
                          <td className="text-truncate" style={{ maxWidth: "200px" }} title={exp.description?.S || exp.description}>
                            {exp.description?.S || exp.description}
                          </td>
                          <td className="fw-bold text-dark">
                            ₹{parseFloat(exp.amount?.N || exp.amount?.S || exp.amount).toLocaleString()}
                          </td>
                          <td className="text-muted small">
                            {formatDate(exp.date?.S || exp.date)}
                          </td>
                          <td>
                            <span className={statusBadge(exp.status?.S || exp.status)}>{exp.status?.S || exp.status}</span>
                          </td>
                          <td className="text-end pe-4">
                            <div className="d-flex gap-2 justify-content-end">
                              {isManagerOrAdmin && exp.status === "Pending" && (
                                <>
                                  <button 
                                    className="btn btn-sm btn-light text-success border-0 rounded-circle shadow-sm" 
                                    style={{ width: "32px", height: "32px" }} 
                                    onClick={(e) => { e.stopPropagation(); handleApprove(exp.id, exp.employeeId); }}
                                    title="Approve"
                                  >
                                    <i className="bi bi-check-lg" />
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-light text-danger border-0 rounded-circle shadow-sm" 
                                    style={{ width: "32px", height: "32px" }} 
                                    onClick={(e) => { e.stopPropagation(); handleReject(exp.id, exp.employeeId); }}
                                    title="Reject"
                                  >
                                    <i className="bi bi-x-lg" />
                                  </button>
                                </>
                              )}
                              {(!isManagerOrAdmin && exp.status === 'Pending') && (
                                <button
                                  className="btn btn-sm btn-light text-danger border-0 rounded-circle shadow-sm ms-2"
                                  style={{ width: "32px", height: "32px" }}
                                  onClick={(e) => { e.stopPropagation(); handleDelete(exp.id); }}
                                  title="Delete Expense"
                                >
                                  <i className="bi bi-trash" />
                                </button>
                              )}
                              <button 
                                className="btn btn-sm btn-light text-primary border-0 rounded-circle shadow-sm ms-2" 
                                style={{ width: "32px", height: "32px" }} 
                                onClick={(e) => { e.stopPropagation(); setViewItem(exp); }}
                                title="View Details"
                              >
                                <i className="bi bi-eye" />
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

            {totalPages > 1 && (
              <div className="card-footer bg-white border-0 pt-3 pb-4 px-4 d-flex justify-content-between align-items-center border-top">
                <small className="text-muted fw-semibold">
                  Showing {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
                </small>
                <nav>
                  <ul className="pagination pagination-sm mb-0 gap-1">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button className="page-link rounded-circle border-0 text-dark bg-light shadow-sm" style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setCurrentPage(currentPage - 1)}>
                        <i className="bi bi-chevron-left" />
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <li key={p} className={`page-item ${p === currentPage ? "active" : ""}`}>
                        <button className={`page-link rounded-circle border-0 shadow-sm ${p === currentPage ? 'bg-primary text-white' : 'bg-light text-dark'}`} style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: p === currentPage ? "bold" : "normal" }} onClick={() => setCurrentPage(p)}>
                          {p}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button className="page-link rounded-circle border-0 text-dark bg-light shadow-sm" style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setCurrentPage(currentPage + 1)}>
                        <i className="bi bi-chevron-right" />
                      </button>
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
