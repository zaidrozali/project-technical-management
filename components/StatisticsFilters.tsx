import React, { useState, useEffect } from 'react';
import { states } from '@/data/states';
import { ProjectStatus, ProjectType } from '@/data/projects';
import { Button } from '@/components/ui/button';
import { Filter, X, Calendar, DollarSign, Building2, Cog, CheckCircle2, Clock, AlertCircle, PauseCircle, TrendingDown } from 'lucide-react';

// Filter state interface
export interface StatisticsFiltersState {
  states: string[];
  types: ProjectType[];
  statuses: ProjectStatus[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
  budgetRange: {
    min: number;
    max: number;
  };
  showDelayedOnly: boolean;
}

interface StatisticsFiltersProps {
  filters: StatisticsFiltersState;
  onApplyFilters: (filters: StatisticsFiltersState) => void;
  onResetFilters: () => void;
}

// Available project types
const projectTypes: { value: ProjectType; label: string; icon: React.ReactNode }[] = [
  { value: 'construction', label: 'Construction', icon: <Building2 className="w-4 h-4" /> },
  { value: 'machinery', label: 'Machinery', icon: <Cog className="w-4 h-4" /> },
];

// Available project statuses
const projectStatuses: { value: ProjectStatus; label: string; color: string; icon: React.ReactNode }[] = [
  { value: 'planning', label: 'Planning', color: '#6b7280', icon: <Clock className="w-4 h-4" /> },
  { value: 'in-progress', label: 'In Progress', color: '#f59e0b', icon: <AlertCircle className="w-4 h-4" /> },
  { value: 'completed', label: 'Completed', color: '#10b981', icon: <CheckCircle2 className="w-4 h-4" /> },
  { value: 'on-hold', label: 'On Hold', color: '#ef4444', icon: <PauseCircle className="w-4 h-4" /> },
];

// Budget range presets in RM
const budgetPresets = [
  { label: 'All Budgets', min: 0, max: 100000000000 },
  { label: 'Under RM 100M', min: 0, max: 100000000 },
  { label: 'RM 100M - 500M', min: 100000000, max: 500000000 },
  { label: 'RM 500M - 1B', min: 500000000, max: 1000000000 },
  { label: 'RM 1B - 10B', min: 1000000000, max: 10000000000 },
  { label: 'Over RM 10B', min: 10000000000, max: 100000000000 },
];

const StatisticsFilters: React.FC<StatisticsFiltersProps> = ({
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  // Local filter state for managing changes before applying
  const [localFilters, setLocalFilters] = useState<StatisticsFiltersState>(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync local filters when prop filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle state multi-select toggle
  const handleStateToggle = (stateId: string) => {
    setLocalFilters(prev => ({
      ...prev,
      states: prev.states.includes(stateId)
        ? prev.states.filter(s => s !== stateId)
        : [...prev.states, stateId],
    }));
  };

  // Handle type checkbox toggle
  const handleTypeToggle = (type: ProjectType) => {
    setLocalFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type],
    }));
  };

  // Handle status checkbox toggle
  const handleStatusToggle = (status: ProjectStatus) => {
    setLocalFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status],
    }));
  };

  // Handle date range change
  const handleDateChange = (field: 'start' | 'end', value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value || null,
      },
    }));
  };

  // Handle budget range preset selection
  const handleBudgetPresetChange = (preset: { min: number; max: number }) => {
    setLocalFilters(prev => ({
      ...prev,
      budgetRange: preset,
    }));
  };

  // Apply filters
  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  // Handle delayed projects filter toggle
  const handleDelayedFilterToggle = () => {
    setLocalFilters(prev => ({
      ...prev,
      showDelayedOnly: !prev.showDelayedOnly,
    }));
  };

  // Reset filters
  const handleReset = () => {
    const resetFilters: StatisticsFiltersState = {
      states: [],
      types: [],
      statuses: [],
      dateRange: { start: null, end: null },
      budgetRange: { min: 0, max: 100000000000 },
      showDelayedOnly: false,
    };
    setLocalFilters(resetFilters);
    onResetFilters();
  };

  // Check if any filters are active
  const hasActiveFilters =
    localFilters.states.length > 0 ||
    localFilters.types.length > 0 ||
    localFilters.statuses.length > 0 ||
    localFilters.dateRange.start !== null ||
    localFilters.dateRange.end !== null ||
    localFilters.budgetRange.min !== 0 ||
    localFilters.budgetRange.max !== 100000000000 ||
    localFilters.showDelayedOnly;

  // Get current budget preset label
  const getCurrentBudgetLabel = () => {
    const preset = budgetPresets.find(
      p => p.min === localFilters.budgetRange.min && p.max === localFilters.budgetRange.max
    );
    return preset?.label || 'Custom Range';
  };

  return (
    <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Filter Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">Filters</h3>
            <p className="text-sm text-zinc-500">
              {hasActiveFilters
                ? `${
                    localFilters.states.length +
                    localFilters.types.length +
                    localFilters.statuses.length
                  } filters active`
                : 'No filters applied'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                handleReset();
              }}
              className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
          <svg
            className={`w-5 h-5 text-zinc-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expandable Filter Content */}
      {isExpanded && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 space-y-6">
          {/* State Multi-Select */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              States
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {states.map(state => (
                <button
                  key={state.id}
                  onClick={() => handleStateToggle(state.id)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                    localFilters.states.includes(state.id)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-600 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                >
                  {state.name}
                </button>
              ))}
            </div>
            {localFilters.states.length > 0 && (
              <p className="mt-2 text-xs text-zinc-500">
                {localFilters.states.length} state{localFilters.states.length > 1 ? 's' : ''}{' '}
                selected
              </p>
            )}
          </div>

          {/* Project Type Checkboxes */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Project Type
            </label>
            <div className="flex flex-wrap gap-3">
              {projectTypes.map(type => (
                <label
                  key={type.value}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                    localFilters.types.includes(type.value)
                      ? type.value === 'construction'
                        ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-400 dark:border-orange-600 text-orange-700 dark:text-orange-300'
                        : 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                      : 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={localFilters.types.includes(type.value)}
                    onChange={() => handleTypeToggle(type.value)}
                    className="sr-only"
                  />
                  {type.icon}
                  <span className="text-sm font-medium">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Project Status Checkboxes */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Project Status
            </label>
            <div className="flex flex-wrap gap-3">
              {projectStatuses.map(status => (
                <label
                  key={status.value}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                    localFilters.statuses.includes(status.value)
                      ? 'border-2'
                      : 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                  }`}
                  style={
                    localFilters.statuses.includes(status.value)
                      ? {
                          backgroundColor: `${status.color}20`,
                          borderColor: status.color,
                          color: status.color,
                        }
                      : {}
                  }
                >
                  <input
                    type="checkbox"
                    checked={localFilters.statuses.includes(status.value)}
                    onChange={() => handleStatusToggle(status.value)}
                    className="sr-only"
                  />
                  {status.icon}
                  <span className="text-sm font-medium">{status.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range Picker */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date Range (Project Start Date)
              </span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs text-zinc-500 mb-1">From</label>
                <input
                  type="date"
                  value={localFilters.dateRange.start || ''}
                  onChange={e => handleDateChange('start', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-zinc-500 mb-1">To</label>
                <input
                  type="date"
                  value={localFilters.dateRange.end || ''}
                  onChange={e => handleDateChange('end', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Budget Range Selector */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Budget Range
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {budgetPresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handleBudgetPresetChange(preset)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                    localFilters.budgetRange.min === preset.min &&
                    localFilters.budgetRange.max === preset.max
                      ? 'bg-violet-500 text-white border-violet-500'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-600 hover:border-violet-400'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Current: {getCurrentBudgetLabel()}
            </p>
          </div>

          {/* Delayed Projects Filter */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              <span className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Progress Status
              </span>
            </label>
            <div className="flex items-center gap-3 p-4 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800">
              <input
                type="checkbox"
                id="delayed-filter"
                checked={localFilters.showDelayedOnly}
                onChange={handleDelayedFilterToggle}
                className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-red-600 focus:ring-red-500 focus:ring-2 cursor-pointer"
              />
              <label
                htmlFor="delayed-filter"
                className="flex-1 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    Show only delayed projects
                  </span>
                  {localFilters.showDelayedOnly && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Projects with actual progress more than 5% behind planned progress
                </p>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <Button
              onClick={handleApply}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1"
              disabled={!hasActiveFilters}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsFilters;
