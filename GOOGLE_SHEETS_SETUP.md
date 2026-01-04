# Google Sheets Sync Setup Guide

This guide will help you set up automatic synchronization with Google Sheets for your project management system.

## Overview

The Google Sheets sync feature allows you to:
- ✅ Maintain a Google Sheet as your master data source
- ✅ Sync projects to the database with a single click
- ✅ Schedule automatic syncs (optional)
- ✅ Collaborate with team members using Google Sheets

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Create Project**
3. Name your project (e.g., "MyPeta Project Sync")
4. Click **Create**

---

## Step 2: Enable Google Sheets API

1. In your Google Cloud Project, go to **APIs & Services** → **Library**
2. Search for "Google Sheets API"
3. Click on it and press **Enable**

---

## Step 3: Create a Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Fill in the details:
   - **Service account name**: `mypeta-sheets-sync`
   - **Service account ID**: Will auto-generate
   - Click **Create and Continue**
4. **Grant this service account access to project** (Optional - skip this step)
   - Click **Continue**
5. **Grant users access to this service account** (Optional - skip this step)
   - Click **Done**

---

## Step 4: Create Service Account Key

1. In **APIs & Services** → **Credentials**, find your service account
2. Click on the service account email
3. Go to the **Keys** tab
4. Click **Add Key** → **Create New Key**
5. Choose **JSON** format
6. Click **Create**
7. A JSON file will be downloaded - **keep this file safe**!

---

## Step 5: Add Credentials to Environment Variables

Open the downloaded JSON file. You'll need two values:

1. **client_email** - Copy the service account email
2. **private_key** - Copy the entire private key (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)

Add these to your `.env.local` file:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY_HERE
-----END PRIVATE KEY-----"
```

**Important**: The private key must include the quotes and newlines as shown.

---

## Step 6: Prepare Your Google Sheet

### Required Sheet Structure

Your Google Sheet must have these columns in this exact order:

| Column | Header | Data Type | Required | Example |
|--------|--------|-----------|----------|---------|
| A | name | Text | Yes | Kuala Lumpur Highway Expansion |
| B | state_id | Text | Yes | kuala-lumpur |
| C | location | Text | Yes | Cheras |
| D | type | Text | Yes | construction |
| E | status | Text | Yes | in-progress |
| F | start_date | Date | Yes | 2024-01-01 |
| G | end_date | Date | No | 2025-12-31 |
| H | budget | Number | Yes | 50000000 |
| I | contractor | Text | Yes | Gamuda Berhad |
| J | description | Text | Yes | Major highway expansion project |
| K | progress | Number | Yes | 45 |
| L | planned_progress | Number | Yes | 60 |

### Valid Values

**state_id**: Must be one of:
- `johor`, `kedah`, `kelantan`, `kuala-lumpur`, `labuan`, `melaka`, `negeri-sembilan`, `pahang`, `penang`, `perak`, `perlis`, `putrajaya`, `sabah`, `sarawak`, `selangor`, `terengganu`

**type**: `construction` or `machinery`

**status**: `planning`, `in-progress`, `completed`, or `on-hold`

**Date format**: `YYYY-MM-DD` (e.g., `2024-12-25`)

---

## Step 7: Share Your Google Sheet

1. Open your Google Sheet
2. Click the **Share** button
3. Paste your service account email (from Step 5)
4. Set permission to **Viewer**
5. Uncheck **Notify people**
6. Click **Share**

---

## Step 8: Get Your Spreadsheet ID

The Spreadsheet ID is in the URL of your Google Sheet:

```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
```

Copy the `SPREADSHEET_ID_HERE` part.

---

## Step 9: Test the Sync

1. Go to your admin panel: `/admin`
2. Scroll to the "Google Sheets Sync" section
3. Enter your Spreadsheet ID
4. (Optional) Enter the sheet name if you're not using the first sheet
5. Click **Sync Now**

---

## Automatic Sync (Optional)

To enable automatic syncing every X minutes/hours:

### Option A: Using Vercel Cron Jobs (Recommended for Vercel deployment)

1. Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-sheets",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

This syncs every 6 hours. Adjust the cron schedule as needed.

2. Create the cron endpoint at `/pages/api/cron/sync-sheets.ts` (already included)

3. Deploy to Vercel - cron jobs will run automatically

### Option B: Using External Cron Service

Use a service like [cron-job.org](https://cron-job.org/) or [EasyCron](https://www.easycron.com/):

1. Create an account
2. Add a new cron job
3. Set the URL to: `https://your-domain.com/api/projects/sync-google-sheets`
4. Set the method to `POST`
5. Add request body:
```json
{
  "spreadsheetId": "YOUR_SPREADSHEET_ID",
  "sheetName": "Sheet1"
}
```
6. Set the schedule (e.g., every 6 hours)

---

## Troubleshooting

### "Permission denied" error
- Make sure you shared the spreadsheet with the service account email
- Check that the service account has at least "Viewer" permission

### "Invalid spreadsheet ID" error
- Double-check the spreadsheet ID in the URL
- Make sure there are no extra spaces

### "No data found" error
- Ensure your sheet has data (including headers)
- Check that you're using the correct sheet name

### Sync errors for specific rows
- Check the console for detailed error messages
- Verify that all required fields are filled
- Ensure data types match (dates as YYYY-MM-DD, numbers without formatting)

---

## Example Google Sheet

Here's a sample row you can use:

| name | state_id | location | type | status | start_date | end_date | budget | contractor | description | progress | planned_progress |
|------|----------|----------|------|--------|------------|----------|--------|------------|-------------|----------|------------------|
| KL Highway Expansion | kuala-lumpur | Cheras | construction | in-progress | 2024-01-15 | 2025-06-30 | 75000000 | IJM Construction | Major highway expansion in Kuala Lumpur | 45 | 60 |

---

## Security Notes

⚠️ **Important Security Practices**:

1. **Never** commit your `service-account-key.json` file to Git
2. **Never** share your private key publicly
3. Add `.env.local` to `.gitignore`
4. Use environment variables for all credentials
5. Only share the Google Sheet with the service account email (not publicly)
6. Consider using a dedicated service account for this purpose only

---

## Summary

✅ Created Google Cloud Project
✅ Enabled Google Sheets API
✅ Created Service Account
✅ Downloaded credentials
✅ Added credentials to `.env.local`
✅ Prepared Google Sheet with correct format
✅ Shared sheet with service account
✅ Got Spreadsheet ID
✅ Tested sync in admin panel
✅ (Optional) Set up automatic sync

Your Google Sheets sync is now ready! Any changes you make in the Google Sheet can be synced to your database with a click.
