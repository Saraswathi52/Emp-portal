import fs from 'fs';

const API_URL = 'https://d1il4l97ib.execute-api.ap-south-1.amazonaws.com/expense';

async function clearAllExpenses() {
  const employees = ['EMP1001', 'EMP001', 'EMP002', 'EMP003', 'EMP1002'];
  for (const employeeId of employees) {
    try {
      console.log(`Fetching expenses for ${employeeId}...`);
      const res = await fetch(`${API_URL}/employee/${employeeId}`);
      if (!res.ok) continue;
      const data = await res.json();
      const items = Array.isArray(data.Items) ? data.Items : (Array.isArray(data) ? data : []);
      
      for (const item of items) {
        const expid = item.expid?.S || item.expid || item.id;
        if (expid) {
          console.log(`Deleting ${expid}...`);
          await fetch(`${API_URL}/${expid}`, { method: 'DELETE' });
        }
      }
    } catch (err) {
      console.error("Error for", employeeId, ":", err.message);
    }
  }
  console.log("Done checking and deleting.");
}

clearAllExpenses();
