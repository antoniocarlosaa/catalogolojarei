import { supabase } from './supabase';

export interface AccessLog {
    id?: string;
    ip: string;
    location: string;
    device_info: string;
    device_type: 'Mobile' | 'Desktop';
    created_at?: string;
}

export interface AuditLog {
    id?: string;
    user_email: string;
    action_type: 'CRIAR' | 'EDITAR' | 'EXCLUIR' | 'LOGIN' | 'CONFIG';
    target: string;
    details: string;
    created_at?: string;
}

class LogService {
    // Registrar Visita (Público)
    async logVisit() {
        // 0. Verificar se já visitou nesta sessão (Evita F5 duplicando)
        if (typeof sessionStorage !== 'undefined') {
            if (sessionStorage.getItem('visited_session')) {
                return; // Já contou nesta sessão, ignora.
            }
            sessionStorage.setItem('visited_session', 'true');
        }

        try {
            let logData: AccessLog = {
                ip: 'Anonimo',
                location: 'Desconhecido',
                device_info: '{}',
                device_type: 'Desktop'
            };

            // 1. Tentar obter dados do IP (Pode falhar por AdBlock)
            try {
                const response = await fetch('https://ipapi.co/json/');
                if (response.ok) {
                    const data = await response.json();
                    
                    const isMobile = typeof navigator !== 'undefined' ? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) : false;

                    logData = {
                        ip: data.ip || 'Anonimo',
                        location: `${data.city || ''}, ${data.region_code || ''} - ${data.country_name || ''}`,
                        device_info: JSON.stringify({
                            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
                            screen: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'Unknown',
                            type: isMobile ? 'Mobile' : 'Desktop'
                        }),
                        device_type: isMobile ? 'Mobile' : 'Desktop'
                    };
                }
            } catch (err) {
                console.log('API de IP bloqueada ou falhou, registrando visita anônima.');
            }

            // 2. Gravar no Supabase (Silent)
            const { error } = await supabase.from('access_logs').insert([logData]);
            
            if (error) {
                console.error('Erro Supabase ao logar visita:', error.message);
            }

        } catch (error) {
            console.warn('Falha geral ao registrar log de visita:', error);
        }
    }

    // Registrar Ação do Admin (Autenticado)
    async logAction(userEmail: string, action: AuditLog['action_type'], target: string, details: string) {
        try {
            const auditData: AuditLog = {
                user_email: userEmail,
                action_type: action,
                target: target,
                details: details
            };
            await supabase.from('audit_logs').insert([auditData]);
        } catch (error) {
            console.error('Erro ao gravar log de auditoria:', error);
        }
    }

    // Buscar Logs de Visita (Para o Painel Admin)
    async getAccessLogs(limit = 100) {
        const { data, error } = await supabase
            .from('access_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data as AccessLog[];
    }

    // Buscar Logs de Auditoria (Para o Painel Admin)
    async getAuditLogs(limit = 100) {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data as AuditLog[];
    }
    // Excluir Log de Visita Individual
    async deleteAccessLog(id: string) {
        const { error } = await supabase.from('access_logs').delete().eq('id', id);
        if (error) throw error;
    }

    // Limpar Todos os Logs de Visita
    async clearAccessLogs() {
        // Deleta tudo onde ID não é nulo (ou seja, tudo)
        const { error } = await supabase.from('access_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) throw error;
    }

    // Excluir Log de Auditoria Individual
    async deleteAuditLog(id: string) {
        const { error } = await supabase.from('audit_logs').delete().eq('id', id);
        if (error) throw error;
    }

    // Limpar Todos os Logs de Auditoria
    async clearAuditLogs() {
        const { error } = await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) throw error;
    }

    // Contar Total de Visitas (Público/Discreto)
    async getVisitCount() {
        const { count, error } = await supabase
            .from('access_logs')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('❌ ERRO AO CONTAR VISITAS:', error.message, error.details, error.hint);
            return 0;
        }
        return count || 0;
    }
}

export const logger = new LogService();
