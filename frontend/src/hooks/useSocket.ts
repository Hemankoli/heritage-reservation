import { useEffect } from 'react';
import { getSocket } from '../socket';
import { useAppDispatch } from './useAppDispatch';
import { updateSlotCapacity } from '../store/siteSlice';
import type { CapacityUpdate } from '../types/index';

export function useSocket() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const socket = getSocket();
    socket.on('capacity_update', (update: CapacityUpdate) => {
      dispatch(updateSlotCapacity({ slotId: update.slotId, available_tickets: update.available_tickets }));
    });
    return () => { socket.off('capacity_update'); };
  }, [dispatch]);
}
