import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getCurrentUser, getTimesheets, addTimesheet, updateTimesheet, deleteTimesheet, getEmployees } from "../services/dataService";

function Timesheets() {
  const user = getCurrentUser();
  const role = user?.role?.toLowerCase() || "employee";
  const userName = user?.FullName || user?.fullName || user?.name || user?.empid || "Employee";

  const [showModal, setShowModal] = useState(false);
  const [timesheets, setTimesheets] = useState([]);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [editingTimesheetId, setEditingTimesheetId] = useState(null);
  
  const [approvalModal, setApprovalModal] = useState({ show: false, ts: null, action: null });
  const [managerComments, setManagerComments] = useState("");

  // Form State
  const [period, setPeriod] = useState("Daily");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());
  
  const [project, setProject] = useState("");
  const [task, setTask] = useState("");
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDate, setFilterDate] = useState("All Dates");
  const [filterEmployee, setFilterEmployee] = useState("All");
  const [filterDepartment, setFilterDepartment] = useState("All");

  useEffect(() => {
    loadTimesheets();

    const handleSync = () => loadTimesheets();
    window.addEventListener('dataSync', handleSync);
    return () => window.removeEventListener('dataSync', handleSync);
  }, []);

  const loadTimesheets = () => {
    const allTs = getTimesheets();
    const allEmployees = getEmployees();
    const myReports = allEmployees.filter(e => e.Manager === userName || e.Manager === user?.empid).map(e => e.id || e.empid);
    
    let visibleTs = allTs.map(ts => {
      const emp = allEmployees.find(e => e.id === ts.empid || e.empid === ts.empid);
      return {
        ...ts,
        employeeName: emp ? (emp.FullName || emp.name || emp.empid || ts.empid) : ts.empid,
        department: emp ? (emp.Department || emp.department) : "Unknown"
      };
    });

    if (role === 'manager') {
      visibleTs = visibleTs.filter(ts => myReports.includes(ts.empid));
    } else if (role !== 'admin') {
      visibleTs = visibleTs.filter(ts => ts.empid === (user?.empid || "EMP001"));
    }
    
    setTimesheets(visibleTs);
  };

  const totalTimesheets = timesheets.length;
  const dailyTimesheets = timesheets.filter(ts => ts.period === 'Daily' || !ts.period).length;
  const weeklyTimesheets = timesheets.filter(ts => ts.period === 'Weekly').length;
  const monthlyTimesheets = timesheets.filter(ts => ts.period === 'Monthly').length;

  const uniqueDates = ["All Dates", ...new Set(timesheets.map(ts => ts.date))];
  const uniqueEmployees = ["All", ...new Set(timesheets.map(ts => ts.employeeName))].filter(Boolean);
  const uniqueDepartments = ["All", ...new Set(timesheets.map(ts => ts.department))].filter(Boolean);

  const filteredTimesheets = timesheets.filter(ts => {
    const matchesSearch = (ts.project?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           ts.task?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ts.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ts.empid?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPeriod = filterPeriod === "All" || (ts.period || "Daily") === filterPeriod;
    const matchesStatus = filterStatus === "All" || ts.status === filterStatus;
    const matchesDate = filterDate === "All Dates" || ts.date === filterDate;
    const matchesEmployee = filterEmployee === "All" || ts.employeeName === filterEmployee;
    const matchesDepartment = filterDepartment === "All" || ts.department === filterDepartment;
    
    return matchesSearch && matchesPeriod && matchesStatus && matchesDate && matchesEmployee && matchesDepartment;
  });

  const handleEdit = (ts) => {
    setEditingTimesheetId(ts.id);
    
    // Backwards compatibility for old records without period
    if (!ts.period) {
      setPeriod("Daily");
      setCustomStartDate(ts.date || "");
    } else {
      setPeriod(ts.period);
      setCustomStartDate(ts.customStartDate || "");
      setCustomEndDate(ts.customEndDate || "");
      setMonth(ts.month || (new Date().getMonth() + 1).toString());
      setYear(ts.year || new Date().getFullYear().toString());
    }
    
    setProject(ts.project || "");
    setTask(ts.task || "");
    setHours(ts.hours || "");
    setDescription(ts.description || "");
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this timesheet?")) {
      deleteTimesheet(id);
    }
  };

  const handleApprove = (ts) => {
    updateTimesheet({ ...ts, status: 'Approved' });
  };

  const handleReject = (ts) => {
    setApprovalModal({ show: true, ts, action: 'Rejected' });
  };

  const confirmRejection = () => {
    if (!approvalModal.ts) return;
    updateTimesheet({ ...approvalModal.ts, status: 'Rejected', managerComments });
    setApprovalModal({ show: false, ts: null, action: null });
    setManagerComments("");
  };

  const resetForm = () => {
    setPeriod("Daily");
    setCustomStartDate("");
    setCustomEndDate("");
    setMonth((new Date().getMonth() + 1).toString());
    setYear(new Date().getFullYear().toString());
    setProject("");
    setTask("");
    setHours("");
    setDescription("");
    setEditingTimesheetId(null);
    setShowModal(false);
  };

  const formatCustomDate = (d) => {
    if (!d) return "";
    const [y, m, day] = d.split('-');
    return `${day}-${m}-${y}`;
  };

  const handleSave = () => {
    if (!project || !task || !hours || !description) return;
    
    if (period === 'Daily' && !customStartDate) return;
    if (period === 'Weekly' && (!customStartDate || !customEndDate)) return;
    if (period === 'Monthly' && (!month || !year)) return;
    
    let finalDate = "";
    if (period === 'Daily') {
      finalDate = formatCustomDate(customStartDate);
    } else if (period === 'Weekly') {
      finalDate = `${formatCustomDate(customStartDate)} to ${formatCustomDate(customEndDate)}`;
    } else if (period === 'Monthly') {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      finalDate = `${monthNames[parseInt(month) - 1]} ${year}`;
    }

    const payload = {
      period,
      customStartDate,
      customEndDate,
      month,
      year,
      date: finalDate,
      project,
      task,
      hours,
      description,
      empid: user?.empid || "EMP001"
    };

    if (editingTimesheetId) {
      updateTimesheet({ ...payload, id: editingTimesheetId });
    } else {
      addTimesheet(payload);
    }

    resetForm();
  };

  // Generate Year Options
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for(let i = currentYear - 2; i <= currentYear + 2; i++) {
    yearOptions.push(i.toString());
  }

  return (
    <div className="layout">
      <Sidebar role={role} />
      <div className="main-content">
        <Navbar userName={userName} role={role} />
        <div className="page-content">
          <div className="section-header mb-4">
            <h4 className="fw-bold mb-1" style={{ color: "var(--gray-800)" }}>Timesheets</h4>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-xl-3 col-md-6">
              <div className="stat-card card-dashboard d-flex align-items-center gap-2 h-100" style={{ background: "#eff6ff", padding: "1rem" }}>
                <div className="stat-icon" style={{ background: "#3b82f6", width: 38, height: 38, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", color: "white" }}>
                  <i className="bi bi-file-earmark-text" style={{ fontSize: "1.1rem" }}></i>
                </div>
                <div>
                  <div className="stat-label" style={{ fontSize: "0.75rem", color: "var(--gray-600)" }}>Total Timesheets</div>
                  <div className="stat-value fw-bold" style={{ color: "#3b82f6", fontSize: "1.25rem" }}>{totalTimesheets}</div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="stat-card card-dashboard d-flex align-items-center gap-2 h-100" style={{ background: "#ecfdf5", padding: "1rem" }}>
                <div className="stat-icon" style={{ background: "#10b981", width: 38, height: 38, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", color: "white" }}>
                  <i className="bi bi-calendar-day" style={{ fontSize: "1.1rem" }}></i>
                </div>
                <div>
                  <div className="stat-label" style={{ fontSize: "0.75rem", color: "var(--gray-600)" }}>Daily Timesheets</div>
                  <div className="stat-value fw-bold" style={{ color: "#10b981", fontSize: "1.25rem" }}>{dailyTimesheets}</div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="stat-card card-dashboard d-flex align-items-center gap-2 h-100" style={{ background: "#fffbeb", padding: "1rem" }}>
                <div className="stat-icon" style={{ background: "#f59e0b", width: 38, height: 38, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", color: "white" }}>
                  <i className="bi bi-calendar-week" style={{ fontSize: "1.1rem" }}></i>
                </div>
                <div>
                  <div className="stat-label" style={{ fontSize: "0.75rem", color: "var(--gray-600)" }}>Weekly Timesheets</div>
                  <div className="stat-value fw-bold" style={{ color: "#f59e0b", fontSize: "1.25rem" }}>{weeklyTimesheets}</div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="stat-card card-dashboard d-flex align-items-center gap-2 h-100" style={{ background: "#f5f3ff", padding: "1rem" }}>
                <div className="stat-icon" style={{ background: "#8b5cf6", width: 38, height: 38, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", color: "white" }}>
                  <i className="bi bi-calendar-month" style={{ fontSize: "1.1rem" }}></i>
                </div>
                <div>
                  <div className="stat-label" style={{ fontSize: "0.75rem", color: "var(--gray-600)" }}>Monthly Timesheets</div>
                  <div className="stat-value fw-bold" style={{ color: "#8b5cf6", fontSize: "1.25rem" }}>{monthlyTimesheets}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-dashboard p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">Timesheet Records</h5>
              {(role !== 'admin' && role !== 'manager') && (
                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => { resetForm(); setShowModal(true); }}>
                  <i className="bi bi-plus-lg" />
                  New Timesheet
                </button>
              )}
            </div>

            <div className="row g-3 mb-4">
              <div className={role === 'admin' ? "col-md-2" : "col-md-3"}>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input type="text" className="form-control border-start-0 ps-0" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              {role === 'admin' && (
                <>
                  <div className="col-md-2">
                    <select className="form-select" value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)}>
                      <option value="All">All Employees</option>
                      {uniqueEmployees.filter(e => e !== 'All').map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <select className="form-select" value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
                      <option value="All">All Departments</option>
                      {uniqueDepartments.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </>
              )}
              <div className={role === 'admin' ? "col-md-2" : "col-md-3"}>
                <select className="form-select" value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)}>
                  <option value="All">All Periods</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
              <div className={role === 'admin' ? "col-md-2" : "col-md-3"}>
                <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className={role === 'admin' ? "col-md-2" : "col-md-3"}>
                <select className="form-select" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
                  {uniqueDates.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="table-responsive mb-3">
              <table className="table custom-table mb-0">
                <thead>
                  <tr>
                    {(role === 'admin' || role === 'manager') && <th>Emp ID</th>}
                    {(role === 'admin' || role === 'manager') && <th>Employee Name</th>}
                    {role === 'admin' && <th>Department</th>}
                    <th>Period</th>
                    <th>Date</th>
                    <th>Project</th>
                    <th>Task</th>
                    <th>Hours Worked</th>
                    <th>Status</th>
                    {role === 'admin' && <th>Manager Comments</th>}
                    {role !== 'admin' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredTimesheets.length === 0 ? (
                    <tr>
                      <td colSpan={(role === 'admin' || role === 'manager') ? "10" : "7"} className="text-center py-5">
                        <p className="text-muted mb-0">No timesheets found.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTimesheets.map((ts) => (
                      <tr key={ts.id}>
                        {(role === 'admin' || role === 'manager') && <td>{ts.empid}</td>}
                        {(role === 'admin' || role === 'manager') && <td>{ts.employeeName}</td>}
                        {role === 'admin' && <td>{ts.department}</td>}
                        <td>{ts.period || "Daily"}</td>
                        <td>{ts.date}</td>
                        <td>{ts.project}</td>
                        <td>{ts.task}</td>
                        <td>{ts.hours}h</td>
                        <td>
                          <span className={`badge-status ${ts.status === 'Approved' ? 'badge-approved' : ts.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                            {ts.status}
                          </span>
                        </td>
                        {role === 'admin' && (
                          <td>
                            <div style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ts.managerComments}>
                              {ts.managerComments || "-"}
                            </div>
                          </td>
                        )}
                        {role !== 'admin' && (
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              {ts.status === 'Pending' && ts.empid === (user?.empid || "EMP001") && (
                                <>
                                  <button className="btn btn-sm btn-light text-primary" style={{ border: "none" }} onClick={() => handleEdit(ts)}>
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button className="btn btn-sm btn-light text-danger" style={{ border: "none" }} onClick={() => handleDelete(ts.id)}>
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </>
                              )}
                              {ts.status === 'Pending' && role === 'manager' && (
                                <>
                                  <button className="btn btn-sm btn-success py-0 px-2" style={{ fontSize: "0.8rem", borderRadius: "var(--radius)" }} onClick={() => handleApprove(ts)}>
                                    Approve
                                  </button>
                                  <button className="btn btn-sm btn-danger py-0 px-2" style={{ fontSize: "0.8rem", borderRadius: "var(--radius)" }} onClick={() => handleReject(ts)}>
                                    Reject
                                  </button>
                                </>
                              )}
                              <button className="btn btn-sm btn-light text-primary" style={{ border: "none" }} onClick={() => setSelectedTimesheet(ts)}>
                                <i className="bi bi-eye"></i>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ border: "none", borderRadius: "var(--radius)" }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{editingTimesheetId ? "Edit Timesheet" : "New Timesheet"}</h5>
                <button type="button" className="btn-close" onClick={resetForm}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Period</label>
                    <select className="form-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                  
                  {period === 'Daily' && (
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold">Date</label>
                      <input type="date" className="form-control" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
                    </div>
                  )}

                  {period === 'Weekly' && (
                    <div className="row mb-3">
                      <div className="col-6">
                        <label className="form-label text-muted small fw-bold">Start Date</label>
                        <input type="date" className="form-control" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
                      </div>
                      <div className="col-6">
                        <label className="form-label text-muted small fw-bold">End Date</label>
                        <input type="date" className="form-control" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} />
                      </div>
                    </div>
                  )}

                  {period === 'Monthly' && (
                    <div className="row mb-3">
                      <div className="col-6">
                        <label className="form-label text-muted small fw-bold">Month</label>
                        <select className="form-select" value={month} onChange={(e) => setMonth(e.target.value)}>
                          <option value="1">January</option>
                          <option value="2">February</option>
                          <option value="3">March</option>
                          <option value="4">April</option>
                          <option value="5">May</option>
                          <option value="6">June</option>
                          <option value="7">July</option>
                          <option value="8">August</option>
                          <option value="9">September</option>
                          <option value="10">October</option>
                          <option value="11">November</option>
                          <option value="12">December</option>
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label text-muted small fw-bold">Year</label>
                        <select className="form-select" value={year} onChange={(e) => setYear(e.target.value)}>
                          {yearOptions.map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Project</label>
                    <select className="form-select" value={project} onChange={(e) => setProject(e.target.value)}>
                      <option value="">Select a project</option>
                      <option value="Internal">Internal</option>
                      <option value="Client A">Client A</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Task</label>
                    <select className="form-select" value={task} onChange={(e) => setTask(e.target.value)}>
                      <option value="">Select a task</option>
                      <option value="Development">Development</option>
                      <option value="Meeting">Meeting</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Hours Worked</label>
                    <input type="number" className="form-control" placeholder="e.g. 8" value={hours} onChange={(e) => setHours(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Description</label>
                    <textarea className="form-control" rows="3" placeholder="What did you work on?" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-light" onClick={resetForm}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleSave}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTimesheet && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ border: "none", borderRadius: "var(--radius)" }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Timesheet Details</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedTimesheet(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold">Period</label>
                    <p className="mb-0 fw-medium">{selectedTimesheet.period || "N/A"}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold">Date</label>
                    <p className="mb-0 fw-medium">{selectedTimesheet.date}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold">Status</label>
                    <div>
                      <span className={`badge-status ${selectedTimesheet.status === 'Approved' ? 'badge-approved' : selectedTimesheet.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                        {selectedTimesheet.status}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold">Project</label>
                    <p className="mb-0 fw-medium">{selectedTimesheet.project}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold">Task</label>
                    <p className="mb-0 fw-medium">{selectedTimesheet.task}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold">Hours Worked</label>
                    <p className="mb-0 fw-medium">{selectedTimesheet.hours}h</p>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label text-muted small fw-bold">Description</label>
                    <div className="p-3 bg-light rounded border">
                      <p className="mb-0" style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>{selectedTimesheet.description}</p>
                    </div>
                  </div>
                  {selectedTimesheet.managerComments && (
                    <div className="col-md-12 mt-3">
                      <label className="form-label text-muted small fw-bold">Manager Comments</label>
                      <div className="p-3 bg-light rounded border border-warning">
                        <p className="mb-0" style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>{selectedTimesheet.managerComments}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-primary" onClick={() => setSelectedTimesheet(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {approvalModal.show && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ border: "none", borderRadius: "var(--radius)" }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Reject Timesheet</h5>
                <button type="button" className="btn-close" onClick={() => setApprovalModal({ show: false, ts: null, action: null })}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to reject this timesheet?</p>
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">Manager Comments (Optional)</label>
                  <textarea className="form-control" rows="3" placeholder="Enter comments here..." value={managerComments} onChange={(e) => setManagerComments(e.target.value)}></textarea>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-light" onClick={() => setApprovalModal({ show: false, ts: null, action: null })}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={confirmRejection}>
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Timesheets;
