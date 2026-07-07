import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { employeesSeed, leavesSeed, expensesSeed, departments } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const totalPayroll = 128400;
  const approvedExpenses = expensesSeed.filter(e => e.status === "Approved").reduce((s, e) => s + e.amount, 0);
  const approvedLeaves = leavesSeed.filter(l => l.status === "Approved").length;

  const byDept = departments.map(d => ({
    dept: d,
    count: employeesSeed.filter(e => e.department === d).length,
  }));

  const stats = [
    { label: "Headcount", value: employeesSeed.length },
    { label: "Approved Leaves (MTD)", value: approvedLeaves },
    { label: "Approved Expenses (USD)", value: `$${approvedExpenses.toFixed(2)}` },
    { label: "Monthly Payroll", value: `$${totalPayroll.toLocaleString()}` },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Reports</h2>
        <p className="text-sm text-slate-500 mt-1">High-level organizational metrics.</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label} className="border-slate-200">
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="text-2xl font-semibold text-slate-900 mt-2">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Headcount by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Department</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byDept.map(d => {
                const pct = Math.round((d.count / employeesSeed.length) * 100);
                return (
                  <TableRow key={d.dept}>
                    <TableCell className="font-medium text-slate-900">{d.dept}</TableCell>
                    <TableCell>{d.count}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-500 w-8">{pct}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
