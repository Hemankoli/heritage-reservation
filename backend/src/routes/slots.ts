import { Router } from 'express';
import { getSlotsBySite } from '../controllers/slotController';

const router = Router();
router.get('/:siteId/slots', getSlotsBySite);
export default router;
