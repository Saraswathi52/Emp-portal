
import axios from 'axios';

const MANAGER_API_BASE = 'https://5luqrfxzbi.execute-api.ap-south-1.amazonaws.com';
const ADMIN_API_BASE = 'https://z312reqsx9.execute-api.ap-south-1.amazonaws.com';

export async function getManagerProfile(empid) {
  try {
    const response = await axios.get(`${MANAGER_API_BASE}/manager/${empid}`);
    let data = response.data;
    if (data.statusCode && data.body) {
      data = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
    }
    // Unwrap DynamoDB format if needed
    if (data && Object.keys(data).length > 0 && typeof data[Object.keys(data)[0]] === 'object' && ('S' in data[Object.keys(data)[0]] || 'N' in data[Object.keys(data)[0]])) {
      const unwrapped = {};
      for (const key in data) {
        const val = data[key];
        unwrapped[key] = val.S !== undefined ? val.S : (val.N !== undefined ? Number(val.N) : (val.BOOL !== undefined ? val.BOOL : val));
      }
      data = unwrapped;
    }

    return {
      empid: data.empid || empid,
      Title: data.Title || '',
      FullName: data.FullName || '',
      DateOfBirth: data.DateOfBirth || '',
      BloodGroup: data.BloodGroup || '',
      Phone: data.Phone || '',
      Email: data.Email || '',
      Address: data.Address || '',
      Department: data.Department || '',
      Designation: data.Designation || '',
      JoiningDate: data.JoiningDate || '',
      Manager: data.Manager || '',
      Status: data.Status || '',
      EmergencyContactName: data.EmergencyContactName || '',
      EmergencyContactPhone: data.EmergencyContactPhone || '',
      EmergencyContactRelation: data.EmergencyContactRelation || '',
      Education: data.Education || '',
      Skills: data.Skills || '',
      LinkedIn: data.LinkedIn || '',
      GitHub: data.GitHub || '',
      Role: data.Role || 'Manager',
      Password: data.Password || '',
      profileImage: data.profileImage || null,
      resume: data.resume || null,
      resumeName: data.resumeName || null
    };
  } catch (error) {
    console.error('Error fetching manager profile:', error);
    return null;
  }
}

