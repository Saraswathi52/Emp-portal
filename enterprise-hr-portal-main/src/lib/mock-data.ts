export type Employee = {
  id: string;
  name: string;
  department: string;
  role: string;
  manager: string;
  email: string;
  status: "Active" | "On Leave" | "Inactive";
};

export type LeaveRequest = {
  id: string;
  employee: string;
  type: "Annual" | "Sick" | "Personal" | "Unpaid";
  start: string;
  end: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
};

export type Expense = {
  id: string;
  employee: string;
  category: "Travel" | "Meals" | "Software" | "Office" | "Training";
  amount: number;
  receipt: string;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
};

export type Document = {
  id: string;
  name: string;
  type: "PDF" | "Image" | "Spreadsheet" | "Word";
  uploaded: string;
  size: string;
};

export const employeesSeed: Employee[] = [
  { id: "EMP-1001", name: "Aarav Sharma", department: "Engineering", role: "Software Engineer", manager: "Priya Nair", email: "aarav.sharma@company.com", status: "Active" },
  { id: "EMP-1002", name: "Priya Nair", department: "Engineering", role: "Engineering Manager", manager: "Rahul Verma", email: "priya.nair@company.com", status: "Active" },
  { id: "EMP-1003", name: "Diego Alvarez", department: "Design", role: "Product Designer", manager: "Sofia Kim", email: "diego.alvarez@company.com", status: "Active" },
  { id: "EMP-1004", name: "Sofia Kim", department: "Design", role: "Design Lead", manager: "Rahul Verma", email: "sofia.kim@company.com", status: "Active" },
  { id: "EMP-1005", name: "Emma Thompson", department: "Marketing", role: "Marketing Specialist", manager: "James Carter", email: "emma.thompson@company.com", status: "On Leave" },
  { id: "EMP-1006", name: "James Carter", department: "Marketing", role: "Marketing Director", manager: "Rahul Verma", email: "james.carter@company.com", status: "Active" },
  { id: "EMP-1007", name: "Yuki Tanaka", department: "Finance", role: "Financial Analyst", manager: "Olivia Brown", email: "yuki.tanaka@company.com", status: "Active" },
  { id: "EMP-1008", name: "Olivia Brown", department: "Finance", role: "Finance Manager", manager: "Rahul Verma", email: "olivia.brown@company.com", status: "Active" },
  { id: "EMP-1009", name: "Mateo Rossi", department: "Operations", role: "Operations Analyst", manager: "Chen Wei", email: "mateo.rossi@company.com", status: "Inactive" },
  { id: "EMP-1010", name: "Chen Wei", department: "Operations", role: "Operations Manager", manager: "Rahul Verma", email: "chen.wei@company.com", status: "Active" },
  { id: "EMP-1011", name: "Fatima Al-Hassan", department: "HR", role: "HR Business Partner", manager: "Rahul Verma", email: "fatima.hassan@company.com", status: "Active" },
  { id: "EMP-1012", name: "Rahul Verma", department: "Executive", role: "Chief Operating Officer", manager: "—", email: "rahul.verma@company.com", status: "Active" },
];

export const leavesSeed: LeaveRequest[] = [
  { id: "LV-2001", employee: "Aarav Sharma", type: "Annual", start: "2026-07-14", end: "2026-07-18", reason: "Family vacation", status: "Pending" },
  { id: "LV-2002", employee: "Emma Thompson", type: "Sick", start: "2026-07-06", end: "2026-07-09", reason: "Flu recovery", status: "Approved" },
  { id: "LV-2003", employee: "Diego Alvarez", type: "Personal", start: "2026-07-22", end: "2026-07-22", reason: "Personal errand", status: "Pending" },
  { id: "LV-2004", employee: "Yuki Tanaka", type: "Annual", start: "2026-08-01", end: "2026-08-10", reason: "Trip abroad", status: "Pending" },
  { id: "LV-2005", employee: "Mateo Rossi", type: "Unpaid", start: "2026-06-20", end: "2026-06-25", reason: "Family matter", status: "Rejected" },
];

export const expensesSeed: Expense[] = [
  { id: "EX-3001", employee: "Aarav Sharma", category: "Travel", amount: 482.5, receipt: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=60", status: "Pending", date: "2026-07-01" },
  { id: "EX-3002", employee: "Sofia Kim", category: "Software", amount: 129.0, receipt: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=60", status: "Approved", date: "2026-06-28" },
  { id: "EX-3003", employee: "Emma Thompson", category: "Meals", amount: 76.2, receipt: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=60", status: "Pending", date: "2026-07-03" },
  { id: "EX-3004", employee: "Yuki Tanaka", category: "Training", amount: 950.0, receipt: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=60", status: "Pending", date: "2026-07-04" },
  { id: "EX-3005", employee: "Chen Wei", category: "Office", amount: 210.75, receipt: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=60", status: "Rejected", date: "2026-06-25" },
];

export const documentsSeed: Document[] = [
  { id: "DOC-01", name: "Employee Handbook 2026.pdf", type: "PDF", uploaded: "2026-01-12", size: "2.4 MB" },
  { id: "DOC-02", name: "Q2 Financial Report.pdf", type: "PDF", uploaded: "2026-06-30", size: "1.1 MB" },
  { id: "DOC-03", name: "Office Floor Plan.png", type: "Image", uploaded: "2026-03-04", size: "820 KB" },
  { id: "DOC-04", name: "Payroll July.xlsx", type: "Spreadsheet", uploaded: "2026-07-01", size: "312 KB" },
  { id: "DOC-05", name: "Onboarding Checklist.docx", type: "Word", uploaded: "2026-05-15", size: "98 KB" },
  { id: "DOC-06", name: "Security Policy.pdf", type: "PDF", uploaded: "2026-02-20", size: "540 KB" },
];

export const departments = ["Engineering", "Design", "Marketing", "Finance", "Operations", "HR", "Executive"];
