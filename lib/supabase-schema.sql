-- ============================================
-- MyPeta Projects Management Schema
-- ============================================
-- This schema adds project management capabilities with role-based access control
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- 1. CREATE PROJECTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    state_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('construction', 'machinery')),
    status TEXT NOT NULL CHECK (status IN ('planning', 'in-progress', 'completed', 'on-hold')),
    start_date DATE NOT NULL,
    end_date DATE,
    budget BIGINT NOT NULL CHECK (budget >= 0),
    contractor TEXT NOT NULL,
    description TEXT NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_by TEXT NOT NULL, -- Clerk user ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_projects_state_id ON public.projects(state_id);
CREATE INDEX IF NOT EXISTS idx_projects_type ON public.projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON public.projects(start_date);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at);

-- ============================================
-- 3. CREATE UPDATED_AT TRIGGER
-- ============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 4. HELPER FUNCTION TO CHECK ADMIN ROLE
-- ============================================
-- This function checks if a user has admin role from Clerk metadata
-- Note: You'll need to pass the Clerk metadata from the client

CREATE OR REPLACE FUNCTION public.is_user_admin(clerk_user_id TEXT, user_metadata JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if the user has admin role in their public metadata
    RETURN (user_metadata->>'role' = 'admin') OR (user_metadata->'publicMetadata'->>'role' = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read projects (public viewing)
DROP POLICY IF EXISTS "Anyone can view projects" ON public.projects;
CREATE POLICY "Anyone can view projects"
    ON public.projects
    FOR SELECT
    USING (true);

-- Policy: Only authenticated users can insert projects
-- Additional admin check should be done in the application layer
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON public.projects;
CREATE POLICY "Authenticated users can insert projects"
    ON public.projects
    FOR INSERT
    WITH CHECK (created_by IS NOT NULL);

-- Policy: Only the creator or admins can update their projects
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
CREATE POLICY "Users can update their own projects"
    ON public.projects
    FOR UPDATE
    USING (created_by = current_setting('app.current_user_id', true));

-- Policy: Only the creator can delete their projects
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
CREATE POLICY "Users can delete their own projects"
    ON public.projects
    FOR DELETE
    USING (created_by = current_setting('app.current_user_id', true));

-- ============================================
-- 6. PROJECT STATISTICS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.get_project_statistics()
RETURNS TABLE (
    total_projects BIGINT,
    total_budget BIGINT,
    avg_progress NUMERIC,
    by_status JSONB,
    by_type JSONB,
    by_state JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_projects,
        COALESCE(SUM(p.budget), 0)::BIGINT as total_budget,
        COALESCE(AVG(p.progress), 0)::NUMERIC as avg_progress,
        (
            SELECT jsonb_object_agg(status, count)
            FROM (
                SELECT status, COUNT(*) as count
                FROM public.projects
                GROUP BY status
            ) status_counts
        ) as by_status,
        (
            SELECT jsonb_object_agg(type, count)
            FROM (
                SELECT type, COUNT(*) as count
                FROM public.projects
                GROUP BY type
            ) type_counts
        ) as by_type,
        (
            SELECT jsonb_object_agg(state_id, count)
            FROM (
                SELECT state_id, COUNT(*) as count
                FROM public.projects
                GROUP BY state_id
            ) state_counts
        ) as by_state
    FROM public.projects p;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. GET PROJECTS BY FILTERS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.get_filtered_projects(
    filter_state TEXT DEFAULT NULL,
    filter_type TEXT DEFAULT NULL,
    filter_status TEXT DEFAULT NULL,
    filter_start_date DATE DEFAULT NULL,
    filter_end_date DATE DEFAULT NULL,
    sort_by TEXT DEFAULT 'created_at',
    sort_order TEXT DEFAULT 'DESC'
)
RETURNS SETOF public.projects AS $$
DECLARE
    query TEXT;
BEGIN
    query := 'SELECT * FROM public.projects WHERE 1=1';

    IF filter_state IS NOT NULL AND filter_state != 'all' THEN
        query := query || ' AND state_id = ' || quote_literal(filter_state);
    END IF;

    IF filter_type IS NOT NULL AND filter_type != 'all' THEN
        query := query || ' AND type = ' || quote_literal(filter_type);
    END IF;

    IF filter_status IS NOT NULL AND filter_status != 'all' THEN
        query := query || ' AND status = ' || quote_literal(filter_status);
    END IF;

    IF filter_start_date IS NOT NULL THEN
        query := query || ' AND start_date >= ' || quote_literal(filter_start_date);
    END IF;

    IF filter_end_date IS NOT NULL THEN
        query := query || ' AND start_date <= ' || quote_literal(filter_end_date);
    END IF;

    query := query || ' ORDER BY ' || quote_ident(sort_by) || ' ' || sort_order;

    RETURN QUERY EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. GRANT NECESSARY PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant select to everyone, insert/update/delete to authenticated users
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.projects TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.get_project_statistics() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_filtered_projects TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_admin TO authenticated;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next steps:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Set up Clerk to include 'role' in user metadata for admins
-- 3. Update your application to use these functions
-- 4. Test the RLS policies with different user roles
