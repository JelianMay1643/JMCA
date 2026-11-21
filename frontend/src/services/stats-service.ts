import api from "../lib/axios";
import type { Stats } from "../types/stats";

export const getStats = async (days: number): Promise<Stats> => {
  const res = await api.get("/api/admin/stats", { params: { days } });
  return res.data;
};