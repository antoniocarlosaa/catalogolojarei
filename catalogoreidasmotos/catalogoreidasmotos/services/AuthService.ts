import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export class AuthService {
    // Login com email e senha
    async signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            return { user: data.user, error: null };
        } catch (error) {
            return { user: null, error: error as Error };
        }
    }

    // Logout
    async signOut(): Promise<{ error: Error | null }> {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    }

    // Obter usuário atual
    async getCurrentUser(): Promise<User | null> {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    }

    // Obter sessão atual
    async getSession(): Promise<Session | null> {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    }

    // Listener para mudanças de autenticação
    onAuthStateChange(callback: (event: string, session: Session | null) => void) {
        return supabase.auth.onAuthStateChange(callback);
    }
}

export const authService = new AuthService();
