-- ============================================
-- MyPeta Projects Schema Update
-- Add Planned Progress Tracking
-- ============================================
-- ⚠️  NOTE: This file is only for EXISTING databases that already have a projects table
-- ⚠️  For NEW databases, use supabase-schema-base.sql instead
--
-- Run this SQL in your Supabase SQL Editor to add planned progress tracking

-- ============================================
-- 1. ADD PLANNED_PROGRESS COLUMN
-- ============================================

-- Add planned_progress column to track expected progress
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS planned_progress INTEGER DEFAULT 0 CHECK (planned_progress >= 0 AND planned_progress <= 100);

-- Update existing rows to have planned_progress equal to progress (so they're on track)
UPDATE public.projects
SET planned_progress = progress
WHERE planned_progress IS NULL;

-- ============================================
-- 2. CREATE HELPER FUNCTION FOR DELAYED PROJECTS
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
-- 3. CREATE VIEW FOR PROJECT STATUS WITH DELAYS
-- ============================================

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
-- 4. CREATE FUNCTION TO GET DELAYED PROJECTS
-- ============================================

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

-- ============================================
-- 5. UPDATE STATISTICS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.get_project_statistics_v2()
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
GRANT EXECUTE ON FUNCTION public.get_project_statistics_v2 TO anon, authenticated;

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================
-- Next steps:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Update your TypeScript types to include planned_progress
-- 3. Update admin forms to allow setting planned progress
-- 4. Add visual indicators for delay status in your UI
