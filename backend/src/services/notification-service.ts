import { db } from "../db";
import { notifications } from "../db/schema";

type Payload = { title: string; message?: string; link?: string };

// Para sa usa ka customer
export async function notifyUser(userId: number, p: Payload) {
  try {
    await db.insert(notifications).values({ userId, audience: "user", ...p });
  } catch (err) {
    console.error("notifyUser failed:", err);
  }
}

// Para sa admin (usa ka shared row, ang bisan unsang admin makakita)
export async function notifyAdmin(p: Payload) {
  try {
    await db.insert(notifications).values({ userId: null, audience: "admin", ...p });
  } catch (err) {
    console.error("notifyAdmin failed:", err);
  }
}