import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Check, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { expensesSeed, type Expense } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/expenses")({
  component: ExpensesPage,
});

const RECEIPT = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=70";
const empty: Expense = { id: "", employee: "", category: "Travel", amount: 0, receipt: RECEIPT, status: "Pending", date: new Date().toISOString().slice(0, 10) };

function ExpensesPage() {
  const [rows, setRows] = useState<Expense[]>(expensesSeed);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState<Expense>(empty);

  const setStatus = (id: string, status: Expense["status"]) => {
    setRows(rs => rs.map(r => (r.id === id ? { ...r, status } : r)));
    toast.success(`Expense ${status.toLowerCase()}`);
  };

  const create = () => {
    if (!form.employee || !form.amount) { toast.error("Fill required fields"); return; }
    const id = `EX-${3000 + rows.length + 1}`;
    setRows(rs => [{ ...form, id, status: "Pending" }, ...rs]);
    toast.success("Expense submitted");
    setOpen(false); setForm(empty);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Expense Management</h2>
          <p className="text-sm text-slate-500 mt-1">Track reimbursements and approve claims.</p>
        </div>
        <Button onClick={() => { setForm(empty); setOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> New Expense
        </Button>
      </div>

      <Card className="border-slate-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Employee</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium text-slate-900">{r.employee}</TableCell>
                <TableCell>{r.category}</TableCell>
                <TableCell className="text-slate-600">{r.date}</TableCell>
                <TableCell className="font-medium">${r.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <button onClick={() => setPreview(r.receipt)} className="flex items-center gap-2 group">
                    <img src={r.receipt} alt="Receipt" className="h-10 w-10 rounded object-cover border border-slate-200" />
                    <Eye className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                  </button>
                </TableCell>
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
          <DialogHeader><DialogTitle>New expense claim</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Employee</Label>
              <Input value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v as Expense["category"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Travel","Meals","Software","Office","Training"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount (USD)</Label>
              <Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value || "0") })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={create} className="bg-blue-600 hover:bg-blue-700">Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!preview} onOpenChange={o => !o && setPreview(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Receipt preview</DialogTitle></DialogHeader>
          {preview && <img src={preview} alt="Receipt" className="w-full rounded border border-slate-200" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
