import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function Leave() {
  const [showForm, setShowForm] = useState(false);

  const [leaveRequests, setLeaveRequests] = useState([
    {
      leaveId: "L001",
      employeeId: "EMP1001",
      startDate: "2026-08-10",
      endDate: "2026-08-12",
      reason: "Vacation",
      status: "Pending",
    },
  ]);

  const [employeeId, setEmployeeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const handleApply = () => {
    if (
      employeeId === "" ||
      startDate === "" ||
      endDate === "" ||
      reason === ""
    ) {
      alert("Please fill all fields");
      return;
    }

    const newLeave = {
      leaveId: "L00" + (leaveRequests.length + 1),
      employeeId,
      startDate,
      endDate,
      reason,
      status: "Pending",
    };

    setLeaveRequests([...leaveRequests, newLeave]);

    setEmployeeId("");
    setStartDate("");
    setEndDate("");
    setReason("");

    setShowForm(false);
  };

  return (
    <div>
      <Navbar />

      <div style={{ display: "flex" }}>
        <Sidebar />

        <div style={{ padding: "30px", flex: 1 }}>
          <h2>Leave Management</h2>

          <hr />

          <button onClick={() => setShowForm(!showForm)}>
            Apply Leave
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
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <br />
              <br />

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />

              <br />
              <br />

              <textarea
                placeholder="Reason"
                rows="3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <br />
              <br />

              <button onClick={handleApply}>
                Submit Leave
              </button>
            </div>
          )}

          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Leave ID</th>
                <th>Employee ID</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {leaveRequests.map((leave) => (
                <tr key={leave.leaveId}>
                  <td>{leave.leaveId}</td>
                  <td>{leave.employeeId}</td>
                  <td>{leave.startDate}</td>
                  <td>{leave.endDate}</td>
                  <td>{leave.reason}</td>
                  <td>{leave.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}

export default Leave;