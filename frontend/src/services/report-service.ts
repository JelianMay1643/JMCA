import api from "../lib/axios";


export const reportReasons = [
  "Fake or counterfeit",
  "Wrong description or price",
  "Inappropriate item",
  "Damaged or poor quality",
  "Other",
];

export type ReportStatus = "open" | "reviewed" | "dismissed";

export type Report = {
  id: number;
  productId: number;
  productName: string;
  reporterName: string | null;
  reporterEmail: string | null;
  reason: string;
  details?: string | null;
  status: ReportStatus;
  createdAt: string;
};

export async function reportProduct(
  productId: number,
  reason: string,
  details?: string
) {
  const { data } = await api.post(`/api/reports/product/${productId}`, {
    reason,
    details,
  });
  return data;
}

export async function getReports(): Promise<Report[]> {
  const { data } = await api.get("/api/reports");
  return data;
}

export async function updateReport(
  id: number,
  status: "reviewed" | "dismissed"
): Promise<{ status: ReportStatus }> {
  const { data } = await api.patch(`/api/reports/${id}`, { status });
  return data;
}