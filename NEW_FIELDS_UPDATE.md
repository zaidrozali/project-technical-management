# New Fields Update Summary

## Overview

The MyPeta project management system has been updated to include four new data fields to better track project details and financial information.

---

## New Fields Added

### 1. **location** (Text)
- **Type**: Optional text field
- **Purpose**: City or area where the project is located
- **Examples**: Cheras, Shah Alam, Johor Bahru, Kuching
- **Database**: `TEXT` field, allows NULL

### 2. **branch** (Text)
- **Type**: Optional text field
- **Purpose**: Branch or division managing the project
- **Examples**: JBEC, BPEC, CF, KL2EC
- **Database**: `TEXT` field, allows NULL

### 3. **disbursed** (Number)
- **Type**: Optional number field with decimal support
- **Purpose**: Amount of money already spent/disbursed from the budget
- **Examples**: 1802281.78, 6094282.13
- **Database**: `NUMERIC(15, 2)` field, defaults to 0
- **Note**: Used to calculate available funds (Budget - Disbursed)

### 4. **officer** (Text)
- **Type**: Optional text field
- **Purpose**: Name or ID of the responsible officer
- **Examples**: NNS, John Doe, Officer-123
- **Database**: `TEXT` field, allows NULL

---

## Changes Made

### ✅ Database Schema (`lib/supabase-schema-base.sql`)

Updated the projects table structure:
```sql
ALTER TABLE public.projects
ADD COLUMN location TEXT,
ADD COLUMN branch TEXT,
ADD COLUMN disbursed NUMERIC(15, 2) DEFAULT 0 CHECK (disbursed >= 0),
ADD COLUMN officer TEXT;
```

Added indexes for performance:
```sql
CREATE INDEX idx_projects_branch ON public.projects(branch);
CREATE INDEX idx_projects_officer ON public.projects(officer);
```

**Note**: Progress fields changed from `INTEGER` to `NUMERIC(5, 2)` to support decimal percentages like 41.61% and 93.46%.

### ✅ TypeScript Types

Updated all type definitions in:
- `/lib/supabase.ts` - Database type definitions
- `/lib/projects-db.ts` - CRUD operation interfaces

### ✅ API Endpoints

**Google Sheets Sync** (`/pages/api/projects/sync-google-sheets.ts`):
- Updated column range from `A:L` to `A:O` (15 columns)
- Updated column mapping to include new fields

**Excel Upload** (`/pages/api/projects/upload-excel.ts`):
- Added support for new fields in uploaded Excel files

**Excel Export** (`/pages/api/projects/export-excel.ts`):
- Exports now include all 15 columns plus created/updated timestamps

### ✅ Admin Form (`/pages/admin.tsx`)

Added four new form fields:
1. **Location** - Text input field (after State)
2. **Branch** - Text input field (after Location)
3. **Disbursed (RM)** - Number input with decimal support (after Budget)
4. **Officer** - Text input field (after Contractor)

### ✅ Google Sheets Template (`google-sheets-template.csv`)

Updated template with 5 real project examples from your data:
- Dekad Jitu Sdn Bhd
- Ifimajaya Sdn Bhd
- MCS Management Sdn Bhd
- MK Services Sdn Bhd
- Smart Reliance Sdn Bhd

---

## Column Structure

Your Google Sheet/Excel files should now have these columns in this **exact order**:

| # | Column | Type | Required | Example |
|---|--------|------|----------|---------|
| 1 | name | Text | Yes | Dekad Jitu Sdn Bhd |
| 2 | state_id | Text | Yes | kuala-lumpur |
| 3 | **location** | Text | No | KL |
| 4 | **branch** | Text | No | JBEC |
| 5 | type | Text | Yes | construction |
| 6 | status | Text | Yes | in-progress |
| 7 | start_date | Date | Yes | 2023-01-15 |
| 8 | end_date | Date | No | 2025-12-31 |
| 9 | budget | Number | Yes | 58795550 |
| 10 | **disbursed** | Number | No | 1802281.78 |
| 11 | contractor | Text | Yes | Dekad Jitu Sdn Bhd |
| 12 | **officer** | Text | No | NNS |
| 13 | description | Text | Yes | Construction project description |
| 14 | progress | Number | Yes | 41.61 |
| 15 | planned_progress | Number | Yes | 74.78 |

