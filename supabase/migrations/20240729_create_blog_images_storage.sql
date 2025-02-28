
-- Create a storage bucket for blog images if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('blog-images', 'blog-images')
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload and view images
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES 
('Anyone can view blog images', 
'{"version":"1","statement":{"effect":"Allow","principal":"*","action":"GET","resource":"blog-images/*"}}',
'blog-images')
ON CONFLICT (name, bucket_id) DO NOTHING;

INSERT INTO storage.policies (name, definition, bucket_id)
VALUES 
('Authenticated users can upload blog images', 
'{"version":"1","statement":{"effect":"Allow","principal":{"id":"authenticated"},"action":["INSERT","UPDATE"],"resource":"blog-images/*"}}',
'blog-images')
ON CONFLICT (name, bucket_id) DO NOTHING;
