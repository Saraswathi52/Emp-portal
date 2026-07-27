import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getCurrentUser, getTimesheets, addTimesheet, updateTimesheet, deleteTimesheet } from "../services/dataService";

// Helper for Date Calculation
const getFormattedDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`;
};

const getCalculatedDateRange = (period) => {
  const today = new Date();
  
  if (period === 'Today') {
    return getFormattedDate(today);
  } else if (period === 'Yesterday') {
    const y = new Date(today);
    y.setDate(today.getDate() - 1);
    return getFormattedDate(y);
  } else if (period === 'This Week') {
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(today.setDate(diff));
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${getFormattedDate(start)} to ${getFormattedDate(end)}`;
  } else if (period === 'Last Week') {
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) - 7;
    const start = new Date(new Date().setDate(diff));
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${getFormattedDate(start)} to ${getFormattedDate(end)}`;
  } else if (period === 'This Month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return `${getFormattedDate(start)} to ${getFormattedDate(end)}`;
  } else if (period === 'Last Month') {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    return `${getFormattedDate(start)} to ${getFormattedDate(end)}`;
  }
  return "";
};

function Timesheets() {
  const user = getCurrentUser();
  const role = user?.role?.toLowerCase() || "employee";
  const userName = user?.FullName || user?.fullName || user?.name || user?.empid || "Employee";

  const [showModal, setShowModal] = useState(false);
  const [timesheets, setTimesheets] = useState([]);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [editingTimesheetId, setEditingTimesheetId] = useState(null);

  // Form State
  const [period, setPeriod] = useState("Today");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [project, setProject] = useState("");
  const [task, setTask] = useState("");
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadTimesheets();

    const handleSync = () => loadTimesheets();
    window.addEventListener('dataSync', handleSync);
    return () => window.removeEventListener('dataSync', handleSync);
  }, []);

  const loadTimesheets = () => {
    setTimesheets(getTimesheets());
  };

  const handleEdit = (ts) => {
    setEditingTimesheetId(ts.id);
    
    // Backwards compatibility for old records without period
    if (!ts.period) {
      setPeriod("Custom");
      if (ts.date && ts.date.includes(" to ")) {
        const parts = ts.date.split(" to ");
        setCustomStartDate(parts[0]);
        setCustomEndDate(parts[1]);
      } else {
        setCustomStartDate(ts.date || "");
        setCustomEndDate(ts.date || "");
      }
    } else {
      setPeriod(ts.period);
      setCustomStartDate(ts.customStartDate || "");
      setCustomEndDate(ts.customEndDate || "");
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

  const resetForm = () => {
    setPeriod("Today");
    setCustomStartDate("");
    setCustomEndDate("");
    setProject("");
    setTask("");
    setHours("");
    setDescription("");
    setEditingTimesheetId(null);
    setShowModal(false);
  };

  const handleSave = () => {
    if (!project || !task || !hours || !description) return;
    if (period === 'Custom' && (!customStartDate || !customEndDate)) return;
    
    let finalDate = "";
    if (period === 'Custom') {
      const formatCustom = (d) => {
        if (!d) return "";
        const [y, m, day] = d.split('-');
        return `${day}-${m}-${y}`;
      };
      const formattedStart = formatCustom(customStartDate);
      const formattedEnd = formatCustom(customEndDate);
      finalDate = customStartDate === customEndDate ? formattedStart : `${formattedStart} to ${formattedEnd}`;
    } else {
      finalDate = getCalculatedDateRange(period);
    }

    const payload = {
      period,
      customStartDate,
      customEndDate,
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

  return (
    <div className="layout">
      <Sidebar role={role} />
      <div className="main-content">
        <Navbar userName={userName} role={role} />
        <div className="page-content">
          <div className="section-header mb-4">
            <h4 className="fw-bold mb-1" style={{ color: "var(--gray-800)" }}>Timesheets</h4>
          </div>

          <div className="card-dashboard p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">Timesheet Records</h5>
              <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => { resetForm(); setShowModal(true); }}>
                <i className="bi bi-plus-lg" />
                New Timesheet
              </button>
            </div>
            
            <div className="table-responsive mb-3">
              <table className="table custom-table mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Project</th>
                    <th>Task</th>
                    <th>Hours Worked</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {timesheets.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <p className="text-muted mb-0">No timesheets available.</p>
                      </td>
                    </tr>
                  ) : (
                    timesheets.map((ts) => (
                      <tr key={ts.id}>
                        <td>{ts.date}</td>
                        <td>{ts.project}</td>
                        <td>{ts.task}</td>
                        <td>{ts.hours}h</td>
                        <td>
                          <span className={`badge-status ${ts.status === 'Approved' ? 'badge-approved' : ts.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                            {ts.status}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {ts.status === 'Pending' && (
                              <>
                                <button className="btn btn-sm btn-light text-primary" style={{ border: "none" }} onClick={() => handleEdit(ts)}>
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button className="btn btn-sm btn-light text-danger" style={{ border: "none" }} onClick={() => handleDelete(ts.id)}>
                                  <i className="bi bi-trash"></i>
                                </button>
                              </>
                            )}
                            <button className="btn btn-sm btn-light text-primary" style={{ border: "none" }} onClick={() => setSelectedTimesheet(ts)}>
                              <i className="bi bi-eye"></i>
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
                      <option value="Today">Today</option>
                      <option value="Yesterday">Yesterday</option>
                      <option value="This Week">This Week</option>
                      <option value="Last Week">Last Week</option>
                      <option value="This Month">This Month</option>
                      <option value="Last Month">Last Month</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                  
                  {period === 'Custom' && (
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
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-primary" onClick={() => setSelectedTimesheet(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Timesheets;
