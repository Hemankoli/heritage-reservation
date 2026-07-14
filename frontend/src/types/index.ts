export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Site {
  _id: string;
  name: string;
  description: string;
  location: string;
  imageUrl: string;
  maxDailyCapacity: number;
}

export interface TimeSlot {
  _id: string;
  site: string;
  date: string;
  startTime: string;
  endTime: string;
  totalCapacity: number;
  available_tickets: number;
}

export interface Reservation {
  _id: string;
  user: string;
  timeSlot: TimeSlot;
  site: { _id: string; name: string; location: string };
  quantity: number;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CapacityUpdate {
  slotId: string;
  available_tickets: number;
  siteId: string;
}
