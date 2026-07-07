import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { leavesSeed, type LeaveRequest } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/leave")({
  component: LeavePage,
});

const empty: LeaveRequest = { id: "", employee: "", type: "Annual", start: "", end: "", reason: "", status: "Pending" };

function LeavePage() {
  const [rows, setRows] = useState<LeaveRequest[]>(leavesSeed);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LeaveRequest>(empty);

  const setStatus = (id: string, status: LeaveRequest["status"]) => {
    setRows(rs => rs.map(r => (r.id === id ? { ...r, status } : r)));
    toast.success(`Request ${status.toLowerCase()}`);
  };

  const apply = () => {
    if (!form.employee || !form.start || !form.end) {
      toast.error("Fill required fields");
      return;
    }
    const id = `LV-${2000 + rows.length + 1}`;
    setRows(rs => [{ ...form, id, status: "Pending" }, ...rs]);
    toast.success("Leave request submitted");
    setOpen(false);
    setForm(empty);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Leave Management</h2>
          <p className="text-sm text-slate-500 mt-1">Review and manage employee leave requests.</p>
        </div>
        <Button onClick={() => { setForm(empty); setOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Apply Leave
        </Button>
      </div>

      <Card className="border-slate-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Employee</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium text-slate-900">{r.employee}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell className="text-slate-600">{r.start}</TableCell>
                <TableCell className="text-slate-600">{r.end}</TableCell>
                <TableCell className="max-w-[240px] truncate text-slate-600">{r.reason}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    r.status === "Approved" ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : r.status === "Rejected" ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                  }>{r.status}</Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" disabled={r.status === "Approved"}
                    onClick={() => setStatus(r.id, "Approved")}
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    <Check className="h-3.5 w-3.5 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" disabled={r.status === "Rejected"}
                    onClick={() => setStatus(r.id, "Rejected")}
                    className="border-rose-200 text-rose-700 hover:bg-rose-50">
                    <X className="h-3.5 w-3.5 mr-1" /> Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Apply for leave</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Employee</Label>
              <Input value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Leave type</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v as LeaveRequest["type"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Annual">Annual</SelectItem>
                  <SelectItem value="Sick">Sick</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start date</Label>
              <Input type="date" value={form.start} onChange={e => setForm({ ...form, start: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>End date</Label>
              <Input type="date" value={form.end} onChange={e => setForm({ ...form, end: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Reason</Label>
              <Textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={apply} className="bg-blue-600 hover:bg-blue-700">Submit request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
