import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getEmployee, getLeaveRequests, getHolidays } from "../services/dataService";

function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
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

  const leaveReqs = getLeaveRequests(userData?.employeeId);
  const approvedLeaves = leaveReqs.filter(l => l.status === 'Approved').length;
  
  const notifications = [
    { id: 1, title: 'Approved Leave Requests', text: approvedLeaves > 0 ? `${approvedLeaves} Processed` : 'None Currently', icon: 'bi-calendar-check-fill', color: '#10b981', bg: '#ecfdf5' },
    { id: 2, title: 'Attendance Status', text: 'In Good Standing', icon: 'bi-graph-up-arrow', color: '#3b82f6', bg: '#eff6ff' },
    { id: 3, title: 'Upcoming Company Events', text: 'Q3 Strategy Review', icon: 'bi-calendar-event', color: '#8b5cf6', bg: '#f5f3ff' },
    { id: 4, title: 'Company Announcements', text: 'Policy Compliance Update', icon: 'bi-megaphone-fill', color: '#f59e0b', bg: '#fffbeb' },
  ];

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
            <i className="bi bi-bell" style={{ fontSize: "1.2rem", color: "var(--gray-600)" }} />
            <span className="position-absolute badge rounded-pill bg-danger" style={{ top: "4px", right: "4px", fontSize: "0.55rem", padding: "0.25em 0.4em" }}>
              {notifications.length}
            </span>
          </button>
          {showNotif && (
            <ul className="dropdown-menu dropdown-menu-end shadow-sm show" style={{ position: "absolute", top: "100%", right: 0, borderRadius: "10px", border: "1px solid var(--gray-200)", padding: "0", minWidth: "320px", overflow: "hidden", zIndex: 1000 }}>
            <li className="p-3" style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
              <h6 className="mb-0 fw-bold" style={{ color: "var(--gray-800)" }}>Notifications</h6>
            </li>
            {notifications.map(n => (
              <li key={n.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                <div className="dropdown-item d-flex align-items-start gap-3 p-3" style={{ whiteSpace: "normal" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "8px", background: n.bg, color: n.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>
                    <i className={n.icon} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--gray-800)" }}>{n.title}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>{n.text}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
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
