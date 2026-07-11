
ALTER TABLE public.ev_models ADD COLUMN IF NOT EXISTS last_price_update date;
UPDATE public.ev_models SET price_bdt = 5590000, last_price_update = CURRENT_DATE WHERE slug = 'byd-atto-3';
UPDATE public.ev_models SET last_price_update = CURRENT_DATE WHERE slug IN ('byd-seal','byd-sealion-6','byd-dolphin');
