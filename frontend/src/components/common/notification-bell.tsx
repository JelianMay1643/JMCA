import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "../../services/notification-service";

function NotificationBell() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const load = useCallback(() => {
    getNotifications()
      .then((res) => {
        setItems(res.items);
        setUnread(res.unread);
      })
      .catch(() => {});
  }, []);

  
  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const handleOpen = () => {
    setOpen((o) => !o);
    if (!open) load();
  };

  const handleClick = async (n: AppNotification) => {
    setOpen(false);
    if (!n.isRead) {
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
      );
      setUnread((u) => Math.max(0, u - 1));
      markNotificationRead(n.id).catch(() => {});
    }
    if (n.link) navigate(n.link);
  };

  const handleReadAll = async () => {
    await markAllNotificationsRead().catch(() => {});
    setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
    setUnread(0);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative flex cursor-pointer"
      >
        <Bell size={22} />
        {unread > 0 && (
          <span className="absolute -right-2.5 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-magenta px-1 text-[11px] text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-30 w-80 max-w-[90vw] overflow-hidden rounded-lg bg-white text-neutral-800 shadow-lg">
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2">
            <p className="font-bold">Notifications</p>
            {unread > 0 && (
              <button
                onClick={handleReadAll}
                className="cursor-pointer text-xs text-magenta hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="p-4 text-center text-sm text-neutral-500">
                No notifications yet.
              </p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`block w-full cursor-pointer border-b border-neutral-100 px-4 py-3 text-left hover:bg-blush ${
                    n.isRead ? "" : "bg-[#f7e9f3]"
                  }`}
                >
                  <p className="text-sm font-bold">{n.title}</p>
                  <p className="text-sm text-neutral-600">{n.message}</p>
                  <p className="mt-1 text-xs text-neutral-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;