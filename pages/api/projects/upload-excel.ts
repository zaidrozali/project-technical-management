import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import * as XLSX from 'xlsx';
import { createProject, updateProject, getAllProjects } from '@/lib/projects-db';
import { getAuth } from '@clerk/nextjs/server';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

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

    // Parse the uploaded file
    const form = new IncomingForm();
    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read the Excel file
    const fileBuffer = fs.readFileSync((file as File).filepath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(worksheet);

    // Validate and process the data
    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[],
    };

    // Get existing projects to check for updates
    const { data: existingProjects } = await getAllProjects();
    const projectMap = new Map(existingProjects?.map(p => [p.name, p]) || []);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      try {
        // Validate required fields
        if (!row.name || !row.state_id || !row.type || !row.status ||
            !row.start_date || !row.budget || !row.contractor || !row.description) {
          results.errors.push(`Row ${i + 2}: Missing required fields`);
          continue;
        }

        // Prepare project data
        const projectData: ProjectRow = {
          name: String(row.name).trim(),
          state_id: String(row.state_id).trim().toLowerCase(),
          location: row.location ? String(row.location).trim() : null,
          branch: row.branch ? String(row.branch).trim() : null,
          type: row.type as 'construction' | 'machinery',
          status: row.status as 'planning' | 'in-progress' | 'completed' | 'on-hold',
          start_date: row.start_date,
          end_date: row.end_date || null,
          budget: Number(row.budget),
          disbursed: Number(row.disbursed) || 0,
          contractor: String(row.contractor).trim(),
          officer: row.officer ? String(row.officer).trim() : null,
          description: String(row.description).trim(),
          progress: Number(row.progress) || 0,
          planned_progress: Number(row.planned_progress) || 0,
        };

        // Check if project exists (by name)
        const existingProject = projectMap.get(projectData.name);

        if (existingProject) {
          // Update existing project
          const result = await updateProject(existingProject.id, projectData, userId);
          if (result.error) {
            results.errors.push(`Row ${i + 2}: ${result.error}`);
          } else {
            results.updated++;
          }
        } else {
          // Create new project
          const result = await createProject(projectData, userId);
          if (result.error) {
            results.errors.push(`Row ${i + 2}: ${result.error}`);
          } else {
            results.created++;
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Row ${i + 2}: ${errorMessage}`);
      }
    }

    // Clean up the uploaded file
    fs.unlinkSync((file as File).filepath);

    return res.status(200).json({
      success: true,
      message: `Processed ${data.length} rows`,
      results,
    });

  } catch (error) {
    console.error('[upload-excel] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
}
