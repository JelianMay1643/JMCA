export type Stats = {
  totals: {
    revenue: number;
    orders: number;
    customers: number;
    products: number;
    lowStock: number;
  };
  period: { days: number; revenue: number; orders: number };
  today: { revenue: number; orders: number };
  statusCounts: Record<string, number>;
  daily: { date: string; revenue: number; orders: number }[];
  topProducts: {
    productId: number;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  byCategory: { category: string; revenue: number }[];
  byPayment: { method: string; count: number; revenue: number }[];
  recentOrders: {
    id: string;
    customerName: string;
    total: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
  }[];
  lowStock: { id: number; name: string; category: string; stock: number }[];
};