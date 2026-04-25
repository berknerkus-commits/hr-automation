import { trpc } from "@/lib/trpc";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface NotificationPanelProps {
  onClose: () => void;
}

const typeColors: Record<string, string> = {
  izin: "bg-blue-500/20 text-blue-400",
  onboarding: "bg-purple-500/20 text-purple-400",
  ats: "bg-amber-500/20 text-amber-400",
  sistem: "bg-zinc-500/20 text-zinc-400",
};

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const { data: notifications = [], isLoading } = trpc.notifications.list.useQuery();
  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });
  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const unread = notifications.filter((n) => !n.read);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Bildirimler</span>
          {unread.length > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unread.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unread.length > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              title="Tümünü okundu işaretle"
            >
              <CheckCheck className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground ml-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <Bell className="w-8 h-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">Henüz bildirim yok</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`px-4 py-3 border-b border-border/50 last:border-0 hover:bg-secondary/50 transition-colors ${
                !notif.read ? "bg-primary/5" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                    typeColors[notif.type] ?? typeColors.sistem
                  }`}
                >
                  {notif.type.toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{notif.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: tr })}
                  </p>
                </div>
                {!notif.read && (
                  <button
                    onClick={() => markRead.mutate({ id: notif.id })}
                    className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                    title="Okundu işaretle"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
