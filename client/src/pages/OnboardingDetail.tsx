import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Calendar,
  Building2,
  Briefcase,
  Mail,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";

interface Props {
  id: number;
}

export default function OnboardingDetailPage({ id }: Props) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", dueDate: "" });

  const { data: employee, isLoading: empLoading } = trpc.onboarding.getEmployee.useQuery({ id });
  const { data: tasks = [], isLoading: tasksLoading } = trpc.onboarding.listTasks.useQuery({ employeeId: id });

  const createTask = trpc.onboarding.createTask.useMutation({
    onSuccess: () => {
      utils.onboarding.listTasks.invalidate();
      utils.onboarding.listEmployees.invalidate();
      setShowTaskForm(false);
      setTaskForm({ title: "", description: "", dueDate: "" });
      toast.success("Görev eklendi");
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleTask = trpc.onboarding.toggleTask.useMutation({
    onMutate: async ({ id: taskId, completed }) => {
      await utils.onboarding.listTasks.cancel({ employeeId: id });
      const prev = utils.onboarding.listTasks.getData({ employeeId: id });
      utils.onboarding.listTasks.setData({ employeeId: id }, (old) =>
        old?.map((t) => (t.id === taskId ? { ...t, completed } : t))
      );
      return { prev };
    },
    onError: (e, _, ctx) => {
      utils.onboarding.listTasks.setData({ employeeId: id }, ctx?.prev);
      toast.error(e.message);
    },
    onSettled: () => {
      utils.onboarding.listTasks.invalidate({ employeeId: id });
      utils.onboarding.listEmployees.invalidate();
    },
  });

  const deleteTask = trpc.onboarding.deleteTask.useMutation({
    onSuccess: () => { utils.onboarding.listTasks.invalidate(); toast.success("Görev silindi"); },
    onError: (e) => toast.error(e.message),
  });

  const updateEmployee = trpc.onboarding.updateEmployee.useMutation({
    onSuccess: () => { utils.onboarding.getEmployee.invalidate({ id }); utils.onboarding.listEmployees.invalidate(); toast.success("Durum güncellendi"); },
    onError: (e) => toast.error(e.message),
  });

  if (empLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="w-48 h-8 bg-muted rounded" />
          <div className="w-full h-32 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Çalışan bulunamadı</p>
        <Link href="/onboarding">
          <a className="text-primary text-sm mt-2 inline-block hover:underline">← Geri dön</a>
        </Link>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <Link href="/onboarding">
        <a className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5">
          <ArrowLeft className="w-4 h-4" />
          Onboarding Listesi
        </a>
      </Link>

      {/* Employee Card */}
      <div className="bg-card border border-border rounded-xl p-6 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center text-lg font-bold flex-shrink-0">
            {employee.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">{employee.name}</h1>
              <span className={`badge-${employee.status}`}>
                {employee.status === "beklemede" ? "Beklemede" : employee.status === "devam_ediyor" ? "Devam Ediyor" : "Tamamlandı"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {employee.position && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Briefcase className="w-3 h-3" /> {employee.position}
                </span>
              )}
              {employee.department && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="w-3 h-3" /> {employee.department}
                </span>
              )}
              {employee.email && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="w-3 h-3" /> {employee.email}
                </span>
              )}
              {employee.startDate && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(employee.startDate).toLocaleDateString("tr-TR")} başlangıç
                </span>
              )}
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateEmployee.mutate({ id: employee.id, status: "tamamlandi" })}
                disabled={employee.status === "tamamlandi"}
                className="gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Tamamla
              </Button>
            </div>
          )}
        </div>

        {/* Progress */}
        {tasks.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">İlerleme</span>
              <span className="text-xs font-semibold text-foreground">{completedCount}/{tasks.length} görev</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{progress}% tamamlandı</p>
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Görevler</p>
          {isAdmin && (
            <Button size="sm" onClick={() => setShowTaskForm(true)} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Görev Ekle
            </Button>
          )}
        </div>

        {tasksLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse flex items-center gap-3">
                <div className="w-5 h-5 bg-muted rounded-full" />
                <div className="w-48 h-4 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <CheckCircle2 className="w-8 h-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">Henüz görev yok</p>
            {isAdmin && (
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowTaskForm(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Görev Ekle
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 px-5 py-4 hover:bg-secondary/20 transition-colors group">
                <button
                  onClick={() => toggleTask.mutate({ id: task.id, completed: !task.completed })}
                  className="mt-0.5 flex-shrink-0 transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                  )}
                  {task.dueDate && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="w-3 h-3" />
                      Son tarih: {new Date(task.dueDate).toLocaleDateString("tr-TR")}
                    </p>
                  )}
                </div>
                {isAdmin && (
                  <button
                    onClick={() => { if (confirm("Silinsin mi?")) deleteTask.mutate({ id: task.id }); }}
                    className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Form Dialog */}
      <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Görev Ekle</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Görev Adı *</Label>
              <Input
                className="mt-1"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Örn: Bilgisayar kurulumu"
              />
            </div>
            <div>
              <Label>Açıklama</Label>
              <Textarea
                className="mt-1"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                rows={2}
                placeholder="Görev detayları..."
              />
            </div>
            <div>
              <Label>Son Tarih</Label>
              <Input
                className="mt-1"
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1"
                onClick={() => createTask.mutate({ ...taskForm, employeeId: id })}
                disabled={!taskForm.title}
              >
                Ekle
              </Button>
              <Button variant="outline" onClick={() => setShowTaskForm(false)}>İptal</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
