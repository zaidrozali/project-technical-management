# Planned Progress Feature Setup Guide

## Overview

This feature adds **planned progress tracking** to construction and machinery projects, allowing you to:
- Track both **actual progress** and **planned/expected progress**
- Identify projects that are **ahead of schedule** or **delayed**
- Filter projects that are **more than 5% behind** planned progress
- Visualize delay status with color-coded indicators

---

## What's New

### 1. Database Schema Update

**File**: `/lib/supabase-schema-update-planned-progress.sql`

This SQL migration adds:
- `planned_progress` column to the projects table (0-100%)
- Helper function `calculate_progress_delay()` to compute delay percentage
- View `projects_with_delays` with computed delay status fields
- Function `get_delayed_projects()` to query projects behind schedule
- Updated statistics function `get_project_statistics_v2()` with delay metrics

**Delay Status Categories**:
- **On Track or Ahead**: `actual >= planned`
- **Slightly Behind**: `planned - actual <= 5%`
- **Significantly Delayed**: `planned - actual > 5%`

### 2. TypeScript Type Updates

**Files Updated**:
- `/lib/supabase.ts` - Added `planned_progress: number` to database types
- `/lib/projects-db.ts` - Updated `CreateProjectData` and `UpdateProjectData` interfaces
- `/data/projects.ts` - Added `planned_progress?: number` to Project interface

### 3. Admin Panel Enhancement

**File**: `/pages/admin.tsx`

**New Features**:
- Dual progress sliders for **Actual Progress** and **Planned Progress**
- Real-time **delay status indicator** that shows:
  - ✅ **Green**: On track or ahead
  - ⚠️ **Yellow**: Slightly behind (≤5%)
  - 🔴 **Red**: Significantly delayed (>5%)
- Automatic calculation of delay percentage

**Form Changes**:
```typescript
// Old form state
{
  progress: 0,
}

// New form state
{
  progress: 0,           // Actual progress
  plannedProgress: 0,    // Planned/expected progress
}
```

### 4. Statistics Filtering

**File**: `/components/StatisticsFilters.tsx`

**New Filter Option**:
- Checkbox to **"Show only delayed projects"**
- Filters projects where `planned_progress - actual_progress > 5%`
- Visual indicator when filter is active

**Filter State Update**:
```typescript
export interface StatisticsFiltersState {
  // ... existing filters
  showDelayedOnly: boolean; // NEW
}
```

### 5. Statistics Page Logic

**File**: `/pages/statistics.tsx`

**New Filtering Logic**:
```typescript
// Filter delayed projects (more than 5% behind planned progress)
if (filters.showDelayedOnly) {
  result = result.filter(p => {
    const plannedProgress = p.planned_progress || 0;
    const actualProgress = p.progress || 0;
    return plannedProgress - actualProgress > 5;
  });
}
```

---

## Setup Instructions

### Step 1: Run the Database Schema

**IMPORTANT**: Since this is a new database, you need to run the base schema first.

1. Log in to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your `mypeta` project
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `/lib/supabase-schema-base.sql`
6. Paste into the SQL editor
7. Click **Run** to execute

This will:
- Create the `projects` table with all columns including `planned_progress`
- Create indexes for performance
- Enable Row Level Security (RLS) with proper policies
- Create all helper functions and views for delay tracking
- Set up automatic `updated_at` timestamp triggers

### Step 2: Verify TypeScript Compilation

1. Ensure no TypeScript errors:
   ```bash
   npm run build
   ```

2. If there are errors, restart your dev server:
   ```bash
   npm run dev
   ```

### Step 3: Test the Feature

#### Test Admin Panel:

1. Navigate to `/admin`
2. Create a new project with different actual and planned progress values:
   - **Actual Progress**: 30%
   - **Planned Progress**: 50%
3. Observe the delay status indicator:
   - Should show **"Significantly Delayed"** in red
   - Should display **"20% behind schedule"**

#### Test Statistics Filtering:

1. Navigate to `/statistics`
2. Expand the **Filters** panel
3. Scroll to **"Progress Status"** section
4. Check **"Show only delayed projects"**
5. Click **"Apply Filters"**
6. Verify that only projects with >5% delay are shown

