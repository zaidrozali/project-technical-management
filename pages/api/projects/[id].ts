/**
 * API Route: /api/projects/[id]
 *
 * Handles:
 * - GET: Fetch a single project by ID
 * - PUT: Update a project (admin only)
 * - DELETE: Delete a project (admin only)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import {
  getProjectById,
  updateProject,
  deleteProject,
  UpdateProjectData,
} from '@/lib/projects-db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;
  const projectId = query.id as string;

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required' });
  }

  try {
    switch (method) {
      case 'GET':
        return await handleGetProject(projectId, res);
      case 'PUT':
        return await handleUpdateProject(req, res, projectId);
      case 'DELETE':
        return await handleDeleteProject(req, res, projectId);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('[API /projects/[id]] Unhandled error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/projects/[id]
 * Fetch a single project by ID
 */
async function handleGetProject(
  projectId: string,
  res: NextApiResponse
) {
  const result = await getProjectById(projectId);

  if (result.error) {
    return res.status(404).json({ error: result.error });
  }

  return res.status(200).json({
    success: true,
    data: result.data,
  });
}

/**
 * PUT /api/projects/[id]
 * Update a project (requires admin authentication)
 */
async function handleUpdateProject(
  req: NextApiRequest,
  res: NextApiResponse,
  projectId: string
) {
  // Authenticate user with Clerk
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Please sign in' });
  }

  const updateData: UpdateProjectData = {};

  // Extract update fields from request body
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
  } = req.body;

  // Only include provided fields
  if (name !== undefined) updateData.name = name;
  if (state_id !== undefined) updateData.state_id = state_id;
  if (type !== undefined) updateData.type = type;
  if (status !== undefined) updateData.status = status;
  if (start_date !== undefined) updateData.start_date = start_date;
  if (end_date !== undefined) updateData.end_date = end_date;
  if (budget !== undefined) updateData.budget = Number(budget);
  if (contractor !== undefined) updateData.contractor = contractor;
  if (description !== undefined) updateData.description = description;
  if (progress !== undefined) updateData.progress = Number(progress);

  // Update project (admin check is done in updateProject function)
  const result = await updateProject(projectId, updateData, userId);

  if (result.error) {
    const statusCode = result.error.includes('Unauthorized') ? 403 : 500;
    return res.status(statusCode).json({ error: result.error });
  }

  return res.status(200).json({
    success: true,
    data: result.data,
    message: 'Project updated successfully',
  });
}

/**
 * DELETE /api/projects/[id]
 * Delete a project (requires admin authentication)
 */
async function handleDeleteProject(
  req: NextApiRequest,
  res: NextApiResponse,
  projectId: string
) {
  // Authenticate user with Clerk
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Please sign in' });
  }

  // Delete project (admin check is done in deleteProject function)
  const result = await deleteProject(projectId, userId);

  if (result.error) {
    const statusCode = result.error.includes('Unauthorized') ? 403 : 500;
    return res.status(statusCode).json({ error: result.error });
  }

  return res.status(200).json({
    success: true,
    message: 'Project deleted successfully',
  });
}
