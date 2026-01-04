/**
 * Projects Database Helper Functions
 *
 * This file provides CRUD operations and utility functions for interacting
 * with the projects table in Supabase. All functions include proper error
 * handling and TypeScript types.
 */

import { supabase, ProjectRow, ProjectInsert, ProjectUpdate, ProjectType, ProjectStatus } from './supabase';
import { clerkClient } from '@clerk/nextjs/server';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Interface for creating a new project
 * Matches the database Insert type without auto-generated fields
 */
export interface CreateProjectData {
  name: string;
  state_id: string;
  location?: string | null;
  branch?: string | null;
  type: ProjectType;
  status: ProjectStatus;
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

/**
 * Interface for updating an existing project
 * All fields are optional to allow partial updates
 */
export interface UpdateProjectData {
  name?: string;
  state_id?: string;
  location?: string | null;
  branch?: string | null;
  type?: ProjectType;
  status?: ProjectStatus;
  start_date?: string;
  end_date?: string | null;
  budget?: number;
  disbursed?: number;
  contractor?: string;
  officer?: string | null;
  description?: string;
  progress?: number;
  planned_progress?: number;
}

/**
 * Filters for querying projects
 */
export interface ProjectFilters {
  state_id?: string;
  type?: ProjectType;
  status?: ProjectStatus;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
}

/**
 * Statistics for project aggregation
 */
export interface ProjectStatistics {
  total_projects: number;
  total_budget: number;
  average_progress: number;
  by_status: Record<ProjectStatus, number>;
  by_type: Record<ProjectType, number>;
  by_state: Record<string, number>;
}

/**
 * Standard response type for database operations
 */
export interface DbResponse<T> {
  data: T | null;
  error: string | null;
}

// ============================================================================
// Admin Check Function
// ============================================================================

/**
 * Check if a user has admin role from Clerk
 * Looks for role: 'admin' in the user's public metadata
 *
 * @param clerkUserId - The Clerk user ID to check
 * @returns Promise<boolean> - True if user is admin, false otherwise
 */
export async function isUserAdmin(clerkUserId: string): Promise<boolean> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkUserId);

    if (!user) {
      return false;
    }

    // Check for admin role in public metadata
    const publicMetadata = user.publicMetadata as { role?: string } | undefined;
    return publicMetadata?.role === 'admin';
  } catch (error) {
    console.error('[projects-db] Error checking admin status:', error);
    return false;
  }
}

// ============================================================================
// CRUD Functions
// ============================================================================

/**
 * Get all projects from the database
 * Returns projects sorted by created_at descending (newest first)
 *
 * @returns Promise<DbResponse<ProjectRow[]>>
 */
export async function getAllProjects(): Promise<DbResponse<ProjectRow[]>> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[projects-db] Error fetching all projects:', error);
      return { data: null, error: error.message };
    }

    return { data: data as ProjectRow[], error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[projects-db] Exception in getAllProjects:', errorMessage);
    return { data: null, error: errorMessage };
  }
}

/**
 * Get a single project by its ID
 *
 * @param id - The project UUID
 * @returns Promise<DbResponse<ProjectRow>>
 */
export async function getProjectById(id: string): Promise<DbResponse<ProjectRow>> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[projects-db] Error fetching project by ID:', error);
      return { data: null, error: error.message };
    }

    return { data: data as ProjectRow, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[projects-db] Exception in getProjectById:', errorMessage);
    return { data: null, error: errorMessage };
  }
}

/**
 * Get projects with optional filters
 * Supports filtering by state, type, status, and date ranges
 *
 * @param filters - Optional filter criteria
 * @returns Promise<DbResponse<ProjectRow[]>>
 */
export async function getFilteredProjects(filters: ProjectFilters): Promise<DbResponse<ProjectRow[]>> {
  try {
    let query = supabase
      .from('projects')
      .select('*');

    // Apply filters if provided
    if (filters.state_id) {
      query = query.eq('state_id', filters.state_id);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.start_date_from) {
      query = query.gte('start_date', filters.start_date_from);
    }

    if (filters.start_date_to) {
      query = query.lte('start_date', filters.start_date_to);
    }

    if (filters.end_date_from) {
      query = query.gte('end_date', filters.end_date_from);
    }

    if (filters.end_date_to) {
      query = query.lte('end_date', filters.end_date_to);
    }

    // Order by created_at descending
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('[projects-db] Error fetching filtered projects:', error);
      return { data: null, error: error.message };
    }

    return { data: data as ProjectRow[], error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[projects-db] Exception in getFilteredProjects:', errorMessage);
    return { data: null, error: errorMessage };
  }
}

