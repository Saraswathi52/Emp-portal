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

const seedExpenses = [
  { id: 'EXP001', employeeId: 'EMP001', expenseType: 'Travel', amount: 2500, date: '2026-07-01', description: 'Client meeting - Hyderabad to Bangalore', project: 'Project Alpha', meeting: 'Client Review Meeting', paymentMode: 'Corporate Card', status: 'Pending', receipt: null, receiptName: null },
  { id: 'EXP002', employeeId: 'EMP001', expenseType: 'Food', amount: 800, date: '2026-06-28', description: 'Team lunch - Sprint completion', project: 'Project Beta', meeting: 'Sprint Retrospective', paymentMode: 'Cash', status: 'Approved', receipt: null, receiptName: null },
  { id: 'EXP003', employeeId: 'EMP002', expenseType: 'Accommodation', amount: 4500, date: '2026-06-15', description: 'Business trip - Pune office', project: 'Project Alpha', meeting: 'Quarterly Review', paymentMode: 'Corporate Card', status: 'Rejected', receipt: null, receiptName: null },
  { id: 'EXP004', employeeId: 'EMP001', expenseType: 'Transport', amount: 1200, date: '2026-07-05', description: 'Site visit - client location', project: 'Project Gamma', meeting: 'Site Assessment', paymentMode: 'Personal', status: 'Pending', receipt: null, receiptName: null },
  { id: 'EXP005', employeeId: 'EMP003', expenseType: 'Office Supplies', amount: 3500, date: '2026-06-20', description: 'Stationery and printer cartridges', project: 'General', meeting: '', paymentMode: 'Corporate Card', status: 'Approved', receipt: null, receiptName: null },
];

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

export function getEmployee(id) {
  return getEmployees().find(e => e.id === id) || null;
}

export function saveEmployee(employee) {
  const employees = getEmployees();
  const idx = employees.findIndex(e => e.id === employee.id);
  if (idx >= 0) {
    employees[idx] = { ...employees[idx], ...employee };
  } else {
    employees.push(employee);
  }
  localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(employees));
  return employee;
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

export function updateLeaveStatus(leaveId, status) {
  const all = getAllLeaveRequests();
  const updated = all.map(l => l.leaveId === leaveId ? { ...l, status } : l);
  localStorage.setItem(KEYS.LEAVE_REQUESTS, JSON.stringify(updated));
  return updated;
}

export function getExpenses(employeeId) {
  init();
  const all = JSON.parse(localStorage.getItem(KEYS.EXPENSES) || '[]');
  return all.filter(e => e.employeeId === employeeId);
}

export function getAllExpenses() {
  init();
  return JSON.parse(localStorage.getItem(KEYS.EXPENSES) || '[]');
}

export function addExpense(expense) {
  const all = getAllExpenses();
  all.push(expense);
  localStorage.setItem(KEYS.EXPENSES, JSON.stringify(all));
  return expense;
}

export function updateExpenseStatus(id, status) {
  const all = getAllExpenses();
  const updated = all.map(e => e.id === id ? { ...e, status } : e);
  localStorage.setItem(KEYS.EXPENSES, JSON.stringify(updated));
  return updated;
}

export function deleteExpense(id) {
  const all = getAllExpenses();
  const filtered = all.filter(e => e.id !== id);
  localStorage.setItem(KEYS.EXPENSES, JSON.stringify(filtered));
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
