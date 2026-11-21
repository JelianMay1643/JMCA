import api from "../lib/axios";

export type TicketStatus = "open" | "answered" | "closed";

export type Ticket = {
  id: number;
  subject: string;
  message: string;
  status: TicketStatus;
  adminReply: string | null;
  createdAt: string;
  repliedAt: string | null;
};

export type AdminTicket = Ticket & {
  customerName: string | null;
  customerEmail: string | null;
};

// Customer
export async function createTicket(subject: string, message: string) {
  const { data } = await api.post("/api/support", { subject, message });
  return data as Ticket;
}

export async function getMyTickets(): Promise<Ticket[]> {
  const { data } = await api.get("/api/support/mine");
  return data;
}

// Admin
export async function getAllTickets(): Promise<AdminTicket[]> {
  const { data } = await api.get("/api/support");
  return data;
}

export async function replyTicket(id: number, reply: string) {
  const { data } = await api.patch(`/api/support/${id}/reply`, { reply });
  return data as Ticket;
}

export async function closeTicket(id: number) {
  const { data } = await api.patch(`/api/support/${id}/close`);
  return data as Ticket;
}