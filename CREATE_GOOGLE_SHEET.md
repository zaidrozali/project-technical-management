# How to Create Your Google Sheet for MyPeta Project Sync

This guide will walk you through creating a Google Sheet that works with your MyPeta project management system.

---

## Quick Start (Recommended)

### Option 1: Import the Template CSV

1. **Open Google Sheets**
   - Go to [sheets.google.com](https://sheets.google.com)
   - Click the **+ Blank** button to create a new spreadsheet

2. **Import the Template**
   - Click **File** → **Import**
   - Click **Upload** tab
   - Drag and drop `google-sheets-template.csv` from your project folder
   - Choose **"Replace spreadsheet"** or **"Insert new sheet(s)"**
   - Set **Separator type** to **Comma**
   - Click **Import data**

3. **Rename Your Sheet**
   - Click on "Untitled spreadsheet" at the top
   - Give it a meaningful name like "MyPeta Projects Database"

4. **Done!** You now have a ready-to-use Google Sheet with sample data

---

## Option 2: Create Manually

If you prefer to create the sheet from scratch:

### Step 1: Create New Spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **+ Blank** to create a new spreadsheet
3. Name it "MyPeta Projects Database"

### Step 2: Set Up Column Headers

In **Row 1**, enter these headers in **exact order**:

| Column | Header | Description |
|--------|--------|-------------|
| **A1** | name | Project name (unique identifier) |
| **B1** | state_id | State code (lowercase with hyphens) |
| **C1** | location | City or area name (e.g., Cheras, Ipoh) |
| **D1** | type | Either "construction" or "machinery" |
| **E1** | status | planning, in-progress, completed, or on-hold |
| **F1** | start_date | Format: YYYY-MM-DD (e.g., 2024-01-15) |
| **G1** | end_date | Format: YYYY-MM-DD (optional, can be blank) |
| **H1** | budget | Number only, no currency symbols |
| **I1** | contractor | Contractor/vendor name |
| **J1** | description | Brief project description |
| **K1** | progress | Number 0-100 (actual progress percentage) |
| **L1** | planned_progress | Number 0-100 (expected progress percentage) |

### Step 3: Format the Headers (Optional but Recommended)

1. Select Row 1 (click on the row number "1")
2. Make it **bold** (Ctrl/Cmd + B)
3. Change background color to light blue or gray
4. Enable **Freeze Row 1** (View → Freeze → 1 row)

### Step 4: Add Sample Data

Here's a sample row you can copy to Row 2:

| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Kuala Lumpur MRT Extension | kuala-lumpur | Cheras | construction | in-progress | 2024-01-15 | 2026-06-30 | 8500000000 | MMC-Gamuda | Extension of MRT line | 35 | 50 |

---

## Valid Values Reference

### State IDs (Column B)
Must be **exactly** one of these (lowercase with hyphens):

```
johor
kedah
kelantan
kuala-lumpur
labuan
melaka
negeri-sembilan
pahang
penang
perak
perlis
putrajaya
sabah
sarawak
selangor
terengganu
```

### Location (Column C)
- City or area name where the project is located
- Examples: `Cheras`, `Ipoh`, `Johor Bahru`, `Kuching`
- Free text field

### Project Types (Column D)
Only two options:
- `construction`
- `machinery`

### Project Statuses (Column E)
Must be one of:
- `planning`
- `in-progress`
- `completed`
- `on-hold`

### Date Format (Columns F & G)
- Format: `YYYY-MM-DD`
- Examples: `2024-01-15`, `2025-12-31`
- `end_date` can be left blank for ongoing projects

### Budget (Column H)
- Numbers only, no commas or currency symbols
- Example: `8500000000` (not `RM 8,500,000,000`)

### Progress Values (Columns K & L)
- Integer from 0 to 100
- `progress` = Actual progress percentage
- `planned_progress` = Expected/planned progress percentage
- If actual < planned, project is delayed

---

## Tips for Managing Your Sheet

### 1. **Use Data Validation** (Recommended)

Set up dropdown menus to prevent errors:

**For State ID (Column B):**
1. Select column B (click "B" header)
2. Data → Data validation
3. Criteria: List of items
4. Enter: `johor,kedah,kelantan,kuala-lumpur,labuan,melaka,negeri-sembilan,pahang,penang,perak,perlis,putrajaya,sabah,sarawak,selangor,terengganu`
5. Check "Show dropdown list in cell"
6. Save

**For Type (Column D):**
- List of items: `construction,machinery`

**For Status (Column E):**
- List of items: `planning,in-progress,completed,on-hold`

### 2. **Use Conditional Formatting** (Optional)

Highlight delayed projects:
1. Select columns K and L (progress columns)
2. Format → Conditional formatting
3. Format cells if: Custom formula is
4. Formula: `=K2<L2` (actual less than planned)
5. Choose red background color
6. Done

### 3. **Protect Your Headers**

1. Select Row 1
2. Data → Protect sheets and ranges
3. Set permissions to "Show a warning when editing this range"
4. This prevents accidental deletion of headers

---

## Example Data Rows

Here are more examples you can add to your sheet:

```csv
Penang Second Bridge Maintenance,penang,Batu Maung,construction,planning,2024-03-01,2024-12-31,250000000,IJM Construction,Major maintenance and repair works,0,10
Johor Water Treatment Plant,johor,Johor Bahru,construction,in-progress,2023-06-01,2025-03-31,450000000,Ranhill SAJ,New water treatment facility,65,60
Sabah Rural Electrification,sabah,Kota Kinabalu,construction,in-progress,2023-09-15,2024-09-30,180000000,Sarawak Energy,Bringing electricity to remote villages,75,80
Selangor Smart Traffic System,selangor,Shah Alam,machinery,in-progress,2024-02-01,2025-01-31,320000000,Telekom Malaysia,AI-powered traffic system,40,45
```

---

## What Happens When You Sync?

When you sync from the admin panel:

1. **Matching**: System matches rows by project **name** (Column A)
2. **Update**: If project name exists, it updates all fields
3. **Create**: If project name is new, it creates a new project
4. **No Delete**: Sync never deletes projects, only creates/updates

**Example Workflow:**
- You have a project called "KL MRT Extension" in database
- You edit budget and progress in Google Sheets
- Click "Sync Now" in admin panel
- System finds "KL MRT Extension" and updates budget + progress
- All other fields are also updated from the sheet

---

## Common Mistakes to Avoid

❌ **Wrong state_id format**
- Bad: `Kuala Lumpur`, `KL`, `KUALA-LUMPUR`
- Good: `kuala-lumpur`

❌ **Wrong date format**
- Bad: `15/01/2024`, `Jan 15, 2024`, `2024/01/15`
- Good: `2024-01-15`

❌ **Budget with symbols**
- Bad: `RM 85,000,000`, `85000000.00`
- Good: `85000000`

❌ **Wrong type/status values**
- Bad: `Construction`, `In Progress`, `building`
- Good: `construction`, `in-progress`

❌ **Missing required fields**
- All columns except `end_date` are required
- Empty cells will cause sync errors

---

## Next Steps

After creating your Google Sheet:

1. ✅ **Get the Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
   ```

2. ✅ **Follow the setup guide**: [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md)
   - Create Google Cloud service account
   - Enable Google Sheets API
   - Share sheet with service account
   - Add credentials to `.env.local`

3. ✅ **Test the sync** in your admin panel at `/admin`

---

## Need Help?

- **Setup issues**: See [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md)
- **Column reference**: See table above for exact requirements
- **Sample data**: Use the provided `google-sheets-template.csv`

---

Happy syncing! 🚀
