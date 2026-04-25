import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";
import { Users, Shield, UserCheck, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "wouter";

export default function AdminPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  if (user?.role !== "admin") {
    navigate("/");
    return null;
  }

  const { data: users = [], isLoading } = trpc.admin.listUsers.useQuery();

  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => { utils.admin.listUsers.invalidate(); toast.success("Rol güncellendi"); },
    onError: (e) => toast.error(e.message),
  });

  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Yönetim Paneli</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Kullanıcı rolleri ve sistem yönetimi</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{users.length}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Toplam Kullanıcı</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{adminCount}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Yönetici</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{userCount}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Çalışan</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Kullanıcılar</p>
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
                <div className="w-24 h-8 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">Henüz kullanıcı yok</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {users.map((u) => {
              const initials = u.name
                ? u.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                : "?";
              const isCurrentUser = u.id === user?.id;
              return (
                <div key={u.id} className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                    u.role === "admin" ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                  }`}>
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{u.name ?? "İsimsiz"}</p>
                      {u.role === "admin" && <Crown className="w-3.5 h-3.5 text-primary" />}
                      {isCurrentUser && (
                        <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">Siz</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{u.email ?? u.openId}</p>
                    <p className="text-xs text-muted-foreground/60">
                      Son giriş: {new Date(u.lastSignedIn).toLocaleDateString("tr-TR")}
                    </p>
                  </div>

                  {/* Role Selector */}
                  <div className="flex-shrink-0">
                    <Select
                      value={u.role}
                      onValueChange={(v) => {
                        if (isCurrentUser && v !== "admin") {
                          toast.error("Kendi rolünüzü değiştiremezsiniz");
                          return;
                        }
                        updateRole.mutate({ userId: u.id, role: v as "user" | "admin" });
                      }}
                      disabled={isCurrentUser}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <span className="flex items-center gap-1.5">
                            <Shield className="w-3 h-3 text-primary" />
                            Yönetici
                          </span>
                        </SelectItem>
                        <SelectItem value="user">
                          <span className="flex items-center gap-1.5">
                            <UserCheck className="w-3 h-3 text-muted-foreground" />
                            Çalışan
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="mt-4 bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Rol Tabanlı Erişim</p>
            <p className="text-xs text-muted-foreground mt-1">
              <strong className="text-foreground">Yönetici:</strong> Tüm modüllere tam erişim — iş ilanları, adaylar, onboarding, izin onayları ve kullanıcı yönetimi.
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              <strong className="text-foreground">Çalışan:</strong> Sadece kendi izin talepleri ve bakiyesi görüntülenebilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
