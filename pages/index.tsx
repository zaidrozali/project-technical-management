import Head from 'next/head';
import Link from 'next/link';
import MalaysiaMap from '@/components/MalaysiaMap';
import ProjectList from '@/components/ProjectList';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import MobileBottomNav from '@/components/MobileBottomNav';
import ProjectStatsCharts from '@/components/ProjectStatsCharts';
import DashboardSidebar, { DashboardFilters } from '@/components/DashboardSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useState, useMemo } from 'react';
import { getProjectsByState, projects } from '@/data/projects';
import { states } from '@/data/states';

const Home = () => {
  const [activeState, setActiveState] = useState<string | null>(null);
  const [showProjectList, setShowProjectList] = useState(false);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // Sidebar filters
  const [filters, setFilters] = useState<DashboardFilters>({
    state: 'all',
    type: 'all',
    status: 'all',
  });

  const handleStateClick = (stateId: string) => {
    setSelectedState(stateId);
    setShowProjectList(true);
  };

  const handleStateHover = (stateId: string | null) => {
    setActiveState(stateId);
  };

  const handleCloseProjectList = () => {
    setShowProjectList(false);
  };

  const projectsForState = selectedState ? getProjectsByState(selectedState) : [];

  // Calculate dynamic stats based on filters
  const stats = useMemo(() => {
    let filteredProjects = [...projects];

    if (filters.state !== 'all') {
      filteredProjects = filteredProjects.filter(p => p.stateId === filters.state);
    }
    if (filters.type !== 'all') {
      filteredProjects = filteredProjects.filter(p => p.type === filters.type);
    }
    if (filters.status !== 'all') {
      filteredProjects = filteredProjects.filter(p => p.status === filters.status);
    }

    return {
      total: filteredProjects.length,
      inProgress: filteredProjects.filter(p => p.status === 'in-progress').length,
      completed: filteredProjects.filter(p => p.status === 'completed').length,
      onHold: filteredProjects.filter(p => p.status === 'on-hold').length,
    };
  }, [filters]);

  return (
    <>
      <Head>
        <title>Project Management Dashboard | Malaysia</title>
        <meta name="description" content="Track construction and machinery projects across Malaysia" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <SidebarProvider>
        <DashboardSidebar filters={filters} onFilterChange={setFilters} />

        <SidebarInset>
          <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20 md:pb-12 bg-[url('/grid.svg')] bg-fixed bg-center">
            <PageHeader showPollsButton={false} showNewsButton={false} showStatisticsButton={true} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">

              <div className="mb-8 flex flex-col md:flex-row gap-6 md:items-end justify-between animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="md:hidden" />
                  <div className="space-y-1">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-zinc-900 dark:text-white tracking-tight">
                      Project Management Dashboard
                    </h2>
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl font-sans">
                      Track construction and machinery projects across Malaysian states.
                      Click on a state to view its projects.
                    </p>
                  </div>
                </div>

                {/* State Selector */}
                <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-zinc-900/50 p-2 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm">
                  <div className="w-full sm:w-56">
                    <p className='text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 mb-1.5 px-1'>Select State</p>
                    <select
                      value={selectedState || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleStateClick(e.target.value);
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose a state...</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.id}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl overflow-hidden glass border border-white/20 dark:border-white/10 shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 mb-10">
                <MalaysiaMap
                  activeState={activeState}
                  onStateClick={handleStateClick}
                  onStateHover={handleStateHover}
                />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Total Projects</p>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-amber-500">{stats.inProgress}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-emerald-500">{stats.completed}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">On Hold</p>
                  <p className="text-3xl font-bold text-red-500">{stats.onHold}</p>
                </div>
              </div>

              {/* Charts Section */}
              <div className="mb-10">
                <ProjectStatsCharts filters={filters} />
              </div>

              {/* View All Projects Button */}
              <div className="flex justify-center mb-10">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/25"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  View All Projects
                </Link>
              </div>

              <Footer />
            </main>

            <MobileBottomNav />
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Project List Slide-out Panel */}
      {showProjectList && (
        <ProjectList
          stateId={selectedState}
          projects={projectsForState}
          onClose={handleCloseProjectList}
        />
      )}
    </>
  );
};

export default Home;