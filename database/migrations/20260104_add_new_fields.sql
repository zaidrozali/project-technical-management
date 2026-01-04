-- Migration: Add New Fields to Projects Table
-- Date: 2026-01-04

-- Step 1: Drop the view that depends on progress columns
DROP VIEW IF EXISTS public.projects_with_delays;

-- Step 2: Drop and recreate the calculate_progress_delay function with NUMERIC parameters
DROP FUNCTION IF EXISTS public.calculate_progress_delay(integer, integer);

CREATE OR REPLACE FUNCTION public.calculate_progress_delay(actual_progress NUMERIC, planned_progress NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $function$
BEGIN
    IF planned_progress = 0 THEN
        RETURN 0;
    END IF;

    -- Return negative if behind, positive if ahead
    -- E.g., actual 30%, planned 40% = -25% (behind by 25%)
    RETURN ROUND(((actual_progress - planned_progress) / planned_progress) * 100, 2);
END;
$function$;

-- Step 3: Add new columns to existing projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS branch TEXT,
ADD COLUMN IF NOT EXISTS disbursed NUMERIC(15, 2) DEFAULT 0 CHECK (disbursed >= 0),
ADD COLUMN IF NOT EXISTS officer TEXT;

-- Step 4: Update progress columns to support decimal values
ALTER TABLE public.projects
ALTER COLUMN progress TYPE NUMERIC(5, 2),
ALTER COLUMN planned_progress TYPE NUMERIC(5, 2);

-- Step 5: Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_projects_branch ON public.projects(branch);
CREATE INDEX IF NOT EXISTS idx_projects_officer ON public.projects(officer);

-- Step 6: Recreate the view with updated column types and new fields
CREATE OR REPLACE VIEW public.projects_with_delays AS
SELECT
    id,
    name,
    state_id,
    location,
    branch,
    type,
    status,
    start_date,
    end_date,
    budget,
    disbursed,
    contractor,
    officer,
    description,
    progress,
    planned_progress,
    created_by,
    created_at,
    updated_at,
    (progress - planned_progress) AS progress_difference,
    calculate_progress_delay(progress, planned_progress) AS delay_percentage,
    CASE
        WHEN progress >= planned_progress THEN 'on_track_or_ahead'::text
        WHEN (planned_progress - progress) <= 5 THEN 'slightly_behind'::text
        WHEN (planned_progress - progress) > 5 THEN 'significantly_delayed'::text
        ELSE 'on_track'::text
    END AS delay_status
FROM public.projects;
