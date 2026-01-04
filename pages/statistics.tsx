import { useState, useMemo } from 'react';
import Head from 'next/head';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { formatBudget } from '@/data/projects';
import { states } from '@/data/states';
import PageHeader from '@/components/PageHeader';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import StatisticsFilters, { StatisticsFiltersState } from '@/components/StatisticsFilters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardSidebar, { DashboardFilters } from '@/components/DashboardSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useProjects } from '@/hooks/useProjects';
import { ProjectStatus } from '@/lib/supabase';

const Statistics = () => {
  // Fetch projects from API
  const { projects } = useProjects();
  // Statistics filter state
  const [filters, setFilters] = useState<StatisticsFiltersState>({
    states: [],
    types: [],
    statuses: [],
    dateRange: { start: null, end: null },
    budgetRange: { min: 0, max: 100000000000 },
    showDelayedOnly: false,
  });

  // Sidebar filters (for navigation consistency)
  const [sidebarFilters, setSidebarFilters] = useState<DashboardFilters>({
    state: 'all',
    type: 'all',
    status: 'all',
  });

  // Filter projects based on current filters
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Filter by states
    if (filters.states.length > 0) {
      result = result.filter(p => filters.states.includes(p.state_id));
    }

    // Filter by types
    if (filters.types.length > 0) {
      result = result.filter(p => filters.types.includes(p.type));
    }

    // Filter by statuses
    if (filters.statuses.length > 0) {
      result = result.filter(p => filters.statuses.includes(p.status));
    }

    // Filter by date range
    if (filters.dateRange.start) {
      result = result.filter(p => new Date(p.start_date) >= new Date(filters.dateRange.start!));
    }
    if (filters.dateRange.end) {
      result = result.filter(p => new Date(p.start_date) <= new Date(filters.dateRange.end!));
    }

    // Filter by budget range
    result = result.filter(
      p => p.budget >= filters.budgetRange.min && p.budget <= filters.budgetRange.max
    );

    // Filter delayed projects (more than 5% behind planned progress)
    if (filters.showDelayedOnly) {
      result = result.filter(p => {
        const plannedProgress = p.planned_progress || 0;
        const actualProgress = p.progress || 0;
        return plannedProgress - actualProgress > 5;
      });
    }

    return result;
  }, [filters]);

  // 1. Project Status Distribution - Pie/Donut Chart
  const statusDistributionData = useMemo(() => {
    const counts: Record<ProjectStatus, number> = {
      planning: 0,
      'in-progress': 0,
      completed: 0,
      'on-hold': 0,
    };

    filteredProjects.forEach(p => {
      counts[p.status]++;
    });

    return [
      { name: 'Planning', value: counts.planning, fill: '#6b7280' },
      { name: 'In Progress', value: counts['in-progress'], fill: '#f59e0b' },
      { name: 'Completed', value: counts.completed, fill: '#10b981' },
      { name: 'On Hold', value: counts['on-hold'], fill: '#ef4444' },
    ].filter(item => item.value > 0);
  }, [filteredProjects]);

  // 2. Budget by State - Bar Chart
  const budgetByStateData = useMemo(() => {
    const stateMap = new Map<string, number>();

    filteredProjects.forEach(p => {
      const current = stateMap.get(p.state_id) || 0;
      stateMap.set(p.state_id, current + p.budget);
    });

    return Array.from(stateMap.entries())
      .map(([stateId, budget]) => ({
        state: states.find(s => s.id === stateId)?.name || stateId,
        stateId,
        budget: budget / 1000000000, // Convert to billions
        budgetRaw: budget,
        budgetFormatted: formatBudget(budget),
      }))
      .sort((a, b) => b.budget - a.budget)
      .slice(0, 10);
  }, [filteredProjects]);

  // 3. Project Progress Timeline - Line Chart
  const progressTimelineData = useMemo(() => {
    // Group projects by month/year based on start date
    const timelineMap = new Map<string, { started: number; completed: number }>();

    filteredProjects.forEach(p => {
      const startDate = new Date(p.start_date);
      const monthKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;

      if (!timelineMap.has(monthKey)) {
        timelineMap.set(monthKey, { started: 0, completed: 0 });
      }

      const entry = timelineMap.get(monthKey)!;
      entry.started++;

      if (p.status === 'completed' && p.end_date) {
        const endDate = new Date(p.end_date);
        const endMonthKey = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`;

        if (!timelineMap.has(endMonthKey)) {
          timelineMap.set(endMonthKey, { started: 0, completed: 0 });
        }
        timelineMap.get(endMonthKey)!.completed++;
      }
    });

    return Array.from(timelineMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        month,
        monthLabel: new Date(month + '-01').toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        started: data.started,
        completed: data.completed,
      }));
  }, [filteredProjects]);

  // 4. Projects by Type - Bar Chart
  const projectsByTypeData = useMemo(() => {
    const constructionByState = new Map<string, number>();
    const machineryByState = new Map<string, number>();

    filteredProjects.forEach(p => {
      const stateName = states.find(s => s.id === p.state_id)?.name || p.state_id;
      if (p.type === 'construction') {
        constructionByState.set(stateName, (constructionByState.get(stateName) || 0) + 1);
      } else {
        machineryByState.set(stateName, (machineryByState.get(stateName) || 0) + 1);
      }
    });

    // Get all unique states
    const allStates = new Set([...constructionByState.keys(), ...machineryByState.keys()]);

    return Array.from(allStates)
      .map(state => ({
        state,
        construction: constructionByState.get(state) || 0,
        machinery: machineryByState.get(state) || 0,
        total: (constructionByState.get(state) || 0) + (machineryByState.get(state) || 0),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [filteredProjects]);

  // 5. Budget Utilization - Area Chart (simulated based on progress)
  const budgetUtilizationData = useMemo(() => {
    // Group by quarter and calculate allocated vs utilized (based on progress)
    const quarterMap = new Map<string, { allocated: number; utilized: number }>();

    filteredProjects.forEach(p => {
      const startDate = new Date(p.start_date);
      const quarter = Math.ceil((startDate.getMonth() + 1) / 3);
      const quarterKey = `Q${quarter} ${startDate.getFullYear()}`;

      if (!quarterMap.has(quarterKey)) {
        quarterMap.set(quarterKey, { allocated: 0, utilized: 0 });
      }

      const entry = quarterMap.get(quarterKey)!;
      entry.allocated += p.budget;
      entry.utilized += (p.budget * p.progress) / 100;
    });

    return Array.from(quarterMap.entries())
      .sort((a, b) => {
        const [qA, yA] = a[0].split(' ');
        const [qB, yB] = b[0].split(' ');
        return yA !== yB ? parseInt(yA) - parseInt(yB) : parseInt(qA[1]) - parseInt(qB[1]);
      })
      .map(([quarter, data]) => ({
        quarter,
        allocated: data.allocated / 1000000000, // Convert to billions
        utilized: data.utilized / 1000000000,
        allocatedFormatted: formatBudget(data.allocated),
        utilizedFormatted: formatBudget(data.utilized),
      }));
  }, [filteredProjects]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0);
    const avgProgress =
      filteredProjects.length > 0
        ? filteredProjects.reduce((sum, p) => sum + p.progress, 0) / filteredProjects.length
        : 0;

    return {
      totalProjects: filteredProjects.length,
      totalBudget: formatBudget(totalBudget),
      avgProgress: avgProgress.toFixed(1),
      completed: filteredProjects.filter(p => p.status === 'completed').length,
      inProgress: filteredProjects.filter(p => p.status === 'in-progress').length,
    };
  }, [filteredProjects]);

  // Custom label for pie chart
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const handleApplyFilters = (newFilters: StatisticsFiltersState) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      states: [],
      types: [],
      statuses: [],
      dateRange: { start: null, end: null },
      budgetRange: { min: 0, max: 100000000000 },
      showDelayedOnly: false,
    });
  };

  return (
    <>
      <Head>
        <title>Statistics & Analytics | MyPeta Malaysia</title>
        <meta
          name="description"
          content="Comprehensive statistics and analytics for construction and machinery projects across Malaysia"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <SidebarProvider>
        <DashboardSidebar filters={sidebarFilters} onFilterChange={setSidebarFilters} projects={projects} />

        <SidebarInset>
          <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20 md:pb-12 bg-[url('/grid.svg')] bg-fixed bg-center">
            <PageHeader showPollsButton={false} showNewsButton={false} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
              {/* Page Title */}
              <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="md:hidden" />
                  <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-zinc-900 dark:text-white tracking-tight">
                      Statistics & Analytics
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl font-sans">
                      Comprehensive insights into project performance, budget allocation, and progress
                      across Malaysian states.
                    </p>
                  </div>
                </div>
              </div>

          {/* Filters Section */}
          <div className="mb-8">
            <StatisticsFilters
              filters={filters}
              onApplyFilters={handleApplyFilters}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Total Projects
              </p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {summaryStats.totalProjects}
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Total Budget
              </p>
              <p className="text-2xl md:text-3xl font-bold text-violet-500">
                {summaryStats.totalBudget}
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Avg Progress
              </p>
              <p className="text-3xl font-bold text-blue-500">{summaryStats.avgProgress}%</p>
            </div>
            <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Completed
              </p>
              <p className="text-3xl font-bold text-emerald-500">{summaryStats.completed}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                In Progress
              </p>
              <p className="text-3xl font-bold text-amber-500">{summaryStats.inProgress}</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {/* 1. Project Status Distribution - Donut Chart */}
            <Card className="bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-900 dark:text-white">
                  Project Status Distribution
                </CardTitle>
                <CardDescription>
                  Overview of projects by their current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        innerRadius={50}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {statusDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => (
                          <span className="text-zinc-600 dark:text-zinc-400">{value}</span>
                        )}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(24, 24, 27, 0.95)',
                          border: '1px solid rgba(63, 63, 70, 0.5)',
                          borderRadius: '8px',
                          color: 'white',
                        }}
                        itemStyle={{ color: 'white' }}
                        labelStyle={{ color: 'white' }}
                        formatter={(value: number) => [`${value} projects`, 'Count']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 2. Budget by State - Bar Chart */}
            <Card className="bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-900 dark:text-white">Budget by State</CardTitle>
                <CardDescription>
                  Total budget allocation per state (in billions RM)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={budgetByStateData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 12, fill: '#9ca3af' }}
                        stroke="#9ca3af"
                        tickFormatter={value => `${value.toFixed(1)}B`}
                      />
                      <YAxis
                        dataKey="state"
                        type="category"
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        stroke="#9ca3af"
                        width={75}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(24, 24, 27, 0.95)',
                          border: '1px solid rgba(63, 63, 70, 0.5)',
                          borderRadius: '8px',
                          color: 'white',
                        }}
                        itemStyle={{ color: 'white' }}
                        labelStyle={{ color: 'white' }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(_value: any, _name: any, props: any) => [
                          props?.payload?.budgetFormatted || '',
                          'Budget',
                        ]}
                      />
                      <Bar dataKey="budget" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 3. Project Progress Timeline - Line Chart */}
            <Card className="bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-900 dark:text-white">
                  Project Progress Timeline
                </CardTitle>
                <CardDescription>
                  Projects started and completed over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={progressTimelineData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                      <XAxis
                        dataKey="monthLabel"
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        stroke="#9ca3af"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(24, 24, 27, 0.95)',
                          border: '1px solid rgba(63, 63, 70, 0.5)',
                          borderRadius: '8px',
                          color: 'white',
                        }}
                        itemStyle={{ color: 'white' }}
                        labelStyle={{ color: 'white' }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        formatter={value => (
                          <span className="text-zinc-600 dark:text-zinc-400">{value}</span>
                        )}
                      />
                      <Line
                        type="monotone"
                        dataKey="started"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                        name="Started"
                      />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', strokeWidth: 2 }}
                        name="Completed"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 4. Projects by Type - Bar Chart */}
            <Card className="bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-900 dark:text-white">Projects by Type</CardTitle>
                <CardDescription>
                  Construction vs Machinery projects per state
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={projectsByTypeData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                      <XAxis
                        dataKey="state"
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        stroke="#9ca3af"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={0}
                      />
                      <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(24, 24, 27, 0.95)',
                          border: '1px solid rgba(63, 63, 70, 0.5)',
                          borderRadius: '8px',
                          color: 'white',
                        }}
                        itemStyle={{ color: 'white' }}
                        labelStyle={{ color: 'white' }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        formatter={value => (
                          <span className="text-zinc-600 dark:text-zinc-400">{value}</span>
                        )}
                      />
                      <Bar
                        dataKey="construction"
                        fill="#f97316"
                        radius={[4, 4, 0, 0]}
                        name="Construction"
                      />
                      <Bar
                        dataKey="machinery"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                        name="Machinery"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 5. Budget Utilization - Area Chart (Full Width) */}
            <Card className="bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-zinc-900 dark:text-white">Budget Utilization</CardTitle>
                <CardDescription>
                  Allocated vs utilized budget trends over quarters (in billions RM)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={budgetUtilizationData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorAllocated" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorUtilized" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                      <XAxis
                        dataKey="quarter"
                        tick={{ fontSize: 12, fill: '#9ca3af' }}
                        stroke="#9ca3af"
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: '#9ca3af' }}
                        stroke="#9ca3af"
                        tickFormatter={value => `${value.toFixed(0)}B`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(24, 24, 27, 0.95)',
                          border: '1px solid rgba(63, 63, 70, 0.5)',
                          borderRadius: '8px',
                          color: 'white',
                        }}
                        itemStyle={{ color: 'white' }}
                        labelStyle={{ color: 'white' }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(_value: any, name: any, props: any) => {
                          const key = name === 'Allocated' ? 'allocatedFormatted' : 'utilizedFormatted';
                          return [props.payload[key], name];
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        formatter={value => (
                          <span className="text-zinc-600 dark:text-zinc-400">{value}</span>
                        )}
                      />
                      <Area
                        type="monotone"
                        dataKey="allocated"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorAllocated)"
                        name="Allocated"
                      />
                      <Area
                        type="monotone"
                        dataKey="utilized"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorUtilized)"
                        name="Utilized"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
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

export default Statistics;
