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
                            <div className="w-12 h-12 bg-gold/10 text-gold rounded-full flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-2xl">notifications_active</span>
                            </div>

                            <h3 className="text-2xl font-heading text-white mb-2">Novidades Exclusivas</h3>
                            <p className="text-white/60 text-sm mb-6 max-w-xs">
                                Cadastre-se para receber avisos sobre novos veículos de luxo e ofertas especiais em primeira mão.
                            </p>

                            <form onSubmit={handleSubmit} className="w-full space-y-4">
                                <input
                                    type="text"
                                    placeholder="Seu Nome (Opcional)"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-gold outline-none text-sm placeholder:text-white/20"
                                />
                                <input
                                    type="email"
                                    required
                                    placeholder="Seu Melhor E-mail"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-gold outline-none text-sm placeholder:text-white/20"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gold text-black font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Inscrevendo...' : 'Quero Receber Novidades'}
                                </button>
                            </form>

                            <p className="mt-4 text-[10px] text-white/20">
                                Respeitamos sua privacidade. Cancele quando quiser.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewsletterModal;
