import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Cron job endpoint for automatic Google Sheets sync
 *
 * This endpoint should be called periodically by:
 * - Vercel Cron Jobs (if deployed on Vercel)
 * - External cron services (cron-job.org, EasyCron, etc.)
 *
 * Security: You should add authentication here in production
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Optional: Verify cron secret to prevent unauthorized access
    const cronSecret = req.headers['x-cron-secret'] || req.query.secret;
    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret && cronSecret !== expectedSecret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get spreadsheet configuration from environment variables
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Sheet1';

    if (!spreadsheetId) {
      return res.status(500).json({
        error: 'GOOGLE_SHEETS_SPREADSHEET_ID not configured in environment variables'
      });
    }

    // Call the sync API endpoint
    const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 3000}`;
    const syncResponse = await fetch(`${baseUrl}/api/projects/sync-google-sheets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Pass admin authentication - you may need to adjust this based on your auth setup
      },
      body: JSON.stringify({
        spreadsheetId,
        sheetName,
      }),
    });

    const result = await syncResponse.json();

    if (result.success) {
      console.log('[cron] Sync successful:', result);
      return res.status(200).json({
        success: true,
        message: 'Automatic sync completed',
        ...result,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.error('[cron] Sync failed:', result);
      return res.status(500).json({
        success: false,
        error: result.error,
        timestamp: new Date().toISOString(),
      });
    }

  } catch (error) {
    console.error('[cron] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }
}
