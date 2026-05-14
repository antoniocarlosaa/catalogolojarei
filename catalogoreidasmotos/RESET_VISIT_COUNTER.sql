-- 🚨 CUIDADO: ESTE SCRIPT APAGA TODO O HISTÓRICO DE VISITAS! 🚨
-- Execute apenas se você realmente quer ZERAR o contador.

TRUNCATE TABLE access_logs;

-- Confirmação visual
SELECT 'SUCESSO: Todas as visitas foram apagadas. O contador está zerado.' as status;
