-- ============================================
-- MyPeta Projects - Base Schema
-- Initial Database Setup
-- ============================================
-- Run this SQL FIRST in your Supabase SQL Editor to create the base tables

-- ============================================
-- 1. CREATE PROJECTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    state_id TEXT NOT NULL,
    location TEXT,
    branch TEXT,
    type TEXT NOT NULL CHECK (type IN ('construction', 'machinery')),
    status TEXT NOT NULL CHECK (status IN ('planning', 'in-progress', 'completed', 'on-hold')),
    start_date DATE NOT NULL,
    end_date DATE,
    budget BIGINT NOT NULL CHECK (budget >= 0),
    disbursed NUMERIC(15, 2) DEFAULT 0 CHECK (disbursed >= 0),
    contractor TEXT NOT NULL,
    officer TEXT,
    description TEXT NOT NULL,
    progress NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    planned_progress NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (planned_progress >= 0 AND planned_progress <= 100),
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Index on state_id for filtering by state
CREATE INDEX IF NOT EXISTS idx_projects_state_id ON public.projects(state_id);

-- Index on type for filtering by project type
CREATE INDEX IF NOT EXISTS idx_projects_type ON public.projects(type);

-- Index on status for filtering by status
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

-- Index on start_date for date range queries
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON public.projects(start_date);

-- Index on created_by for user-specific queries
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);

-- Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- Index on branch for filtering by branch
CREATE INDEX IF NOT EXISTS idx_projects_branch ON public.projects(branch);

-- Index on officer for filtering by officer
CREATE INDEX IF NOT EXISTS idx_projects_officer ON public.projects(officer);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- Policy: Anyone can view projects (public read access)
CREATE POLICY "Allow public read access to projects"
ON public.projects
FOR SELECT
TO public
USING (true);

-- Policy: Only authenticated users can insert projects
CREATE POLICY "Allow authenticated users to insert projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Only authenticated users can update projects
CREATE POLICY "Allow authenticated users to update projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Only authenticated users can delete projects
CREATE POLICY "Allow authenticated users to delete projects"
ON public.projects
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- 5. CREATE UPDATED_AT TRIGGER
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before update
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 6. HELPER FUNCTION FOR DELAY CALCULATION
-- ============================================

-- Function to calculate progress delay percentage
CREATE OR REPLACE FUNCTION public.calculate_progress_delay(
    actual_progress INTEGER,
    planned_progress INTEGER
) RETURNS NUMERIC AS $$
BEGIN
    IF planned_progress = 0 THEN
        RETURN 0;
    END IF;

    -- Return negative if behind, positive if ahead
    -- E.g., actual 30%, planned 40% = -25% (behind by 25%)
    RETURN ROUND(((actual_progress - planned_progress)::NUMERIC / planned_progress::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 7. CREATE VIEWS
-- ============================================

-- View for projects with delay status
CREATE OR REPLACE VIEW public.projects_with_delays AS
SELECT
    p.*,
    (p.progress - p.planned_progress) as progress_difference,
    calculate_progress_delay(p.progress, p.planned_progress) as delay_percentage,
    CASE
        WHEN p.progress >= p.planned_progress THEN 'on_track_or_ahead'
        WHEN (p.planned_progress - p.progress) <= 5 THEN 'slightly_behind'
        WHEN (p.planned_progress - p.progress) > 5 THEN 'significantly_delayed'
        ELSE 'on_track'
    END as delay_status
FROM public.projects p;

-- Grant permissions on the view
GRANT SELECT ON public.projects_with_delays TO anon, authenticated;

-- ============================================
-- 8. UTILITY FUNCTIONS
-- ============================================

-- Function to get delayed projects
CREATE OR REPLACE FUNCTION public.get_delayed_projects(
    delay_threshold INTEGER DEFAULT 5
)
RETURNS SETOF public.projects AS $$
BEGIN
    RETURN QUERY
    SELECT p.*
    FROM public.projects p
    WHERE (p.planned_progress - p.progress) > delay_threshold
    ORDER BY (p.planned_progress - p.progress) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_delayed_projects TO anon, authenticated;

-- Function to get project statistics
CREATE OR REPLACE FUNCTION public.get_project_statistics()
RETURNS TABLE (
    total_projects BIGINT,
    total_budget BIGINT,
    avg_progress NUMERIC,
    avg_planned_progress NUMERIC,
    projects_ahead BIGINT,
    projects_on_track BIGINT,
    projects_delayed BIGINT,
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
        COALESCE(AVG(p.planned_progress), 0)::NUMERIC as avg_planned_progress,
        COUNT(*) FILTER (WHERE p.progress > p.planned_progress)::BIGINT as projects_ahead,
        COUNT(*) FILTER (WHERE p.progress = p.planned_progress)::BIGINT as projects_on_track,
        COUNT(*) FILTER (WHERE p.progress < p.planned_progress)::BIGINT as projects_delayed,
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_project_statistics TO anon, authenticated;

-- ============================================
-- BASE SCHEMA SETUP COMPLETE!
-- ============================================
-- Next steps:
-- 1. Your database is now ready to accept projects
-- 2. You can start using the admin panel to create projects
-- 3. All features including planned progress tracking are enabled
