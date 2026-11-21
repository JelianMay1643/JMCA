import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export const getPayment = async (userId: number) => {
  const [row] = await db
    .select({
      paymentProvider: users.paymentProvider,
      paymentNumber: users.paymentNumber,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row ?? { paymentProvider: null, paymentNumber: null };
};

export const savePayment = async (
  userId: number,
  provider: string | null,
  number: string | null
) => {
  await db
    .update(users)
    .set({ paymentProvider: provider, paymentNumber: number })
    .where(eq(users.id, userId));
};