import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess }) => {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error } = await signIn(email, password);

        if (error) {
            setError('Email ou senha incorretos. Tente novamente.');
            setLoading(false);
        } else {
            onSuccess();
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 bg-black/95 backdrop-blur-md">
            <div className="w-full max-w-md bg-surface border border-white/10 p-8 rounded-[2rem] shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="font-heading text-gold text-2xl uppercase tracking-wider">Acesso ADM</h2>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-bold mt-2">Autenticação Necessária</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-white/50 hover:text-white transition-all"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-600/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-500">error</span>
                        <p className="text-red-500 text-xs font-bold">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] text-white/40 uppercase font-bold tracking-widest mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-surface-light border border-white/5 text-white text-sm px-6 py-4 rounded-2xl focus:border-gold outline-none"
                            placeholder="seu@email.com"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] text-white/40 uppercase font-bold tracking-widest mb-2">
                            Senha
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-surface-light border border-white/5 text-white text-sm px-6 py-4 rounded-2xl focus:border-gold outline-none"
                            placeholder="••••••••"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-gold text-black font-heading text-[11px] tracking-[0.3em] rounded-full shadow-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                <span>ENTRANDO...</span>
                            </div>
                        ) : (
                            'ENTRAR'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-[9px] text-white/20 uppercase tracking-wider">
                        Acesso restrito a administradores
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
