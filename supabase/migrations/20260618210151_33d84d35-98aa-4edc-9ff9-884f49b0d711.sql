
CREATE TABLE public.ev_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  model text NOT NULL,
  slug text UNIQUE NOT NULL,
  type text,
  price_bdt bigint,
  range_km int,
  battery_kwh numeric,
  charging_time_min int,
  zero_to_hundred numeric,
  specs jsonb,
  pros text[],
  cons text[],
  image_url text,
  is_featured boolean DEFAULT false,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.ev_models TO anon, authenticated;
GRANT ALL ON public.ev_models TO service_role;
ALTER TABLE public.ev_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ev_models public read" ON public.ev_models FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text,
  title_bn text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt_bn text,
  content_en text,
  content_bn text,
  category text,
  meta_title text,
  meta_description text,
  cover_url text,
  author text DEFAULT 'BanglaEV',
  published boolean DEFAULT true,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.posts TO anon, authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts public read published" ON public.posts FOR SELECT TO anon, authenticated USING (published = true);

CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  source text,
  created_at timestamptz DEFAULT now()
);
GRANT INSERT ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads anon insert" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
