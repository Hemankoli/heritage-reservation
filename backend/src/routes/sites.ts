import { Router } from 'express';
import { getSites, getSiteById } from '../controllers/siteController';

const router = Router();
router.get('/', getSites);
router.get('/:id', getSiteById);
export default router;
