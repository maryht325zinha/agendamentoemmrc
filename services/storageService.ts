
import { supabase } from './supabaseClient';
import { Booking, User } from '../../types';

export const storageService = {
  // Bookings
  getBookings: async (): Promise<Booking[]> => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }

    return data.map(b => ({
      ...b,
      resourceId: b.resource_id,
      userId: b.user_id,
      userName: b.user_name,
      startTime: b.start_time,
      endTime: b.end_time,
      adminNote: b.admin_note,
      createdAt: new Date(b.created_at).getTime()
    })) as Booking[];
  },

  saveBooking: async (booking: Partial<Booking>): Promise<void> => {
    const { error } = await supabase
      .from('bookings')
      .insert([{
        user_id: (await supabase.auth.getUser()).data.user?.id,
        user_name: booking.userName,
        resource_id: booking.resourceId,
        date: booking.date,
        start_time: booking.startTime,
        end_time: booking.endTime,
        room: booking.room,
        quantity: booking.quantity,
        status: booking.status || 'PENDING'
      }]);

    if (error) throw error;
  },

  updateBooking: async (id: string, updated: Partial<Booking>): Promise<void> => {
    const payload: any = {};
    if (updated.status) payload.status = updated.status;
    if (updated.adminNote) payload.admin_note = updated.adminNote;
    if (updated.startTime) payload.start_time = updated.startTime;
    if (updated.endTime) payload.end_time = updated.endTime;
    if (updated.room) payload.room = updated.room;
    if (updated.quantity) payload.quantity = updated.quantity;

    const { error } = await supabase
      .from('bookings')
      .update(payload)
      .eq('id', id);

    if (error) throw error;
  },

  deleteBooking: async (id: string): Promise<void> => {
    const { error, count } = await supabase
      .from('bookings')
      .delete({ count: 'exact' }) // Request exact count of deleted rows
      .eq('id', id);

    if (error) throw error;

    if (count === 0) {
      throw new Error('No booking found or authorized to delete with the given ID.');
    }
  },

  // User Auth
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email || '',
      name: profile?.full_name || user.user_metadata?.full_name || 'Usuário',
      role: profile?.role || user.user_metadata?.role || 'TEACHER'
    };
  },

  logout: async (): Promise<void> => {
    await supabase.auth.signOut();
  }
};
