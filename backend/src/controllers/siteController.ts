import type { Request, Response } from 'express';
import { Site } from '../models/Site';
import { getCache, setCache } from '../config/redis';

const SITES_CACHE_KEY = 'sites:all';
const SITE_CACHE_TTL = 300; // 5 minutes

export async function getSites(_req: Request, res: Response): Promise<void> {
  const cached = await getCache(SITES_CACHE_KEY);
  if (cached) {
    res.json(cached);
    return;
  }
  const sites = await Site.find().sort({ name: 1 });
  await setCache(SITES_CACHE_KEY, sites, SITE_CACHE_TTL);
  res.json(sites);
}

export async function getSiteById(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const cacheKey = `sites:${id}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }
  const site = await Site.findById(id);
  if (!site) { res.status(404).json({ error: 'Site not found' }); return; }
  await setCache(cacheKey, site, SITE_CACHE_TTL);
  res.json(site);
}
