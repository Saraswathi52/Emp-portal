import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { employeesSeed, departments, type Employee } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/employees")({
  component: EmployeesPage,
});

const empty: Employee = { id: "", name: "", department: "Engineering", role: "", manager: "", email: "", status: "Active" };

function EmployeesPage() {
  const [rows, setRows] = useState<Employee[]>(employeesSeed);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<Employee>(empty);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return rows.filter(r =>
      [r.name, r.id, r.department, r.role, r.manager, r.email].some(v => v.toLowerCase().includes(q))
    );
  }, [rows, query]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty, id: `EMP-${1000 + rows.length + 1}` });
    setOpen(true);
  };
  const openEdit = (e: Employee) => {
    setEditing(e);
    setForm(e);
    setOpen(true);
  };
  const remove = (id: string) => {
    setRows(rs => rs.filter(r => r.id !== id));
    toast.success("Employee removed");
  };
  const save = () => {
    if (!form.name || !form.email) {
      toast.error("Name and email are required");
      return;
    }
    if (editing) {
      setRows(rs => rs.map(r => (r.id === editing.id ? form : r)));
      toast.success("Employee updated");
    } else {
      setRows(rs => [form, ...rs]);
      toast.success("Employee added");
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Employees</h2>
          <p className="text-sm text-slate-500 mt-1">{rows.length} people across {departments.length} departments.</p>
        </div>
        <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Add Employee
        </Button>
      </div>

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search by name, ID, department…" value={query} onChange={e => setQuery(e.target.value)} className="pl-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs text-slate-500">{e.id}</TableCell>
                  <TableCell className="font-medium text-slate-900">{e.name}</TableCell>
                  <TableCell>{e.department}</TableCell>
                  <TableCell>{e.role}</TableCell>
                  <TableCell className="text-slate-600">{e.manager}</TableCell>
                  <TableCell className="text-slate-600">{e.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      e.status === "Active" ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : e.status === "On Leave" ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                    }>{e.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(e)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(e.id)}>
                      <Trash2 className="h-4 w-4 text-rose-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-slate-500 py-10">No employees match your search.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit employee" : "Add employee"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Full name</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={form.department} onValueChange={v => setForm({ ...form, department: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Manager</Label>
              <Input value={form.manager} onChange={e => setForm({ ...form, manager: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as Employee["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="bg-blue-600 hover:bg-blue-700">{editing ? "Save changes" : "Add employee"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
