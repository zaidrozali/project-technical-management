import Head from 'next/head';
import { useState, useMemo } from 'react';
import { getStatusColor, getTypeColor, formatBudget } from '@/data/projects';
import { states } from '@/data/states';
import PageHeader from '@/components/PageHeader';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import DashboardSidebar, { DashboardFilters } from '@/components/DashboardSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';
import { useProjects } from '@/hooks/useProjects';
import { ProjectRow, ProjectStatus, ProjectType } from '@/lib/supabase';

const ProjectsPage = () => {
    // Fetch projects from API
    const { projects, isLoading } = useProjects();
    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedState, setSelectedState] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [showDelayedOnly, setShowDelayedOnly] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'budget' | 'progress' | 'date'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Sidebar filters
    const [sidebarFilters, setSidebarFilters] = useState<DashboardFilters>({
        state: 'all',
        type: 'all',
        status: 'all',
    });

    // Filter and sort projects
    const filteredProjects = useMemo(() => {
        let result = [...projects];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.contractor.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.id.toLowerCase().includes(query)
            );
        }

        // State filter
        if (selectedState !== 'all') {
            result = result.filter(p => p.state_id === selectedState);
        }

        // Type filter
        if (selectedType !== 'all') {
            result = result.filter(p => p.type === selectedType);
        }

        // Status filter
        if (selectedStatus !== 'all') {
            result = result.filter(p => p.status === selectedStatus);
        }

        // Delayed projects filter (more than 5% behind)
        if (showDelayedOnly) {
            result = result.filter(p => {
                const plannedProgress = p.planned_progress || 0;
                const actualProgress = p.progress || 0;
                return plannedProgress - actualProgress > 5;
            });
        }

        // Sorting
        result.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'budget':
                    comparison = a.budget - b.budget;
                    break;
                case 'progress':
                    comparison = a.progress - b.progress;
                    break;
                case 'date':
                    comparison = new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [projects, searchQuery, selectedState, selectedType, selectedStatus, showDelayedOnly, sortBy, sortOrder]);

    const getStatusLabel = (status: ProjectStatus) => {
        switch (status) {
            case 'completed': return 'Completed';
            case 'in-progress': return 'In Progress';
            case 'on-hold': return 'On Hold';
            case 'planning': return 'Planning';
            default: return status;
        }
    };

    const getStateName = (stateId: string) => {
        return states.find(s => s.id === stateId)?.name || stateId;
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedState('all');
        setSelectedType('all');
        setSelectedStatus('all');
        setShowDelayedOnly(false);
    };

    const hasActiveFilters = searchQuery || selectedState !== 'all' || selectedType !== 'all' || selectedStatus !== 'all' || showDelayedOnly;

    return (
        <>
            <Head>
                <title>All Projects | Project Management Dashboard</title>
                <meta name="description" content="View and filter all construction and machinery projects across Malaysia" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <SidebarProvider>
                <DashboardSidebar filters={sidebarFilters} onFilterChange={setSidebarFilters} projects={projects} />

                <SidebarInset>
                    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20 md:pb-12">
                        <PageHeader showPollsButton={false} showNewsButton={false} showStatisticsButton={true} />

                        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                            {/* Header */}
                            <div className="mb-6 flex flex-col md:flex-row gap-4 md:items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <SidebarTrigger className="md:hidden" />
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <Link
                                                href="/"
                                                className="text-blue-500 hover:text-blue-600 transition-colors"
                                            >
                                                ← Back to Map
                                            </Link>
                                        </div>
                                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                                            All Projects
                                        </h1>
                                        <p className="text-zinc-600 dark:text-zinc-400">
                                            {filteredProjects.length} of {projects.length} projects
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 mb-6">
                                    <div className="flex flex-wrap gap-4">
                                        {/* Search */}
                                        <div className="flex-1 min-w-[200px]">
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Search</label>
                                            <input
                                                type="text"
                                                placeholder="Search projects, contractors..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        {/* State Filter */}
                                        <div className="w-full sm:w-44">
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">State</label>
                                            <select
                                                value={selectedState}
                                                onChange={(e) => setSelectedState(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="all">All States</option>
                                                {states.map((state) => (
                                                    <option key={state.id} value={state.id}>
                                                        {state.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Type Filter */}
                                        <div className="w-full sm:w-40">
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Type</label>
                                            <select
                                                value={selectedType}
                                                onChange={(e) => setSelectedType(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="all">All Types</option>
                                                <option value="construction">🏗️ Construction</option>
                                                <option value="machinery">⚙️ Machinery</option>
                                            </select>
                                        </div>

                                        {/* Status Filter */}
                                        <div className="w-full sm:w-40">
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Status</label>
                                            <select
                                                value={selectedStatus}
                                                onChange={(e) => setSelectedStatus(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="all">All Status</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                                <option value="planning">Planning</option>
                                                <option value="on-hold">On Hold</option>
                                            </select>
                                        </div>

                                        {/* Sort */}
                                        <div className="w-full sm:w-40">
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Sort By</label>
                                            <select
                                                value={`${sortBy}-${sortOrder}`}
                                                onChange={(e) => {
                                                    const [by, order] = e.target.value.split('-');
                                                    setSortBy(by as typeof sortBy);
                                                    setSortOrder(order as typeof sortOrder);
                                                }}
                                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="name-asc">Name A-Z</option>
                                                <option value="name-desc">Name Z-A</option>
                                                <option value="budget-desc">Budget High-Low</option>
                                                <option value="budget-asc">Budget Low-High</option>
                                                <option value="progress-desc">Progress High-Low</option>
                                                <option value="progress-asc">Progress Low-High</option>
                                                <option value="date-desc">Newest First</option>
                                                <option value="date-asc">Oldest First</option>
                                            </select>
                                        </div>

                                        {/* Delay Filter Checkbox */}
                                        <div className="w-full sm:flex-1 flex items-end">
                                            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={showDelayedOnly}
                                                    onChange={(e) => setShowDelayedOnly(e.target.checked)}
                                                    className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-red-600 focus:ring-red-500 focus:ring-2 cursor-pointer"
                                                />
                                                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                    Only Delayed (&gt;5%)
                                                </span>
                                                {showDelayedOnly && (
                                                    <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                                                        Active
                                                    </span>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    {/* Clear Filters */}
                                    {hasActiveFilters && (
                                        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                                            <button
                                                onClick={clearFilters}
                                                className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                                            >
                                                Clear all filters
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Projects Table/List */}
                                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                                    {filteredProjects.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                                            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-lg font-medium">No projects found</p>
                                            <p className="text-sm">Try adjusting your filters</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                                                        <th className="text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 px-4 py-3">Project</th>
                                                        <th className="text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 px-4 py-3 hidden md:table-cell">State</th>
                                                        <th className="text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 px-4 py-3 hidden lg:table-cell">Contractor</th>
                                                        <th className="text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 px-4 py-3">Status</th>
                                                        <th className="text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 px-4 py-3 hidden sm:table-cell">Progress</th>
                                                        <th className="text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 px-4 py-3">Budget</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredProjects.map((project, index) => (
                                                        <tr
                                                            key={project.id}
                                                            className={`border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${index === filteredProjects.length - 1 ? 'border-b-0' : ''}`}
                                                        >
                                                            <td className="px-4 py-4">
                                                                <div className="flex items-start gap-3">
                                                                    <span
                                                                        className="shrink-0 mt-1 text-xs font-medium px-2 py-0.5 rounded-full"
                                                                        style={{
                                                                            backgroundColor: `${getTypeColor(project.type)}20`,
                                                                            color: getTypeColor(project.type)
                                                                        }}
                                                                    >
                                                                        {project.type === 'construction' ? '🏗️' : '⚙️'}
                                                                    </span>
                                                                    <div>
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <p className="font-medium text-zinc-900 dark:text-white">{project.name}</p>
                                                                            {(() => {
                                                                                const plannedProgress = project.planned_progress || 0;
                                                                                const actualProgress = project.progress || 0;
                                                                                const progressDiff = plannedProgress - actualProgress;
                                                                                if (plannedProgress > 0) {
                                                                                    const isOnTrack = progressDiff <= 0;
                                                                                    const isSlightlyBehind = progressDiff > 0 && progressDiff <= 5;
                                                                                    const isDelayed = progressDiff > 5;
                                                                                    return (
                                                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                                                                                            isOnTrack
                                                                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                                                                : isSlightlyBehind
                                                                                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                                                                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                                                        }`}>
                                                                                            {isOnTrack
                                                                                                ? actualProgress > plannedProgress ? `+${actualProgress - plannedProgress}%` : '✓'
                                                                                                : `${progressDiff}%↓`
                                                                                            }
                                                                                        </span>
                                                                                    );
                                                                                }
                                                                                return null;
                                                                            })()}
                                                                        </div>
                                                                        <p className="text-xs text-zinc-500 font-mono">{project.id}</p>
                                                                        <p className="text-xs text-zinc-500 md:hidden mt-1">{getStateName(project.state_id)}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 hidden md:table-cell">
                                                                <span className="text-sm text-zinc-700 dark:text-zinc-300">{getStateName(project.state_id)}</span>
                                                            </td>
                                                            <td className="px-4 py-4 hidden lg:table-cell">
                                                                <span className="text-sm text-zinc-600 dark:text-zinc-400">{project.contractor}</span>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <span
                                                                    className="text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
                                                                    style={{
                                                                        backgroundColor: `${getStatusColor(project.status)}20`,
                                                                        color: getStatusColor(project.status)
                                                                    }}
                                                                >
                                                                    {getStatusLabel(project.status)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4 hidden sm:table-cell">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-20 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full rounded-full"
                                                                            style={{
                                                                                width: `${project.progress}%`,
                                                                                backgroundColor: getStatusColor(project.status)
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 w-8">{project.progress}%</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 text-right">
                                                                <span className="font-semibold text-zinc-900 dark:text-white whitespace-nowrap">{formatBudget(project.budget)}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8">
                                    <Footer />
                                </div>
                        </main>

                        <MobileBottomNav />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
};

export default ProjectsPage;
