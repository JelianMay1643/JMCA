import { Request, Response } from "express";
import * as statsRepo from "@/repositories/stats-repository";

export const getStats = async (req: Request, res: Response) => {
  const requested = Number(req.query.days);
  const days = [7, 30].includes(requested) ? requested : 7;
  res.json(await statsRepo.getStats(days));
};