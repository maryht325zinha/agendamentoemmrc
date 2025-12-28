
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import { User, Booking } from './types';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = await storageService.getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        const fetchedBookings = await storageService.getBookings();
        setBookings(fetchedBookings);
      }
    } catch (error: any) {
      console.error('Failed to load data:', error);
      setInitError(error.message || 'Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    await storageService.logout();
    setUser(null);
    setBookings([]);
  };

  const handleAddBookings = async (newBookings: Partial<Booking>[]) => {
    try {
      for (const booking of newBookings) {
        await storageService.saveBooking(booking);
      }
      const updatedBookings = await storageService.getBookings();
      setBookings(updatedBookings);
    } catch (error) {
      console.error('Error adding bookings:', error);
      alert('Erro ao realizar agendamento.');
    }
  };

  const handleUpdateBooking = async (id: string, updated: Partial<Booking>) => {
    try {
      await storageService.updateBooking(id, updated);
      const updatedBookings = await storageService.getBookings();
      setBookings(updatedBookings);
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      await storageService.deleteBooking(id);
      const updatedBookings = await storageService.getBookings();
      setBookings(updatedBookings);
    } catch (error: any) {
      console.error('Error deleting booking:', error);
      alert('Erro ao excluir agendamento: ' + (error.message || 'Erro desconhecido'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-circle-exclamation text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Erro na Inicialização</h2>
          <p className="text-slate-600 mb-6">{initError}</p>
          <button
            onClick={() => { setInitError(null); loadData(); }}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={loadData} />;
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      <Dashboard
        user={user}
        bookings={bookings}
        onAddBookings={handleAddBookings}
        onUpdateBooking={handleUpdateBooking}
        onDeleteBooking={handleDeleteBooking}
      />
    </Layout>
  );
};

export default App;
