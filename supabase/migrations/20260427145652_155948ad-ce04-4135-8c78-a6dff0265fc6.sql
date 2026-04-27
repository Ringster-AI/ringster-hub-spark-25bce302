-- Drop the over-permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can upload an avatar" ON storage.objects;

-- Replace UPDATE / DELETE policies (which previously checked owner) with
-- ones that ALSO require the path to belong to the user, matching the new
-- INSERT contract. owner can be NULL for files uploaded before this change,
-- so we rely on the path prefix as the source of truth.
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;

-- INSERT: only authenticated users, only into their own <uid>/... folder
CREATE POLICY "Authenticated users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- UPDATE: only authenticated users, only on files under their own folder
CREATE POLICY "Authenticated users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- DELETE: only authenticated users, only on files under their own folder
CREATE POLICY "Authenticated users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);