---

## Database Schema Details

### New Column

```sql
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS planned_progress INTEGER DEFAULT 0
CHECK (planned_progress >= 0 AND planned_progress <= 100);
```

### Helper Function

```sql
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
```

### Projects with Delays View

```sql
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
```

---

## UI Components

### Admin Panel - Dual Progress Sliders

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Actual Progress */}
  <div>
    <label>Actual Progress: {formData.progress}%</label>
    <input type="range" name="progress" min="0" max="100" />
  </div>

  {/* Planned Progress */}
  <div>
    <label>Planned Progress: {formData.plannedProgress}%</label>
    <input type="range" name="plannedProgress" min="0" max="100" />
  </div>
</div>
```

### Admin Panel - Delay Status Indicator

Color-coded status based on delay:

- **Green** (Emerald): On track or ahead
- **Yellow**: Slightly behind (≤5%)
- **Red**: Significantly delayed (>5%)

Shows messages like:
- "On Track or Ahead" / "5% ahead of schedule"
- "Slightly Behind Schedule" / "3% behind schedule"
- "Significantly Delayed" / "15% behind schedule"

### Statistics Filters - Delayed Projects Checkbox

```tsx
<div className="flex items-center gap-3 p-4 rounded-xl border">
  <input
    type="checkbox"
    id="delayed-filter"
    checked={filters.showDelayedOnly}
    onChange={handleDelayedFilterToggle}
  />
  <label htmlFor="delayed-filter">
    <span>Show only delayed projects</span>
    <p>Projects with actual progress more than 5% behind planned progress</p>
  </label>
</div>
```

---

## API Changes

### POST /api/projects

**Request body now includes**:
```json
{
  "name": "Project Name",
  "progress": 30,
  "planned_progress": 50,
  // ... other fields
}
```

### GET /api/projects

**Response now includes**:
```json
{
  "id": "uuid",
  "name": "Project Name",
  "progress": 30,
  "planned_progress": 50,
  // ... other fields
}
```

---

## Example Usage

### Creating a Project with Planned Progress

```typescript
const newProject = {
  name: "KL Highway Expansion",
  state_id: "kuala-lumpur",
  type: "construction",
  status: "in-progress",
  start_date: "2024-01-01",
  budget: 50000000,
  contractor: "IJM Construction",
  description: "Highway expansion project",
  progress: 35,              // Actual: 35%
  planned_progress: 50,      // Expected: 50%
};

// This project is 15% behind schedule
```

### Querying Delayed Projects

```sql
-- Get all projects delayed by more than 5%
SELECT * FROM public.get_delayed_projects(5);

-- Or use the view
SELECT *
FROM public.projects_with_delays
WHERE delay_status = 'significantly_delayed';
```

### Using the Statistics Filter

```typescript
// Show only delayed projects
const filters = {
  states: [],
  types: [],
  statuses: [],
  dateRange: { start: null, end: null },
  budgetRange: { min: 0, max: 100000000000 },
  showDelayedOnly: true,  // Enable delay filter
};
```

---

## Troubleshooting

### Projects don't show planned_progress

**Solution**: Run the SQL migration. Existing projects will have `planned_progress` set to their current `progress` value.

### TypeScript errors about planned_progress

**Solution**:
1. Restart your TypeScript server
2. Run `npm run build` to verify
3. Check that all type files are updated

### Filter not working

**Solution**:
1. Verify the SQL migration ran successfully
2. Check browser console for errors
3. Ensure `showDelayedOnly` is in filter state

### Delay indicator not showing

**Solution**:
1. Set both `progress` and `plannedProgress` to non-zero values
2. Make sure the values are different
3. Check the conditional rendering logic

---

## Summary

You now have a complete **planned progress tracking system** that:

✅ Tracks actual vs. planned progress for all projects
✅ Identifies delayed projects automatically
✅ Provides visual indicators in the admin panel
✅ Allows filtering by delay status
✅ Calculates delay percentages
✅ Uses database views for efficient querying

All features are fully integrated with your existing Supabase backend and work seamlessly with role-based admin access control!
