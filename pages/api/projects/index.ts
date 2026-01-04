/**
 * API Route: /api/projects
 *
 * Handles:
 * - GET: Fetch all projects (with optional filters)
 * - POST: Create a new project (admin only)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import {
  getAllProjects,
  getFilteredProjects,
  createProject,
  CreateProjectData,
  ProjectFilters,
} from '@/lib/projects-db';
import { ProjectRow } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGetProjects(req, res);
      case 'POST':
        return await handleCreateProject(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('[API /projects] Unhandled error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/projects
 * Fetch all projects or filtered projects based on query parameters
 */
async function handleGetProjects(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { state_id, type, status, start_date_from, start_date_to, end_date_from, end_date_to } = req.query;

  // Check if any filters are provided
  const hasFilters = state_id || type || status || start_date_from || start_date_to || end_date_from || end_date_to;

  let result;
  if (hasFilters) {
    const filters: ProjectFilters = {
      state_id: state_id as string,
      type: type as any,
      status: status as any,
      start_date_from: start_date_from as string,
      start_date_to: start_date_to as string,
      end_date_from: end_date_from as string,
      end_date_to: end_date_to as string,
    };
    result = await getFilteredProjects(filters);
  } else {
    result = await getAllProjects();
  }

  if (result.error) {
    return res.status(500).json({ error: result.error });
  }

  return res.status(200).json({
    success: true,
    data: result.data,
    count: result.data?.length || 0,
  });
}

/**
 * POST /api/projects
 * Create a new project (requires admin authentication)
 */
async function handleCreateProject(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Authenticate user with Clerk
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Please sign in' });
  }

  // Validate request body
  const {
    name,
    state_id,
    type,
    status,
    start_date,
    end_date,
    budget,
    contractor,
    description,
    progress,
    planned_progress,
  } = req.body;

  if (!name || !state_id || !type || !status || !start_date || budget === undefined || !contractor || !description || progress === undefined) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['name', 'state_id', 'type', 'status', 'start_date', 'budget', 'contractor', 'description', 'progress'],
    });
  }

  const projectData: CreateProjectData = {
    name,
    state_id,
    type,
    status,
    start_date,
    end_date: end_date || null,
    budget: Number(budget),
    contractor,
    description,
    progress: Number(progress),
    planned_progress: planned_progress !== undefined ? Number(planned_progress) : 0,
  };

  // Create project (admin check is done in createProject function)
  const result = await createProject(projectData, userId);

  if (result.error) {
    const statusCode = result.error.includes('Unauthorized') ? 403 : 500;
    return res.status(statusCode).json({ error: result.error });
  }

  return res.status(201).json({
    success: true,
    data: result.data,
    message: 'Project created successfully',
  });
}
