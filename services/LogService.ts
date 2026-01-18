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

            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            const logData: AccessLog = {
                ip: data.ip || 'Desconhecido',
                location: `${data.city || 'Desconhecido'}, ${data.region_code || ''} - ${data.country_name || ''}`,
                device_info: `${navigator.platform} | ${navigator.userAgent}`,
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
}

export const logger = new LogService();
