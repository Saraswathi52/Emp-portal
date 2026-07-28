import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Bell, Gift, CalendarCheck, CalendarX, IndianRupee, CheckCircle2 } from "lucide-react";
import { getEmployee, getLeaveRequests, getHolidays } from "../services/dataService";
import { getNotifications, markAllAsRead, markAsRead } from "../services/notificationService";
import { FileText } from "lucide-react";

function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfPwd, setShowConfPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: '', new: '', confirm: '' });
  const [pwdErrors, setPwdErrors] = useState({});
  const [pwdSuccess, setPwdSuccess] = useState('');
  
  useEffect(() => {
    if (showPasswordModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showPasswordModal]);
  
  const handlePasswordCancel = () => {
    setShowPasswordModal(false);
    setPwdForm({ current: '', new: '', confirm: '' });
    setPwdErrors({});
    setPwdSuccess('');
    setShowPwd(false);
    setShowNewPwd(false);
    setShowConfPwd(false);
  };

  const handlePasswordSave = () => {
    const errs = {};
    if (!pwdForm.current) {
      errs.current = 'Current Password is required.';
    }
    
    if (!pwdForm.new) {
      errs.new = 'New Password is required.';
    } else {
      if (pwdForm.new.length < 8 || pwdForm.new.length > 20) {
        errs.new = 'New Password must be between 8 and 20 characters.';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(pwdForm.new)) {
        errs.new = 'New Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.';
      }
    }

    if (!pwdForm.confirm) {
      errs.confirm = 'Confirm New Password is required.';
    } else if (pwdForm.new !== pwdForm.confirm) {
      errs.confirm = 'Confirm Password must exactly match the New Password.';
    }

    setPwdErrors(errs);
    if (Object.keys(errs).length === 0) {
      setPwdSuccess('Password changed successfully!');
    } else {
      setPwdSuccess('');
    }
  };

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  let userData = {};
  try {
    userData = JSON.parse(localStorage.getItem("user")) || {};
  } catch (e) {
    userData = {};
  }
  
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const handleSync = (e) => {
      if (e.detail?.userId === userData?.employeeId) {
        loadNotifications();
      }
    };
    window.addEventListener('notificationSync', handleSync);
    return () => window.removeEventListener('notificationSync', handleSync);
  }, [userData?.employeeId]);


  useEffect(() => {
    async function fetchEmp() {
      if (userData?.employeeId) {
        if (userData?.role?.toLowerCase() === 'admin') {
          const { getAdminProfile } = await import('../services/dataService');
          const data = await getAdminProfile(userData.employeeId);
          setEmployee(data);
        } else if (userData?.role?.toLowerCase() === 'manager') {
          const { getManagerProfile } = await import('../services/dataService');
          const data = await getManagerProfile(userData.employeeId);
          setEmployee(data);
        } else {
          const data = await getEmployee(userData.employeeId);
          setEmployee(data);
        }
      }
    }
    fetchEmp();
  }, [userData?.employeeId, userData?.role]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getName = () => employee?.FullName || employee?.name || userData?.name || "User";
  const getRole = () => employee?.Designation || employee?.role || userData?.role || "Role";
  
  const getInitial = () => {
    const name = getName();
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  useEffect(() => {
    async function loadNotifications() {
      if (!userData?.employeeId) return;
      
      const notifs = [];
      let notifId = 1;
      
      // 1. Birthdays
      try {
        let allEmployees = [];
        if (userData?.role?.toLowerCase() === 'admin') {
          const { getAdminEmployees } = await import('../services/dataService');
          allEmployees = await getAdminEmployees();
        } else {
          const res = await fetch('https://zwfgsom5dk.execute-api.ap-south-1.amazonaws.com/employees');
          if (res.ok) {
             const data = await res.json();
             allEmployees = data.body ? (typeof data.body === 'string' ? JSON.parse(data.body) : data.body) : data;
             if (allEmployees.Items) allEmployees = allEmployees.Items;
          }
          
          if (!Array.isArray(allEmployees) || allEmployees.length === 0) {
             const { getEmployees } = await import('../services/dataService');
             allEmployees = getEmployees();
          }
        }

        const today = new Date();
        const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
        const todayDate = String(today.getDate()).padStart(2, '0');

        allEmployees.forEach(emp => {
          const dob = emp.DateOfBirth?.S || emp.DateOfBirth || emp.dob?.S || emp.dob;
          const name = emp.FullName?.S || emp.FullName || emp.name?.S || emp.name;
          if (dob && typeof dob === 'string' && dob.includes('-')) {
            const parts = dob.split('-'); 
            let m, d;
            if (parts.length === 3) {
              m = parts[1];
              d = parts[2];
            }
            if (m === todayMonth && d === todayDate) {
              notifs.push({
                id: notifId++,
                title: 'Birthday',
                text: `Happy Birthday ${name}!`,
                icon: Gift,
                color: '#ec4899',
                bg: '#fdf2f8',
                time: 'Today',
                isUnread: true
              });
            }
          }
        });
      } catch (error) {
        console.error("Failed to load birthdays", error);
      }

      // 2. Fetch from Notification Service
      try {
        const storedNotifs = getNotifications(userData.employeeId) || [];
        
        storedNotifs.forEach(n => {
           // map iconType to lucide icon component
           let IconComp = Bell;
           if (n.iconType === 'leave-approve') IconComp = CalendarCheck;
           if (n.iconType === 'leave-reject') IconComp = CalendarX;
           if (n.iconType === 'leave-request') IconComp = CalendarCheck;
           if (n.iconType === 'expense') IconComp = IndianRupee;
           if (n.iconType === 'document') IconComp = FileText;
           
           notifs.push({
             ...n,
             icon: IconComp
           });
        });
      } catch (e) { console.error(e); }
      
      // Sort so newest is first by id (timestamp is embedded) or timestamp
      notifs.sort((a, b) => {
        if (a.timestamp && b.timestamp) return new Date(b.timestamp) - new Date(a.timestamp);
        return 0; // Birthdays stay at top/where they are
      });
      
      setNotifications(notifs);
    }

    loadNotifications();
  }, [userData?.employeeId, employee]);

  return (
    <nav className="navbar-custom d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn d-lg-none p-1"
          onClick={onToggleSidebar}
          style={{ color: "#475569", fontSize: "1.3rem" }}
        >
          <i className="bi bi-list" />
        </button>
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-people-fill" style={{ color: "var(--primary)", fontSize: "1.5rem" }} />
          <span className="fw-bold" style={{ fontSize: "1.1rem", color: "var(--gray-800)" }}>
            PeopleCore
          </span>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Notification Bell */}
        <div className="dropdown position-relative" ref={notifRef}>
          <button 
            className="btn position-relative p-2 border-0" 
            type="button" 
            onClick={() => {
              setShowNotif(!showNotif);
              if (showProfile) setShowProfile(false);
            }} 
            style={{ background: "transparent" }}
          >
            <Bell size={18} style={{ color: "var(--gray-600)" }} />
            <span className="position-absolute badge rounded-pill bg-danger" style={{ top: "4px", right: "4px", fontSize: "0.55rem", padding: "0.25em 0.4em" }}>
              {notifications.filter(n => n.isUnread).length > 0 ? notifications.filter(n => n.isUnread).length : ''}
            </span>
          </button>
          {showNotif && (
            <div className="dropdown-menu dropdown-menu-end shadow-lg show p-0" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, borderRadius: "12px", border: "1px solid rgba(0,0,0,0.06)", minWidth: "380px", overflow: "hidden", zIndex: 1000, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)" }}>
              <div className="d-flex align-items-center justify-content-between p-3" style={{ background: "#fff", borderBottom: "1px solid var(--gray-100)" }}>
                <h6 className="mb-0 fw-bold" style={{ color: "var(--gray-800)", fontSize: "1.05rem" }}>Notifications</h6>
                <button onClick={() => markAllAsRead(userData?.employeeId)} className="btn btn-link p-0 text-primary text-decoration-none" style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                  <CheckCircle2 size={16} className="me-1" /> Mark all as read
                </button>
              </div>
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div className="p-5 text-center">
                    <Bell size={32} style={{ color: "var(--gray-300)" }} className="mb-3" />
                    <h6 className="fw-semibold" style={{ color: "var(--gray-700)" }}>You're all caught up!</h6>
                    <p className="text-muted small mb-0">No new notifications right now.</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} onClick={() => n.isUnread && markAsRead(userData?.employeeId, n.id)} className="dropdown-item d-flex align-items-start gap-3 p-3 position-relative" style={{ borderBottom: "1px solid var(--gray-50)", whiteSpace: "normal", transition: "background 0.2s ease", cursor: n.isUnread ? 'pointer' : 'default' }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: n.bg, color: n.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <n.icon size={20} />
                      </div>
                      <div className="flex-grow-1 pe-3">
                        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--gray-900)", marginBottom: "2px" }}>{n.title}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--gray-600)", lineHeight: "1.4" }}>{n.text}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginTop: "4px" }}>{n.time || 'Just now'}</div>
                      </div>
                      {n.isUnread && (
                        <div className="position-absolute" style={{ top: "16px", right: "16px", width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)" }}></div>
                      )}
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-2 text-center" style={{ background: "var(--gray-50)", borderTop: "1px solid var(--gray-100)" }}>
                  <button className="btn btn-link text-decoration-none p-0 fw-semibold" style={{ fontSize: "0.85rem" }}>View all notifications</button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="dropdown position-relative" ref={profileRef}>
          <div className="d-flex align-items-stretch">
            <button
              className="btn d-flex align-items-center gap-2 border-0"
              onClick={() => navigate("/profile")}
              type="button"
              style={{ background: "var(--gray-50)", borderRadius: "50px 0 0 50px", padding: "0.25rem 0.25rem 0.25rem 0.5rem" }}
            >
              {employee?.profileImage ? (
                <img
                  src={employee.profileImage}
                  alt="Profile"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "2px solid #fff",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    objectFit: "cover"
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "var(--primary)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    border: "2px solid #fff",
                  }}
                >
                  {getInitial()}
                </div>
              )}
              <span className="d-none d-sm-inline text-truncate" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--gray-700)", maxWidth: "160px" }}>
                {getName()}
              </span>
            </button>
            <button
              className="btn border-0 dropdown-toggle-split"
              onClick={() => {
                setShowProfile(!showProfile);
                if (showNotif) setShowNotif(false);
              }}
              type="button"
              style={{ background: "var(--gray-50)", borderRadius: "0 50px 50px 0", padding: "0.25rem 0.75rem 0.25rem 0.35rem", display: "flex", alignItems: "center" }}
            >
              <i className="bi bi-chevron-down" style={{ fontSize: "0.7rem", color: "var(--gray-400)" }} />
            </button>
          </div>
          {showProfile && (
            <ul className="dropdown-menu dropdown-menu-end shadow-sm show" style={{ position: "absolute", top: "100%", right: 0, borderRadius: "10px", border: "1px solid var(--gray-200)", padding: "0.5rem", minWidth: "280px", zIndex: 1000 }}>
            <li className="px-3 py-2">
              <div className="d-flex align-items-center gap-3 mb-3">
                {employee?.profileImage ? (
                  <img
                    src={employee.profileImage}
                    alt="Profile"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      border: "2px solid #fff",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                      objectFit: "cover"
                    }}
                  />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 700, border: "2px solid #fff", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
                    {getInitial()}
                  </div>
                )}
                <div>
                  <h6 className="mb-0 fw-bold">{getName()}</h6>
                  <small className="text-muted">{getRole()}</small>
                </div>
              </div>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => navigate("/profile")} style={{ borderRadius: "6px", fontSize: "0.88rem" }}>
                <i className="bi bi-person" /> My Profile
              </button>
            </li>
            <li>
              <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => { setShowPasswordModal(true); setShowProfile(false); }} style={{ borderRadius: "6px", fontSize: "0.88rem" }}>
                <i className="bi bi-shield-lock" /> Change Password
              </button>
            </li>
            <li>
              <button className="dropdown-item d-flex align-items-center gap-2 text-danger" onClick={handleLogout} style={{ borderRadius: "6px", fontSize: "0.88rem", marginTop: "4px" }}>
                <i className="bi bi-box-arrow-right" /> Logout
              </button>
            </li>
          </ul>
          )}
        </div>
      </div>
      
      {showPasswordModal && createPortal(
        <>
          <div className="modal-backdrop show" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1040, position: "fixed", inset: 0 }}></div>
          <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1050, position: "fixed", inset: 0, overflow: "hidden" }}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: "420px", margin: "auto", height: "100%" }}>
              <div className="modal-content shadow-lg" style={{ borderRadius: "24px", border: "none", backgroundColor: "#fff", padding: "0.5rem", maxHeight: "90vh" }}>
                <div className="modal-header border-0 pb-2 pt-4 px-4 position-relative d-flex justify-content-center">
                  <h5 className="modal-title fw-bold text-center w-100" style={{ color: "var(--gray-800)", fontSize: "1.3rem", letterSpacing: "-0.5px" }}>
                    Change Password
                  </h5>
                  <button type="button" className="btn-close position-absolute" style={{ right: "1.5rem", top: "1.5rem", fontSize: "0.85rem" }} onClick={handlePasswordCancel}></button>
                </div>
                <div className="modal-body px-4 pt-2 pb-3 overflow-auto">
                  {pwdSuccess && (
                    <div className="alert alert-success d-flex align-items-center mb-4 py-2 px-3" style={{ fontSize: "0.85rem", borderRadius: "12px", border: "1px solid #badbcc", backgroundColor: "#f0fdf4", color: "#166534" }}>
                      <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                      <div>{pwdSuccess}</div>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.4rem" }}>Current Password</label>
                    <div className="position-relative">
                      <i className="bi bi-lock position-absolute" style={{ left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-500)", fontSize: "1.1rem" }}></i>
                      <input 
                        type={showPwd ? "text" : "password"} 
                        className={`form-control ${pwdErrors.current ? 'is-invalid' : ''}`} 
                        placeholder="Enter current password"
                        value={pwdForm.current} 
                        onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })} 
                        style={{ fontSize: "0.95rem", padding: "0.75rem 2.5rem", borderRadius: "14px", border: pwdErrors.current ? "1.5px solid var(--danger)" : "1.5px solid var(--gray-200)", transition: "all 0.2s ease", backgroundColor: "var(--gray-50)" }} 
                        onFocus={(e) => { e.target.style.backgroundColor = "#fff"; e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 4px rgba(37,99,235,0.1)"; }}
                        onBlur={(e) => { e.target.style.backgroundColor = "var(--gray-50)"; e.target.style.borderColor = pwdErrors.current ? "var(--danger)" : "var(--gray-200)"; e.target.style.boxShadow = "none"; }}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPwd(!showPwd)}
                        className="btn btn-link p-0 position-absolute"
                        style={{ right: "1rem", top: "50%", transform: "translateY(-50%)", zIndex: 10, textDecoration: "none" }}
                        tabIndex="-1"
                      >
                        <i className={`bi ${showPwd ? "bi-eye-slash" : "bi-eye"}`} style={{ color: "var(--gray-500)", fontSize: "1.1rem" }}></i>
                      </button>
                    </div>
                    {pwdErrors.current && <div className="text-danger mt-1 ms-1" style={{ fontSize: "0.8rem", fontWeight: 500 }}>{pwdErrors.current}</div>}
                  </div>

                  <div className="mb-4">
                    <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.4rem" }}>New Password</label>
                    <div className="position-relative">
                      <i className="bi bi-lock position-absolute" style={{ left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-500)", fontSize: "1.1rem" }}></i>
                      <input 
                        type={showNewPwd ? "text" : "password"} 
                        className={`form-control ${pwdErrors.new ? 'is-invalid' : ''}`} 
                        placeholder="Enter new password"
                        value={pwdForm.new} 
                        onChange={(e) => setPwdForm({ ...pwdForm, new: e.target.value })} 
                        style={{ fontSize: "0.95rem", padding: "0.75rem 2.5rem", borderRadius: "14px", border: pwdErrors.new ? "1.5px solid var(--danger)" : "1.5px solid var(--gray-200)", transition: "all 0.2s ease", backgroundColor: "var(--gray-50)" }} 
                        onFocus={(e) => { e.target.style.backgroundColor = "#fff"; e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 4px rgba(37,99,235,0.1)"; }}
                        onBlur={(e) => { e.target.style.backgroundColor = "var(--gray-50)"; e.target.style.borderColor = pwdErrors.new ? "var(--danger)" : "var(--gray-200)"; e.target.style.boxShadow = "none"; }}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowNewPwd(!showNewPwd)}
                        className="btn btn-link p-0 position-absolute"
                        style={{ right: "1rem", top: "50%", transform: "translateY(-50%)", zIndex: 10, textDecoration: "none" }}
                        tabIndex="-1"
                      >
                        <i className={`bi ${showNewPwd ? "bi-eye-slash" : "bi-eye"}`} style={{ color: "var(--gray-500)", fontSize: "1.1rem" }}></i>
                      </button>
                    </div>
                    {pwdErrors.new && <div className="text-danger mt-1 ms-1" style={{ fontSize: "0.8rem", fontWeight: 500 }}>{pwdErrors.new}</div>}
                  </div>

                  <div className="mb-4">
                    <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.4rem" }}>Confirm New Password</label>
                    <div className="position-relative">
                      <i className="bi bi-lock-fill position-absolute" style={{ left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-500)", fontSize: "1.1rem" }}></i>
                      <input 
                        type={showConfPwd ? "text" : "password"} 
                        className={`form-control ${pwdErrors.confirm ? 'is-invalid' : ''}`} 
                        placeholder="Confirm new password"
                        value={pwdForm.confirm} 
                        onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })} 
                        style={{ fontSize: "0.95rem", padding: "0.75rem 2.5rem", borderRadius: "14px", border: pwdErrors.confirm ? "1.5px solid var(--danger)" : "1.5px solid var(--gray-200)", transition: "all 0.2s ease", backgroundColor: "var(--gray-50)" }} 
                        onFocus={(e) => { e.target.style.backgroundColor = "#fff"; e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 4px rgba(37,99,235,0.1)"; }}
                        onBlur={(e) => { e.target.style.backgroundColor = "var(--gray-50)"; e.target.style.borderColor = pwdErrors.confirm ? "var(--danger)" : "var(--gray-200)"; e.target.style.boxShadow = "none"; }}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfPwd(!showConfPwd)}
                        className="btn btn-link p-0 position-absolute"
                        style={{ right: "1rem", top: "50%", transform: "translateY(-50%)", zIndex: 10, textDecoration: "none" }}
                        tabIndex="-1"
                      >
                        <i className={`bi ${showConfPwd ? "bi-eye-slash" : "bi-eye"}`} style={{ color: "var(--gray-500)", fontSize: "1.1rem" }}></i>
                      </button>
                    </div>
                    {pwdErrors.confirm && <div className="text-danger mt-1 ms-1" style={{ fontSize: "0.8rem", fontWeight: 500 }}>{pwdErrors.confirm}</div>}
                  </div>
                </div>
                <div className="modal-footer border-0 px-4 pb-4 pt-1 flex-shrink-0 d-flex gap-2 justify-content-center">
                  <button type="button" className="btn btn-light w-50" onClick={handlePasswordCancel} style={{ borderRadius: "12px", fontSize: "0.95rem", padding: "0.7rem", fontWeight: 600, backgroundColor: "var(--gray-100)", color: "var(--gray-700)", border: "none", transition: "all 0.2s ease" }} onMouseEnter={(e) => e.target.style.backgroundColor = "var(--gray-200)"} onMouseLeave={(e) => e.target.style.backgroundColor = "var(--gray-100)"}>Cancel</button>
                  <button type="button" className="btn btn-primary w-50" onClick={handlePasswordSave} style={{ borderRadius: "12px", fontSize: "0.95rem", padding: "0.7rem", fontWeight: 600, border: "none", background: "var(--primary)", transition: "all 0.2s ease" }} onMouseEnter={(e) => { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = "0 4px 12px rgba(37,99,235,0.3)"; }} onMouseLeave={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}>Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        </>, document.body
      )}
    </nav>
  );
}

export default Navbar;
