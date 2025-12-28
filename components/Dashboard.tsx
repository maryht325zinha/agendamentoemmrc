
import React, { useState } from 'react';
import { User, Booking, ResourceType, BookingStatus } from '../types';
import { RESOURCES } from '../constants';
import BookingModal from './BookingModal';

interface DashboardProps {
  user: User;
  bookings: Booking[];
  onAddBookings: (b: Partial<Booking>[]) => void;
  onUpdateBooking: (id: string, b: Partial<Booking>) => void;
  onDeleteBooking: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user, bookings, onAddBookings, onUpdateBooking, onDeleteBooking
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  // Admin Cancellation States
  const [cancelingBooking, setCancelingBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const userBookings = bookings.filter(b => b.userId === user.id);
  const isAdmin = user.role === 'ADMIN';
  const displayBookings = isAdmin ? bookings : userBookings;

  const filteredDisplayBookings = displayBookings.filter(b => b.date >= filterDate).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingBooking(null);
    setIsModalOpen(true);
  };

  const handleConfirm = (booking: Booking) => {
    onUpdateBooking(booking.id, { status: 'CONFIRMED' });
  };

  const initiateCancel = (booking: Booking) => {
    setCancelingBooking(booking);
    setCancelReason('');
  };

  const executeCancel = () => {
    if (cancelingBooking) {
      onUpdateBooking(cancelingBooking.id, {
        status: 'CANCELED',
        adminNote: cancelReason || 'Reserva cancelada pela administração.'
      });
      setCancelingBooking(null);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
            <i className="fa-solid fa-circle-check"></i> CONFIRMADO
          </span>
        );
      case 'CANCELED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200 uppercase tracking-wider">
            <i className="fa-solid fa-circle-xmark"></i> CANCELADO
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-wider">
            <i className="fa-solid fa-clock"></i> PENDENTE
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-sm font-medium mb-1">Seus Agendamentos</p>
            <h3 className="text-3xl font-bold">{userBookings.length}</h3>
          </div>
          <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
            <i className="fa-solid fa-calendar-check"></i>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Próxima Reserva</p>
            <h3 className="text-xl font-bold text-slate-800">
              {userBookings.filter(b => b.status !== 'CANCELED').length > 0
                ? `${new Date(userBookings.filter(b => b.status !== 'CANCELED')[0].date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} às ${userBookings.filter(b => b.status !== 'CANCELED')[0].startTime}`
                : 'Nenhum agendamento'}
            </h3>
          </div>
          <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl">
            <i className="fa-solid fa-clock"></i>
          </div>
        </div>

        <button
          onClick={handleNew}
          className="bg-slate-900 hover:bg-slate-800 transition-colors rounded-3xl p-6 text-white shadow-xl shadow-slate-200 flex items-center justify-between group"
        >
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Novo Agendamento</p>
            <h3 className="text-xl font-bold">Reservar agora</h3>
          </div>
          <div className="h-12 w-12 bg-indigo-500 group-hover:bg-indigo-400 transition-colors rounded-2xl flex items-center justify-center text-2xl">
            <i className="fa-solid fa-plus"></i>
          </div>
        </button>
      </div>

      {/* Main List & Filters */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800">
            {isAdmin ? 'Todos os Agendamentos (Admin)' : 'Meus Agendamentos'}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ver a partir de:</span>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-slate-50 border-none rounded-lg px-3 py-1.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredDisplayBookings.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Status / Recurso</th>
                  <th className="px-6 py-4">Data e Hora</th>
                  {isAdmin && <th className="px-6 py-4">Professor</th>}
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDisplayBookings.map(b => {
                  const resource = RESOURCES[b.resourceId];
                  return (
                    <tr key={b.id} className={`hover:bg-slate-50/50 transition-colors ${b.status === 'CANCELED' ? 'opacity-60 bg-slate-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(b.status)}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-${resource.color}-50 text-${resource.color}-600`}>
                              <i className={`fa-solid ${resource.icon}`}></i>
                            </div>
                            <div>
                              <p className="font-bold text-slate-700 text-sm">{resource.name}</p>
                              <div className="flex flex-col gap-0.5 mt-0.5">
                                {b.room && (
                                  <span className="text-xs font-semibold text-indigo-600">
                                    <i className="fa-solid fa-location-dot mr-1"></i> {b.room}
                                  </span>
                                )}
                                {b.quantity && <span className="text-[10px] text-slate-500">{b.quantity} unidades</span>}
                              </div>
                            </div>
                          </div>
                          {b.adminNote && (
                            <div className={`p-2 rounded-lg text-xs italic ${b.status === 'CANCELED' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600'}`}>
                              <strong>Obs do Admin:</strong> {b.adminNote}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-slate-600 font-medium whitespace-nowrap">
                            {new Date(b.date).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'long' })}
                          </span>
                          <div className="inline-flex items-center self-start px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {b.startTime} - {b.endTime}
                          </div>
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-slate-700">{b.userName}</span>
                        </td>
                      )}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {isAdmin && b.status === 'PENDING' && (
                            <button
                              onClick={() => handleConfirm(b)}
                              className="p-2 text-emerald-500 hover:text-emerald-700 transition-colors rounded-lg bg-emerald-50 hover:bg-emerald-100"
                              title="Marcar como Atendido"
                            >
                              <i className="fa-solid fa-check-double"></i>
                            </button>
                          )}

                          {isAdmin && b.status !== 'CANCELED' && (
                            <button
                              onClick={() => initiateCancel(b)}
                              className="p-2 text-red-400 hover:text-red-600 transition-colors rounded-lg bg-red-50 hover:bg-red-100"
                              title="Cancelar com Motivo"
                            >
                              <i className="fa-solid fa-ban"></i>
                            </button>
                          )}

                          {b.userId === user.id && b.status !== 'CANCELED' && (
                            <button
                              onClick={() => handleEdit(b)}
                              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                              title="Editar Agendamento"
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center h-20 w-20 bg-slate-100 rounded-full mb-4 text-slate-400 text-3xl">
                <i className="fa-solid fa-calendar-xmark"></i>
              </div>
              <h3 className="text-slate-900 font-bold mb-1">Nenhum agendamento encontrado</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                Não há reservas registradas para o período selecionado.
              </p>
              <button
                onClick={handleNew}
                className="mt-6 inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <i className="fa-solid fa-plus"></i>
                Fazer um agendamento
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Modal */}
      {cancelingBooking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 animate-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Cancelar Agendamento</h3>
            <p className="text-sm text-slate-500 mb-4">
              Informe o motivo do cancelamento. O professor <strong>{cancelingBooking.userName}</strong> será notificado.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ex: Recurso em manutenção, sala reservada para evento..."
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none text-sm h-24 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setCancelingBooking(null)}
                className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={executeCancel}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-lg shadow-red-100 transition-all"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => {
          if (editingBooking) {
            onUpdateBooking(editingBooking.id, data[0]);
          } else {
            onAddBookings(data);
          }
        }}
        user={user}
        editingBooking={editingBooking}
        allBookings={bookings}
      />
    </div>
  );
};

export default Dashboard;
