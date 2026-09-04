import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env.local');

// Parse .env.local manually
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const testVehicle = {
    id: 'f204bb22-8d0d-403c-9d97-0479c8fc6f41', // Existing ID from fetch
    name: 'TEST BIZ 110',
    price: 12990,
    type: 'MOTOS',
    image_url: 'https://i.ibb.co/9km4H47j/1776463843715-7yaiom.jpg',
    images: ['https://i.ibb.co/9km4H47j/1776463843715-7yaiom.jpg'],
    km: 32,
    year: '2022',
    color: 'VERMELHA',
    plate_last3: 'E30',
    is_sold: false,
    updated_at: new Date().toISOString()
  };

  console.log('Attempting upsert with Anon Key...');
  const { data, error } = await supabase
    .from('vehicles')
    .upsert(testVehicle, { onConflict: 'id' });

  if (error) {
    console.error('Upsert failed with error:', error);
  } else {
    console.log('Upsert succeeded! Data:', data);
  }
}

run().catch(console.error);