export async function updateManagerProfile(empid, payload) {
  try {
    const url = `${MANAGER_API_BASE}/manager/${empid}`;
    console.log("URL:", url);
    console.log("Payload:", payload);
    const response = await axios.put(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.log("Error Data:", error.response?.data);
    console.log("Error Status:", error.response?.status);
    console.log("Full Error:", error);
    throw error;
  }
}



export async function getAdminProfile(adm_id) {
  try {
    const response = await axios.get(`${ADMIN_API_BASE}/admin/${adm_id}`);
    let data = response.data;
    if (data.statusCode && data.body) {
      data = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
    }
    // Unwrap DynamoDB format if needed
    if (data && Object.keys(data).length > 0 && typeof data[Object.keys(data)[0]] === 'object' && ('S' in data[Object.keys(data)[0]] || 'N' in data[Object.keys(data)[0]])) {
      const unwrapped = {};
      for (const key in data) {
        const val = data[key];
        unwrapped[key] = val.S !== undefined ? val.S : (val.N !== undefined ? Number(val.N) : (val.BOOL !== undefined ? val.BOOL : val));
      }
      data = unwrapped;
    }
    
    // Map to PascalCase fields expected by frontend
    return {
      empid: data.adm_id || data.empid || adm_id,
      FullName: data.fullName || data.FullName || '',
      Email: data.email || data.Email || '',
      Phone: data.phone || data.Phone || '',
      Department: data.department || data.Department || '',
      Designation: data.designation || data.Designation || '',
      Role: data.role || data.Role || 'Admin',
      Status: data.status || data.Status || '',
      JoiningDate: data.joiningDate || data.JoiningDate || '',
      Address: data.address || data.Address || '',
      Title: data.title || data.Title || '',
      DateOfBirth: data.dateOfBirth || data.DateOfBirth || '',
      BloodGroup: data.bloodGroup || data.BloodGroup || '',
      Manager: data.manager || data.Manager || '',
      EmergencyContactName: data.emergencyContactName || data.EmergencyContactName || '',
      EmergencyContactPhone: data.emergencyContactPhone || data.EmergencyContactPhone || '',
      EmergencyContactRelation: data.emergencyContactRelation || data.EmergencyContactRelation || '',
      Education: data.education || data.Education || '',
      Skills: data.skills || data.Skills || '',
      LinkedIn: data.linkedIn || data.LinkedIn || '',
      GitHub: data.github || data.GitHub || '',
      profileImage: data.profileImage || null,
      resume: data.resume || null,
      resumeName: data.resumeName || null,
      ...data
    };
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return null;
  }
}

export async function updateAdminProfile(adm_id, payload) {
  try {
    // Map PascalCase fields back to camelCase for the API
    const apiPayload = {
      ...payload,
      fullName: payload.FullName !== undefined ? payload.FullName : payload.fullName,
      email: payload.Email !== undefined ? payload.Email : payload.email,
      phone: payload.Phone !== undefined ? payload.Phone : payload.phone,
      department: payload.Department !== undefined ? payload.Department : payload.department,
      designation: payload.Designation !== undefined ? payload.Designation : payload.designation,
      role: payload.Role !== undefined ? payload.Role : payload.role,
      status: payload.Status !== undefined ? payload.Status : payload.status,
      address: payload.Address !== undefined ? payload.Address : payload.address,
      title: payload.Title !== undefined ? payload.Title : payload.title,
      education: payload.Education !== undefined ? payload.Education : payload.education,
      linkedIn: payload.LinkedIn !== undefined ? payload.LinkedIn : payload.linkedIn,
      github: payload.GitHub !== undefined ? payload.GitHub : payload.github
    };

    // Remove duplicates
    delete apiPayload.FullName;
    delete apiPayload.Email;
    delete apiPayload.Phone;
    delete apiPayload.Department;
    delete apiPayload.Designation;
    delete apiPayload.Role;
    delete apiPayload.Status;
    delete apiPayload.Address;
    delete apiPayload.Title;
    delete apiPayload.Education;
    delete apiPayload.LinkedIn;
    delete apiPayload.GitHub;

    const response = await axios.put(`${ADMIN_API_BASE}/admin/${adm_id}`, apiPayload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error("Error updating admin profile:", error);
    throw error;
  }
}

let cachedEmployees = null;

export async function getAdminEmployees() {
  if (cachedEmployees) return cachedEmployees;
  try {
    const response = await axios.get(`${ADMIN_API_BASE}/admin/employees`);
    let data = response.data;
    if (data.statusCode && data.body) {
      data = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
    }
    cachedEmployees = Array.isArray(data) ? data : (data.Items || []);
    return cachedEmployees;
  } catch (error) {
    console.error('Error fetching admin employees:', error);
    throw error;
  }
}

export async function addAdminEmployee(employee) {
  if (!cachedEmployees) await getAdminEmployees();
  cachedEmployees.push(employee);
  return employee;
}

export async function updateAdminEmployee(id, employeeData) {
  if (!cachedEmployees) return;
  cachedEmployees = cachedEmployees.map(e => (e.empid === id || e.id === id || e.empid?.S === id || e.id?.S === id) ? { ...e, ...employeeData } : e);
}

export async function deleteAdminEmployee(id) {
  if (!cachedEmployees) return;
  cachedEmployees = cachedEmployees.filter(e => e.empid !== id && e.id !== id && e.empid?.S !== id && e.id?.S !== id);
}

let cachedDepartments = null;

export async function getAdminDepartments() {
  if (cachedDepartments) return cachedDepartments;
  try {
    const response = await axios.get(ED_DEPARTMENT_API);
    if (response.data) {
      if (response.data.body) {
        cachedDepartments = typeof response.data.body === 'string' ? JSON.parse(response.data.body) : response.data.body;
      } else {
        cachedDepartments = Array.isArray(response.data) ? response.data : (response.data.Items || []);
      }
      return cachedDepartments;
    }
    cachedDepartments = [];
    return cachedDepartments;
  } catch (error) {
    console.error('Error fetching admin departments:', error);
    cachedDepartments = [];
    return cachedDepartments;
  }
}

export async function addAdminDepartment(dept) {
  if (!cachedDepartments) await getAdminDepartments();
  cachedDepartments.push(dept);
  return dept;
}

export async function updateAdminDepartment(id, deptData) {
  if (!cachedDepartments) return;
  cachedDepartments = cachedDepartments.map(d => d.id === id || d.DepartmentId === id ? { ...d, ...deptData } : d);
}

export async function deleteAdminDepartment(id) {
  if (!cachedDepartments) return;
  cachedDepartments = cachedDepartments.filter(d => d.id !== id && d.DepartmentId !== id);
}

export const ED_DEPARTMENT_API = 'https://uzxfzaqjsd.execute-api.ap-south-1.amazonaws.com/ed_department';

export async function createDepartment(payload) {
  try {
    const response = await axios.post(ED_DEPARTMENT_API, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error("Error adding department:", error);
    throw error;
  }
}

export async function updateDepartment(depid, payload) {
  try {
    const response = await axios.put(`${ED_DEPARTMENT_API}/${depid}`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error("Error updating department:", error);
    throw error;
  }
}

export async function deleteDepartment(depid) {
  try {
    const response = await axios.delete(`${ED_DEPARTMENT_API}/${depid}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting department:", error);
    throw error;
  }
}


const KEYS = {
  EMPLOYEES: 'peoplecore_employees',
  ATTENDANCE: 'peoplecore_attendance',
  LEAVE_BALANCES: 'peoplecore_leave_balances',
  LEAVE_REQUESTS: 'peoplecore_leave_requests',
  EXPENSES: 'peoplecore_expenses',
  HOLIDAYS: 'peoplecore_holidays',
  PROFILE: 'peoplecore_profile',
  DOCUMENTS: 'peoplecore_documents',
};

export const MANAGER_CRUD_API = 'https://wz4iitq6zc.execute-api.ap-south-1.amazonaws.com/manager';
export const MANAGER_EMPLOYEES_API = 'https://5luqrfxzbi.execute-api.ap-south-1.amazonaws.com/manager';

export async function getManagerEmployees(empid) {
  try {
    const response = await axios.get(`${MANAGER_EMPLOYEES_API}/${empid}/employees`);
    let data = response.data;
    if (data.statusCode && data.body) {
      data = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
    }
    
    let rawEmployees = Array.isArray(data) ? data : (data.employees || data.Items || []);
    
    // Unwrap DynamoDB format if present
    const employees = rawEmployees.map(emp => {
      const parsedEmp = {};
      for (const key in emp) {
        if (emp[key] && typeof emp[key] === 'object') {
          parsedEmp[key] = emp[key].S !== undefined ? emp[key].S : (emp[key].N !== undefined ? emp[key].N : emp[key]);
        } else {
          parsedEmp[key] = emp[key];
        }
      }
      return parsedEmp;
    });

    return employees;
  } catch (error) {
    console.error(`Error fetching employees for manager ${empid}:`, error);
    throw error;
  }
}

export async function getAdminManagers() {
  try {
    const response = await axios.get(MANAGER_CRUD_API);
    let data = response.data;
    if (data.statusCode && data.body) {
      data = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
    }
    return Array.isArray(data) ? data : (data.managers || data.Items || []);
  } catch (error) {
    console.error('Error fetching admin managers:', error);
    throw error;
  }
}

export async function addAdminManager(payload) {
  try {
    const response = await axios.post(MANAGER_CRUD_API, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error("Error adding admin manager:", error);
    throw error;
  }
}

export const LEAVE_API_URL = 'https://rbbdgd2ai8.execute-api.ap-south-1.amazonaws.com/leave';

export async function submitLeaveRequestApi(leaveData) {
  try {
    const res = await fetch(LEAVE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leaveData)
    });
    if (!res.ok) throw new Error('Failed to apply leave');
    return await res.json();
  } catch (error) {
    console.error('Error applying leave:', error);
    throw error;
  }
}

export async function getManagerLeaveRequests(managerId) {
  try {
    const url = `${LEAVE_API_URL}/manager/${managerId}`;
    console.log("=== DEBUG GET MANAGER LEAVES ===");
    console.log("API URL:", url);

    const response = await axios.get(url);
    
    let data = response.data;
    if (data.body) {
      data = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
    }
    
    let finalData = [];
    if (Array.isArray(data)) finalData = data;
    else if (data.Items) finalData = data.Items;
    else if (typeof data === 'object' && Object.keys(data).length > 0) finalData = [data];

    return finalData;
  } catch (error) {
    console.error('Error fetching manager leaves API. Error:', error);
    return [];
  }
}

export async function getEmployeeLeaveRequests(employeeId) {
  try {
    const url = `${LEAVE_API_URL}/${employeeId}`;
    console.log("=== DEBUG GET EMPLOYEE LEAVES ===");
    console.log("API URL:", url);

    const response = await axios.get(url);
    
    let data = response.data;
    if (data.body) {
      data = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
    }
    
    let finalData = [];
    if (Array.isArray(data)) finalData = data;
    else if (data.Items) finalData = data.Items;
    else if (typeof data === 'object' && Object.keys(data).length > 0) finalData = [data];

    return finalData;
  } catch (error) {
    console.error('Error fetching employee leaves API. Error:', error);
    return [];
  }
}

export async function updateManagerLeaveStatus(leaveId, status) {
  try {
    const url = `${LEAVE_API_URL}/${leaveId}`;
    const response = await axios.put(url, { status }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating leave status:', error);
    throw error;
  }
}

export async function deleteLeaveRequestApi(leave_id) {
  try {
    const url = `${LEAVE_API_URL}/${leave_id}`;

    console.log(`[deleteLeaveRequestApi] DELETE request URL:`, url);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      console.error(`[deleteLeaveRequestApi] Error Response status:`, res.status);
      throw new Error(`Failed to delete leave. Status: ${res.status}`);
    }

    const text = await res.text();
    let json = {};
    if (text) {
      try { json = JSON.parse(text); } catch (e) { json = { message: text }; }
    }

    console.log(`[deleteLeaveRequestApi] API response:`, json);
    return json;
  } catch (error) {
    console.error('[deleteLeaveRequestApi] Error deleting leave:', error);
    throw error;
  }
}

const seedEmployees = [
  {
    id: 'EMP001',
    name: 'John Doe',
    role: 'Employee',
    department: 'Software Development',
    email: 'john.doe@company.com',
    phone: '+91 98765 43210',
    manager: 'Rajesh Kumar',
    status: 'Active',
    designation: 'Senior Software Engineer',
    joiningDate: '2024-01-15',
    location: 'Hyderabad, India',
    dob: '1992-03-12',
    bloodGroup: 'O+',
    emergencyContact: '+91 98765 43211',
    emergencyName: 'Jane Doe',
    relation: 'Spouse',
    address: '123, Main Street, Jubilee Hills, Hyderabad - 500033',
    education: 'B.Tech in Computer Science, IIT Hyderabad',
    skills: ['React', 'Node.js', 'Python', 'PostgreSQL'],
    linkedIn: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    resume: null,
    resumeName: null,
  },
  {
    id: 'EMP002',
    name: 'Alice Smith',
    role: 'Manager',
    department: 'Human Resources',
    email: 'alice.smith@company.com',
    phone: '+91 98765 43212',
    manager: 'Admin',
    status: 'Active',
    designation: 'HR Manager',
    joiningDate: '2023-06-01',
    location: 'Hyderabad, India',
    dob: '1988-07-22',
    bloodGroup: 'A+',
    emergencyContact: '+91 98765 43213',
    emergencyName: 'Bob Smith',
    relation: 'Spouse',
    address: '456, Park Avenue, Hyderabad - 500034',
    education: 'MBA in HR, XLRI Jamshedpur',
    skills: ['Recruitment', 'Payroll', 'Employee Relations'],
    linkedIn: 'https://linkedin.com/in/alicesmith',
    github: 'https://github.com/alicesmith',
    resume: null,
    resumeName: null,
  },
  {
    id: 'EMP003',
    name: 'Admin User',
    role: 'Admin',
    department: 'Administration',
    email: 'admin@company.com',
    phone: '+91 98765 43214',
    manager: '—',
    status: 'Active',
    designation: 'System Administrator',
    joiningDate: '2022-01-01',
    location: 'Hyderabad, India',
    dob: '1985-05-15',
    bloodGroup: 'B+',
    emergencyContact: '+91 98765 43215',
    emergencyName: 'Admin Emergency',
    relation: 'Brother',
    address: '789, Admin Road, Hyderabad - 500035',
    education: 'MCA, University of Hyderabad',
    skills: ['System Admin', 'Network Security', 'Cloud'],
    linkedIn: 'https://linkedin.com/in/admin',
    github: 'https://github.com/admin',
    resume: null,
    resumeName: null,
  },
];

const seedAttendance = [
  { employeeId: 'EMP001', date: new Date().toISOString().split('T')[0], checkIn: '09:15 AM', checkOut: '06:30 PM', status: 'Present' },
  { employeeId: 'EMP001', date: getPastDate(1), checkIn: '08:55 AM', checkOut: '06:15 PM', status: 'Present' },
  { employeeId: 'EMP001', date: getPastDate(2), checkIn: '09:30 AM', checkOut: '07:00 PM', status: 'Present' },
  { employeeId: 'EMP001', date: getPastDate(3), checkIn: '08:45 AM', checkOut: '05:45 PM', status: 'Present' },
  { employeeId: 'EMP001', date: getPastDate(4), checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'Present' },
  { employeeId: 'EMP001', date: getPastDate(5), checkIn: null, checkOut: null, status: 'Absent' },
  { employeeId: 'EMP001', date: getPastDate(6), checkIn: null, checkOut: null, status: 'Weekend' },
];

function getPastDate(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

const seedLeaveBalances = {
  EMP001: { annual: 18, sick: 12, personal: 5, annualUsed: 3, sickUsed: 1, personalUsed: 0, wfh: 10, wfhUsed: 2 },
  EMP002: { annual: 20, sick: 12, personal: 5, annualUsed: 5, sickUsed: 2, personalUsed: 1, wfh: 10, wfhUsed: 3 },
  EMP003: { annual: 20, sick: 12, personal: 5, annualUsed: 2, sickUsed: 0, personalUsed: 0, wfh: 10, wfhUsed: 1 },
};

const seedLeaveRequests = [
  { leaveId: 'L001', employeeId: 'EMP001', leaveType: 'Annual', startDate: '2026-08-10', endDate: '2026-08-12', reason: 'Family vacation', status: 'Pending', halfDay: false, wfh: false, appliedOn: '2026-07-01' },
  { leaveId: 'L002', employeeId: 'EMP002', leaveType: 'Sick', startDate: '2026-07-20', endDate: '2026-07-21', reason: 'Not feeling well', status: 'Approved', halfDay: false, wfh: false, appliedOn: '2026-07-19' },
  { leaveId: 'L003', employeeId: 'EMP003', leaveType: 'Personal', startDate: '2026-06-05', endDate: '2026-06-05', reason: 'Personal work', status: 'Rejected', halfDay: false, wfh: false, appliedOn: '2026-06-01' },
  { leaveId: 'L004', employeeId: 'EMP001', leaveType: 'WFH', startDate: '2026-07-10', endDate: '2026-07-10', reason: 'Work from home', status: 'Approved', halfDay: false, wfh: true, appliedOn: '2026-07-08' },
  { leaveId: 'L005', employeeId: 'EMP001', leaveType: 'Annual', startDate: '2026-07-25', endDate: '2026-07-25', reason: 'Half day - doctor appointment', status: 'Pending', halfDay: true, wfh: false, appliedOn: '2026-07-20' },
];

const seedExpenses = [];

const seedHolidays = [
  { date: '2026-01-26', name: 'Republic Day' },
  { date: '2026-03-29', name: 'Holi' },
  { date: '2026-05-01', name: 'Labor Day' },
  { date: '2026-10-02', name: 'Gandhi Jayanti' },
  { date: '2026-10-22', name: 'Dussehra' },
  { date: '2026-11-12', name: 'Diwali' },
  { date: '2026-11-15', name: 'Diwali Holiday' },
  { date: '2026-09-14', name: 'Ganesh Chathurdasi' },
  { date: '2026-12-25', name: 'Christmas' },
];

const seedDocuments = [
  { id: "DOC-2026-0001", employeeId: "EMP001", type: "Resume", fileName: "resume.pdf", status: "Uploaded", size: "1.2 MB" },
  { id: "DOC-2026-0002", employeeId: "EMP002", type: "ID Proof", fileName: "aadhar.pdf", status: "Uploaded", size: "0.8 MB" },
  { id: "DOC-2026-0003", employeeId: "EMP003", type: "Certification", fileName: "certificate.pdf", status: "Uploaded", size: "2.1 MB" },
];

function init() {
  if (!localStorage.getItem('expenses_cleared_v1')) {
    localStorage.removeItem(KEYS.EXPENSES);
    localStorage.setItem('expenses_cleared_v1', 'true');
  }

  if (!localStorage.getItem(KEYS.EMPLOYEES)) {
    localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(seedEmployees));
  }
  if (!localStorage.getItem(KEYS.ATTENDANCE)) {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(seedAttendance));
  }
  if (!localStorage.getItem(KEYS.LEAVE_BALANCES)) {
    localStorage.setItem(KEYS.LEAVE_BALANCES, JSON.stringify(seedLeaveBalances));
  }
  if (!localStorage.getItem(KEYS.LEAVE_REQUESTS)) {
    localStorage.setItem(KEYS.LEAVE_REQUESTS, JSON.stringify(seedLeaveRequests));
  } else {
    // Cleanup stuck local test data for the user
    try {
      const leaves = JSON.parse(localStorage.getItem(KEYS.LEAVE_REQUESTS) || '[]');
      const cleaned = leaves.filter(l => l.reason !== 'rdrh');
      if (leaves.length !== cleaned.length) {
        localStorage.setItem(KEYS.LEAVE_REQUESTS, JSON.stringify(cleaned));
      }
    } catch (e) { }
  }
  if (!localStorage.getItem(KEYS.EXPENSES)) {
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(seedExpenses));
  }
  if (!localStorage.getItem(KEYS.HOLIDAYS)) {
    localStorage.setItem(KEYS.HOLIDAYS, JSON.stringify(seedHolidays));
  }
  if (!localStorage.getItem(KEYS.DOCUMENTS)) {
    localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(seedDocuments));
  }
}

export function getEmployees() {
  init();
  return JSON.parse(localStorage.getItem(KEYS.EMPLOYEES) || '[]');
}

const API_BASE_URL = 'https://zwfgsom5dk.execute-api.ap-south-1.amazonaws.com';

export async function getEmployee(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch employee: ${response.status}`);
    }
    let data = await response.json();

    // Handle potential AWS response wrappers
    if (data.statusCode && data.body) {
      data = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
    } else if (data.Item) {
      data = data.Item;
    } else if (data.body) {
      data = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
    }

    // Check if DynamoDB typed format is returned (e.g., { empid: { S: "123" } })
    if (data && Object.keys(data).length > 0 && typeof data[Object.keys(data)[0]] === 'object' && ('S' in data[Object.keys(data)[0]] || 'N' in data[Object.keys(data)[0]])) {
      const unwrapped = {};
      for (const key in data) {
        const val = data[key];
        unwrapped[key] = val.S !== undefined ? val.S : (val.N !== undefined ? Number(val.N) : (val.BOOL !== undefined ? val.BOOL : val));
      }
      data = unwrapped;
    }

    // Convert response into a single employee object expected by Profile.jsx
    const emp = {
      empid: data.empid || id,
      Title: data.Title || '',
      FullName: data.FullName || '',
      DateOfBirth: data.DateOfBirth || '',
      BloodGroup: data.BloodGroup || '',
      Phone: data.Phone || '',
      Email: data.Email || '',
      Address: data.Address || '',
      Department: data.Department || '',
      Designation: data.Designation || '',
      JoiningDate: data.JoiningDate || '',
      Manager: data.Manager || '',
      Status: data.Status || '',
      EmergencyContactName: data.EmergencyContactName || '',
      EmergencyContactPhone: data.EmergencyContactPhone || '',
      EmergencyContactRelation: data.EmergencyContactRelation || '',
      Education: data.Education || '',
      Skills: data.Skills || '',
      LinkedIn: data.LinkedIn || '',
      GitHub: data.GitHub || '',
      Role: data.Role || '',
      Password: data.Password || '',
      profileImage: data.profileImage || null,
      resume: data.resume || null,
      resumeName: data.resumeName || null
    };

    return emp;
  } catch (error) {
    console.error('Error fetching employee:', error);
    return null;
  }
}

export async function saveEmployee(employee) {
  try {
    const empid = employee.empid;

    // Create the exact payload expected by the backend
    const payload = {
      empid: employee.empid,
      Title: employee.Title,
      FullName: employee.FullName,
      DateOfBirth: employee.DateOfBirth,
      BloodGroup: employee.BloodGroup,
      Phone: employee.Phone,
      Email: employee.Email,
      Address: employee.Address,
      Department: employee.Department,
      Designation: employee.Designation,
      JoiningDate: employee.JoiningDate,
      Manager: employee.Manager,
      Status: employee.Status,
      EmergencyContactName: employee.EmergencyContactName,
      EmergencyContactPhone: employee.EmergencyContactPhone,
      EmergencyContactRelation: employee.EmergencyContactRelation,
      Education: employee.Education,
      Skills: employee.Skills,
      LinkedIn: employee.LinkedIn,
      GitHub: employee.GitHub,
      Role: employee.Role,
      Password: employee.Password
    };

    if (employee.profileImage !== undefined) payload.profileImage = employee.profileImage;
    if (employee.resume !== undefined) payload.resume = employee.resume;
    if (employee.resumeName !== undefined) payload.resumeName = employee.resumeName;
    if (employee.fileName !== undefined) payload.fileName = employee.fileName;
    if (employee.fileContent !== undefined) payload.fileContent = employee.fileContent;

    const response = await fetch(`${API_BASE_URL}/employees/${empid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`Failed to save employee: ${response.status}`);
    }
    return employee;
  } catch (error) {
    console.error('Error saving employee:', error);
    throw error;
  }
}

export function getAttendance(employeeId) {
  init();
  const all = JSON.parse(localStorage.getItem(KEYS.ATTENDANCE) || '[]');
  return all.filter(a => a.employeeId === employeeId);
}

export function getTodayAttendance(employeeId) {
  const today = new Date().toISOString().split('T')[0];
  const records = getAttendance(employeeId);
  return records.find(a => a.date === today) || null;
}

export function getLeaveBalances(employeeId) {
  init();
  const all = JSON.parse(localStorage.getItem(KEYS.LEAVE_BALANCES) || '{}');
  return all[employeeId] || { annual: 18, sick: 12, personal: 5, annualUsed: 0, sickUsed: 0, personalUsed: 0, wfh: 10, wfhUsed: 0 };
}

export function getLeaveRequests(employeeId) {
  init();
  const all = JSON.parse(localStorage.getItem(KEYS.LEAVE_REQUESTS) || '[]');
  return all.filter(l => l.employeeId === employeeId);
}

export function getAllLeaveRequests() {
  init();
  return JSON.parse(localStorage.getItem(KEYS.LEAVE_REQUESTS) || '[]');
}

export function addLeaveRequest(leave) {
  const all = getAllLeaveRequests();
  all.push(leave);
  localStorage.setItem(KEYS.LEAVE_REQUESTS, JSON.stringify(all));
  return leave;
}

export function deleteLeaveRequestLocal(leaveId) {
  const all = getAllLeaveRequests();
  const filtered = all.filter(l => l.leaveId !== leaveId && l.leave_id !== leaveId);
  localStorage.setItem(KEYS.LEAVE_REQUESTS, JSON.stringify(filtered));
  return filtered;
}

export function updateLeaveStatus(leaveId, status) {
  const all = getAllLeaveRequests();
  const updated = all.map(l => l.leaveId === leaveId ? { ...l, status } : l);
  localStorage.setItem(KEYS.LEAVE_REQUESTS, JSON.stringify(updated));
  return updated;
}

const EXPENSE_API_URL = 'https://d1il4l97ib.execute-api.ap-south-1.amazonaws.com/expense';

export async function getExpenses(employeeId) {
  if (!employeeId) {
    console.error("getExpenses Error: employeeId is undefined");
    return [];
  }

  console.log("getExpenses: using empid =", employeeId);
  const url = `${EXPENSE_API_URL}/employee/${employeeId}`;
  console.log("Request URL:", url);
  console.log("Request Method: GET");
  try {
    const res = await fetch(url);
    console.log("API Response (getExpenses):", res.status);
    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error(`Failed to fetch expenses: ${res.status}`);
    }
    const data = await res.json();
    const items = data.Items || data;

    return (Array.isArray(items) ? items : [items]).map(item => ({
      id: item.expid?.S || item.id,
      employeeId: item.empid?.S || item.employeeId,
      expenseType: item.expenseType?.S || item.category?.S || item.expenseType,
      amount: item.amount?.S ? parseFloat(item.amount.S) : (item.amount?.N ? parseFloat(item.amount.N) : item.amount),
      date: item.expenseDate?.S || item.date?.S || item.date,
      description: item.description?.S || item.description,
      project: item.project?.S || item.project,
      meeting: item.meeting?.S || item.meeting,
      paymentMode: item.paymentMode?.S || item.paymentMode,
      status: item.status?.S || item.status,
      receipt: item.attachmentUrl?.S || item.receipt
    }));
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
}

export async function getAllExpenses() {
  const url = `${EXPENSE_API_URL}/ALL`;
  console.log("Request URL:", url);
  console.log("Request Method: GET");
  try {
    const res = await fetch(url);
    console.log("API Response (getAllExpenses):", res.status);
    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error(`Failed to fetch all expenses: ${res.status}`);
    }
    const data = await res.json();
    const items = data.Items || data;

    return (Array.isArray(items) ? items : [items]).map(item => ({
      id: item.expid?.S || item.id,
      employeeId: item.empid?.S || item.employeeId,
      expenseType: item.expenseType?.S || item.category?.S || item.expenseType,
      amount: item.amount?.S ? parseFloat(item.amount.S) : (item.amount?.N ? parseFloat(item.amount.N) : item.amount),
      date: item.expenseDate?.S || item.date?.S || item.date,
      description: item.description?.S || item.description,
      project: item.project?.S || item.project,
      meeting: item.meeting?.S || item.meeting,
      paymentMode: item.paymentMode?.S || item.paymentMode,
      status: item.status?.S || item.status,
      receipt: item.attachmentUrl?.S || item.receipt
    }));
  } catch (error) {
    console.error('Error fetching all expenses:', error);
    return [];
  }
}

export async function getManagerExpenses(managerId) {
  if (!managerId) return [];
  const url = `${EXPENSE_API_URL}/manager/${managerId}`;
  console.log("Manager ID:", managerId);
  console.log("Expense API URL:", url);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error(`Failed to fetch expenses: ${res.status}`);
    }
    const data = await res.json();
    console.log("Expense Response:", data);
    
    const items = data.Items || data;
    return (Array.isArray(items) ? items : [items]).map(item => ({
      id: item.expid?.S || item.id,
      employeeId: item.empid?.S || item.employeeId,
      employeeName: item.employeeName?.S || item.employeeName || item.empid?.S || item.empid, // Fallback to id if name is missing
      expenseType: item.expenseType?.S || item.category?.S || item.category || item.expenseType,
      amount: item.amount?.S ? parseFloat(item.amount.S) : (item.amount?.N ? parseFloat(item.amount.N) : item.amount),
      date: item.expenseDate?.S || item.date?.S || item.date,
      description: item.description?.S || item.description,
      project: item.project?.S || item.project,
      meeting: item.meeting?.S || item.meeting,
      paymentMode: item.paymentMode?.S || item.paymentMode,
      status: item.status?.S || item.status,
      receipt: item.attachmentUrl?.S || item.attachmentUrl || item.receipt
    }));
  } catch (error) {
    console.error('Error fetching manager expenses:', error);
    return [];
  }
}

export async function addExpense(expense) {
  const payload = {
    expid: { S: expense.id },
    empid: { S: expense.employeeId },
    expenseType: { S: expense.expenseType },
    amount: { S: expense.amount.toString() },
    expenseDate: { S: expense.date },
    description: { S: expense.description },
    status: { S: expense.status || 'Pending' },
    paymentMode: { S: expense.paymentMode },
    project: { S: expense.project },
    meeting: { S: expense.meeting || "" }
  };

  if (expense.receipt && expense.receiptName) {
    payload.fileName = expense.receiptName;
    payload.fileContent = expense.receipt; // Contains the Base64 string from FileReader
  }

  const url = EXPENSE_API_URL;
  console.log("Request URL:", url);
  console.log("Request Method: POST");
  console.log("Request Payload:", JSON.stringify(payload, null, 2));

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log("API Response (addExpense):", res.status);
    if (!res.ok) throw new Error(`Failed to add expense: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
}

export async function updateExpenseStatus(id, status, empid) {
  if (!id) {
    console.error("updateExpenseStatus Error: expid is undefined", { id });
    return;
  }
  const payload = {
    status: status
  };

  const url = `${EXPENSE_API_URL}/${id}`;
  console.log("Request URL:", url);
  console.log("Request Method: PUT");
  console.log("Request Payload:", JSON.stringify(payload, null, 2));

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log("API Response (updateExpenseStatus):", res.status);
    if (!res.ok) throw new Error(`Failed to update expense: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
}

export async function deleteExpense(id) {
  if (!id) {
    console.error("deleteExpense Error: expid is undefined");
    return;
  }
  const url = `${EXPENSE_API_URL}/${id}`;
  console.log("Request URL:", url);
  console.log("Request Method: DELETE");

  try {
    const res = await fetch(url, {
      method: 'DELETE'
    });
    console.log("API Response (deleteExpense):", res.status);

    if (!res.ok) {
      throw new Error(`Failed to delete expense: ${res.status}`);
    }

    // Fallback: Also remove from local storage if the frontend is still partly relying on it
    const all = JSON.parse(localStorage.getItem(KEYS.EXPENSES) || '[]');
    const filtered = all.filter(e => e.id !== id);
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(filtered));

    return true;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
}

export function getHolidays() {
  init();
  return JSON.parse(localStorage.getItem(KEYS.HOLIDAYS) || '[]');
}

export function getCurrentUser() {
  const stored = localStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
}

export function getNextId(prefix, existing) {
  const nums = existing.map(e => {
    const n = parseInt(e.id?.replace(prefix, '') || e.leaveId?.replace('L', '') || '0');
    return isNaN(n) ? 0 : n;
  });
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

export function getNextLeaveId() {
  const all = getAllLeaveRequests();
  const nums = all.map(l => parseInt(l.leaveId.replace('L', '')) || 0);
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `L${String(max + 1).padStart(3, '0')}`;
}

export function getNextExpenseId() {
  const all = getAllExpenses();
  const nums = all.map(e => parseInt(e.id.replace('EXP', '')) || 0);
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `EXP${String(max + 1).padStart(3, '0')}`;
}

export function getAllDocuments() {
  init();
  return JSON.parse(localStorage.getItem(KEYS.DOCUMENTS) || '[]');
}

export function getDocuments(employeeId) {
  const all = getAllDocuments();
  return all.filter(d => d.employeeId === employeeId);
}

export function addDocument(doc) {
  const all = getAllDocuments();
  all.push(doc);
  localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(all));
  return doc;
}

export function deleteDocument(id) {
  const all = getAllDocuments();
  const filtered = all.filter(d => d.id !== id);
  localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(filtered));
}

export function getNextDocId() {
  const all = getAllDocuments();
  const year = new Date().getFullYear();
  const prefix = `DOC-${year}-`;
  const nums = all.map(d => {
    if (d.id.startsWith(prefix)) {
      return parseInt(d.id.replace(prefix, '')) || 0;
    }
    return 0;
  });
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
}
