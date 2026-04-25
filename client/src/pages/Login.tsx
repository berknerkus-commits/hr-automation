import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-4">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">İK Otomasyon</h1>
          <p className="text-sm text-muted-foreground mt-1">HR Yönetim Sistemi</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <h2 className="text-lg font-semibold text-foreground mb-1">Hoş Geldiniz</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Sisteme erişmek için giriş yapın.
          </p>
          <Button
            className="w-full"
            onClick={() => { window.location.href = getLoginUrl(); }}
          >
            Giriş Yap
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 İK Otomasyon Sistemi
        </p>
      </div>
    </div>
  );
}