/**
 * Create a new project
 * Only admin users can create projects
 *
 * @param data - The project data to insert
 * @param clerkUserId - The Clerk user ID of the creator
 * @returns Promise<DbResponse<ProjectRow>>
 */
export async function createProject(
  data: CreateProjectData,
  clerkUserId: string
): Promise<DbResponse<ProjectRow>> {
  try {
    // Verify user is admin
    const isAdmin = await isUserAdmin(clerkUserId);
    if (!isAdmin) {
      return { data: null, error: 'Unauthorized: Only admins can create projects' };
    }

    const insertData: ProjectInsert = {
      ...data,
      created_by: clerkUserId,
    };

    const { data: newProject, error } = await supabase
      .from('projects')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[projects-db] Error creating project:', error);
      return { data: null, error: error.message };
    }

    return { data: newProject as ProjectRow, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[projects-db] Exception in createProject:', errorMessage);
    return { data: null, error: errorMessage };
  }
}

/**
 * Update an existing project
 * Only admin users can update projects
 *
 * @param id - The project UUID to update
 * @param data - The fields to update
 * @param clerkUserId - The Clerk user ID of the user making the update
 * @returns Promise<DbResponse<ProjectRow>>
 */
export async function updateProject(
  id: string,
  data: UpdateProjectData,
  clerkUserId: string
): Promise<DbResponse<ProjectRow>> {
  try {
    // Verify user is admin
    const isAdmin = await isUserAdmin(clerkUserId);
    if (!isAdmin) {
      return { data: null, error: 'Unauthorized: Only admins can update projects' };
    }

    const updateData: ProjectUpdate = {
      ...data,
    };

    const { data: updatedProject, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[projects-db] Error updating project:', error);
      return { data: null, error: error.message };
    }

    return { data: updatedProject as ProjectRow, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[projects-db] Exception in updateProject:', errorMessage);
    return { data: null, error: errorMessage };
  }
}

/**
 * Delete a project
 * Only admin users can delete projects
 *
 * @param id - The project UUID to delete
 * @param clerkUserId - The Clerk user ID of the user making the deletion
 * @returns Promise<DbResponse<boolean>>
 */
export async function deleteProject(
  id: string,
  clerkUserId: string
): Promise<DbResponse<boolean>> {
  try {
    // Verify user is admin
    const isAdmin = await isUserAdmin(clerkUserId);
    if (!isAdmin) {
      return { data: null, error: 'Unauthorized: Only admins can delete projects' };
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[projects-db] Error deleting project:', error);
      return { data: null, error: error.message };
    }

    return { data: true, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[projects-db] Exception in deleteProject:', errorMessage);
    return { data: null, error: errorMessage };
  }
}

/**
 * Get aggregated project statistics
 * Returns counts by status, type, state, total budget, and average progress
 *
 * @returns Promise<DbResponse<ProjectStatistics>>
 */
export async function getProjectStatistics(): Promise<DbResponse<ProjectStatistics>> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*');

    if (error) {
      console.error('[projects-db] Error fetching project statistics:', error);
      return { data: null, error: error.message };
    }

    const projects = data as ProjectRow[];

    // Initialize statistics
    const stats: ProjectStatistics = {
      total_projects: projects.length,
      total_budget: 0,
      average_progress: 0,
      by_status: {
        'planning': 0,
        'in-progress': 0,
        'completed': 0,
        'on-hold': 0,
      },
      by_type: {
        'construction': 0,
        'machinery': 0,
      },
      by_state: {},
    };

    // Calculate aggregations
    let totalProgress = 0;

    for (const project of projects) {
      // Sum budget
      stats.total_budget += project.budget;

      // Sum progress for average calculation
      totalProgress += project.progress;

      // Count by status
      stats.by_status[project.status]++;

      // Count by type
      stats.by_type[project.type]++;

      // Count by state
      if (stats.by_state[project.state_id]) {
        stats.by_state[project.state_id]++;
      } else {
        stats.by_state[project.state_id] = 1;
      }
    }

    // Calculate average progress
    stats.average_progress = projects.length > 0
      ? Math.round((totalProgress / projects.length) * 100) / 100
      : 0;

    return { data: stats, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[projects-db] Exception in getProjectStatistics:', errorMessage);
    return { data: null, error: errorMessage };
  }
}
