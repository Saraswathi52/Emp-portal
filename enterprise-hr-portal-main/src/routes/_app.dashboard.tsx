import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, CalendarDays, Receipt, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { employeesSeed, leavesSeed, expensesSeed, documentsSeed } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

const stats = [
  { label: "Total Employees", value: employeesSeed.length, icon: Users, tint: "bg-blue-50 text-blue-600", to: "/employees" },
  { label: "Pending Leave Requests", value: leavesSeed.filter(l => l.status === "Pending").length, icon: CalendarDays, tint: "bg-amber-50 text-amber-600", to: "/leave" },
  { label: "Pending Expense Claims", value: expensesSeed.filter(e => e.status === "Pending").length, icon: Receipt, tint: "bg-emerald-50 text-emerald-600", to: "/expenses" },
  { label: "Uploaded Documents", value: documentsSeed.length, icon: FileText, tint: "bg-violet-50 text-violet-600", to: "/documents" },
] as const;

function Dashboard() {
  const activePct = Math.round((employeesSeed.filter(e => e.status === "Active").length / employeesSeed.length) * 100);
  const recentLeaves = leavesSeed.slice(0, 4);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Overview</h2>
        <p className="text-sm text-slate-500 mt-1">Snapshot of your organization for July 2026.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <Link key={s.label} to={s.to} className="block">
            <Card className="hover:shadow-md transition-shadow border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{s.label}</p>
                    <p className="text-3xl font-semibold text-slate-900 mt-2">{s.value}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-md grid place-items-center ${s.tint}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100">
              {recentLeaves.map(l => (
                <div key={l.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{l.employee}</p>
                    <p className="text-xs text-slate-500 truncate">{l.type} · {l.start} → {l.end}</p>
                  </div>
                  <Badge variant="outline" className={
                    l.status === "Approved" ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : l.status === "Rejected" ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                  }>{l.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" /> Workforce Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Active employees</span>
                <span className="font-medium text-slate-900">{activePct}%</span>
              </div>
              <Progress value={activePct} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Leave utilization</span>
                <span className="font-medium text-slate-900">42%</span>
              </div>
              <Progress value={42} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Expense approvals</span>
                <span className="font-medium text-slate-900">68%</span>
              </div>
              <Progress value={68} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
