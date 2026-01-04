-- Migration: Fix Budget Type and Progress Delay Function
-- Date: 2026-01-04
-- Purpose:
--   1. Change budget from BIGINT to NUMERIC(15,2) to support decimal values
--   2. Fix calculate_progress_delay function to use NUMERIC parameters

-- Step 1: Drop the view that depends on budget column
DROP VIEW IF EXISTS public.projects_with_delays;

-- Step 2: Drop and recreate calculate_progress_delay function with NUMERIC parameters
DROP FUNCTION IF EXISTS public.calculate_progress_delay(integer, integer);

CREATE OR REPLACE FUNCTION public.calculate_progress_delay(
    actual_progress NUMERIC,
    planned_progress NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
    IF planned_progress = 0 THEN
        RETURN 0;
    END IF;

    -- Return negative if behind, positive if ahead
    -- E.g., actual 30%, planned 40% = -25% (behind by 25%)
    RETURN ROUND(((actual_progress - planned_progress) / planned_progress) * 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 3: Change budget column type from BIGINT to NUMERIC(15,2)
ALTER TABLE public.projects
ALTER COLUMN budget TYPE NUMERIC(15, 2);

-- Step 4: Recreate the projects_with_delays view

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
