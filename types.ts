
export enum ResourceType {
  TABLETS = 'TABLETS',
  DATA_SHOW = 'DATA_SHOW',
  LOUSA_SALA_17 = 'LOUSA_SALA_17'
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'TEACHER' | 'ADMIN';
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  resourceId: ResourceType;
  date: string; // ISO format YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  quantity?: number; // Only for Tablets
  room?: string; // Room identification
  status: BookingStatus;
  adminNote?: string; // Reason for cancellation or general feedback
  createdAt: number;
}

export interface ResourceInfo {
  id: ResourceType;
  name: string;
  icon: string;
  maxQuantity: number;
  description: string;
  color: string;
}
