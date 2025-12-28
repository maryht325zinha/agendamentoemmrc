
import React from 'react';
import { User } from '../types';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center relative">
            {/* Lado Esquerdo: Ícone */}
            <div className="flex items-center z-10">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <i className="fa-solid fa-graduation-cap text-white text-xl"></i>
              </div>
            </div>

            {/* Centro: Nome do App Centralizado */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 pointer-events-auto">
                AgendamentosEMMRC
              </h1>
            </div>

            {/* Lado Direito: Info do Usuário */}
            {user && (
              <div className="flex items-center space-x-4 z-10">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-slate-700 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                    {user.role === 'ADMIN' ? 'Admin' : 'Professor'}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors bg-slate-50 rounded-full"
                  title="Sair"
                >
                  <i className="fa-solid fa-right-from-bracket text-lg"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} AgendamentosEMMRC - Gestão de Recursos Escolares
      </footer>
    </div>
  );
};

export default Layout;
