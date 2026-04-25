import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  Users,
  ArrowRight,
  TrendingUp,
  Activity,
  UserPlus,
  FileText,
} from "lucide-react";
import { Link } from "wouter";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  href,
  description,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  href: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <a className="block bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 group">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      </a>
    </Link>
  );
}

function ActivityIcon({ type }: { type: string }) {
  if (type === 'izin') return <CalendarDays className="w-3.5 h-3.5" />;
  if (type === 'ats') return <UserPlus className="w-3.5 h-3.5" />;
  if (type === 'onboarding') return <ClipboardList className="w-3.5 h-3.5" />;
  return <Activity className="w-3.5 h-3.5" />;
}

function ActivityBadgeColor(type: string) {
  if (type === 'izin') return 'bg-emerald-500/15 text-emerald-400';
  if (type === 'ats') return 'bg-blue-500/15 text-blue-400';
  if (type === 'onboarding') return 'bg-amber-500/15 text-amber-400';
  return 'bg-primary/15 text-primary';
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();
  const { data: leaveBalance } = trpc.leave.myBalance.useQuery();
  const { data: myLeaves } = trpc.leave.listRequests.useQuery();
  const isAdmin = user?.role === "admin";
  const { data: recentActivity, isLoading: activityLoading } = trpc.dashboard.recentActivity.useQuery(
    undefined,
    { enabled: isAdmin }
  );

  const pendingMyLeaves = myLeaves?.filter((l) => l.status === "beklemede").length ?? 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Günaydın";
    if (h < 18) return "İyi günler";
    return "İyi akşamlar";
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          {greeting()}, {user?.name?.split(" ")[0] ?? "Kullanıcı"} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {new Date().toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats Grid */}
      {isAdmin ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
                  <div className="w-10 h-10 bg-muted rounded-lg mb-4" />
                  <div className="w-16 h-8 bg-muted rounded mb-2" />
                  <div className="w-32 h-4 bg-muted rounded" />
                </div>
              ))
            ) : (
              <>
                <StatCard
                  title="Açık Pozisyonlar"
                  value={stats?.openPositions ?? 0}
                  icon={BriefcaseBusiness}
                  color="bg-blue-500/15 text-blue-400"
                  href="/ats"
                  description="Aktif iş ilanları"
                />
                <StatCard
                  title="Toplam Aday"
                  value={stats?.totalCandidates ?? 0}
                  icon={Users}
                  color="bg-purple-500/15 text-purple-400"
                  href="/ats"
                  description="Tüm iş ilanlarında"
                />
                <StatCard
                  title="Onboarding"
                  value={stats?.pendingOnboarding ?? 0}
                  icon={ClipboardList}
                  color="bg-amber-500/15 text-amber-400"
                  href="/onboarding"
                  description="Devam eden süreçler"
                />
                <StatCard
                  title="Bekleyen İzinler"
                  value={stats?.pendingLeaves ?? 0}
                  icon={CalendarDays}
                  color="bg-emerald-500/15 text-emerald-400"
                  href="/leave"
                  description="Onay bekliyor"
                />
              </>
            )}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {/* Employee stats */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {leaveBalance ? leaveBalance.totalDays - leaveBalance.usedDays - leaveBalance.pendingDays : "-"}
            </div>
            <div className="text-sm font-medium text-foreground">Kalan İzin Günü</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {leaveBalance ? `${leaveBalance.usedDays} gün kullanıldı` : "Yükleniyor..."}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <ClipboardList className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">{pendingMyLeaves}</div>
            <div className="text-sm font-medium text-foreground">Bekleyen Talebim</div>
            <div className="text-xs text-muted-foreground mt-0.5">Onay bekleyen izin talepleri</div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {leaveBalance?.pendingDays ?? 0}
            </div>
            <div className="text-sm font-medium text-foreground">Beklemedeki Günler</div>
            <div className="text-xs text-muted-foreground mt-0.5">Onay sürecinde olan günler</div>
          </div>
        </div>
      )}

      {/* Recent Activity - Admin only */}
      {isAdmin && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Son Aktiviteler</h2>
          </div>
          {activityLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0" />
                  <div className="flex-1">
                    <div className="w-48 h-3.5 bg-muted rounded mb-1.5" />
                    <div className="w-32 h-3 bg-muted rounded" />
                  </div>
                  <div className="w-20 h-3 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.map((item, idx) => (
                <div key={`${item.type}-${item.id}-${idx}`} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${ActivityBadgeColor(item.type)}`}>
                    <ActivityIcon type={item.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {new Date(item.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Henüz aktivite yok</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Hızlı Erişim</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {isAdmin && (
            <>
              <Link href="/ats">
                <a className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors group">
                  <BriefcaseBusiness className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">İş İlanı Ekle</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                </a>
              </Link>
              <Link href="/onboarding">
                <a className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors group">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Yeni Çalışan</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                </a>
              </Link>
              <Link href="/leave">
                <a className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors group">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">İzin Talepleri</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                </a>
              </Link>
              <Link href="/admin">
                <a className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors group">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Kullanıcılar</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                </a>
              </Link>
            </>
          )}
          {!isAdmin && (
            <>
              <Link href="/leave">
                <a className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors group">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">İzin Talebi Oluştur</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                </a>
              </Link>
              <Link href="/leave">
                <a className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors group">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">İzin Geçmişim</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                </a>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
