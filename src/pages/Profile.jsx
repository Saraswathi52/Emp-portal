import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getCurrentUser, getEmployee, saveEmployee, getAllLeaveRequests, getAllExpenses, updateLeaveStatus, updateExpenseStatus, getManagerProfile, updateManagerProfile } from "../services/dataService";

const Field = ({ label, value, icon, name, type = 'text', options = null, editing, form, onChange }) => {
  const val = editing ? (form[name] || '') : (value || '');
  return (
    <div className="col-md-6">
      <div className="d-flex align-items-center gap-3 p-3" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", border: "1px solid var(--gray-100)", minHeight: 56 }}>
        <div style={{ width: 38, height: 38, borderRadius: "10px", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>
          <i className={`bi ${icon}`} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.7rem", color: "var(--gray-500)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px" }}>{label}</div>
          {editing ? (
            options ? (
              <select name={name} value={val} onChange={onChange} className="form-select form-select-sm" style={{ fontSize: "0.85rem", padding: "0.2rem 0.5rem", marginTop: 2 }}>
                <option value="">Select...</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input type={type} name={name} value={val} onChange={onChange} className="form-control form-control-sm" style={{ fontSize: "0.85rem", padding: "0.2rem 0.5rem", marginTop: 2 }} />
            )
          ) : (
            <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--gray-700)", overflow: "hidden", textOverflow: "ellipsis" }}>
              {type === 'url' && val ? <a href={val} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "none" }}>{val}</a> : (val || '—')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function Profile() {
  const user = getCurrentUser();
  const [emp, setEmp] = useState(null);
  const [role, setRole] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored).role.toLowerCase() : "employee";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchEmp() {
      if (user?.employeeId) {
        const data = await getEmployee(user.employeeId);
        setEmp(data);
      }
    }
    fetchEmp();
  }, [user?.employeeId]);

  const isManager = role === 'manager';
  const [pendingItems, setPendingItems] = useState([]);

  useEffect(() => {
    async function fetchPending() {
      if (isManager) {
        try {
          const leaves = getAllLeaveRequests() || [];
          const expenses = await getAllExpenses() || [];
          
          const pLeaves = leaves.filter(l => l.status === 'Pending');
          const pExpenses = expenses.filter(e => e.status === 'Pending');

          const items = [
            ...pLeaves.map(l => ({
              id: l.leaveId,
              employeeName: l.employeeName || l.employeeId,
              type: 'Leave',
              typeDetail: l.wfh ? 'WFH' : l.leaveType,
              detail: `${l.startDate} to ${l.endDate}${l.halfDay ? ' (Half Day)' : ''}`,
              reason: l.reason,
              appliedOn: l.appliedOn,
              status: l.status,
              kind: 'leave',
            })),
            ...pExpenses.map(e => ({
              id: e.id,
              employeeName: e.employeeName || e.employeeId,
              type: 'Expense',
              typeDetail: e.expenseType,
              detail: `₹${parseFloat(e.amount).toLocaleString()}`,
              reason: e.description,
              appliedOn: e.submittedOn,
              status: e.status,
              kind: 'expense',
            })),
          ].sort((a, b) => new Date(b.appliedOn || 0) - new Date(a.appliedOn || 0));
          
          setPendingItems(items);
        } catch (error) {
          console.error("Failed to fetch pending items", error);
        }
      } else {
        setPendingItems([]);
      }
    }
    fetchPending();
  }, [isManager, refreshKey]);

  const showToast2 = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = (item) => {
    if (item.kind === 'leave') {
      updateLeaveStatus(item.id, 'Approved');
    } else {
      updateExpenseStatus(item.id, 'Approved');
    }
    showToast2(`${item.type} request approved`);
    setRefreshKey(k => k + 1);
  };

  const handleReject = (item) => {
    if (item.kind === 'leave') {
      updateLeaveStatus(item.id, 'Rejected');
    } else {
      updateExpenseStatus(item.id, 'Rejected');
    }
    showToast2(`${item.type} request rejected`, 'warning');
    setRefreshKey(k => k + 1);
  };

  const [form, setForm] = useState({
    Title: '', FullName: '', Email: '', Phone: '', Department: '', Designation: '',
    Manager: '', Status: '', location: '', DateOfBirth: '', BloodGroup: '',
    JoiningDate: '', EmergencyContactName: '', EmergencyContactPhone: '', EmergencyContactRelation: '',
    Address: '', Education: '', Skills: '', LinkedIn: '', GitHub: '',
  });

  useEffect(() => {
    if (emp) {
      setForm({
        Title: emp.Title || '',
        FullName: emp.FullName || '',
        Email: emp.Email || '',
        Phone: emp.Phone || '',
        Department: emp.Department || '',
        Designation: emp.Designation || '',
        Manager: emp.Manager || '',
        Status: emp.Status || '',
        location: emp.location || '',
        DateOfBirth: emp.DateOfBirth || '',
        BloodGroup: emp.BloodGroup || '',
        JoiningDate: emp.JoiningDate || '',
        EmergencyContactName: emp.EmergencyContactName || '',
        EmergencyContactPhone: emp.EmergencyContactPhone || '',
        EmergencyContactRelation: emp.EmergencyContactRelation || '',
        Address: emp.Address || '',
        Education: emp.Education || '',
        Skills: Array.isArray(emp.Skills) ? emp.Skills.join(', ') : (emp.Skills || ''),
        LinkedIn: emp.LinkedIn || '',
        GitHub: emp.GitHub || '',
      });
    }
  }, [emp]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (isManager) {
        const payload = {
          Title: form.Title,
          FullName: form.FullName,
          DateOfBirth: form.DateOfBirth,
          BloodGroup: form.BloodGroup,
          Phone: form.Phone,
          Address: form.Address,
          EmergencyContactName: form.EmergencyContactName,
          EmergencyContactPhone: form.EmergencyContactPhone,
          EmergencyContactRelation: form.EmergencyContactRelation,
          Education: form.Education,
          Skills: typeof form.Skills === 'string' ? form.Skills.split(',').map(s => s.trim()).filter(Boolean) : form.Skills,
          LinkedIn: form.LinkedIn,
          GitHub: form.GitHub,
          Status: form.Status
        };
        await updateManagerProfile(user.employeeId, payload);
        const refreshed = await getManagerProfile(user.employeeId);
        setEmp(refreshed);
      } else {
        const updated = {
          ...emp,
          ...form,
          Skills: typeof form.Skills === 'string' ? form.Skills.split(',').map(s => s.trim()).filter(Boolean) : form.Skills,
        };
        await saveEmployee(updated);
        const refreshed = await getEmployee(updated.empid || user?.employeeId);
        setEmp(refreshed || updated);
      }
      setEditing(false);
      showToast("Profile updated successfully!");
    } catch (error) {
      showToast("Failed to update profile", "warning");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (emp) {
      setForm({
        Title: emp.Title || '',
        FullName: emp.FullName || '',
        Email: emp.Email || '',
        Phone: emp.Phone || '',
        Department: emp.Department || '',
        Designation: emp.Designation || '',
        Manager: emp.Manager || '',
        Status: emp.Status || '',
        location: emp.location || '',
        DateOfBirth: emp.DateOfBirth || '',
        BloodGroup: emp.BloodGroup || '',
        JoiningDate: emp.JoiningDate || '',
        EmergencyContactName: emp.EmergencyContactName || '',
        EmergencyContactPhone: emp.EmergencyContactPhone || '',
        EmergencyContactRelation: emp.EmergencyContactRelation || '',
        Address: emp.Address || '',
        Education: emp.Education || '',
        Skills: Array.isArray(emp.Skills) ? emp.Skills.join(', ') : (emp.Skills || ''),
        LinkedIn: emp.LinkedIn || '',
        GitHub: emp.GitHub || '',
      });
    }
    setEditing(false);
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const updated = { ...emp, resume: ev.target.result, resumeName: file.name };
        saveEmployee(updated).then(async () => {
          const refreshed = await getEmployee(updated.empid || user?.employeeId);
          setEmp(refreshed || updated);
          showToast("Resume uploaded successfully!");
        }).catch(() => {
          showToast("Failed to upload resume", "warning");
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const displayName = [emp?.Title, emp?.FullName].filter(Boolean).join(' ') || user?.name || 'User';
  const initial = (emp?.FullName || user?.name || 'User').charAt(0).toUpperCase();

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 250;
          const MAX_HEIGHT = 250;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
          const base64Content = compressedDataUrl.split(',')[1];

          saveEmployee({
            ...(emp || {}),
            empid: emp?.empid || user?.employeeId,
            FullName: emp?.FullName || user?.name || user?.employeeId,
            profileImage: compressedDataUrl, 
            fileName: file.name,
            fileContent: base64Content
          }).then(() => {
            window.location.reload();
          }).catch((err) => {
            console.error("Profile image upload error:", err);
            showToast("Failed to upload profile image", "warning");
          });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
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
              <h4>My Profile</h4>
              <p>Manage your personal and professional information</p>
            </div>
            <div className="d-flex gap-2">
              {editing ? (
                <>
                  <button className="btn-custom-success d-flex align-items-center gap-2" onClick={handleSave} disabled={isLoading}>
                    <i className="bi bi-check-lg" /> {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn-custom-outline d-flex align-items-center gap-2" onClick={handleCancel}>
                    <i className="bi bi-x-lg" /> Cancel
                  </button>
                </>
              ) : (
                <button className="btn-custom-primary d-flex align-items-center gap-2" onClick={() => setEditing(true)}>
                  <i className="bi bi-pencil-square" /> Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card-dashboard p-4 text-center">
                <div style={{ position: "relative", display: "inline-block", marginBottom: "1rem" }}>
                  <label style={{ cursor: "pointer", margin: 0 }}>
                    {emp?.profileImage ? (
                      <img
                        src={emp.profileImage}
                        alt="Profile Avatar"
                        style={{
                          width: 120, height: 120, borderRadius: "50%",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.1)", border: "4px solid #fff",
                          objectFit: "cover"
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 120, height: 120, borderRadius: "50%",
                        background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                        color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center",
                        fontSize: "3rem", fontWeight: 700,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.1)", border: "4px solid #fff"
                      }}>
                        {initial}
                      </div>
                    )}
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleProfileImageUpload} disabled={isLoading} />
                    <div style={{
                      position: "absolute", bottom: "5px", right: "5px",
                      background: "var(--primary)", color: "#fff",
                      width: "32px", height: "32px", borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "2px solid #fff", boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                    }}>
                      <i className="bi bi-camera-fill" style={{ fontSize: "0.85rem" }} />
                    </div>
                  </label>
                </div>
                <h5 className="fw-bold mb-1" style={{ color: "var(--gray-800)" }}>{displayName}</h5>
                <p className="mb-2" style={{ color: "var(--primary)", fontSize: "0.9rem", fontWeight: 500 }}>{emp?.Designation || emp?.Role || ''}</p>
                <span className="badge-status badge-approved d-inline-block mb-2">{emp?.empid || ''}</span>
                <div style={{ color: "var(--gray-500)", fontSize: "0.85rem" }}>
                  <i className="bi bi-geo-alt me-1" /> {emp?.location || ''}
                </div>

                <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--gray-100)" }}>
                  <h6 className="fw-bold mb-2" style={{ color: "var(--gray-700)", fontSize: "0.85rem" }}>
                    <i className="bi bi-file-earmark-text me-1" /> Resume
                  </h6>
                  {emp?.resume ? (
                    <div className="d-flex align-items-center justify-content-between p-2" style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)" }}>
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-filetype-pdf" style={{ color: "var(--danger)", fontSize: "1.2rem" }} />
                        <small style={{ color: "var(--gray-600)" }}>{emp.resumeName || 'Resume'}</small>
                      </div>
                      <a href={emp.resume} download={emp.resumeName} className="btn btn-sm btn-custom-outline" style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}>
                        <i className="bi bi-download" />
                      </a>
                    </div>
                  ) : (
                    <p style={{ color: "var(--gray-400)", fontSize: "0.82rem" }}>No resume uploaded</p>
                  )}
                  <label className="btn-custom-outline d-flex align-items-center justify-content-center gap-2 mt-2 w-100" style={{ cursor: "pointer", fontSize: "0.82rem", padding: "0.4rem" }}>
                    <i className="bi bi-cloud-upload" /> {emp?.resume ? 'Update Resume' : 'Upload Resume'}
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} style={{ display: 'none' }} disabled={isLoading} />
                  </label>
                  <small style={{ color: "var(--gray-400)", fontSize: "0.7rem", display: "block", marginTop: "0.25rem" }}>Supported: PDF, DOC, DOCX</small>
                </div>

                <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--gray-100)" }}>
                  <h6 className="fw-bold mb-2" style={{ color: "var(--gray-700)", fontSize: "0.85rem" }}>
                    <i className="bi bi-link-45deg me-1" /> Links
                  </h6>
                  {editing ? (
                    <div className="d-flex flex-column gap-2">
                      <div className="input-group input-group-sm">
                        <span className="input-group-text" style={{ fontSize: "0.75rem", background: "var(--gray-50)" }}><i className="bi bi-linkedin" /></span>
                        <input type="url" name="LinkedIn" value={form.LinkedIn} onChange={handleChange} className="form-control form-control-sm" placeholder="LinkedIn URL" style={{ fontSize: "0.8rem" }} />
                      </div>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text" style={{ fontSize: "0.75rem", background: "var(--gray-50)" }}><i className="bi bi-github" /></span>
                        <input type="url" name="GitHub" value={form.GitHub} onChange={handleChange} className="form-control form-control-sm" placeholder="GitHub URL" style={{ fontSize: "0.8rem" }} />
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-center gap-3">
                      {emp?.LinkedIn ? (
                        <a href={emp.LinkedIn} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ color: "#0a66c2", background: "#f0f4ff", borderRadius: "50px", padding: "0.3rem 0.8rem", fontSize: "0.8rem" }}>
                          <i className="bi bi-linkedin me-1" /> LinkedIn
                        </a>
                      ) : (
                        <span style={{ color: "var(--gray-400)", fontSize: "0.8rem" }}><i className="bi bi-linkedin me-1" /> Not set</span>
                      )}
                      {emp?.GitHub ? (
                        <a href={emp.GitHub} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ color: "#333", background: "#f0f0f0", borderRadius: "50px", padding: "0.3rem 0.8rem", fontSize: "0.8rem" }}>
                          <i className="bi bi-github me-1" /> GitHub
                        </a>
                      ) : (
                        <span style={{ color: "var(--gray-400)", fontSize: "0.8rem" }}><i className="bi bi-github me-1" /> Not set</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="card-dashboard p-4 mb-4">
                <h5 className="fw-bold mb-4" style={{ color: "var(--gray-800)" }}>
                  <i className="bi bi-person me-2" style={{ color: "var(--primary)" }} />
                  Personal Details
                </h5>
                <div className="row g-3">
                  <Field label="Title" value={emp?.Title} icon="bi-person-badge" name="Title" options={['Mr', 'Ms', 'Mrs', 'Manager']} editing={editing} form={form} onChange={handleChange} />
                  <Field label="Full Name" value={emp?.FullName} icon="bi-person" name="FullName" editing={editing} form={form} onChange={handleChange} />
                  <Field label="Date of Birth" value={emp?.DateOfBirth} icon="bi-calendar" name="DateOfBirth" type="date" editing={editing} form={form} onChange={handleChange} />
                  <Field label="Blood Group" value={emp?.BloodGroup} icon="bi-droplet" name="BloodGroup" options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} editing={editing} form={form} onChange={handleChange} />
                  <Field label="Phone" value={emp?.Phone} icon="bi-telephone" name="Phone" editing={editing} form={form} onChange={handleChange} />
                  <Field label="Email" value={emp?.Email} icon="bi-envelope" name="Email" type="email" editing={false} form={form} onChange={handleChange} />
                  <Field label="Address" value={emp?.Address} icon="bi-geo-alt" name="Address" editing={editing} form={form} onChange={handleChange} />
                </div>
              </div>

              <div className="card-dashboard p-4 mb-4">
                <h5 className="fw-bold mb-4" style={{ color: "var(--gray-800)" }}>
                  <i className="bi bi-briefcase me-2" style={{ color: "var(--primary)" }} />
                  Official Details
                </h5>
                <div className="row g-3">
                  <Field label="Employee ID" value={emp?.empid} icon="bi-person-badge" name="empid" editing={false} form={form} onChange={handleChange} />
                  <Field label="Department" value={emp?.Department} icon="bi-building" name="Department" editing={false} form={form} onChange={handleChange} />
                  <Field label="Designation" value={emp?.Designation} icon="bi-briefcase" name="Designation" editing={false} form={form} onChange={handleChange} />
                  <Field label="Joining Date" value={emp?.JoiningDate} icon="bi-calendar-check" name="JoiningDate" type="date" editing={false} form={form} onChange={handleChange} />
                  <Field label="Manager" value={emp?.Manager} icon="bi-person-up" name="Manager" editing={false} form={form} onChange={handleChange} />
                  <Field label="Status" value={emp?.Status} icon="bi-check-circle" name="Status" options={['Active', 'Inactive', 'On Leave']} editing={editing} form={form} onChange={handleChange} />
                </div>
              </div>

              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <div className="card-dashboard p-4">
                    <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)", fontSize: "0.95rem" }}>
                      <i className="bi bi-telephone-forward me-2" style={{ color: "var(--primary)" }} />
                      Emergency Contact
                    </h5>
                    <div className="d-flex flex-column gap-3">
                      <div>
                        <small style={{ color: "var(--gray-500)", fontSize: "0.7rem", textTransform: "uppercase" }}>Name</small>
                        {editing ? (
                          <input name="EmergencyContactName" value={form.EmergencyContactName} onChange={handleChange} className="form-control form-control-sm" style={{ fontSize: "0.85rem" }} />
                        ) : (
                          <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>{emp?.EmergencyContactName || '—'}</div>
                        )}
                      </div>
                      <div>
                        <small style={{ color: "var(--gray-500)", fontSize: "0.7rem", textTransform: "uppercase" }}>Phone</small>
                        {editing ? (
                          <input name="EmergencyContactPhone" value={form.EmergencyContactPhone} onChange={handleChange} className="form-control form-control-sm" style={{ fontSize: "0.85rem" }} />
                        ) : (
                          <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>{emp?.EmergencyContactPhone || '—'}</div>
                        )}
                      </div>
                      <div>
                        <small style={{ color: "var(--gray-500)", fontSize: "0.7rem", textTransform: "uppercase" }}>Relation</small>
                        {editing ? (
                          <input name="EmergencyContactRelation" value={form.EmergencyContactRelation} onChange={handleChange} className="form-control form-control-sm" style={{ fontSize: "0.85rem" }} />
                        ) : (
                          <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>{emp?.EmergencyContactRelation || '—'}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card-dashboard p-4">
                    <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)", fontSize: "0.95rem" }}>
                      <i className="bi bi-mortarboard me-2" style={{ color: "var(--primary)" }} />
                      Education & Skills
                    </h5>
                    <div className="d-flex flex-column gap-3">
                      <div>
                        <small style={{ color: "var(--gray-500)", fontSize: "0.7rem", textTransform: "uppercase" }}>Education</small>
                        {editing ? (
                          <textarea name="Education" value={form.Education} onChange={handleChange} className="form-control form-control-sm" rows="2" style={{ fontSize: "0.85rem" }} />
                        ) : (
                          <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>{emp?.Education || '—'}</div>
                        )}
                      </div>
                      <div>
                        <small style={{ color: "var(--gray-500)", fontSize: "0.7rem", textTransform: "uppercase" }}>Skills</small>
                        {editing ? (
                          <textarea name="Skills" value={form.Skills} onChange={handleChange} className="form-control form-control-sm" rows="2" placeholder="React, Node.js, Python" style={{ fontSize: "0.85rem" }} />
                        ) : (
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {Array.isArray(emp?.Skills) && emp.Skills.length > 0 ? emp.Skills.map((s, i) => (
                              <span key={i} className="badge-status badge-uploaded" style={{ fontSize: "0.72rem" }}>{s}</span>
                            )) : <span style={{ color: "var(--gray-400)", fontSize: "0.85rem" }}>—</span>}
                          </div>
                        )}
                        {editing && <small style={{ color: "var(--gray-400)", fontSize: "0.7rem" }}>Separate skills with commas</small>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isManager && (
            <div className="card-dashboard p-4 mt-4" key={refreshKey}>
              <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)" }}>
                <i className="bi bi-hourglass-split me-2" style={{ color: "var(--warning)" }} />
                Pending Approvals
                {pendingItems.length > 0 && (
                  <span className="ms-2 badge-status badge-pending" style={{ fontSize: "0.7rem" }}>{pendingItems.length} pending</span>
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
                    {pendingItems.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4" style={{ color: "var(--gray-400)" }}>
                          <i className="bi bi-check2-all" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }} />
                          No pending approvals
                        </td>
                      </tr>
                    ) : (
                      pendingItems.map((item) => (
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
                          <td><span className={`badge-status badge-${item.status === 'Pending' ? 'pending' : item.status === 'Approved' ? 'approved' : 'rejected'}`}>{item.status}</span></td>
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
          )}
        </div>
      </div>
    </div>
  );
}
export default Profile;
