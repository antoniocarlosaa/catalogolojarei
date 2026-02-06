import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const NewsletterModal: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // MODO DEBUG: Forçar exibição sempre após 1 segundo
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('newsletter_seen', 'true');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('newsletter_subscriptions')
                .insert([{ email, name }]);

            if (error) {
                // Se duplicado, fingimos sucesso para não expor dados ou mostramos msg amigável.
                if (error.code === '23505') { // Unique violation
                    setSubmitted(true);
                    localStorage.setItem('newsletter_subscribed', 'true');
                    setTimeout(() => setIsVisible(false), 2000);
                    return;
                }
                throw error;
            }

            setSubmitted(true);
            localStorage.setItem('newsletter_subscribed', 'true');
            setTimeout(() => setIsVisible(false), 2000);

        } catch (error) {
            console.error("Erro ao inscrever", error);
            alert("Houve um erro ao se inscrever. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    if (!isVisible && !submitted) return null;

    return (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`relative w-full max-w-md bg-surface border border-gold/20 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>

                <button onClick={handleClose} className="absolute top-2 right-2 text-white/30 hover:text-white transition-colors p-2">
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>

                <div className="p-8 flex flex-col items-center text-center">
                    {submitted ? (
                        <div className="animate-in fade-in zoom-in duration-300 py-8">
                            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl">check</span>
                            </div>
                            <h3 className="text-xl font-heading text-white mb-2">Inscrição Confirmada!</h3>
                            <p className="text-white/60 text-sm">Obrigado por se inscrever. Você receberá nossas novidades.</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-12 h-12 bg-[#25D366]/20 text-[#25D366] rounded-full flex items-center justify-center mb-6 animate-bounce">
                                <span className="material-symbols-outlined text-2xl">chat</span>
                            </div>

                            <h3 className="text-2xl font-heading text-white mb-2">Receba no WhatsApp!</h3>
                            <p className="text-white/60 text-sm mb-6 max-w-xs">
                                Seja o primeiro a saber quando chegar uma nova nave. Cadastre seu WhatsApp para receber alertas em tempo real.
                            </p>

                            <form onSubmit={handleSubmit} className="w-full space-y-4">
                                <input
                                    type="text"
                                    placeholder="Seu Nome"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-[#25D366] outline-none text-sm placeholder:text-white/20"
                                />
                                <input
                                    type="tel"
                                    required
                                    placeholder="(99) 99999-9999"
                                    value={email} // Using email state for phone to minimize refactor lines, conceptually it's 'contact'
                                    onChange={e => {
                                        // Simple mask
                                        let v = e.target.value.replace(/\D/g, '');
                                        v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
                                        v = v.replace(/(\d)(\d{4})$/, '$1-$2');
                                        setEmail(v);
                                    }}
                                    maxLength={15}
                                    className="w-full bg-black/20 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-[#25D366] outline-none text-sm placeholder:text-white/20"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#25D366] text-white font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(37,211,102,0.4)]"
                                >
                                    {loading ? 'Cadastrando...' : 'Ativar Alerta WhatsApp'}
                                </button>
                            </form>

                            <div className="mt-6 flex flex-col gap-2 w-full">
                                <button
                                    onClick={() => {
                                        if (confirm("Deseja realmente parar de receber os alertas?")) {
                                            localStorage.removeItem('newsletter_subscribed');
                                            alert("Você foi removido da lista localmente. Para remoção total, contate o admin.");
                                            handleClose();
                                        }
                                    }}
                                    className="text-[10px] text-white/30 hover:text-red-400 underline decoration-dotted cursor-pointer transition-colors"
                                >
                                    Não quero mais receber mensagens
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewsletterModal;
