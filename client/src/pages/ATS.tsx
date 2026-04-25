import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Briefcase,
  MapPin,
  Building2,
  Users,
  ChevronRight,
  X,
  Pencil,
  Trash2,
  GripVertical,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Stage = "yeni" | "mulakat" | "teklif" | "kabul" | "red";

const STAGES: { key: Stage; label: string; color: string; bg: string }[] = [
  { key: "yeni", label: "Yeni", color: "text-blue-400", bg: "border-t-blue-500" },
  { key: "mulakat", label: "Mülakat", color: "text-amber-400", bg: "border-t-amber-500" },
  { key: "teklif", label: "Teklif", color: "text-purple-400", bg: "border-t-purple-500" },
  { key: "kabul", label: "Kabul", color: "text-emerald-400", bg: "border-t-emerald-500" },
  { key: "red", label: "Red", color: "text-red-400", bg: "border-t-red-500" },
];

export default function ATSPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();

  const [selectedPostingId, setSelectedPostingId] = useState<number | null>(null);
  const [showPostingForm, setShowPostingForm] = useState(false);
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [editingPosting, setEditingPosting] = useState<any>(null);
  const [editingCandidate, setEditingCandidate] = useState<any>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);

  const { data: postings = [], isLoading: postingsLoading } = trpc.ats.listPostings.useQuery();
  const { data: candidates = [], isLoading: candidatesLoading } = trpc.ats.listCandidates.useQuery(
    { jobPostingId: selectedPostingId ?? undefined },
    { enabled: selectedPostingId !== null }
  );

  const createPosting = trpc.ats.createPosting.useMutation({
    onSuccess: () => { utils.ats.listPostings.invalidate(); setShowPostingForm(false); toast.success("İş ilanı oluşturuldu"); },
    onError: (e) => toast.error(e.message),
  });
  const updatePosting = trpc.ats.updatePosting.useMutation({
    onSuccess: () => { utils.ats.listPostings.invalidate(); setEditingPosting(null); toast.success("Güncellendi"); },
    onError: (e) => toast.error(e.message),
  });
  const deletePosting = trpc.ats.deletePosting.useMutation({
    onSuccess: () => { utils.ats.listPostings.invalidate(); setSelectedPostingId(null); toast.success("Silindi"); },
    onError: (e) => toast.error(e.message),
  });
  const createCandidate = trpc.ats.createCandidate.useMutation({
    onSuccess: () => { utils.ats.listCandidates.invalidate(); setShowCandidateForm(false); toast.success("Aday eklendi"); },
    onError: (e) => toast.error(e.message),
  });
  const updateStage = trpc.ats.updateCandidateStage.useMutation({
    onSuccess: () => utils.ats.listCandidates.invalidate(),
    onError: (e) => toast.error(e.message),
  });
  const updateCandidate = trpc.ats.updateCandidate.useMutation({
    onSuccess: () => { utils.ats.listCandidates.invalidate(); setEditingCandidate(null); toast.success("Güncellendi"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteCandidate = trpc.ats.deleteCandidate.useMutation({
    onSuccess: () => { utils.ats.listCandidates.invalidate(); toast.success("Aday silindi"); },
    onError: (e) => toast.error(e.message),
  });

  const selectedPosting = postings.find((p) => p.id === selectedPostingId);

  // Drag & Drop
  const handleDragStart = (id: number) => setDraggedId(id);
  const handleDrop = (stage: Stage) => {
    if (draggedId !== null) {
      updateStage.mutate({ id: draggedId, stage });
      setDraggedId(null);
    }
  };

  // Forms
  const PostingForm = ({ initial, onSubmit, onClose }: any) => {
    const [form, setForm] = useState(initial ?? { title: "", department: "", location: "", description: "", status: "active" });
    return (
      <div className="space-y-4">
        <div>
          <Label>Pozisyon Adı *</Label>
          <Input className="mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Örn: Senior Frontend Developer" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Departman</Label>
            <Input className="mt-1" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Mühendislik" />
          </div>
          <div>
            <Label>Lokasyon</Label>
            <Input className="mt-1" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="İstanbul / Uzaktan" />
          </div>
        </div>
        <div>
          <Label>Açıklama</Label>
          <Textarea className="mt-1" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Pozisyon hakkında detaylar..." />
        </div>
        <div>
          <Label>Durum</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="draft">Taslak</SelectItem>
              <SelectItem value="closed">Kapalı</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 pt-2">
          <Button className="flex-1" onClick={() => onSubmit(form)} disabled={!form.title}>
            {initial ? "Güncelle" : "Oluştur"}
          </Button>
          <Button variant="outline" onClick={onClose}>İptal</Button>
        </div>
      </div>
    );
  };

  const CandidateForm = ({ onSubmit, onClose }: any) => {
    const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "", stage: "yeni" as Stage });
    return (
      <div className="space-y-4">
        <div>
          <Label>Ad Soyad *</Label>
          <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ahmet Yılmaz" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>E-posta</Label>
            <Input className="mt-1" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ahmet@ornek.com" />
          </div>
          <div>
            <Label>Telefon</Label>
            <Input className="mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+90 555 000 00 00" />
          </div>
        </div>
        <div>
          <Label>Aşama</Label>
          <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v as Stage })}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STAGES.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Notlar</Label>
          <Textarea className="mt-1" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Aday hakkında notlar..." />
        </div>
        <div className="flex gap-2 pt-2">
          <Button className="flex-1" onClick={() => onSubmit(form)} disabled={!form.name}>Ekle</Button>
          <Button variant="outline" onClick={onClose}>İptal</Button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Aday Takibi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">İş ilanları ve aday pipeline yönetimi</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowPostingForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            İlan Ekle
          </Button>
        )}
      </div>

      <div className="flex gap-5 min-h-0">
        {/* Job Postings Sidebar */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">İş İlanları</p>
            </div>
            <div className="divide-y divide-border max-h-[calc(100vh-200px)] overflow-y-auto">
              {postingsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 animate-pulse">
                    <div className="w-32 h-4 bg-muted rounded mb-2" />
                    <div className="w-20 h-3 bg-muted rounded" />
                  </div>
                ))
              ) : postings.length === 0 ? (
                <div className="p-6 text-center">
                  <Briefcase className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Henüz ilan yok</p>
                </div>
              ) : (
                postings.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPostingId(p.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors ${
                      selectedPostingId === p.id ? "bg-primary/10 border-l-2 border-l-primary" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {p.department && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Building2 className="w-3 h-3" />
                              {p.department}
                            </span>
                          )}
                          {p.location && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {p.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`badge-${p.status} flex-shrink-0`}>
                        {p.status === "active" ? "Aktif" : p.status === "draft" ? "Taslak" : "Kapalı"}
                      </span>
                    </div>
                    {isAdmin && selectedPostingId === p.id && (
                      <div className="flex gap-1 mt-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setEditingPosting(p)}
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                        >
                          <Pencil className="w-3 h-3" /> Düzenle
                        </button>
                        <span className="text-muted-foreground/30">·</span>
                        <button
                          onClick={() => { if (confirm("Silinsin mi?")) deletePosting.mutate({ id: p.id }); }}
                          className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Sil
                        </button>
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 min-w-0">
          {!selectedPostingId ? (
            <div className="flex flex-col items-center justify-center h-64 bg-card border border-border rounded-xl">
              <Briefcase className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Bir iş ilanı seçin</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Aday pipeline'ını görüntülemek için sol taraftan bir ilan seçin</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground">{selectedPosting?.title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {candidates.length} aday
                  </p>
                </div>
                {isAdmin && (
                  <Button size="sm" onClick={() => setShowCandidateForm(true)} className="gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    Aday Ekle
                  </Button>
                )}
              </div>

              {/* Kanban Columns */}
              <div className="grid grid-cols-5 gap-3 overflow-x-auto pb-2">
                {STAGES.map((stage) => {
                  const stageCandidates = candidates.filter((c) => c.stage === stage.key);
                  return (
                    <div
                      key={stage.key}
                      className={`bg-card border border-border rounded-xl border-t-2 ${stage.bg} min-h-[400px] flex flex-col`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(stage.key)}
                    >
                      {/* Column Header */}
                      <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
                        <span className={`text-xs font-semibold ${stage.color}`}>{stage.label}</span>
                        <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">
                          {stageCandidates.length}
                        </span>
                      </div>

                      {/* Cards */}
                      <div className="p-2 flex-1 space-y-2">
                        {stageCandidates.map((c) => (
                          <div
                            key={c.id}
                            draggable={isAdmin}
                            onDragStart={() => handleDragStart(c.id)}
                            className={`bg-background border border-border rounded-lg p-3 ${
                              isAdmin ? "cursor-grab active:cursor-grabbing" : ""
                            } hover:border-primary/30 transition-colors group`}
                          >
                            <div className="flex items-start gap-2">
                              {isAdmin && <GripVertical className="w-3 h-3 text-muted-foreground/40 mt-0.5 flex-shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-foreground truncate">{c.name}</p>
                                {c.email && (
                                  <p className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5 truncate">
                                    <Mail className="w-2.5 h-2.5" /> {c.email}
                                  </p>
                                )}
                                {c.phone && (
                                  <p className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                                    <Phone className="w-2.5 h-2.5" /> {c.phone}
                                  </p>
                                )}
                                {c.notes && (
                                  <p className="text-[10px] text-muted-foreground/70 mt-1 line-clamp-2">{c.notes}</p>
                                )}
                              </div>
                            </div>
                            {isAdmin && (
                              <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setEditingCandidate(c)}
                                  className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5"
                                >
                                  <Pencil className="w-2.5 h-2.5" /> Düzenle
                                </button>
                                <span className="text-muted-foreground/30 text-[10px]">·</span>
                                <button
                                  onClick={() => { if (confirm("Silinsin mi?")) deleteCandidate.mutate({ id: c.id }); }}
                                  className="text-[10px] text-muted-foreground hover:text-destructive transition-colors flex items-center gap-0.5"
                                >
                                  <Trash2 className="w-2.5 h-2.5" /> Sil
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={showPostingForm} onOpenChange={setShowPostingForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Yeni İş İlanı</DialogTitle></DialogHeader>
          <PostingForm
            onSubmit={(form: any) => createPosting.mutate(form)}
            onClose={() => setShowPostingForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingPosting} onOpenChange={(o) => !o && setEditingPosting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>İlanı Düzenle</DialogTitle></DialogHeader>
          {editingPosting && (
            <PostingForm
              initial={editingPosting}
              onSubmit={(form: any) => updatePosting.mutate({ id: editingPosting.id, ...form })}
              onClose={() => setEditingPosting(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showCandidateForm} onOpenChange={setShowCandidateForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Aday Ekle</DialogTitle></DialogHeader>
          <CandidateForm
            onSubmit={(form: any) => createCandidate.mutate({ ...form, jobPostingId: selectedPostingId! })}
            onClose={() => setShowCandidateForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingCandidate} onOpenChange={(o) => !o && setEditingCandidate(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adayı Düzenle</DialogTitle></DialogHeader>
          {editingCandidate && (
            <div className="space-y-4">
              <div>
                <Label>Ad Soyad</Label>
                <Input className="mt-1" defaultValue={editingCandidate.name}
                  onChange={(e) => setEditingCandidate({ ...editingCandidate, name: e.target.value })} />
              </div>
              <div>
                <Label>Aşama</Label>
                <Select value={editingCandidate.stage} onValueChange={(v) => setEditingCandidate({ ...editingCandidate, stage: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notlar</Label>
                <Textarea className="mt-1" defaultValue={editingCandidate.notes ?? ""}
                  onChange={(e) => setEditingCandidate({ ...editingCandidate, notes: e.target.value })} rows={2} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" onClick={() => updateCandidate.mutate({ id: editingCandidate.id, name: editingCandidate.name, stage: editingCandidate.stage, notes: editingCandidate.notes })}>
                  Güncelle
                </Button>
                <Button variant="outline" onClick={() => setEditingCandidate(null)}>İptal</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
