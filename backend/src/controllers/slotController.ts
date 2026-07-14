import type { Request, Response } from 'express';
import { z } from 'zod';
import { TimeSlot } from '../models/TimeSlot';
import { getCache, setCache } from '../config/redis';

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const SLOT_CACHE_TTL = 60; // 1 minute — slots change with bookings

export function slotCacheKey(siteId: string, date?: string): string {
  return `slots:${siteId}${date ? `:${date}` : ''}`;
}

export async function getSlotsBySite(req: Request, res: Response): Promise<void> {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: 'Invalid date format' }); return; }

  const { siteId } = req.params as { siteId: string };
  const { date } = parsed.data;
  const cacheKey = slotCacheKey(siteId, date);

  const cached = await getCache(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  const filter: Record<string, unknown> = { site: siteId };
  if (date) {
    const day = new Date(date);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    filter['date'] = { $gte: day, $lt: next };
  }

  const slots = await TimeSlot.find(filter).sort({ date: 1, startTime: 1 });
  await setCache(cacheKey, slots, SLOT_CACHE_TTL);
  res.json(slots);
}
