DO $$
BEGIN
    -- Prisma's shadow database may not include Supabase's storage schema.
    -- Skip there, but configure the real Supabase project when storage exists.
    IF to_regclass('storage.buckets') IS NOT NULL THEN
        -- Create the public Supabase Storage bucket used by builder image uploads.
        EXECUTE $sql$
            INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
            VALUES (
                'page-assets',
                'page-assets',
                true,
                5242880,
                ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
            )
            ON CONFLICT (id) DO UPDATE SET
                public = EXCLUDED.public,
                file_size_limit = EXCLUDED.file_size_limit,
                allowed_mime_types = EXCLUDED.allowed_mime_types
        $sql$;

        -- The upload API stores images under users/{auth.uid()}/pages/{pageId}/{assetId}.
        -- Public reads are handled by the bucket's public setting; writes stay scoped.
        EXECUTE $sql$
            DROP POLICY IF EXISTS "Pageforce users can upload page assets" ON storage.objects
        $sql$;

        EXECUTE $sql$
            DROP POLICY IF EXISTS "Pageforce users can update page assets" ON storage.objects
        $sql$;

        EXECUTE $sql$
            DROP POLICY IF EXISTS "Pageforce users can delete page assets" ON storage.objects
        $sql$;

        EXECUTE $sql$
            CREATE POLICY "Pageforce users can upload page assets"
            ON storage.objects
            FOR INSERT
            TO authenticated
            WITH CHECK (
                bucket_id = 'page-assets'
                AND (storage.foldername(name))[1] = 'users'
                AND (storage.foldername(name))[2] = auth.uid()::text
            )
        $sql$;

        EXECUTE $sql$
            CREATE POLICY "Pageforce users can update page assets"
            ON storage.objects
            FOR UPDATE
            TO authenticated
            USING (
                bucket_id = 'page-assets'
                AND (storage.foldername(name))[1] = 'users'
                AND (storage.foldername(name))[2] = auth.uid()::text
            )
            WITH CHECK (
                bucket_id = 'page-assets'
                AND (storage.foldername(name))[1] = 'users'
                AND (storage.foldername(name))[2] = auth.uid()::text
            )
        $sql$;

        EXECUTE $sql$
            CREATE POLICY "Pageforce users can delete page assets"
            ON storage.objects
            FOR DELETE
            TO authenticated
            USING (
                bucket_id = 'page-assets'
                AND (storage.foldername(name))[1] = 'users'
                AND (storage.foldername(name))[2] = auth.uid()::text
            )
        $sql$;
    END IF;
END $$;
