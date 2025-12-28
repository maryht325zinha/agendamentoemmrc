
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface AuthProps {
    onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<'TEACHER' | 'ADMIN'>('TEACHER');
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            role: role,
                        },
                    },
                });
                if (signUpError) throw signUpError;
                alert('Confirme seu e-mail para ativar sua conta!');
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
                onLogin();
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro na autenticação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-500">
                <div className="p-8 pb-4 flex flex-col items-center">
                    <div className="h-20 w-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-4xl shadow-xl shadow-indigo-100 mb-6 rotate-3">
                        <i className="fa-solid fa-graduation-cap"></i>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900">
                        {isSignUp ? 'Criar Conta' : 'AgendamentosEMMRC'}
                    </h1>
                    <p className="text-slate-500 text-sm mt-2">
                        {isSignUp ? 'Cadastre-se para gerenciar agendamentos' : 'Bem-vindo de volta!'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="p-8 pt-4 space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-semibold border border-red-100 flex items-start gap-2">
                            <i className="fa-solid fa-circle-exclamation mt-1"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    {isSignUp && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Seu Nome Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Ex: Prof. Roberto Silva"
                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Nível de Acesso</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as any)}
                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium transition-all appearance-none"
                                >
                                    <option value="TEACHER">Professor</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">E-mail</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Ex: roberto@escola.edu.br"
                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Senha</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-100 transition-all flex items-center justify-center gap-3 group"
                    >
                        {loading ? (
                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                        ) : (
                            <>
                                <span>{isSignUp ? 'Criar Conta' : 'Entrar no Sistema'}</span>
                                <i className="fa-solid fa-arrow-right text-slate-400 group-hover:translate-x-1 transition-transform"></i>
                            </>
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                            {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Ainda não tem conta? Cadastre-se'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Auth;
