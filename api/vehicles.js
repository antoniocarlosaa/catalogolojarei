import { createClient } from '@supabase/supabase-js';

// Gerador determinístico de UUID para lidar com IDs do CRM que não são UUID
function getDeterministicUUID(str) {
  if (!str) return null;
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
  if (isUUID) return str;

  // Cria um hash estável e formata como UUID v4 fake determinístico
  let hash1 = 0, hash2 = 0;
  const stringVal = String(str);
  for (let i = 0; i < stringVal.length; i++) {
    const char = stringVal.charCodeAt(i);
    hash1 = (hash1 * 31 + char) & 0xffffffff;
    hash2 = (hash2 * 37 + char) & 0xffffffff;
  }
  const part1 = Math.abs(hash1).toString(16).padStart(8, '0');
  const part2 = Math.abs(hash2).toString(16).padStart(8, '0');
  const part3 = Math.abs(hash1 ^ hash2).toString(16).padStart(8, '0');
  const part4 = Math.abs(hash1 + hash2).toString(16).padStart(8, '0');
  const fullHex = (part1 + part2 + part3 + part4).slice(0, 32);
  
  return `${fullHex.slice(0, 8)}-${fullHex.slice(8, 12)}-4${fullHex.slice(12, 15)}-9${fullHex.slice(15, 18)}-${fullHex.slice(18, 30)}`;
}

export default async function handler(req, res) {
  // Configura cabeçalhos de CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    // 1. Validação do Token de Segurança
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const secretToken = process.env.VITE_API_TOKEN;

    if (!token || token !== secretToken) {
      return res.status(401).json({ error: 'Não autorizado. Token inválido.' });
    }

    // 2. Validação do payload recebido do CRM
    const vehicleData = req.body;
    if (!vehicleData || !vehicleData.id) {
      return res.status(400).json({ error: 'Payload inválido. ID do veículo é obrigatório.' });
    }

    // Inicialização do cliente Supabase usando a chave de serviço (se disponível) ou a Anon Key
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Configuração do Supabase ausente nas variáveis de ambiente.' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const finalId = getDeterministicUUID(vehicleData.id);

    // Determina se o veículo deve ser publicado ou removido do catálogo
    const shouldPublish = vehicleData.publish_catalog !== false && vehicleData.active !== false;

    if (!shouldPublish) {
      // Se não for para publicar (desmarcado no CRM), deletamos da tabela do catálogo
      const { error: deleteError } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', finalId);

      if (deleteError) {
        console.error("Erro ao deletar no Supabase:", deleteError);
        return res.status(500).json({ error: 'Erro ao remover veículo do catálogo.', details: deleteError.message });
      }

      return res.status(200).json({ success: true, message: 'Veículo removido do catálogo com sucesso!', id: finalId });
    }

    // Mapeamento de fotos (suporta array ou string separada por vírgula)
    let photos = [];
    if (Array.isArray(vehicleData.photos)) {
      photos = vehicleData.photos;
    } else if (typeof vehicleData.photos === 'string') {
      photos = vehicleData.photos.split(',').map(p => p.trim()).filter(Boolean);
    }
    const imageUrl = photos[0] || null;

    // Combina marca, modelo e versão para o campo name (obrigatório e NOT NULL)
    const name = [vehicleData.brand, vehicleData.model, vehicleData.version]
      .filter(Boolean)
      .join(' ') || 'Veículo sem nome';

    // Conversões e ajustes de tipos de dados para o banco
    const price = vehicleData.value ? parseFloat(vehicleData.value) : null;
    const km = vehicleData.mileage !== undefined ? parseInt(vehicleData.mileage, 10) : (vehicleData.km !== undefined ? parseInt(vehicleData.km, 10) : null);
    const plate_last3 = vehicleData.plate ? String(vehicleData.plate).slice(-3) : null;
    const type = (vehicleData.type && ['MOTOS', 'CARROS'].includes(vehicleData.type.toUpperCase())) 
      ? vehicleData.type.toUpperCase() 
      : 'MOTOS';

    // Monta o payload no formato correto para a tabela 'vehicles'
    const payload = {
      id: finalId,
      name,
      price,
      type,
      image_url: imageUrl,
      images: photos,
      km,
      year: vehicleData.year ? String(vehicleData.year) : null,
      color: vehicleData.color || null,
      plate_last3,
      is_sold: false,
      updated_at: new Date().toISOString()
    };

    // Executa o upsert
    const { data, error } = await supabase
      .from('vehicles')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error("Erro no Supabase:", error);
      return res.status(500).json({ error: 'Erro ao salvar no banco de dados do catálogo.', details: error.message });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Veículo sincronizado no catálogo com sucesso!', 
      id: finalId,
      data 
    });

  } catch (err) {
    console.error("Erro interno:", err);
    return res.status(500).json({ error: 'Erro interno no servidor.', details: err.message });
  }
}
