/**
 * API Route: /api/projects/stats
 *
 * Handles:
 * - GET: Fetch aggregated project statistics
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getProjectStatistics } from '@/lib/projects-db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }

  try {
    const result = await getProjectStatistics();

    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('[API /projects/stats] Unhandled error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
