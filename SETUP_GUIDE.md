# MyPeta Enhancement Setup Guide

This guide will help you set up the new features added to your MyPeta application.

## What's Been Added

### 1. Statistics & Analytics Dashboard
- **Location**: `/pages/statistics.tsx`
- **Features**:
  - 5 comprehensive chart types using Recharts
  - Project status distribution (donut chart)
  - Budget by state (bar chart)
  - Project progress timeline (line chart)
  - Projects by type comparison (grouped bar chart)
  - Budget utilization trends (area chart)
  - Summary statistics cards

### 2. Advanced Filtering System
- **Component**: `/components/StatisticsFilters.tsx`
- **Features**:
  - Multi-select state filter
  - Project type checkboxes
  - Project status checkboxes
  - Date range picker
  - Budget range selector
  - Collapsible filter panel

### 3. Left Sidebar Integration
- **Pages**: Dashboard, Projects, Statistics, Admin
- **Features**:
  - Consistent navigation across all pages
  - Quick stats display
  - Filter controls
  - Mobile responsive with collapsible menu

### 4. Supabase Database Integration
- **Schema**: `/lib/supabase-schema.sql`
- **Helper Functions**: `/lib/projects-db.ts`
- **Features**:
  - Projects table with full CRUD operations
  - Row Level Security (RLS) policies
  - Database indexes for performance
  - Statistics aggregation functions

### 5. Role-Based Admin Access Control
- **Hook**: `/hooks/useAdminAccess.ts`
- **Features**:
  - Checks Clerk user metadata for admin role
  - Blocks unauthorized access to admin features
  - Works with both client and server-side code

### 6. API Routes for Project Management
- **Routes**:
  - `GET /api/projects` - Fetch all projects
  - `POST /api/projects` - Create new project (admin only)
  - `GET /api/projects/[id]` - Get single project
  - `PUT /api/projects/[id]` - Update project (admin only)
  - `DELETE /api/projects/[id]` - Delete project (admin only)
  - `GET /api/projects/stats` - Get project statistics

### 7. Enhanced Admin Panel
- **Location**: `/pages/admin.tsx`
- **Features**:
  - Migrated from localStorage to Supabase
  - Role-based access control
  - Real-time project listing
  - Create and delete projects
  - Loading states and error handling
  - Unauthorized access screen

---

## Setup Instructions

### Step 1: Run the Supabase SQL Schema

1. Log in to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your `mypeta` project
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `/lib/supabase-schema.sql`
6. Paste into the SQL editor
7. Click **Run** to execute

This will create:
- `projects` table
- Indexes for performance
- Row Level Security policies
- Helper functions for statistics and filtering

### Step 2: Set Up Admin Users in Clerk

To grant admin access to users:

1. Log in to your [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your `mypeta` application
3. Go to **Users** in the left sidebar
4. Click on a user you want to make an admin
5. Scroll to **Public Metadata** section
6. Click **Edit**
7. Add the following JSON:
   ```json
   {
     "role": "admin"
   }
   ```
8. Click **Save**

**Important**: Only users with `"role": "admin"` in their public metadata can:
- Access the `/admin` page
- Create new projects
- Update existing projects
- Delete projects

### Step 3: Test the Integration

1. **Start your development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Test the Statistics Page**:
   - Navigate to `http://localhost:3000/statistics`
   - You should see 5 charts with existing project data
   - Try the filter controls

3. **Test Admin Access (as admin user)**:
   - Sign in with a user that has admin role
   - Navigate to `http://localhost:3000/admin`
   - You should see the admin panel
   - Try creating a new project
   - Verify it appears in the projects list

4. **Test Admin Access (as non-admin)**:
   - Sign in with a regular user (without admin role)
   - Try to access `http://localhost:3000/admin`
   - You should see an "Access Denied" message

5. **Test API Endpoints**:
   - Open browser dev tools (F12)
   - Go to Network tab
   - Navigate to `/statistics` or `/admin`
   - You should see successful API calls to `/api/projects`

---

## File Structure

### New Files Created
```
/pages
  /api
    /projects
      index.ts        # GET all projects, POST new project
      [id].ts         # GET/PUT/DELETE single project
      stats.ts        # GET project statistics
  statistics.tsx      # Statistics dashboard page

/lib
  supabase-schema.sql  # Database schema and setup
  projects-db.ts       # Project CRUD functions

/hooks
  useAdminAccess.ts    # Admin role checking hook

/components
  StatisticsFilters.tsx # Advanced filtering component
```

### Modified Files
```
/lib
  supabase.ts          # Added projects table type definitions

/pages
  admin.tsx            # Migrated from localStorage to Supabase
  projects.tsx         # Fixed missing closing div tag
```

---

## Navigation Links

Add these links to your navigation menu if needed:

- **Statistics Page**: `http://localhost:3000/statistics`
- **Admin Panel**: `http://localhost:3000/admin`
- **Projects Page**: `http://localhost:3000/projects`

---

## Troubleshooting

### "Access Denied" on Admin Page
**Solution**: Make sure your Clerk user has `"role": "admin"` in public metadata.

### "Failed to fetch projects" Error
**Solution**:
1. Check that the Supabase schema was run successfully
2. Verify Supabase environment variables in `.env.local`
3. Check browser console for detailed error messages

### Charts Not Displaying
**Solution**:
1. Verify project data exists (check `/admin` or `/api/projects`)
2. Check browser console for JavaScript errors
3. Ensure Recharts is installed: `npm install recharts`

### TypeScript Errors
**Solution**: Run `npm install` to ensure all dependencies are installed.

---

## Database Schema Overview

### Projects Table
```sql
- id (UUID, primary key)
- name (text)
- state_id (text)
- type ('construction' | 'machinery')
- status ('planning' | 'in-progress' | 'completed' | 'on-hold')
- start_date (date)
- end_date (date, nullable)
- budget (bigint)
- contractor (text)
- description (text)
- progress (integer, 0-100)
- created_by (text) - Clerk user ID
- created_at (timestamp)
- updated_at (timestamp)
```

### Row Level Security (RLS)
- **SELECT**: Anyone can view projects (public)
- **INSERT**: Only authenticated users (admin check in API)
- **UPDATE**: Only the creator or admins
- **DELETE**: Only the creator or admins

---

## Next Steps

1. **Populate Initial Data**: Use the admin panel to add some projects
2. **Customize Charts**: Modify `/pages/statistics.tsx` to adjust chart styles or add new visualizations
3. **Add More Filters**: Extend `/components/StatisticsFilters.tsx` with additional filter options
4. **Set Up Production**: Deploy to Vercel/Netlify and configure production Supabase environment variables

---

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Review Supabase logs in the dashboard
3. Verify all environment variables are set
4. Ensure Clerk and Supabase are properly configured

---

## Summary

You now have:
- A fully-featured statistics dashboard with filtering
- Left sidebar navigation across main pages
- Supabase-backed project management system
- Role-based admin access control using Clerk
- RESTful API endpoints for project operations

All admin operations are protected and require the `admin` role in Clerk metadata!
