import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function ExpenseManagement() {
  const [showForm, setShowForm] = useState(false);

  const [expenses, setExpenses] = useState([
    {
      id: "EXP001",
      category: "Travel",
      amount: "2500",
      description: "Client Meeting",
      status: "Pending",
    },
    {
      id: "EXP002",
      category: "Food",
      amount: "800",
      description: "Team Lunch",
      status: "Approved",
    },
    {
      id: "EXP003",
      category: "Accommodation",
      amount: "4500",
      description: "Business Trip",
      status: "Rejected",
    },
  ]);

  const [expenseId, setExpenseId] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (
      expenseId === "" ||
      category === "" ||
      amount === "" ||
      description === ""
    ) {
      alert("Please fill all fields");
      return;
    }

    const newExpense = {
      id: expenseId,
      category,
      amount,
      description,
      status: "Pending",
    };

    setExpenses([...expenses, newExpense]);

    setExpenseId("");
    setCategory("");
    setAmount("");
    setDescription("");

    setShowForm(false);
  };

  const handleDelete = (id) => {
    const updatedExpenses = expenses.filter(
      (expense) => expense.id !== id
    );

    setExpenses(updatedExpenses);
  };

  return (
    <div>
      <Navbar />

      <div style={{ display: "flex" }}>
        <Sidebar />

        <div style={{ padding: "30px", flex: 1 }}>
          <h2>Expense Management</h2>

          <hr />

          <button onClick={() => setShowForm(!showForm)}>
            Add Expense
          </button>

          <br />
          <br />

          {showForm && (
            <div style={{ marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="Expense ID"
                value={expenseId}
                onChange={(e) => setExpenseId(e.target.value)}
              />

              <br /><br />

              <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />

              <br /><br />

              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <br /><br />

              <textarea
                placeholder="Description"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <br /><br />

              <button onClick={handleSave}>
                Save Expense
              </button>
            </div>
          )}

          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Expense ID</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.id}</td>
                  <td>{expense.category}</td>
                  <td>₹{expense.amount}</td>
                  <td>{expense.description}</td>
                  <td>{expense.status}</td>
                  <td>
                    <button onClick={() => handleDelete(expense.id)}>
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

export default ExpenseManagement;