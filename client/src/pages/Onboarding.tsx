import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  ClipboardList,
  Building2,
  Briefcase,
  Calendar,
  ChevronRight,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";

const statusConfig = {
  beklemede: { label: "Beklemede", icon: Circle, color: "text-muted-foreground" },
  devam_ediyor: { label: "Devam Ediyor", icon: Clock, color: "text-blue-400" },
  tamamlandi: { label: "Tamamlandı", icon: CheckCircle2, color: "text-emerald-400" },
};

export default function OnboardingPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();

  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", department: "", position: "", startDate: "" });

  const { data: employees = [], isLoading } = trpc.onboarding.listEmployees.useQuery();

  const createEmployee = trpc.onboarding.createEmployee.useMutation({
    onSuccess: () => { utils.onboarding.listEmployees.invalidate(); setShowForm(false); setForm({ name: "", email: "", department: "", position: "", startDate: "" }); toast.success("Çalışan eklendi"); },
    onError: (e) => toast.error(e.message),
  });
  const updateEmployee = trpc.onboarding.updateEmployee.useMutation({
    onSuccess: () => { utils.onboarding.listEmployees.invalidate(); setEditingEmployee(null); toast.success("Güncellendi"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteEmployee = trpc.onboarding.deleteEmployee.useMutation({
    onSuccess: () => { utils.onboarding.listEmployees.invalidate(); toast.success("Silindi"); },
    onError: (e) => toast.error(e.message),
  });

  const EmployeeForm = ({ initial, onSubmit, onClose }: any) => {
    const [f, setF] = useState(initial ?? { name: "", email: "", department: "", position: "", startDate: "" });
    return (
      <div className="space-y-4">
        <div>
          <Label>Ad Soyad *</Label>
          <Input className="mt-1" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ayşe Kaya" />
        </div>
        <div>
          <Label>E-posta</Label>
          <Input className="mt-1" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="ayse@sirket.com" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Departman</Label>
            <Input className="mt-1" value={f.department} onChange={(e) => setF({ ...f, department: e.target.value })} placeholder="Mühendislik" />
          </div>
          <div>
            <Label>Pozisyon</Label>
            <Input className="mt-1" value={f.position} onChange={(e) => setF({ ...f, position: e.target.value })} placeholder="Frontend Developer" />
          </div>
        </div>
        <div>
          <Label>Başlangıç Tarihi</Label>
          <Input className="mt-1" type="date" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} />
        </div>
        <div className="flex gap-2 pt-2">
          <Button className="flex-1" onClick={() => onSubmit(f)} disabled={!f.name}>
            {initial ? "Güncelle" : "Ekle"}
          </Button>
          <Button variant="outline" onClick={onClose}>İptal</Button>
        </div>
      </div>
    );
  };

  const stats = {
    total: employees.length,
    beklemede: employees.filter((e) => e.status === "beklemede").length,
    devam: employees.filter((e) => e.status === "devam_ediyor").length,
    tamamlandi: employees.filter((e) => e.status === "tamamlandi").length,
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Onboarding Yönetimi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Yeni çalışan süreçlerini takip edin</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Çalışan Ekle
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Toplam", value: stats.total, color: "text-foreground" },
          { label: "Beklemede", value: stats.beklemede, color: "text-muted-foreground" },
          { label: "Devam Ediyor", value: stats.devam, color: "text-blue-400" },
          { label: "Tamamlandı", value: stats.tamamlandi, color: "text-emerald-400" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Employee List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Çalışanlar</p>
        </div>
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse flex items-center gap-4">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="w-32 h-4 bg-muted rounded mb-2" />
                  <div className="w-48 h-3 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Henüz çalışan yok</p>
            {isAdmin && (
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowForm(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Çalışan Ekle
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {employees.map((emp) => {
              const sc = statusConfig[emp.status];
              const StatusIcon = sc.icon;
              return (
                <div key={emp.id} className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors group">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {emp.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{emp.name}</p>
                      <span className={`badge-${emp.status}`}>
                        {sc.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {emp.position && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Briefcase className="w-3 h-3" /> {emp.position}
                        </span>
                      )}
                      {emp.department && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Building2 className="w-3 h-3" /> {emp.department}
                        </span>
                      )}
                      {emp.startDate && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(emp.startDate).toLocaleDateString("tr-TR")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => setEditingEmployee(emp)}
                          className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-secondary transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { if (confirm("Silinsin mi?")) deleteEmployee.mutate({ id: emp.id }); }}
                          className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-secondary transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <Link href={`/onboarding/${emp.id}`}>
                      <a className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-secondary transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </a>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Yeni Çalışan Ekle</DialogTitle></DialogHeader>
          <EmployeeForm onSubmit={(f: any) => createEmployee.mutate(f)} onClose={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingEmployee} onOpenChange={(o) => !o && setEditingEmployee(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Çalışanı Düzenle</DialogTitle></DialogHeader>
          {editingEmployee && (
            <EmployeeForm
              initial={{ ...editingEmployee, startDate: editingEmployee.startDate ? new Date(editingEmployee.startDate).toISOString().split("T")[0] : "" }}
              onSubmit={(f: any) => updateEmployee.mutate({ id: editingEmployee.id, ...f })}
              onClose={() => setEditingEmployee(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
