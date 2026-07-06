import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function EmployeeManagement() {
  const [showForm, setShowForm] = useState(false);

  const [employees, setEmployees] = useState([
    {
      id: "EMP1001",
      name: "John Doe",
      department: "IT",
      role: "Employee",
    },
    {
      id: "EMP1002",
      name: "Alice Smith",
      department: "HR",
      role: "Manager",
    },
    {
      id: "EMP1003",
      name: "David Lee",
      department: "Finance",
      role: "Employee",
    },
  ]);

  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [editId, setEditId] = useState(null);

 const handleSave = () => {
  if (
    employeeId === "" ||
    employeeName === "" ||
    department === "" ||
    role === ""
  ) {
    alert("Please fill all fields");
    return;
  }

  const newEmployee = {
  id: employeeId,
  name: employeeName,
  department: department,
  role: role,
};

if (editId) {
  const updatedEmployees = employees.map((employee) =>
    employee.id === editId ? newEmployee : employee
  );

  setEmployees(updatedEmployees);
  setEditId(null);
} else {
  setEmployees([...employees, newEmployee]);
}

  setEmployeeId("");
  setEmployeeName("");
  setDepartment("");
  setRole("");

  setShowForm(false);
};

const handleDelete = (id) => {
  const updatedEmployees = employees.filter(
    (employee) => employee.id !== id
  );

  setEmployees(updatedEmployees);
};
const handleEdit = (employee) => {
  setEmployeeId(employee.id);
  setEmployeeName(employee.name);
  setDepartment(employee.department);
  setRole(employee.role);

  setEditId(employee.id);
  setShowForm(true);
};

  return (
    <div>
      <Navbar />

      <div style={{ display: "flex" }}>
        <Sidebar />

        <div style={{ padding: "30px", flex: 1 }}>
          <h2>Employee Management</h2>

          <hr />

          <button onClick={() => setShowForm(!showForm)}>
            Add Employee
          </button>

          <br />
          <br />

          {showForm && (
            <div style={{ marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />

              <br />
              <br />

              <input
                type="text"
                placeholder="Employee Name"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
              />

              <br />
              <br />

              <input
                type="text"
                placeholder="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />

              <br />
              <br />

              <input
                type="text"
                placeholder="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />

              <br />
              <br />

              <button onClick={handleSave}>
                Save Employee
              </button>
            </div>
          )}

          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.id}</td>
                  <td>{employee.name}</td>
                  <td>{employee.department}</td>
                  <td>{employee.role}</td>

                 <td>
                    <button onClick={() => handleEdit(employee)}>
                    Edit
                    </button>

                     {" "}

                     <button onClick={() => handleDelete(employee.id)}>
                     Delete
                     </button>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EmployeeManagement;