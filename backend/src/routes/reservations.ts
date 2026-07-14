import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { createReservation, cancelReservation, getUserReservations } from '../controllers/reservationController';

const router = Router();
router.use(authenticate);
router.post('/', createReservation);
router.delete('/:id', cancelReservation);
router.get('/my', getUserReservations);
export default router;
