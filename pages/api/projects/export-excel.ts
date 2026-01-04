import type { NextApiRequest, NextApiResponse } from 'next';
import * as XLSX from 'xlsx';
import { getAllProjects } from '@/lib/projects-db';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get all projects
    const { data: projects, error } = await getAllProjects();
    if (error || !projects) {
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }

    // Prepare data for Excel
    const excelData = projects.map(project => ({
      name: project.name,
      state_id: project.state_id,
      location: project.location || '',
      branch: project.branch || '',
      type: project.type,
      status: project.status,
      start_date: project.start_date,
      end_date: project.end_date || '',
      budget: project.budget,
      disbursed: project.disbursed || 0,
      contractor: project.contractor,
      officer: project.officer || '',
      description: project.description,
      progress: project.progress,
      planned_progress: project.planned_progress,
      created_at: new Date(project.created_at).toISOString().split('T')[0],
      updated_at: new Date(project.updated_at).toISOString().split('T')[0],
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects');

    // Set column widths
    const columnWidths = [
      { wch: 30 }, // name
      { wch: 15 }, // state_id
      { wch: 20 }, // location
      { wch: 12 }, // branch
      { wch: 12 }, // type
      { wch: 12 }, // status
      { wch: 12 }, // start_date
      { wch: 12 }, // end_date
      { wch: 15 }, // budget
      { wch: 15 }, // disbursed
      { wch: 20 }, // contractor
      { wch: 15 }, // officer
      { wch: 40 }, // description
      { wch: 10 }, // progress
      { wch: 15 }, // planned_progress
      { wch: 12 }, // created_at
      { wch: 12 }, // updated_at
    ];
    worksheet['!cols'] = columnWidths;

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set response headers
    const fileName = `projects_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Send the file
    return res.send(excelBuffer);

  } catch (error) {
    console.error('[export-excel] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
}
