// Script de teste da conexão com Supabase
import { supabase } from './services/supabase';

async function testSupabaseConnection() {
    console.log('🔍 Testando conexão com Supabase...\n');

    // Teste 1: Verificar credenciais
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    console.log('📋 Credenciais configuradas:');
    console.log('URL:', url || '❌ NÃO CONFIGURADA');
    console.log('Key:', key ? (key.startsWith('eyJ') ? '✅ Formato correto' : '⚠️ Formato suspeito') : '❌ NÃO CONFIGURADA');
    console.log('');

    if (!url || !key) {
        console.error('❌ Configure as credenciais no arquivo .env.local');
        return;
    }

    // Teste 2: Tentar buscar dados
    try {
        console.log('🔄 Tentando buscar veículos...');
        const { data, error } = await supabase
            .from('vehicles')
            .select('count');

        if (error) {
            console.error('❌ Erro ao conectar:', error.message);
            console.log('\n💡 Possíveis causas:');
            console.log('1. Tabela "vehicles" não foi criada (execute o SQL do SUPABASE_SETUP.md)');
            console.log('2. Chave anon incorreta');
            console.log('3. URL incorreta');
        } else {
            console.log('✅ Conexão bem-sucedida!');
            console.log('📊 Veículos no banco:', data);
        }
    } catch (err) {
        console.error('❌ Erro de conexão:', err);
    }

    // Teste 3: Verificar autenticação
    try {
        console.log('\n🔐 Verificando autenticação...');
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            console.log('✅ Usuário autenticado:', user.email);
        } else {
            console.log('ℹ️ Nenhum usuário autenticado (normal se não fez login ainda)');
        }
    } catch (err) {
        console.error('⚠️ Erro ao verificar autenticação:', err);
    }

    console.log('\n✅ Teste concluído!');
}

// Executar teste
testSupabaseConnection();
