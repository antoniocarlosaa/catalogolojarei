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
        try {
            // 1. Obter dados do IP/Localização (API Gratuita)
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();

            const isMobile = typeof navigator !== 'undefined' ? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) : false;

            const logData: AccessLog = {
                ip: data.ip || 'Desconhecido',
                location: `${data.city || ''}, ${data.region_code || ''} - ${data.country_name || ''}`,
                // Salvando um JSON completo no campo de texto para não precisar alterar o banco agora
                device_info: JSON.stringify({
                    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
                    platform: typeof navigator !== 'undefined' ? navigator.platform : 'Unknown',
                    screen: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'Unknown',
                    language: typeof navigator !== 'undefined' ? navigator.language : 'Unknown',
                    isp: data.org || data.asn || 'Desconhecido',
                    timezone: data.timezone,
                    lat_long: `${data.latitude}, ${data.longitude}`,
                    connection: (typeof navigator !== 'undefined' && (navigator as any).connection) ? (navigator as any).connection.effectiveType : 'unknown'
                }),
                device_type: isMobile ? 'Mobile' : 'Desktop'
            };

            // 2. Gravar no Supabase (Silent - não deve travar o site se falhar)
            await supabase.from('access_logs').insert([logData]);

        } catch (error) {
            console.warn('Falha ao registrar log de visita (Silent):', error);
            // Não alertamos o usuário para não atrapalhar a experiência
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

        if (error) return 0;
        return count || 0;
    }
}

export const logger = new LogService();
