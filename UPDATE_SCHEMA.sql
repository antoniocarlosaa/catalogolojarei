-- Adiciona colunas faltantes na tabela vehicles

ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS image_position text DEFAULT '50% 50%';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS plate_last3 text;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS is_zero_km boolean DEFAULT false;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS is_promo_mes boolean DEFAULT false;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS is_repasse boolean DEFAULT false;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS has_revisoes boolean DEFAULT false;

NOTIFY pgrst, 'reload schema';
