
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ResourceType, Booking, User } from '../types';
import { RESOURCES, TIME_SLOTS } from '../constants';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookings: Partial<Booking>[]) => void;
  user: User;
  editingBooking?: Booking | null;
  allBookings: Booking[];
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen, onClose, onSave, user, editingBooking, allBookings
}) => {
  const [selectedResourceIds, setSelectedResourceIds] = useState<Set<ResourceType>>(new Set([ResourceType.DATA_SHOW]));
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('08:20');
  const [quantity, setQuantity] = useState(1);
  const [room, setRoom] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingBooking) {
      setSelectedResourceIds(new Set([editingBooking.resourceId]));
      setDate(editingBooking.date);
      setStartTime(editingBooking.startTime);
      setEndTime(editingBooking.endTime);
      setQuantity(editingBooking.quantity || 1);
      setRoom(editingBooking.room || '');
    } else {
      setSelectedResourceIds(new Set([ResourceType.DATA_SHOW]));
      setDate(new Date().toISOString().split('T')[0]);
      setStartTime('07:30');
      setEndTime('08:20');
      setQuantity(1);
      setRoom('');
    }
    setError(null);
  }, [editingBooking, isOpen]);

  if (!isOpen) return null;

  const toggleResource = (id: ResourceType) => {
    if (editingBooking) return; // Cannot change resource when editing
    const next = new Set(selectedResourceIds);
    if (next.has(id)) {
      if (next.size > 1) next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedResourceIds(next);
  };

  const needsRoomField = selectedResourceIds.has(ResourceType.TABLETS) || selectedResourceIds.has(ResourceType.DATA_SHOW);

  const validate = () => {
    if (startTime >= endTime) {
      return "O horário de término deve ser após o de início.";
    }

    if (selectedResourceIds.size === 0) {
      return "Selecione pelo menos um recurso.";
    }

    if (needsRoomField && !room.trim()) {
      return "Por favor, informe a sala onde o recurso será utilizado.";
    }

    for (const resId of Array.from(selectedResourceIds) as ResourceType[]) {
      const currentResource = RESOURCES[resId];

      const conflicts = allBookings.filter(b => {
        if (editingBooking && b.id === editingBooking.id) return false;
        // Ignore canceled bookings for conflict validation
        if (b.status === 'CANCELED') return false;

        if (b.resourceId === resId && b.date === date) {
          return startTime < b.endTime && endTime > b.startTime;
        }
        return false;
      });

      if (resId === ResourceType.TABLETS) {
        const totalOccupied = conflicts.reduce((sum, b) => sum + (b.quantity || 0), 0);
        if (totalOccupied + quantity > currentResource.maxQuantity) {
          return `Limite de tablets excedido para o horário. Disponível: ${currentResource.maxQuantity - totalOccupied}.`;
        }
      } else {
        if (conflicts.length > 0) {
          return `O recurso "${currentResource.name}" já está reservado neste horário por outro professor.`;
        }
      }
    }

    return null;
  };

  const handleSave = () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const bookingsToSave: Partial<Booking>[] = (Array.from(selectedResourceIds) as ResourceType[]).map(resId => ({
      id: (editingBooking && resId === editingBooking.resourceId) ? editingBooking.id : Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      resourceId: resId,
      date,
      startTime,
      endTime,
      room: (resId === ResourceType.TABLETS || resId === ResourceType.DATA_SHOW) ? room : undefined,
      quantity: resId === ResourceType.TABLETS ? quantity : undefined,
      status: (editingBooking && resId === editingBooking.resourceId) ? editingBooking.status : 'PENDING',
      adminNote: (editingBooking && resId === editingBooking.resourceId) ? editingBooking.adminNote : undefined,
      createdAt: (editingBooking && resId === editingBooking.resourceId) ? editingBooking.createdAt : Date.now()
    }));

    onSave(bookingsToSave);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">
            {editingBooking ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100 flex items-start gap-2">
              <i className="fa-solid fa-circle-exclamation mt-1"></i>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Selecione o(s) Recurso(s)</label>
            <div className="grid grid-cols-1 gap-2">
              {Object.values(RESOURCES).map(res => (
                <button
                  key={res.id}
                  disabled={!!editingBooking && editingBooking.resourceId !== res.id}
                  onClick={() => toggleResource(res.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${selectedResourceIds.has(res.id)
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-100 bg-white hover:border-slate-300'
                    } ${!!editingBooking && editingBooking.resourceId !== res.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center border-2 ${selectedResourceIds.has(res.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                    {selectedResourceIds.has(res.id) && <i className="fa-solid fa-check text-[10px]"></i>}
                  </div>
                  <i className={`fa-solid ${res.icon} text-lg w-6`}></i>
                  <div className="text-left">
                    <p className="font-bold text-sm">{res.name}</p>
                    <p className="text-xs opacity-70">{res.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {needsRoomField && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Qual é a sua sala?</label>
              <input
                type="text"
                placeholder="Ex: Sala 05, Laboratório, 2º Ano A..."
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Início</label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              >
                {TIME_SLOTS.slice(0, -1).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Término</label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              >
                {TIME_SLOTS.filter(t => t > startTime).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {selectedResourceIds.has(ResourceType.TABLETS) && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Quantidade de Tablets (Máx: {RESOURCES[ResourceType.TABLETS].maxQuantity})</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max={RESOURCES[ResourceType.TABLETS].maxQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="flex-1 accent-indigo-600"
                />
                <span className="font-bold text-lg bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg">
                  {quantity}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] px-4 py-2.5 rounded-xl bg-indigo-600 font-semibold text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
          >
            {editingBooking ? 'Salvar Alterações' : 'Confirmar Reserva(s)'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BookingModal;
