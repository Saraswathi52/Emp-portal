import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Gift, CalendarCheck, CalendarX, IndianRupee, CheckCircle2 } from "lucide-react";
import { getEmployee, getLeaveRequests, getHolidays } from "../services/dataService";

function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
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
    async function fetchEmp() {
      if (userData?.employeeId) {
        if (userData?.role?.toLowerCase() === 'manager') {
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
        const res = await fetch('https://zwfgsom5dk.execute-api.ap-south-1.amazonaws.com/employees');
        let allEmployees = [];
        if (res.ok) {
           const data = await res.json();
           allEmployees = data.body ? (typeof data.body === 'string' ? JSON.parse(data.body) : data.body) : data;
           if (allEmployees.Items) allEmployees = allEmployees.Items;
        }
        
        if (!Array.isArray(allEmployees) || allEmployees.length === 0) {
           const { getEmployees } = await import('../services/dataService');
           allEmployees = getEmployees();
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

      // 2. Leaves
      try {
        const { getEmployeeLeaveRequests } = await import('../services/dataService');
        const leaves = await getEmployeeLeaveRequests(userData.employeeId);
        leaves.forEach(l => {
          const status = l.status?.S || l.status;
          const approverName = employee?.Manager || 'Your manager';
          if (status === 'Approved') {
            notifs.push({
              id: notifId++,
              title: 'Leave Approved',
              text: `${approverName} approved your leave request.`,
              icon: CalendarCheck,
              color: '#10b981',
              bg: '#ecfdf5',
              time: 'Recent',
              isUnread: true
            });
          } else if (status === 'Rejected') {
            notifs.push({
              id: notifId++,
              title: 'Leave Rejected',
              text: `${approverName} rejected your leave request.`,
              icon: CalendarX,
              color: '#ef4444',
              bg: '#fef2f2',
              time: 'Recent',
              isUnread: true
            });
          }
        });
      } catch (error) {
        console.error("Failed to load leave notifications", error);
      }

      // 3. Expenses
      try {
        const { getExpenses } = await import('../services/dataService');
        const expenses = await getExpenses(userData.employeeId);
        expenses.forEach(e => {
          const status = e.status?.S || e.status;
          if (status === 'Approved') {
            notifs.push({
              id: notifId++,
              title: 'Expense Approved',
              text: 'Your expense request was approved.',
              icon: IndianRupee,
              color: '#10b981',
              bg: '#ecfdf5',
              time: 'Recent',
              isUnread: true
            });
          } else if (status === 'Rejected') {
            notifs.push({
              id: notifId++,
              title: 'Expense Rejected',
              text: 'Rejected expense request.',
              icon: IndianRupee,
              color: '#ef4444',
              bg: '#fef2f2',
              time: 'Recent',
              isUnread: true
            });
          }
        });
      } catch (error) {
        console.error("Failed to load expense notifications", error);
      }
      
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
              {notifications.length}
            </span>
          </button>
          {showNotif && (
            <div className="dropdown-menu dropdown-menu-end shadow-lg show p-0" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, borderRadius: "12px", border: "1px solid rgba(0,0,0,0.06)", minWidth: "380px", overflow: "hidden", zIndex: 1000, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)" }}>
              <div className="d-flex align-items-center justify-content-between p-3" style={{ background: "#fff", borderBottom: "1px solid var(--gray-100)" }}>
                <h6 className="mb-0 fw-bold" style={{ color: "var(--gray-800)", fontSize: "1.05rem" }}>Notifications</h6>
                <button className="btn btn-link p-0 text-primary text-decoration-none" style={{ fontSize: "0.85rem", fontWeight: 500 }}>
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
                    <div key={n.id} className="dropdown-item d-flex align-items-start gap-3 p-3 position-relative" style={{ borderBottom: "1px solid var(--gray-50)", whiteSpace: "normal", transition: "background 0.2s ease" }}>
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
          <div className="d-flex align-items-center">
            <button
              className="btn d-flex align-items-center gap-2 border-0"
              onClick={() => navigate("/profile")}
              type="button"
              style={{ background: "var(--gray-50)", borderRadius: "50px 0 0 50px", padding: "0.35rem 0.5rem 0.35rem 1rem" }}
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
              <span className="d-none d-sm-inline" style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--gray-700)" }}>
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
              style={{ background: "var(--gray-50)", borderRadius: "0 50px 50px 0", padding: "0.35rem 0.75rem 0.35rem 0.25rem" }}
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
              <div style={{ fontSize: "0.85rem", color: "var(--gray-600)" }}>
                <div className="mb-1"><i className="bi bi-person-vcard me-2" style={{ color: "var(--primary)" }} />{employee?.empid || employee?.id || userData?.employeeId || 'ID not available'}</div>
                <div className="mb-1"><i className="bi bi-envelope me-2" style={{ color: "var(--primary)" }} />{employee?.Email || employee?.email || 'Email not available'}</div>
                <div className="mb-1"><i className="bi bi-telephone me-2" style={{ color: "var(--primary)" }} />{employee?.Phone || employee?.phone || 'Phone not available'}</div>
                <div className="mb-1"><i className="bi bi-building me-2" style={{ color: "var(--primary)" }} />{employee?.Department || employee?.department || 'Department not available'}</div>
                <div><i className="bi bi-geo-alt me-2" style={{ color: "var(--primary)" }} />{employee?.Address || employee?.location || 'Location not available'}</div>
              </div>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => navigate("/profile")} style={{ borderRadius: "6px", fontSize: "0.88rem" }}>
                <i className="bi bi-person" /> View Full Profile
              </button>
            </li>
            <li>
              <button className="dropdown-item d-flex align-items-center gap-2 text-danger" onClick={handleLogout} style={{ borderRadius: "6px", fontSize: "0.88rem" }}>
                <i className="bi bi-box-arrow-right" /> Logout
              </button>
            </li>
          </ul>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
