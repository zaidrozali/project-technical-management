import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  FolderKanban, 
  BarChart3, 
  Settings,
  Building2,
  Cog,
  Filter
} from 'lucide-react';
import { states } from '@/data/states';
import { ProjectRow } from '@/lib/supabase';

export interface DashboardFilters {
  state: string;
  type: string;
  status: string;
}

interface DashboardSidebarProps {
  filters: DashboardFilters;
  onFilterChange: (filters: DashboardFilters) => void;
  projects?: ProjectRow[];
}

const DashboardSidebar = ({ filters, onFilterChange, projects = [] }: DashboardSidebarProps) => {
  const router = useRouter();

  // Calculate stats from live data
  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    planning: projects.filter(p => p.status === 'planning').length,
    onHold: projects.filter(p => p.status === 'on-hold').length,
  };

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/projects', label: 'All Projects', icon: FolderKanban },
    { href: '/admin', label: 'Admin', icon: Settings },
  ];

  return (
    <Sidebar className="border-r border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">MyPeta</span>
        </Link>
      </SidebarHeader>
      
      <SidebarSeparator className="bg-zinc-200/50 dark:bg-zinc-800/50" />
      
      <SidebarContent>
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={router.pathname === item.href}
                    tooltip={item.label}
                    className="hover:translate-x-1 transition-transform duration-200"
                  >
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-zinc-200/50 dark:bg-zinc-800/50" />

        {/* Quick Stats */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick Stats</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="grid grid-cols-2 gap-2 px-2">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-center shadow-sm">
                <p className="text-2xl font-bold font-display text-zinc-900 dark:text-white">{stats.total}</p>
                <p className="text-xs text-zinc-500 font-medium">Total</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3 text-center shadow-sm">
                <p className="text-2xl font-bold font-display text-amber-600">{stats.inProgress}</p>
                <p className="text-xs text-zinc-500 font-medium">In Progress</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/50 rounded-lg p-3 text-center shadow-sm">
                <p className="text-2xl font-bold font-display text-emerald-600">{stats.completed}</p>
                <p className="text-xs text-zinc-500 font-medium">Completed</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/50 rounded-lg p-3 text-center shadow-sm">
                <p className="text-2xl font-bold font-display text-red-600">{stats.onHold}</p>
                <p className="text-xs text-zinc-500 font-medium">On Hold</p>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-zinc-200/50 dark:bg-zinc-800/50" />

        {/* Filters */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Filter className="w-3 h-3" />
            Filters
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-3 px-2">
              {/* State Filter */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">State</label>
                <select
                  value={filters.state}
                  onChange={(e) => onFilterChange({ ...filters, state: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 backdrop-blur text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 backdrop-blur text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value="all">All Types</option>
                  <option value="construction">🏗️ Construction</option>
                  <option value="machinery">⚙️ Machinery</option>
                </select>
              </div>
              
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 backdrop-blur text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="planning">Planning</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>

              {/* Clear Filters */}
              {(filters.state !== 'all' || filters.type !== 'all' || filters.status !== 'all') && (
                <button
                  onClick={() => onFilterChange({ state: 'all', type: 'all', status: 'all' })}
                  className="w-full text-sm text-blue-500 hover:text-blue-600 font-medium py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="text-xs text-zinc-500 text-center">
          Project Dashboard v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
