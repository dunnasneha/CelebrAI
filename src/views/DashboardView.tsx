import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Banknote, 
  CheckCircle2, 
  Copy, 
  Trash2, 
  ExternalLink, 
  Search, 
  Filter,
  ArrowRight,
  Sparkles,
  PieChart,
  ListTodo,
  Store
} from 'lucide-react';
import { CelebrationEvent, DashboardMetrics } from '../types';
import { formatINR, formatReadableDate, getDaysRemaining } from '../utils/formatters';

interface DashboardViewProps {
  events: (CelebrationEvent & { total_tasks: number; completed_tasks: number; total_allocated: number })[];
  metrics: DashboardMetrics;
  onNavigate: (view: string, eventId?: string, tab?: string) => void;
  onDuplicate: (eventId: string) => void;
  onDelete: (eventId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  events,
  metrics,
  onNavigate,
  onDuplicate,
  onDelete
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const eventTypes = ['All', 'Wedding', 'Birthday', 'Anniversary', 'College Event', 'Corporate', 'Other'];

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || 
                          e.event_type.toLowerCase().includes(selectedType.toLowerCase()) || 
                          selectedType.toLowerCase().includes(e.event_type.toLowerCase());
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#B45309]">
            Celebration Command Center
          </span>
          <h1 className="text-3xl font-serif font-black text-[#2E1065] mt-0.5">
            Event Plans & Dashboards
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Track budgets, milestone deadlines, and vendor commitments across all active celebrations.
          </p>
        </div>

        <button
          onClick={() => onNavigate('create')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#2E1065] text-white hover:bg-[#4C1D95] shadow-xs hover:shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 border border-[#E9E2D8] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B7280]">Total Events</span>
            <span className="p-2 bg-[#FAF5FF] text-[#2E1065] rounded-lg">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-[#2E1065]">{metrics.total_events}</div>
          <div className="text-[11px] text-[#059669] font-medium mt-1">Saved Blueprints</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 border border-[#E9E2D8] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B7280]">Upcoming Celebrations</span>
            <span className="p-2 bg-[#FFFBEB] text-[#D97706] rounded-lg">
              <Sparkles className="w-4 h-4 fill-current" />
            </span>
          </div>
          <div className="text-2xl font-black text-[#2E1065]">{metrics.upcoming_events}</div>
          <div className="text-[11px] text-[#B45309] font-medium mt-1">Scheduled Dates</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 border border-[#E9E2D8] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B7280]">Total Budget Planned</span>
            <span className="p-2 bg-[#FAF5FF] text-[#2E1065] rounded-lg">
              <Banknote className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-[#2E1065]">
            {formatINR(metrics.total_budget_sum)}
          </div>
          <div className="text-[11px] text-[#4B5563] font-medium mt-1">INR Across All Events</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-5 border border-[#E9E2D8] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B7280]">Tasks Completed</span>
            <span className="p-2 bg-[#ECFDF5] text-[#059669] rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-[#2E1065]">
            {metrics.completed_tasks} <span className="text-sm font-normal text-[#6B7280]">/ {metrics.total_tasks}</span>
          </div>
          <div className="text-[11px] text-[#059669] font-medium mt-1">
            {metrics.total_tasks > 0 
              ? `${Math.round((metrics.completed_tasks / metrics.total_tasks) * 100)}% Execution Rate`
              : 'No tasks scheduled'}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-2xl border border-[#E9E2D8]">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search events or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl focus:bg-white focus:outline-none focus:border-[#7C3AED]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {eventTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedType === type
                  ? 'bg-[#2E1065] text-white'
                  : 'bg-[#FAF7F2] text-[#4B5563] hover:text-[#2E1065] border border-[#E9E2D8]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E9E2D8] max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 bg-[#FAF5FF] text-[#2E1065] rounded-2xl flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#2E1065]">
            No Celebrations Found
          </h3>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            {searchQuery || selectedType !== 'All'
              ? 'Try modifying your search or filter criteria to see your events.'
              : 'You haven’t crafted any celebration plans yet. Click below to formulate your first event!'}
          </p>
          <button
            onClick={() => onNavigate('create')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#2E1065] text-white hover:bg-[#4C1D95] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Event</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => {
            const daysLeft = getDaysRemaining(event.event_date);
            const taskPct = event.total_tasks > 0 
              ? Math.round((event.completed_tasks / event.total_tasks) * 100) 
              : 0;

            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-[#E9E2D8] shadow-xs hover:shadow-lg transition-all flex flex-col overflow-hidden group"
              >
                {/* Card Header Banner */}
                <div className="p-5 pb-4 border-b border-[#E9E2D8]/60 flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF5FF] text-[#5B21B6] border border-[#F3E8FF] mb-1.5">
                      {event.event_type}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#2E1065] group-hover:text-[#6D28D9] transition-colors leading-snug">
                      {event.name}
                    </h3>
                  </div>

                  {/* Days left pill */}
                  <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap ${
                    daysLeft < 0
                      ? 'bg-gray-100 text-gray-600'
                      : daysLeft <= 7
                      ? 'bg-[#FEE2E2] text-[#991B1B]'
                      : daysLeft <= 30
                      ? 'bg-[#FEF3C7] text-[#92400E]'
                      : 'bg-[#ECFDF5] text-[#065F46]'
                  }`}>
                    {daysLeft < 0 ? 'Concluded' : daysLeft === 0 ? 'Today!' : `${daysLeft}d left`}
                  </span>
                </div>

                {/* Key Details Body */}
                <div className="p-5 space-y-3 flex-1">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[#4B5563]">
                      <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
                      <span className="truncate">{formatReadableDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#4B5563]">
                      <MapPin className="w-3.5 h-3.5 text-[#6B7280]" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#4B5563]">
                      <Users className="w-3.5 h-3.5 text-[#6B7280]" />
                      <span>{event.guests} Guests</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#2E1065] font-bold">
                      <Banknote className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>{formatINR(event.total_budget)}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="pt-2">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#6B7280] font-medium">Milestone Progress</span>
                      <span className="text-[#2E1065] font-bold">{event.completed_tasks}/{event.total_tasks} tasks ({taskPct}%)</span>
                    </div>
                    <div className="w-full bg-[#FAF7F2] rounded-full h-2 border border-[#E9E2D8] overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#2E1065] to-[#7C3AED] h-full rounded-full transition-all duration-500"
                        style={{ width: `${taskPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Sub-view mini badges */}
                  <div className="flex items-center gap-2 pt-1 text-[11px]">
                    <button
                      onClick={() => onNavigate('workspace', event.id, 'budget')}
                      className="px-2 py-1 rounded bg-[#FAF7F2] hover:bg-[#FAF5FF] text-[#4B5563] hover:text-[#2E1065] border border-[#E9E2D8] flex items-center gap-1 cursor-pointer transition-colors"
                      title="View Budget"
                    >
                      <PieChart className="w-3 h-3 text-[#D97706]" />
                      <span>Budget</span>
                    </button>
                    <button
                      onClick={() => onNavigate('workspace', event.id, 'timeline')}
                      className="px-2 py-1 rounded bg-[#FAF7F2] hover:bg-[#FAF5FF] text-[#4B5563] hover:text-[#2E1065] border border-[#E9E2D8] flex items-center gap-1 cursor-pointer transition-colors"
                      title="View Timeline"
                    >
                      <ListTodo className="w-3 h-3 text-[#5B21B6]" />
                      <span>Timeline</span>
                    </button>
                    <button
                      onClick={() => onNavigate('workspace', event.id, 'vendors')}
                      className="px-2 py-1 rounded bg-[#FAF7F2] hover:bg-[#FAF5FF] text-[#4B5563] hover:text-[#2E1065] border border-[#E9E2D8] flex items-center gap-1 cursor-pointer transition-colors"
                      title="View Vendors"
                    >
                      <Store className="w-3 h-3 text-[#059669]" />
                      <span>Vendors</span>
                    </button>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 bg-[#FAF7F2] border-t border-[#E9E2D8] flex items-center justify-between gap-2">
                  <button
                    onClick={() => onNavigate('workspace', event.id, 'overview')}
                    className="flex-1 py-2 px-3 text-xs font-bold text-white bg-[#2E1065] hover:bg-[#4C1D95] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDuplicate(event.id)}
                      className="p-2 text-[#6B7280] hover:text-[#2E1065] hover:bg-white rounded-lg border border-transparent hover:border-[#E9E2D8] transition-colors cursor-pointer"
                      title="Duplicate Plan"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(event.id)}
                      className="p-2 text-[#6B7280] hover:text-[#DC2626] hover:bg-white rounded-lg border border-transparent hover:border-[#E9E2D8] transition-colors cursor-pointer"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[#E9E2D8] shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#2E1065]">
              Delete Celebration Plan?
            </h3>
            <p className="text-xs sm:text-sm text-[#4B5563]">
              Are you sure you want to delete this event? All associated budget items, milestones, and vendor checklists will be permanently removed.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FAF7F2] text-[#4B5563] hover:bg-gray-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#DC2626] text-white hover:bg-red-700 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
