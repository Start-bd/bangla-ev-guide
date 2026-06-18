
DROP POLICY "leads anon insert" ON public.leads;
CREATE POLICY "leads anon insert" ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 100
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(email) <= 200
    AND (message IS NULL OR char_length(message) <= 2000)
    AND (phone IS NULL OR char_length(phone) <= 30)
    AND (source IS NULL OR char_length(source) <= 100)
  );
