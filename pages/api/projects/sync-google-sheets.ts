import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuth } from '@clerk/nextjs/server';
import { isUserAdmin } from '@/lib/projects-db';

interface ProjectRow {
  name: string;
  state_id: string;
  location?: string | null;
  branch?: string | null;
  type: 'construction' | 'machinery';
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  start_date: string;
  end_date?: string | null;
  budget: number;
  disbursed?: number;
  contractor: string;
  officer?: string | null;
  description: string;
  progress: number;
  planned_progress: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is admin
    const isAdmin = await isUserAdmin(userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Only admins can sync projects' });
    }

    // Check if service role key is configured
    if (!supabaseAdmin) {
      return res.status(500).json({
        error: 'Supabase service role key not configured. Please add SUPABASE_SERVICE_ROLE_KEY to environment variables.'
      });
    }

    const { spreadsheetId, sheetName } = req.body;

    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Spreadsheet ID is required' });
    }

    // Check if service account credentials are configured
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!serviceAccountEmail || !privateKey) {
      return res.status(500).json({
        error: 'Google Sheets API not configured. Please add GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY to environment variables.'
      });
    }

    // Set up Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch data from Google Sheets
    const range = sheetName ? `${sheetName}!A:O` : 'A:O'; // A-O includes all columns
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: 'No data found in spreadsheet' });
    }

    // Skip header row
    const dataRows = rows.slice(1);

    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[],
    };

    // Get existing projects using admin client (bypasses RLS)
    const { data: existingProjects, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('*');

    if (fetchError) {
      console.error('[sync-google-sheets] Error fetching existing projects:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch existing projects' });
    }

    const projectMap = new Map(existingProjects?.map(p => [p.name, p]) || []);

    // Helper function to clean numeric values (remove commas and percentage signs)
    const cleanNumber = (value: any): number => {
      if (!value) return 0;
      const str = String(value).replace(/,/g, '').replace(/%/g, '').trim();
      const num = parseFloat(str);
      // Round to 2 decimal places for percentages
      return isNaN(num) ? 0 : Math.round(num * 100) / 100;
    };

    // Helper function to map status values
    const mapStatus = (value: string): 'planning' | 'in-progress' | 'completed' | 'on-hold' => {
      const status = String(value || '').toLowerCase().trim();
      if (status.includes('completed')) return 'completed';
      if (status.includes('delayed') || status.includes('behind')) return 'on-hold';
      if (status.includes('ahead') || status.includes('track')) return 'in-progress';
      return 'in-progress';
    };

    // Helper function to map region to state_id
    const mapRegion = (region: string, location: string): string => {
      const reg = String(region || '').toLowerCase().trim();
      const loc = String(location || '').toLowerCase().trim();

      // Map regions to states
      if (reg.includes('southern') || loc.includes('johor')) return 'johor';
      if (reg.includes('northern') || loc.includes('penang') || loc.includes('kedah')) return 'penang';
      if (reg.includes('selangor') || loc.includes('shah alam') || loc.includes('selangor')) return 'selangor';
      if (reg.includes('sarawak') || loc.includes('kuching') || loc.includes('sarawak')) return 'sarawak';
      if (reg.includes('sabah') || loc.includes('kota kinabalu') || loc.includes('sabah')) return 'sabah';
      if (reg.includes('east coast') || loc.includes('terengganu') || loc.includes('kelantan')) return 'terengganu';
      if (reg.includes('central') || loc.includes('kl') || loc.includes('kuala lumpur')) return 'kuala-lumpur';

      // Default to kuala-lumpur if can't determine
      return 'kuala-lumpur';
    };

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];

      try {
        // Column mapping for user's format:
        // 0: No, 1: Project, 2: Asset Type, 3: Branch, 4: Location, 5: Region,
        // 6: Progress %, 7: Schedule %, 8: Variance, 9: Status, 10: Project Cost (RM),
        // 11: Ahead, 12: Disbursed (RM), 13: Available (RM), 14: Officer

        const name = String(row[1] || '').trim();
        const assetType = String(row[2] || '').toLowerCase().trim();
        const location = row[4] ? String(row[4]).trim() : null;
        const region = String(row[5] || '').trim();

        const projectData: ProjectRow = {
          name: name,
          state_id: mapRegion(region, location || ''),
          location: location,
          branch: row[3] ? String(row[3]).trim() : null,
          type: assetType.includes('machinery') ? 'machinery' : 'construction',
          status: mapStatus(String(row[9] || '')),
          start_date: '2024-01-01', // Default start date
          end_date: null,
          budget: cleanNumber(row[10]),
          disbursed: cleanNumber(row[12]),
          contractor: name, // Use project name as contractor
          officer: row[14] ? String(row[14]).trim() : null,
          description: `${assetType || 'Construction'} project`,
          progress: cleanNumber(row[6]),
          planned_progress: cleanNumber(row[7]),
        };

        // Validate required fields
        if (!projectData.name || !projectData.state_id || !projectData.contractor || !projectData.description) {
          results.errors.push(`Row ${i + 2}: Missing required fields`);
          continue;
        }

        // Check if project exists
        const existingProject = projectMap.get(projectData.name);

        if (existingProject) {
          // Update existing project using admin client
          const { error: updateError } = await supabaseAdmin
            .from('projects')
            .update({
              ...projectData,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingProject.id);

          if (updateError) {
            results.errors.push(`Row ${i + 2}: ${updateError.message}`);
          } else {
            results.updated++;
          }
        } else {
          // Create new project using admin client
          const { error: insertError } = await supabaseAdmin
            .from('projects')
            .insert({
              ...projectData,
              created_by: userId,
            });

          if (insertError) {
            results.errors.push(`Row ${i + 2}: ${insertError.message}`);
          } else {
            results.created++;
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Row ${i + 2}: ${errorMessage}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Synced ${dataRows.length} rows from Google Sheets`,
      results,
    });

  } catch (error) {
    console.error('[sync-google-sheets] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check for specific Google API errors
    if (errorMessage.includes('Unable to parse range') || errorMessage.includes('not found')) {
      return res.status(400).json({ error: 'Invalid spreadsheet ID or sheet name' });
    }

    if (errorMessage.includes('permission') || errorMessage.includes('access')) {
      return res.status(403).json({ error: 'Permission denied. Make sure the spreadsheet is shared with the service account.' });
    }

    return res.status(500).json({ error: errorMessage });
  }
}