---

## Calculated Fields (Auto-computed)

These fields are **NOT** stored in the database but calculated in the app:

### 1. **Variance**
- Formula: `progress - planned_progress`
- Example: 41.61 - 74.78 = -33.17%
- Shows if project is ahead or behind schedule

### 2. **Available (RM)**
- Formula: `budget - disbursed`
- Example: 58,795,550 - 1,802,281.78 = 56,993,268.22
- Shows remaining funds

### 3. **Ahead/Behind Status**
- Determined by comparing `progress` vs `planned_progress`
- Categories:
  - ✅ **On Track**: progress >= planned_progress
  - ⚠️ **Slightly Behind**: difference ≤ 5%
  - 🔴 **Delayed**: difference > 5%

---

## Next Steps

### 1. Update Your Database

Run the updated SQL schema in your Supabase dashboard:

```bash
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of /lib/supabase-schema-base.sql
3. Click "Run"
```

This will add the new columns to your existing projects table.

### 2. Update Your Google Sheet

Import the new template:

```bash
1. Open your Google Sheet
2. File → Import → Upload
3. Select google-sheets-template.csv
4. Choose "Replace current sheet"
```

Or manually add these columns:
- Insert Column C → name it "location"
- Insert Column D → name it "branch"
- Insert Column J → name it "disbursed"
- Insert Column L → name it "officer"

### 3. Test the Sync

1. Go to `/admin`
2. Add the new spreadsheet ID in Google Sheets Sync section
3. Click "Sync Now"
4. Verify the 5 sample projects are imported correctly

### 4. Create New Projects

Use the admin form to create projects with the new fields:
- All existing fields still work
- New fields are optional
- Disbursed defaults to 0 if not provided

---

## Sample Data

Here's a complete example row from the template:

```
Dekad Jitu Sdn Bhd,kuala-lumpur,KL,JBEC,construction,on-hold,2023-01-15,2025-12-31,58795550,1802281.78,Dekad Jitu Sdn Bhd,NNS,Construction project in Southern region,41.61,74.78
```

This represents:
- Project delayed by 33.17% (41.61% actual vs 74.78% planned)
- Budget: RM 58,795,550
- Disbursed: RM 1,802,281.78
- Available: RM 56,993,268.22
- Managed by officer "NNS" from "JBEC" branch in "KL" location

---

## Backward Compatibility

✅ **Existing data is safe**
- Old projects will have NULL values for new fields
- All existing functionality continues to work
- No data migration required

✅ **Optional fields**
- location, branch, and officer are completely optional
- disbursed defaults to 0 if not provided

---

## Files Updated

1. ✅ `/lib/supabase-schema-base.sql` - Database schema
2. ✅ `/lib/supabase.ts` - TypeScript database types
3. ✅ `/lib/projects-db.ts` - Project interfaces
4. ✅ `/pages/api/projects/sync-google-sheets.ts` - Google Sheets sync
5. ✅ `/pages/api/projects/upload-excel.ts` - Excel upload
6. ✅ `/pages/api/projects/export-excel.ts` - Excel export
7. ✅ `/pages/admin.tsx` - Admin form with new fields
8. ✅ `/google-sheets-template.csv` - Updated template with sample data

---

## Support

If you encounter any issues:
1. Check that the database schema was updated correctly
2. Verify column order in your Google Sheet matches the template
3. Ensure new fields are included in Excel uploads
4. Restart your dev server after updating environment variables

Happy tracking! 🚀
