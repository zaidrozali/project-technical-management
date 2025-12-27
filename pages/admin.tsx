import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import DashboardSidebar, { DashboardFilters } from '@/components/DashboardSidebar';
import { states } from '@/data/states';
import { ProjectStatus, ProjectType } from '@/data/projects';
import { ProjectRow } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, ArrowLeft, Save, Shield, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useUser } from '@clerk/nextjs';

const AdminPage = () => {
    const { user } = useUser();
    const { isAdmin, isLoading: isCheckingAdmin } = useAdminAccess();

    const [filters, setFilters] = useState<DashboardFilters>({
        state: 'all',
        type: 'all',
        status: 'all',
    });

    const [projects, setProjects] = useState<ProjectRow[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        stateId: '',
        type: 'construction' as ProjectType,
        status: 'planning' as ProjectStatus,
        budget: '',
        contractor: '',
        startDate: '',
        endDate: '',
        progress: 0,
        plannedProgress: 0,
    });

    // Fetch projects on mount
    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setIsLoadingProjects(true);
        try {
            const response = await fetch('/api/projects');
            const result = await response.json();

            if (result.success && result.data) {
                setProjects(result.data);
            } else {
                console.error('Failed to fetch projects:', result.error);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setIsLoadingProjects(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'progress' || name === 'plannedProgress') ? parseInt(value) || 0 : value,
        }));
    };

    const validateForm = (): string | null => {
        if (!formData.name.trim()) return 'Project name is required';
        if (!formData.stateId) return 'Please select a state';
        if (!formData.description.trim()) return 'Description is required';
        if (!formData.budget || parseFloat(formData.budget) <= 0) return 'Valid budget is required';
        if (!formData.contractor.trim()) return 'Contractor name is required';
        if (!formData.startDate) return 'Start date is required';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAdmin) {
            toast.error('Unauthorized: Only admins can create projects');
            return;
        }

        const error = validateForm();
        if (error) {
            toast.error(error);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    state_id: formData.stateId,
                    type: formData.type,
                    status: formData.status,
                    start_date: formData.startDate,
                    end_date: formData.endDate || null,
                    budget: parseFloat(formData.budget),
                    contractor: formData.contractor,
                    description: formData.description,
                    progress: formData.progress,
                    planned_progress: formData.plannedProgress,
                }),
            });

            const result = await response.json();

            if (result.success) {
                toast.success(`Project "${formData.name}" created successfully!`);

                // Reset form
                setFormData({
                    name: '',
                    description: '',
                    stateId: '',
                    type: 'construction',
                    status: 'planning',
                    budget: '',
                    contractor: '',
                    startDate: '',
                    endDate: '',
                    progress: 0,
                    plannedProgress: 0,
                });

                // Refresh projects list
                fetchProjects();
            } else {
                toast.error(result.error || 'Failed to create project');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            toast.error('An error occurred while creating the project');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProject = async (projectId: string, projectName: string) => {
        if (!isAdmin) {
            toast.error('Unauthorized: Only admins can delete projects');
            return;
        }

        if (!confirm(`Are you sure you want to delete "${projectName}"?`)) {
            return;
        }

        setDeletingProjectId(projectId);

        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Project deleted successfully');
                fetchProjects();
            } else {
                toast.error(result.error || 'Failed to delete project');
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            toast.error('An error occurred while deleting the project');
        } finally {
            setDeletingProjectId(null);
        }
    };

    // Loading state while checking admin access
    if (isCheckingAdmin) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-zinc-600 dark:text-zinc-400">Checking permissions...</p>
                </div>
            </div>
        );
    }

    // Show unauthorized message if not admin
    if (!isAdmin) {
        return (
            <>
                <Head>
                    <title>Access Denied | MyPeta</title>
                    <meta name="description" content="Admin access required" />
                </Head>

                <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4">
                    <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                            Access Denied
                        </h1>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                            This page requires administrator privileges. Please contact your system administrator if you believe you should have access.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head>
                <title>Admin Panel | MyPeta</title>
                <meta name="description" content="Admin panel to manage projects" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <SidebarProvider>
                <DashboardSidebar filters={filters} onFilterChange={setFilters} />

                <SidebarInset>
                    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20 md:pb-12">
                        <PageHeader showPollsButton={false} showNewsButton={false} />

                        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                            {/* Header */}
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <SidebarTrigger className="md:hidden" />
                                    <div>
                                        <Link
                                            href="/"
                                            className="text-blue-500 hover:text-blue-600 transition-colors text-sm flex items-center gap-1 mb-1"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Back to Dashboard
                                        </Link>
                                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                                            Admin Panel
                                        </h1>
                                        <p className="text-zinc-600 dark:text-zinc-400">
                                            Add and manage projects in the system
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Badge */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <p className="font-medium text-blue-900 dark:text-blue-100">
                                            Administrator Access
                                        </p>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            Logged in as {user?.primaryEmailAddress?.emailAddress || 'Admin'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Add Project Form */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                        <Plus className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Add New Project</h2>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Project Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                                            Project Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Kuala Lumpur Highway Expansion"
                                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* State */}
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                                                State *
                                            </label>
                                            <select
                                                name="stateId"
                                                value={formData.stateId}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select a state...</option>
                                                {states.map((state) => (
                                                    <option key={state.id} value={state.id}>
                                                        {state.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Type */}
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                                                Project Type *
                                            </label>
                                            <select
                                                name="type"
                                                value={formData.type}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="construction">Construction</option>
                                                <option value="machinery">Machinery</option>
                                            </select>
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                                                Status *
                                            </label>
                                            <select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="planning">Planning</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                                <option value="on-hold">On Hold</option>
                                            </select>
                                        </div>

                                        {/* Budget */}
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                                                Budget (RM) *
                                            </label>
                                            <input
                                                type="number"
                                                name="budget"
                                                value={formData.budget}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 50000000"
                                                min="0"
                                                step="1000"
                                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        {/* Contractor */}
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                                                Contractor *
                                            </label>
                                            <input
                                                type="text"
                                                name="contractor"
                                                value={formData.contractor}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Gamuda Berhad"
                                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        {/* Start Date */}
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                                                Start Date *
                                            </label>
                                            <input
                                                type="date"
                                                name="startDate"
                                                value={formData.startDate}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        {/* End Date */}
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                                                End Date (Optional)
                                            </label>
                                            <input
                                                type="date"
                                                name="endDate"
                                                value={formData.endDate}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                                            Description *
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Describe the project..."
                                            rows={3}
                                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        />
                                    </div>

                                    {/* Progress Grid - Actual and Planned */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Actual Progress */}
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                                                Actual Progress: {formData.progress}%
                                            </label>
                                            <input
                                                type="range"
                                                name="progress"
                                                value={formData.progress}
                                                onChange={handleInputChange}
                                                min="0"
                                                max="100"
                                                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                            />
                                            <div className="flex justify-between text-xs text-zinc-500 mt-1">
                                                <span>0%</span>
                                                <span>50%</span>
                                                <span>100%</span>
                                            </div>
                                        </div>

                                        {/* Planned Progress */}
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                                                Planned Progress: {formData.plannedProgress}%
                                            </label>
                                            <input
                                                type="range"
                                                name="plannedProgress"
                                                value={formData.plannedProgress}
                                                onChange={handleInputChange}
                                                min="0"
                                                max="100"
                                                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                            />
                                            <div className="flex justify-between text-xs text-zinc-500 mt-1">
                                                <span>0%</span>
                                                <span>50%</span>
                                                <span>100%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Status Indicator */}
                                    {(formData.progress !== 0 || formData.plannedProgress !== 0) && (
                                        <div className={`p-4 rounded-xl border ${
                                            formData.progress >= formData.plannedProgress
                                                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                                                : formData.plannedProgress - formData.progress <= 5
                                                ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
                                                : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                                        }`}>
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className={`w-5 h-5 ${
                                                    formData.progress >= formData.plannedProgress
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : formData.plannedProgress - formData.progress <= 5
                                                        ? 'text-yellow-600 dark:text-yellow-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                }`} />
                                                <div className="flex-1">
                                                    <p className={`text-sm font-medium ${
                                                        formData.progress >= formData.plannedProgress
                                                            ? 'text-emerald-900 dark:text-emerald-100'
                                                            : formData.plannedProgress - formData.progress <= 5
                                                            ? 'text-yellow-900 dark:text-yellow-100'
                                                            : 'text-red-900 dark:text-red-100'
                                                    }`}>
                                                        {formData.progress >= formData.plannedProgress
                                                            ? 'On Track or Ahead'
                                                            : formData.plannedProgress - formData.progress <= 5
                                                            ? 'Slightly Behind Schedule'
                                                            : 'Significantly Delayed'}
                                                    </p>
                                                    <p className={`text-xs ${
                                                        formData.progress >= formData.plannedProgress
                                                            ? 'text-emerald-700 dark:text-emerald-300'
                                                            : formData.plannedProgress - formData.progress <= 5
                                                            ? 'text-yellow-700 dark:text-yellow-300'
                                                            : 'text-red-700 dark:text-red-300'
                                                    }`}>
                                                        {formData.progress > formData.plannedProgress
                                                            ? `${formData.progress - formData.plannedProgress}% ahead of schedule`
                                                            : formData.progress === formData.plannedProgress
                                                            ? 'Exactly on schedule'
                                                            : `${formData.plannedProgress - formData.progress}% behind schedule`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                Create Project
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>

                            {/* Projects List */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                                        All Projects ({projects.length})
                                    </h2>
                                    <button
                                        onClick={fetchProjects}
                                        disabled={isLoadingProjects}
                                        className="text-sm text-blue-500 hover:text-blue-600 font-medium disabled:opacity-50"
                                    >
                                        {isLoadingProjects ? 'Refreshing...' : 'Refresh'}
                                    </button>
                                </div>

                                {isLoadingProjects ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                    </div>
                                ) : projects.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                                        <AlertCircle className="w-12 h-12 mb-3" />
                                        <p className="text-lg font-medium">No projects yet</p>
                                        <p className="text-sm">Create your first project above</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {projects.map((project) => {
                                            const plannedProgress = project.planned_progress || 0;
                                            const actualProgress = project.progress || 0;
                                            const progressDiff = plannedProgress - actualProgress;
                                            const isDelayed = progressDiff > 5;
                                            const isSlightlyBehind = progressDiff > 0 && progressDiff <= 5;
                                            const isOnTrack = progressDiff <= 0;

                                            return (
                                                <div
                                                    key={project.id}
                                                    className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                                >
                                                    <div className="flex-1 mr-4">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="font-medium text-zinc-900 dark:text-white">{project.name}</p>
                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                                                {project.type}
                                                            </span>
                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                                                                {project.status}
                                                            </span>

                                                            {/* Delay Status Badge */}
                                                            {plannedProgress > 0 && (
                                                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                                                    isOnTrack
                                                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                                        : isSlightlyBehind
                                                                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                                                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                                }`}>
                                                                    {isOnTrack
                                                                        ? `✓ ${actualProgress > plannedProgress ? `+${actualProgress - plannedProgress}%` : 'On Track'}`
                                                                        : isSlightlyBehind
                                                                        ? `⚠ ${progressDiff}% behind`
                                                                        : `⚠ ${progressDiff}% DELAYED`
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-zinc-500 mb-2">
                                                            {states.find(s => s.id === project.state_id)?.name} • {project.contractor} • RM {(project.budget / 1000000).toFixed(1)}M
                                                        </p>

                                                        {/* Progress Bars */}
                                                        {plannedProgress > 0 && (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2 text-xs">
                                                                    <span className="text-zinc-500 w-20">Actual:</span>
                                                                    <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-blue-500 transition-all"
                                                                            style={{ width: `${actualProgress}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-zinc-700 dark:text-zinc-300 w-10 text-right font-medium">{actualProgress}%</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs">
                                                                    <span className="text-zinc-500 w-20">Planned:</span>
                                                                    <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-emerald-500 transition-all"
                                                                            style={{ width: `${plannedProgress}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-zinc-700 dark:text-zinc-300 w-10 text-right font-medium">{plannedProgress}%</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteProject(project.id, project.name)}
                                                        disabled={deletingProjectId === project.id}
                                                        className="flex items-center gap-2 px-4 py-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        {deletingProjectId === project.id ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                <span className="text-sm font-medium">Deleting...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Trash2 className="w-4 h-4" />
                                                                <span className="text-sm font-medium">Delete</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <Footer />
                        </main>

                        <MobileBottomNav />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
};

export default AdminPage;
