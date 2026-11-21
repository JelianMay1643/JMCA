import api from "../lib/axios";

export type AppNotification = {
  id: number;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationList = { items: AppNotification[]; unread: number };

export async function getNotifications(): Promise<NotificationList> {
  const { data } = await api.get("/api/notifications");
  return data;
}

export async function markNotificationRead(id: number) {
  await api.patch(`/api/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  await api.patch("/api/notifications/read-all");
}