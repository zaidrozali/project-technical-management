import { getStatusColor, getTypeColor, formatBudget } from '@/data/projects';
import { states } from '@/data/states';
import { ProjectRow } from '@/lib/supabase';

interface ProjectListProps {
    stateId: string | null;
    projects: ProjectRow[];
    onClose: () => void;
}

const ProjectList = ({ stateId, projects, onClose }: ProjectListProps) => {
    if (!stateId) return null;

    const stateName = states.find(s => s.id === stateId)?.name || stateId;

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Completed';
            case 'in-progress': return 'In Progress';
            case 'on-hold': return 'On Hold';
            case 'planning': return 'Planning';
            default: return status;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'construction': return '🏗️ Construction';
            case 'machinery': return '⚙️ Machinery';
            default: return type;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full max-w-lg h-full bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden animate-slide-in">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                {stateName}
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                {projects.length} project{projects.length !== 1 ? 's' : ''} found
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Project Cards */}
                <div className="p-6 overflow-y-auto h-[calc(100vh-120px)]">
                    {projects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <p className="text-lg font-medium">No projects yet</p>
                            <p className="text-sm">Projects in this state will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-5 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all hover:shadow-lg"
                                >
                                    {/* Project Header */}
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex-1">
                                            <span
                                                className="inline-block text-xs font-medium px-2 py-1 rounded-full mb-2"
                                                style={{
                                                    backgroundColor: `${getTypeColor(project.type)}20`,
                                                    color: getTypeColor(project.type)
                                                }}
                                            >
                                                {getTypeLabel(project.type)}
                                            </span>
                                            <h3 className="font-semibold text-zinc-900 dark:text-white leading-tight">
                                                {project.name}
                                            </h3>
                                        </div>
                                        <span
                                            className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full"
                                            style={{
                                                backgroundColor: `${getStatusColor(project.status)}20`,
                                                color: getStatusColor(project.status)
                                            }}
                                        >
                                            {getStatusLabel(project.status)}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                                        {project.description}
                                    </p>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-zinc-500">Progress</span>
                                            <span className="font-medium text-zinc-700 dark:text-zinc-300">{project.progress}%</span>
                                        </div>
                                        <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${project.progress}%`,
                                                    backgroundColor: getStatusColor(project.status)
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider mb-0.5">Budget</p>
                                            <p className="font-semibold text-zinc-900 dark:text-white">{formatBudget(project.budget)}</p>
                                        </div>
                                        <div>
                                            <p className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider mb-0.5">ID</p>
                                            <p className="font-mono text-zinc-700 dark:text-zinc-300">{project.id}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider mb-0.5">Contractor</p>
                                            <p className="text-zinc-700 dark:text-zinc-300">{project.contractor}</p>
                                        </div>
                                        <div>
                                            <p className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider mb-0.5">Start Date</p>
                                            <p className="text-zinc-700 dark:text-zinc-300">{project.start_date}</p>
                                        </div>
                                        {project.end_date && (
                                            <div>
                                                <p className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider mb-0.5">End Date</p>
                                                <p className="text-zinc-700 dark:text-zinc-300">{project.end_date}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default ProjectList;
