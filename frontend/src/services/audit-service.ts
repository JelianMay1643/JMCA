import api from "../lib/axios";

export type AuditLog = {
  id: number;
  actorType: string;
  actorId: number | null;
  actorName: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string;
  createdAt: string;
};

export type AuditPage = {
  items: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function getAuditLogs(params: {
  page: number;
  limit?: number;
  search?: string;
  entity?: string;
}): Promise<AuditPage> {
  const { data } = await api.get("/api/audit-logs", { params });
  return data;
}