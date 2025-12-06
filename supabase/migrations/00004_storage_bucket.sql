-- Create payment-proofs storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous uploads to payment-proofs bucket
CREATE POLICY "Allow anonymous upload to payment-proofs" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'payment-proofs');

-- Allow authenticated users to read payment proofs
CREATE POLICY "Allow authenticated read payment-proofs" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete payment proofs (admin cleanup)
CREATE POLICY "Allow authenticated delete payment-proofs" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');
