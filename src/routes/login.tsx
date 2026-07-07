import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth, type Role } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Nimbus HR" },
      { name: "description", content: "Sign in to your Nimbus HR employee portal account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("aarav.sharma@company.com");
  const [password, setPassword] = useState("demo1234");
  const [role, setRole] = useState<Role>("Employee");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Enter your email and password");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const name = email.split("@")[0].split(".").map(s => s[0].toUpperCase() + s.slice(1)).join(" ");
      login({ name, email, role });
      toast.success(`Welcome back, ${name}`);
      nav({ to: "/dashboard" });
    }, 500);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between bg-slate-900 text-white p-12">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-md bg-blue-600 grid place-items-center">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="font-semibold text-lg">Nimbus HR</span>
        </div>
        <div className="space-y-4 max-w-md">
          <h1 className="text-3xl font-semibold leading-tight">
            The all-in-one people platform for modern enterprises.
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Manage employees, leave, expenses, and documents from a single secure workspace trusted by teams worldwide.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400 pt-4">
            <ShieldCheck className="h-4 w-4" />
            SOC 2 Type II · ISO 27001 · GDPR compliant
          </div>
        </div>
        <p className="text-xs text-slate-500">© 2026 Nimbus HR, Inc.</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2">
            <div className="h-9 w-9 rounded-md bg-blue-600 grid place-items-center text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="font-semibold text-lg">Nimbus HR</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Sign in to your account</h2>
            <p className="text-sm text-muted-foreground">Enter your credentials to access the portal.</p>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="pl-9" placeholder="you@company.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Sign in as</Label>
              <Select value={role} onValueChange={v => setRole(v as Role)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employee">Employee</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Demo portal — any email and password will work.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
