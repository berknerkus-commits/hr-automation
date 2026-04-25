import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Plus,
  CalendarDays,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LEAVE_TYPE_LABELS: Record<string, string> = {
  yillik: "Yıllık İzin",
  hastalik: "Hastalık İzni",
  mazeret: "Mazeret İzni",
  ucretsiz: "Ücretsiz İzin",
};

const MONTHS_TR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const DAYS_TR = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function calculateDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (e < s) return 0;
  let count = 0;
  const cur = new Date(s);
  while (cur <= e) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export default function LeavePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();

  const [showForm, setShowForm] = useState(false);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const [form, setForm] = useState({
    leaveType: "yillik" as "yillik" | "hastalik" | "mazeret" | "ucretsiz",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const { data: requests = [], isLoading } = trpc.leave.listRequests.useQuery();
  const { data: balance } = trpc.leave.myBalance.useQuery();

  const createRequest = trpc.leave.createRequest.useMutation({
    onSuccess: () => {
      utils.leave.listRequests.invalidate();
      utils.leave.myBalance.invalidate();
      setShowForm(false);
      setForm({ leaveType: "yillik", startDate: "", endDate: "", reason: "" });
      toast.success("İzin talebi oluşturuldu");
    },
    onError: (e) => toast.error(e.message),
  });

  const reviewRequest = trpc.leave.reviewRequest.useMutation({
    onSuccess: () => {
      utils.leave.listRequests.invalidate();
      utils.leave.myBalance.invalidate();
      setReviewingId(null);
      setReviewNote("");
      toast.success("Talep güncellendi");
    },
    onError: (e) => toast.error(e.message),
  });

  const days = calculateDays(form.startDate, form.endDate);

  // Calendar logic
  const approvedLeaves = requests.filter((r) => r.status === "onaylandi");

  const calendarDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1);
    const lastDay = new Date(calYear, calMonth + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7; // Monday-first
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(calYear, calMonth, d));
    return cells;
  }, [calMonth, calYear]);

  const isLeaveDay = (date: Date) => {
    return approvedLeaves.some((r) => {
      const s = new Date(r.startDate);
      const e = new Date(r.endDate);
      s.setHours(0, 0, 0, 0);
      e.setHours(23, 59, 59, 999);
      return date >= s && date <= e;
    });
  };

  const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

  const pendingRequests = requests.filter((r) => r.status === "beklemede");
  const myRequests = isAdmin ? requests : requests.filter((r) => r.userId === user?.id);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">İzin Yönetimi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">İzin talepleri ve bakiye yönetimi</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          İzin Talebi
        </Button>
      </div>

      {/* Balance Card */}
      {balance && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Toplam Hak", value: balance.totalDays, color: "text-foreground" },
            { label: "Kullanılan", value: balance.usedDays, color: "text-amber-400" },
            { label: "Beklemede", value: balance.pendingDays, color: "text-blue-400" },
            { label: "Kalan", value: balance.totalDays - balance.usedDays - balance.pendingDays, color: "text-emerald-400" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label} Gün</div>
            </div>
          ))}
        </div>
      )}

      <Tabs defaultValue="requests">
        <TabsList className="mb-4">
          <TabsTrigger value="requests">
            Talepler
            {isAdmin && pendingRequests.length > 0 && (
              <span className="ml-1.5 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="calendar">Takvim</TabsTrigger>
        </TabsList>

        {/* Requests Tab */}
        <TabsContent value="requests">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">
                {isAdmin ? "Tüm İzin Talepleri" : "İzin Taleplerim"}
              </p>
            </div>
            {isLoading ? (
              <div className="divide-y divide-border">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 animate-pulse flex items-center gap-4">
                    <div className="w-24 h-4 bg-muted rounded" />
                    <div className="flex-1 w-32 h-4 bg-muted rounded" />
                    <div className="w-16 h-6 bg-muted rounded-full" />
                  </div>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CalendarDays className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">Henüz izin talebi yok</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowForm(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Talep Oluştur
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {requests.map((req) => (
                  <div key={req.id} className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors">
                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {req.status === "beklemede" && <Clock className="w-5 h-5 text-amber-400" />}
                      {req.status === "onaylandi" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                      {req.status === "reddedildi" && <XCircle className="w-5 h-5 text-red-400" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">
                          {LEAVE_TYPE_LABELS[req.leaveType]}
                        </span>
                        <span className={`badge-${req.status}`}>
                          {req.status === "beklemede" ? "Beklemede" : req.status === "onaylandi" ? "Onaylandı" : "Reddedildi"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(req.startDate).toLocaleDateString("tr-TR")} – {new Date(req.endDate).toLocaleDateString("tr-TR")}
                        <span className="ml-1.5 font-medium text-foreground">{req.days} iş günü</span>
                      </p>
                      {req.reason && <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">{req.reason}</p>}
                      {req.reviewNote && (
                        <p className="text-xs text-muted-foreground/70 mt-0.5 italic">Not: {req.reviewNote}</p>
                      )}
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && req.status === "beklemede" && (
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => reviewRequest.mutate({ id: req.id, status: "onaylandi" })}
                        >
                          <Check className="w-3.5 h-3.5" />
                          Onayla
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10"
                          onClick={() => setReviewingId(req.id)}
                        >
                          <X className="w-3.5 h-3.5" />
                          Reddet
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <button
                onClick={() => {
                  if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
                  else setCalMonth(calMonth - 1);
                }}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <p className="text-sm font-semibold text-foreground">
                {MONTHS_TR[calMonth]} {calYear}
              </p>
              <button
                onClick={() => {
                  if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
                  else setCalMonth(calMonth + 1);
                }}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {DAYS_TR.map((d) => (
                <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((date, idx) => {
                const isToday = date && date.toDateString() === new Date().toDateString();
                const isLeave = date && isLeaveDay(date);
                const isWknd = date && isWeekend(date);
                return (
                  <div
                    key={idx}
                    className={`min-h-[52px] p-1.5 border-b border-r border-border/50 last:border-r-0 ${
                      isWknd ? "bg-secondary/20" : ""
                    } ${isLeave ? "bg-primary/10" : ""}`}
                  >
                    {date && (
                      <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium ${
                        isToday
                          ? "bg-primary text-primary-foreground"
                          : isWknd
                          ? "text-muted-foreground/50"
                          : "text-foreground"
                      }`}>
                        {date.getDate()}
                      </div>
                    )}
                    {isLeave && (
                      <div className="mt-0.5 w-full h-1 bg-primary/60 rounded-full" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="px-5 py-3 border-t border-border flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Bugün</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1 rounded-full bg-primary/60" />
                <span className="text-xs text-muted-foreground">Onaylı İzin</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Request Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>İzin Talebi Oluştur</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>İzin Türü</Label>
              <Select value={form.leaveType} onValueChange={(v) => setForm({ ...form, leaveType: v as any })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yillik">Yıllık İzin</SelectItem>
                  <SelectItem value="hastalik">Hastalık İzni</SelectItem>
                  <SelectItem value="mazeret">Mazeret İzni</SelectItem>
                  <SelectItem value="ucretsiz">Ücretsiz İzin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Başlangıç Tarihi</Label>
                <Input
                  className="mt-1"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Bitiş Tarihi</Label>
                <Input
                  className="mt-1"
                  type="date"
                  value={form.endDate}
                  min={form.startDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
            {days > 0 && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
                <p className="text-sm text-primary font-medium">{days} iş günü</p>
              </div>
            )}
            <div>
              <Label>Açıklama</Label>
              <Textarea
                className="mt-1"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                rows={2}
                placeholder="İzin sebebi (isteğe bağlı)..."
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1"
                onClick={() => createRequest.mutate({ ...form, days })}
                disabled={!form.startDate || !form.endDate || days === 0}
              >
                Talep Gönder
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>İptal</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={reviewingId !== null} onOpenChange={(o) => !o && setReviewingId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Talebi Reddet</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Red Sebebi (isteğe bağlı)</Label>
              <Textarea
                className="mt-1"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
                placeholder="Reddetme sebebini açıklayın..."
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1 bg-destructive hover:bg-destructive/90"
                onClick={() => reviewRequest.mutate({ id: reviewingId!, status: "reddedildi", reviewNote })}
              >
                Reddet
              </Button>
              <Button variant="outline" onClick={() => setReviewingId(null)}>İptal</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
