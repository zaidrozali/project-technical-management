import React, { useMemo } from 'react';
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
} from 'recharts';
import { formatBudget, getStatusColor, getTypeColor } from '@/data/projects';
import { states } from '@/data/states';
import { DashboardFilters } from './DashboardSidebar';
import { ProjectRow } from '@/lib/supabase';

interface ProjectStatsChartsProps {
    filters: DashboardFilters;
    projects?: ProjectRow[];
}

const ProjectStatsCharts = ({ filters, projects = [] }: ProjectStatsChartsProps) => {
    // Filter projects based on sidebar filters
    const filteredProjects = useMemo(() => {
        let result = [...projects];

        if (filters.state !== 'all') {
            result = result.filter(p => p.state_id === filters.state);
        }
        if (filters.type !== 'all') {
            result = result.filter(p => p.type === filters.type);
        }
        if (filters.status !== 'all') {
            result = result.filter(p => p.status === filters.status);
        }

        return result;
    }, [filters, projects]);

    // Status distribution data
    const statusData = useMemo(() => {
        const counts = {
            'In Progress': filteredProjects.filter(p => p.status === 'in-progress').length,
            'Completed': filteredProjects.filter(p => p.status === 'completed').length,
            'Planning': filteredProjects.filter(p => p.status === 'planning').length,
            'On Hold': filteredProjects.filter(p => p.status === 'on-hold').length,
        };
        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
            color: name === 'In Progress' ? '#f59e0b' :
                name === 'Completed' ? '#10b981' :
                    name === 'Planning' ? '#6b7280' : '#ef4444'
        }));
    }, [filteredProjects]);

    // Type distribution data
    const typeData = useMemo(() => {
        const counts = {
            'Construction': filteredProjects.filter(p => p.type === 'construction').length,
            'Machinery': filteredProjects.filter(p => p.type === 'machinery').length,
        };
        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
            color: name === 'Construction' ? '#f97316' : '#3b82f6'
        }));
    }, [filteredProjects]);

    // Budget by state data (top 8 states)
    const budgetByState = useMemo(() => {
        const stateMap = new Map<string, number>();

        filteredProjects.forEach(p => {
            const current = stateMap.get(p.state_id) || 0;
            stateMap.set(p.state_id, current + p.budget);
        });

        return Array.from(stateMap.entries())
            .map(([stateId, budget]) => ({
                state: states.find(s => s.id === stateId)?.name || stateId,
                budget: budget / 1000000000, // Convert to billions
                budgetFormatted: formatBudget(budget),
            }))
            .sort((a, b) => b.budget - a.budget)
            .slice(0, 8);
    }, [filteredProjects]);

    // Progress distribution
    const progressData = useMemo(() => {
        const ranges = [
            { range: '0-25%', min: 0, max: 25 },
            { range: '26-50%', min: 26, max: 50 },
            { range: '51-75%', min: 51, max: 75 },
            { range: '76-100%', min: 76, max: 100 },
        ];

        return ranges.map(r => ({
            range: r.range,
            count: filteredProjects.filter(p => p.progress >= r.min && p.progress <= r.max).length,
        }));
    }, [filteredProjects]);

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null;

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Project Statistics</h2>
                <p className="text-sm text-zinc-500">
                    Showing {filteredProjects.length} of {projects.length} projects
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution - Pie Chart */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Status Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Legend />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white'
                                    }}
                                    itemStyle={{ color: 'white' }}
                                    labelStyle={{ color: 'white' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Type Distribution - Pie Chart */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Project Types</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={typeData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={100}
                                    innerRadius={50}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {typeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Legend />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white'
                                    }}
                                    itemStyle={{ color: 'white' }}
                                    labelStyle={{ color: 'white' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Budget by State - Bar Chart */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Budget by State (Billions RM)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={budgetByState}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                <YAxis dataKey="state" type="category" tick={{ fontSize: 11 }} stroke="#9ca3af" width={80} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white'
                                    }}
                                    itemStyle={{ color: 'white' }}
                                    labelStyle={{ color: 'white' }}
                                    formatter={(value: any, name: any, props: any) => [props.payload.budgetFormatted, 'Budget']}
                                />
                                <Bar dataKey="budget" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Progress Distribution - Bar Chart */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Progress Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={progressData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                <XAxis dataKey="range" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white'
                                    }}
                                    itemStyle={{ color: 'white' }}
                                    labelStyle={{ color: 'white' }}
                                />
                                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Projects" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectStatsCharts;
