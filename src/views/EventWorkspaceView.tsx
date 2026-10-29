import React, { useState } from 'react';
import { 
  ArrowLeft, 
  FileDown, 
  Copy, 
  Trash2, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Users, 
  Banknote, 
  PieChart, 
  ListTodo, 
  Store, 
  Palette, 
  Utensils, 
  ShieldCheck, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  MessageSquare, 
  Share2, 
  TrendingUp, 
  AlertTriangle,
  Lightbulb,
  Edit2,
  Send,
  Loader2,
  Info,
  Settings,
  X
} from 'lucide-react';
import { 
  CelebrationEvent, 
  BudgetItem, 
  TimelineTask, 
  Vendor,
  VendorStatus,
  TimelinePhase,
  PriorityLevel
} from '../types';
import { formatINR, formatReadableDate } from '../utils/formatters';
import { StorageService } from '../services/storageService';
import { exportEventToPrintablePDF } from '../services/pdfExportService';
import { 
  improveTheme, 
  optimizeBudget, 
  generateInvitation, 
  suggestActivities, 
  askCelebrAI 
} from '../services/aiService';

interface EventWorkspaceViewProps {
  event: CelebrationEvent;
  initialTab?: string;
  onBack: () => void;
  onRefresh: () => void;
  onDuplicate: (eventId: string) => void;
  onDelete: (eventId: string) => void;
}

export const EventWorkspaceView: React.FC<EventWorkspaceViewProps> = ({
  event,
  initialTab = 'overview',
  onBack,
  onRefresh,
  onDuplicate,
  onDelete
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentEvent, setCurrentEvent] = useState<CelebrationEvent>(event);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => StorageService.getBudgetItems(event.id));
  const [tasks, setTasks] = useState<TimelineTask[]>(() => StorageService.getTimelineTasks(event.id));
  const [vendors, setVendors] = useState<Vendor[]>(() => StorageService.getVendors(event.id));

  // Edit Event Modal state
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [editEventData, setEditEventData] = useState({
    name: event.name,
    event_type: event.event_type,
    event_date: event.event_date,
    location: event.location,
    guests: event.guests,
    total_budget: event.total_budget,
    theme: event.theme,
    venue_preference: event.venue_preference,
    food_preference: event.food_preference,
    planning_style: event.planning_style
  });

  // Add / Edit Budget Item Modal state
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [editingBudgetItem, setEditingBudgetItem] = useState<BudgetItem | null>(null);
  const [newBudgetItem, setNewBudgetItem] = useState({ category: '', allocated_amount: 10000, notes: '', is_contingency: false });

  // Add / Edit Task Modal state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TimelineTask | null>(null);
  const [taskFormData, setTaskFormData] = useState<{ title: string; description: string; phase: TimelinePhase; due_date: string; priority: PriorityLevel }>({
    title: '',
    description: '',
    phase: 'Weeks Before',
    due_date: event.event_date,
    priority: 'Medium'
  });

  // Add / Edit Vendor Modal state
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [vendorFormData, setVendorFormData] = useState<{ category: string; criteria: string; questions_to_ask: string; estimated_cost: number; status: VendorStatus; notes: string; contact_info: string; deadline: string }>({
    category: '',
    criteria: '',
    questions_to_ask: '',
    estimated_cost: 20000,
    status: 'Not Started',
    notes: '',
    contact_info: '',
    deadline: event.event_date
  });

  // AI tools state
  const [aiSubTab, setAiSubTab] = useState<'chat' | 'theme' | 'invites' | 'activities' | 'budget_opt'>('chat');
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([
    {
      role: 'assistant',
      content: `Hello! I am CelebrAI, your personal celebrations concierge. I am fully synced with **${currentEvent.name}** (${formatINR(currentEvent.total_budget)} budget, ${currentEvent.guests} guests in ${currentEvent.location}). How can I assist you with your planning today?`
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [themeSuggestions, setThemeSuggestions] = useState<any[]>([]);
  const [isThemeLoading, setIsThemeLoading] = useState(false);

  const [invitationDrafts, setInvitationDrafts] = useState<any>(null);
  const [isInviteLoading, setIsInviteLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [activitySuggestions, setActivitySuggestions] = useState<any[]>([]);
  const [isActivityLoading, setIsActivityLoading] = useState(false);

  const [budgetOptimization, setBudgetOptimization] = useState<any>(null);
  const [isBudgetOptLoading, setIsBudgetOptLoading] = useState(false);

  // Authoritative budget summary calculation
  const budgetSummary = StorageService.calculateBudgetSummary(currentEvent.total_budget, budgetItems);

  // Sync state if props change
  React.useEffect(() => {
    setCurrentEvent(event);
    setBudgetItems(StorageService.getBudgetItems(event.id));
    setTasks(StorageService.getTimelineTasks(event.id));
    setVendors(StorageService.getVendors(event.id));
  }, [event]);

  // Handler for Updating Event Details
  const handleSaveEventDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEventData.name.trim()) return;

    StorageService.updateEvent(currentEvent.id, editEventData);
    const updated = StorageService.getEventById(currentEvent.id);
    if (updated) {
      setCurrentEvent(updated);
    }
    setShowEditEventModal(false);
    onRefresh();
  };

  // Handlers for Budget
  const handleAddBudgetItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetItem.category.trim()) return;
    const item: BudgetItem = {
      id: `b-${currentEvent.id}-${Date.now()}`,
      event_id: currentEvent.id,
      category: newBudgetItem.category.trim(),
      allocated_amount: Number(newBudgetItem.allocated_amount) || 0,
      actual_spent: 0,
      notes: newBudgetItem.notes.trim(),
      is_contingency: newBudgetItem.is_contingency || newBudgetItem.category.toLowerCase().includes('contingency')
    };
    const updated = [...budgetItems, item];
    StorageService.updateBudgetItems(currentEvent.id, updated);
    setBudgetItems(updated);
    setNewBudgetItem({ category: '', allocated_amount: 10000, notes: '', is_contingency: false });
    setShowAddBudgetModal(false);
    onRefresh();
  };

  const handleSaveEditBudgetItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudgetItem || !editingBudgetItem.category.trim()) return;

    const updated = budgetItems.map(item => item.id === editingBudgetItem.id ? editingBudgetItem : item);
    StorageService.updateBudgetItems(currentEvent.id, updated);
    setBudgetItems(updated);
    setEditingBudgetItem(null);
    onRefresh();
  };

  const handleUpdateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    const updated = budgetItems.map(item => item.id === id ? { ...item, ...updates } : item);
    StorageService.updateBudgetItems(currentEvent.id, updated);
    setBudgetItems(updated);
    onRefresh();
  };

  const handleDeleteBudgetItem = (id: string) => {
    const updated = budgetItems.filter(item => item.id !== id);
    StorageService.updateBudgetItems(currentEvent.id, updated);
    setBudgetItems(updated);
    onRefresh();
  };

  // Handlers for Tasks
  const handleToggleTask = (taskId: string, current: boolean) => {
    StorageService.updateTimelineTask(taskId, { is_completed: !current });
    setTasks(tasks.map(t => t.id === taskId ? { ...t, is_completed: !current } : t));
    onRefresh();
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskFormData.title.trim()) return;
    StorageService.addTimelineTask(currentEvent.id, taskFormData);
    setTasks(StorageService.getTimelineTasks(currentEvent.id));
    setTaskFormData({
      title: '',
      description: '',
      phase: 'Weeks Before',
      due_date: currentEvent.event_date,
      priority: 'Medium'
    });
    setShowAddTaskModal(false);
    onRefresh();
  };

  const handleSaveEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;

    StorageService.updateTimelineTask(editingTask.id, editingTask);
    setTasks(StorageService.getTimelineTasks(currentEvent.id));
    setEditingTask(null);
    onRefresh();
  };

  const handleDeleteTask = (taskId: string) => {
    StorageService.deleteTimelineTask(taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
    onRefresh();
  };

  // Handlers for Vendors
  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorFormData.category.trim()) return;
    StorageService.addVendor(currentEvent.id, vendorFormData);
    setVendors(StorageService.getVendors(currentEvent.id));
    setVendorFormData({
      category: '',
      criteria: '',
      questions_to_ask: '',
      estimated_cost: 20000,
      status: 'Not Started',
      notes: '',
      contact_info: '',
      deadline: currentEvent.event_date
    });
    setShowAddVendorModal(false);
    onRefresh();
  };

  const handleSaveEditVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor || !editingVendor.category.trim()) return;

    StorageService.updateVendor(editingVendor.id, editingVendor);
    setVendors(StorageService.getVendors(currentEvent.id));
    setEditingVendor(null);
    onRefresh();
  };

  const handleUpdateVendorStatus = (vendorId: string, status: VendorStatus) => {
    StorageService.updateVendor(vendorId, { status });
    setVendors(vendors.map(v => v.id === vendorId ? { ...v, status } : v));
    onRefresh();
  };

  const handleDeleteVendor = (vendorId: string) => {
    StorageService.deleteVendor(vendorId);
    setVendors(vendors.filter(v => v.id !== vendorId));
    onRefresh();
  };

  // Event status handler
  const handleStatusChange = (newStatus: any) => {
    StorageService.updateEvent(currentEvent.id, { status: newStatus });
    setCurrentEvent({ ...currentEvent, status: newStatus });
    onRefresh();
  };

  // AI Actions
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    const updatedHistory = [...chatMessages, { role: 'user', content: userText }];
    setChatMessages(updatedHistory);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await askCelebrAI(currentEvent, userText, updatedHistory);
      setChatMessages([...updatedHistory, { role: 'assistant', content: res.reply }]);
    } catch {
      setChatMessages([...updatedHistory, { role: 'assistant', content: 'Unable to reach CelebrAI service right now. Please try again.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateThemes = async () => {
    setIsThemeLoading(true);
    try {
      const res = await improveTheme(currentEvent, currentEvent.theme);
      setThemeSuggestions(res.themes || []);
    } catch {
      // fallback
    } finally {
      setIsThemeLoading(false);
    }
  };

  const handleApplyTheme = (themeName: string) => {
    StorageService.updateEvent(currentEvent.id, { theme: themeName });
    setCurrentEvent({ ...currentEvent, theme: themeName });
    onRefresh();
  };

  const handleGenerateInvites = async () => {
    setIsInviteLoading(true);
    try {
      const res = await generateInvitation(currentEvent);
      setInvitationDrafts(res);
    } catch {
      // fallback
    } finally {
      setIsInviteLoading(false);
    }
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateActivities = async () => {
    setIsActivityLoading(true);
    try {
      const res = await suggestActivities(currentEvent);
      setActivitySuggestions(res.activities || []);
    } catch {
      // fallback
    } finally {
      setIsActivityLoading(false);
    }
  };

  const handleOptimizeBudget = async () => {
    setIsBudgetOptLoading(true);
    try {
      const res = await optimizeBudget(currentEvent, budgetItems);
      setBudgetOptimization(res);
    } catch {
      // fallback
    } finally {
      setIsBudgetOptLoading(false);
    }
  };

  // Phased task groupings
  const phases: TimelinePhase[] = ['Weeks Before', 'Final Week', 'Day Before', 'Event Day', 'Post-Event'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Workspace Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#4B5563] hover:text-[#2E1065] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Events</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Edit Event Details Button */}
          <button
            onClick={() => {
              setEditEventData({
                name: currentEvent.name,
                event_type: currentEvent.event_type,
                event_date: currentEvent.event_date,
                location: currentEvent.location,
                guests: currentEvent.guests,
                total_budget: currentEvent.total_budget,
                theme: currentEvent.theme,
                venue_preference: currentEvent.venue_preference,
                food_preference: currentEvent.food_preference,
                planning_style: currentEvent.planning_style
              });
              setShowEditEventModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-[#2E1065] border border-[#E9E2D8] hover:bg-[#FAF7F2] shadow-xs cursor-pointer"
            title="Edit Event Details"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#5B21B6]" />
            <span className="hidden sm:inline">Edit Details</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={() => exportEventToPrintablePDF(currentEvent, budgetItems, tasks, vendors)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-[#2E1065] border border-[#E9E2D8] hover:bg-[#FAF7F2] shadow-xs cursor-pointer"
            title="Download Executive Print Blueprint"
          >
            <FileDown className="w-3.5 h-3.5 text-[#B45309]" />
            <span className="hidden sm:inline">Executive PDF</span>
          </button>

          {/* Duplicate Button */}
          <button
            onClick={() => onDuplicate(currentEvent.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-[#4B5563] hover:text-[#2E1065] border border-[#E9E2D8] hover:bg-[#FAF7F2] shadow-xs cursor-pointer"
            title="Duplicate Event"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clone</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(currentEvent.id)}
            className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#DC2626] hover:bg-[#FEF2F2] border border-[#E9E2D8] cursor-pointer"
            title="Delete Event"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Event Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9E2D8] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF5FF] text-[#5B21B6] border border-[#F3E8FF]">
                {currentEvent.event_type}
              </span>
              <span className="text-xs text-[#6B7280]">
                Theme: <strong className="text-[#2E1065]">{currentEvent.theme || 'Classic'}</strong>
              </span>
              <span className="text-xs text-[#6B7280]">
                Style: <strong className="text-[#2E1065]">{currentEvent.planning_style}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#2E1065]">
              {currentEvent.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={currentEvent.status}
              onChange={e => handleStatusChange(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl text-[#2E1065] focus:outline-none focus:border-[#7C3AED]"
            >
              <option value="Planning">Status: Planning</option>
              <option value="In Progress">Status: In Progress</option>
              <option value="Confirmed">Status: Confirmed</option>
              <option value="Completed">Status: Completed</option>
            </select>

            <div className="bg-[#FAF5FF] px-4 py-2 rounded-2xl border border-[#F3E8FF] text-right">
              <div className="text-[10px] text-[#6B7280] uppercase font-bold">Total Budget</div>
              <div className="text-lg font-black text-[#2E1065]">
                {formatINR(currentEvent.total_budget)}
              </div>
            </div>
          </div>
        </div>

        {/* Info badges row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E9E2D8]/80 text-xs">
          <div className="flex items-center gap-2 text-[#4B5563]">
            <Calendar className="w-4 h-4 text-[#6B7280]" />
            <span>{formatReadableDate(currentEvent.event_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-[#4B5563]">
            <MapPin className="w-4 h-4 text-[#6B7280]" />
            <span className="truncate">{currentEvent.location}</span>
          </div>
          <div className="flex items-center gap-2 text-[#4B5563]">
            <Users className="w-4 h-4 text-[#6B7280]" />
            <span>{currentEvent.guests} Guests</span>
          </div>
          <div className="flex items-center gap-2 text-[#4B5563]">
            <Utensils className="w-4 h-4 text-[#6B7280]" />
            <span>{currentEvent.food_preference} • {currentEvent.venue_preference}</span>
          </div>
        </div>
      </div>

      {/* Workspace Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#E9E2D8] pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#2E1065] text-white shadow-xs'
              : 'text-[#4B5563] hover:text-[#2E1065] hover:bg-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Overview & Blueprint</span>
        </button>

        <button
          onClick={() => setActiveTab('budget')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'budget'
              ? 'bg-[#2E1065] text-white shadow-xs'
              : 'text-[#4B5563] hover:text-[#2E1065] hover:bg-white'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Smart Budget</span>
          {budgetSummary.is_over_budget && (
            <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-[#2E1065] text-white shadow-xs'
              : 'text-[#4B5563] hover:text-[#2E1065] hover:bg-white'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>Timeline & Milestones</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {tasks.filter(t => t.is_completed).length}/{tasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('vendors')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'vendors'
              ? 'bg-[#2E1065] text-white shadow-xs'
              : 'text-[#4B5563] hover:text-[#2E1065] hover:bg-white'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Vendor Hub</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {vendors.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ai-tools')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'ai-tools'
              ? 'bg-[#2E1065] text-white shadow-xs'
              : 'text-[#4B5563] hover:text-[#2E1065] hover:bg-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-[#F59E0B]" />
          <span>AI Studio Tools</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW & CREATIVE BLUEPRINT                     */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Concept Description */}
          {currentEvent.overview && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9E2D8] shadow-xs space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B45309]">
                Creative Concept
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2E1065]">
                {currentEvent.overview.concept || `${currentEvent.name} Celebration Concept`}
              </h3>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                {currentEvent.overview.personalized_description || currentEvent.overview.atmosphere}
              </p>

              {currentEvent.overview.key_considerations && currentEvent.overview.key_considerations.length > 0 && (
                <div className="pt-3 border-t border-[#E9E2D8]">
                  <div className="text-xs font-bold text-[#2E1065] mb-2">Key Planning Directives:</div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[#4B5563]">
                    {currentEvent.overview.key_considerations.map((c, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E9E2D8]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Color Palette */}
          {currentEvent.creative?.color_palette && currentEvent.creative.color_palette.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9E2D8] shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#2E1065] flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#6D28D9]" />
                <span>Thematic Color Palette</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {currentEvent.creative.color_palette.map((swatch, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-2xl border border-[#E9E2D8] bg-[#FAF7F2] flex flex-col items-center text-center gap-2 group hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleCopyText(swatch.hex, `hex-${idx}`)}
                    title="Click to copy hex code"
                  >
                    <div 
                      className="w-full h-14 rounded-xl shadow-inner border border-black/10 group-hover:scale-102 transition-transform"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <div>
                      <div className="text-xs font-bold text-[#2E1065]">{swatch.name}</div>
                      <div className="text-[11px] font-mono text-[#6B7280]">
                        {copiedKey === `hex-${idx}` ? '✓ Copied!' : swatch.hex}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decor & Catering Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thematic Decor */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9E2D8] shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#2E1065] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                <span>Thematic Decor Elements</span>
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#4B5563]">
                {currentEvent.creative?.decorations?.map((d, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-[#FAF7F2] p-3 rounded-xl border border-[#E9E2D8]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] shrink-0 mt-2" />
                    <span>{d}</span>
                  </li>
                )) || <li>No decor elements generated yet.</li>}
              </ul>
            </div>

            {/* Feast & Menu */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9E2D8] shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#2E1065] flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#E11D48]" />
                <span>Curated Feast & Menu Highlights</span>
              </h3>
              <div className="space-y-3 text-xs sm:text-sm">
                {currentEvent.creative?.menu_suggestions?.welcome_drinks && (
                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E9E2D8]">
                    <span className="font-bold text-[#2E1065] block mb-1">Welcome Drinks:</span>
                    <span className="text-[#4B5563]">{currentEvent.creative.menu_suggestions.welcome_drinks.join(' • ')}</span>
                  </div>
                )}
                {currentEvent.creative?.menu_suggestions?.appetizers && (
                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E9E2D8]">
                    <span className="font-bold text-[#2E1065] block mb-1">Appetizers & Starters:</span>
                    <span className="text-[#4B5563]">{currentEvent.creative.menu_suggestions.appetizers.join(' • ')}</span>
                  </div>
                )}
                {currentEvent.creative?.menu_suggestions?.mains && (
                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E9E2D8]">
                    <span className="font-bold text-[#2E1065] block mb-1">Main Course Banquet:</span>
                    <span className="text-[#4B5563]">{currentEvent.creative.menu_suggestions.mains.join(' • ')}</span>
                  </div>
                )}
                {currentEvent.creative?.menu_suggestions?.desserts && (
                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E9E2D8]">
                    <span className="font-bold text-[#2E1065] block mb-1">Desserts:</span>
                    <span className="text-[#4B5563]">{currentEvent.creative.menu_suggestions.desserts.join(' • ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Risk Management Safeguards */}
          {currentEvent.risk && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9E2D8] shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#2E1065] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#059669]" />
                <span>Risk Management & Contingency Safeguards</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {currentEvent.risk.weather_contingency && (
                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E9E2D8]">
                    <strong className="text-[#2E1065] block mb-1">Weather Contingency</strong>
                    <span className="text-[#4B5563]">{currentEvent.risk.weather_contingency}</span>
                  </div>
                )}
                {currentEvent.risk.backup_venue && (
                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E9E2D8]">
                    <strong className="text-[#2E1065] block mb-1">Backup Venue</strong>
                    <span className="text-[#4B5563]">{currentEvent.risk.backup_venue}</span>
                  </div>
                )}
                {currentEvent.risk.budget_overruns && (
                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E9E2D8]">
                    <strong className="text-[#2E1065] block mb-1">Budget Overrun Guard</strong>
                    <span className="text-[#4B5563]">{currentEvent.risk.budget_overruns}</span>
                  </div>
                )}
                {currentEvent.risk.emergency_supplies && (
                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E9E2D8]">
                    <strong className="text-[#2E1065] block mb-1">Emergency Supplies</strong>
                    <span className="text-[#4B5563]">{currentEvent.risk.emergency_supplies}</span>
                  </div>
                )}
                {currentEvent.risk.schedule_delays && (
                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E9E2D8]">
                    <strong className="text-[#2E1065] block mb-1">Schedule Delay Buffer</strong>
                    <span className="text-[#4B5563]">{currentEvent.risk.schedule_delays}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: SMART BUDGET                                      */}
      {/* ======================================================== */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-[#E9E2D8]">
              <span className="text-xs font-semibold text-[#6B7280]">Total Target Budget</span>
              <div className="text-xl sm:text-2xl font-black text-[#2E1065] mt-1">
                {budgetSummary.total_budget_formatted}
              </div>
              <div className="text-[11px] text-[#6B7280]">Baseline ceiling</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#E9E2D8]">
              <span className="text-xs font-semibold text-[#6B7280]">Total Planned</span>
              <div className="text-xl sm:text-2xl font-black text-[#2E1065] mt-1">
                {budgetSummary.total_planned_formatted}
              </div>
              <div className="text-[11px] text-[#6B7280]">Category line items</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#E9E2D8] bg-[#FFFBEB]">
              <span className="text-xs font-semibold text-[#B45309]">Contingency Reserve</span>
              <div className="text-xl sm:text-2xl font-black text-[#B45309] mt-1">
                {budgetSummary.contingency_formatted}
              </div>
              <div className="text-[11px] text-[#B45309]">Separated safety buffer</div>
            </div>

            <div className={`rounded-2xl p-5 border ${
              budgetSummary.is_over_budget 
                ? 'bg-[#FEF2F2] border-[#FEE2E2]' 
                : 'bg-[#ECFDF5] border-[#D1FAE5]'
            }`}>
              <span className={`text-xs font-semibold ${
                budgetSummary.is_over_budget ? 'text-[#991B1B]' : 'text-[#065F46]'
              }`}>
                {budgetSummary.is_over_budget ? 'Budget Overage' : 'Remaining Budget'}
              </span>
              <div className="text-xl sm:text-2xl font-black mt-1">
                {budgetSummary.is_over_budget 
                  ? `-${budgetSummary.overage_formatted}` 
                  : budgetSummary.remaining_budget_formatted}
              </div>
              <div className={`text-[11px] ${
                budgetSummary.is_over_budget ? 'text-[#991B1B]' : 'text-[#065F46]'
              }`}>
                {budgetSummary.utilization_percentage}% utilized
              </div>
            </div>
          </div>

          {/* Utilization Bar */}
          <div className="bg-white rounded-2xl p-5 border border-[#E9E2D8] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#2E1065]">
                Budget Utilization ({budgetSummary.utilization_percentage}%)
              </span>
              <span className="text-[#6B7280]">
                {formatINR(budgetSummary.total_allocated)} of {budgetSummary.total_budget_formatted} allocated
              </span>
            </div>
            <div className="w-full bg-[#FAF7F2] rounded-full h-3 border border-[#E9E2D8] overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetSummary.is_over_budget 
                    ? 'bg-[#DC2626]' 
                    : 'bg-gradient-to-r from-[#2E1065] to-[#F59E0B]'
                }`}
                style={{ width: `${Math.min(100, budgetSummary.utilization_percentage)}%` }}
              />
            </div>
          </div>

          {/* Budget Items Table */}
          <div className="bg-white rounded-3xl border border-[#E9E2D8] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#E9E2D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#2E1065]">
                  Expense Breakdown & Actuals
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Track allocated amounts against actual vendor receipts. Contingency is tracked separately to avoid double-counting.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveTab('ai-tools');
                    setAiSubTab('budget_opt');
                    handleOptimizeBudget();
                  }}
                  className="px-3 py-1.5 text-xs font-bold bg-[#FAF5FF] text-[#5B21B6] border border-[#F3E8FF] rounded-xl hover:bg-[#F3E8FF] cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>AI Optimize</span>
                </button>

                <button
                  onClick={() => setShowAddBudgetModal(true)}
                  className="px-3.5 py-1.5 text-xs font-bold bg-[#2E1065] text-white rounded-xl hover:bg-[#4C1D95] cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Expense</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#2E1065] font-bold border-b border-[#E9E2D8]">
                  <tr>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Allocated (INR)</th>
                    <th className="py-3 px-4">Actual Spent (INR)</th>
                    <th className="py-3 px-4">% of Budget</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E2D8]">
                  {budgetSummary.items.map(item => (
                    <tr key={item.id} className={item.is_contingency ? 'bg-[#FFFBEB]/40' : 'hover:bg-[#FAF7F2]/50'}>
                      <td className="py-3 px-4 font-semibold text-[#2E1065]">
                        <div className="flex items-center gap-1.5">
                          <span>{item.category}</span>
                          {item.is_contingency && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] text-[#B45309]">
                              Contingency
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#2E1065]">
                        {item.allocated_formatted}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <input
                          type="number"
                          value={item.actual_spent === 0 ? '' : item.actual_spent}
                          placeholder="0"
                          onChange={e => handleUpdateBudgetItem(item.id, { actual_spent: e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0) })}
                          className="w-24 px-2 py-1 bg-white border border-[#E9E2D8] rounded text-xs focus:outline-none focus:border-[#7C3AED]"
                        />
                      </td>
                      <td className="py-3 px-4 text-[#6B7280]">
                        {item.percentage}%
                      </td>
                      <td className="py-3 px-4 text-[#4B5563] max-w-xs truncate">
                        {item.notes || '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingBudgetItem(item)}
                            className="p-1 text-[#6B7280] hover:text-[#2E1065] rounded cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBudgetItem(item.id)}
                            className="p-1 text-[#6B7280] hover:text-[#DC2626] rounded cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: TIMELINE & SCHEDULE                               */}
      {/* ======================================================== */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#2E1065]">
                Adaptive Preparation Milestones
              </h3>
              <p className="text-xs text-[#6B7280]">
                Phased preparation roadmap chronologically offset from event day ({formatReadableDate(currentEvent.event_date)}).
              </p>
            </div>

            <button
              onClick={() => {
                setTaskFormData({
                  title: '',
                  description: '',
                  phase: 'Weeks Before',
                  due_date: currentEvent.event_date,
                  priority: 'Medium'
                });
                setShowAddTaskModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#2E1065] text-white hover:bg-[#4C1D95] rounded-xl cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Milestone Task</span>
            </button>
          </div>

          {/* Grouped phases */}
          <div className="space-y-6">
            {phases.map(phase => {
              const phaseTasks = tasks.filter(t => t.phase === phase);
              if (phaseTasks.length === 0) return null;

              return (
                <div key={phase} className="bg-white rounded-3xl p-6 border border-[#E9E2D8] shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E9E2D8] pb-2">
                    <h4 className="font-serif text-base font-bold text-[#2E1065] flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#F59E0B]" />
                      <span>{phase}</span>
                    </h4>
                    <span className="text-[11px] font-semibold text-[#6B7280]">
                      {phaseTasks.filter(t => t.is_completed).length}/{phaseTasks.length} Done
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {phaseTasks.map(task => (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                          task.is_completed
                            ? 'bg-[#FAF7F2]/60 border-[#E9E2D8] opacity-75'
                            : 'bg-white border-[#E9E2D8] hover:border-[#7C3AED]/50 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <button
                            onClick={() => handleToggleTask(task.id, task.is_completed)}
                            className="mt-0.5 cursor-pointer text-[#2E1065] focus:outline-none"
                          >
                            {task.is_completed ? (
                              <CheckCircle2 className="w-5 h-5 text-[#059669] fill-emerald-100" />
                            ) : (
                              <Circle className="w-5 h-5 text-[#D1D5DB] hover:text-[#2E1065]" />
                            )}
                          </button>

                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-bold ${
                                task.is_completed ? 'line-through text-[#6B7280]' : 'text-[#2E1065]'
                              }`}>
                                {task.title}
                              </span>

                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                task.priority === 'Urgent'
                                  ? 'bg-[#FEE2E2] text-[#991B1B]'
                                  : task.priority === 'High'
                                  ? 'bg-[#FEF3C7] text-[#92400E]'
                                  : task.priority === 'Medium'
                                  ? 'bg-[#E0E7FF] text-[#3730A3]'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {task.priority}
                              </span>
                            </div>

                            {task.description && (
                              <p className="text-xs text-[#6B7280] leading-relaxed">
                                {task.description}
                              </p>
                            )}

                            {task.due_date && (
                              <div className="text-[11px] text-[#6B7280] font-medium flex items-center gap-1 pt-1">
                                <Calendar className="w-3 h-3" />
                                <span>Target: {formatReadableDate(task.due_date)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingTask(task)}
                            className="p-1 text-[#6B7280] hover:text-[#2E1065] rounded cursor-pointer"
                            title="Edit task"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-[#6B7280] hover:text-[#DC2626] rounded cursor-pointer"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: VENDOR HUB                                        */}
      {/* ======================================================== */}
      {activeTab === 'vendors' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#2E1065]">
                Vendor Selection & Management
              </h3>
              <p className="text-xs text-[#6B7280]">
                Pre-formulated vetting criteria, crucial interview questions, and budget estimates.
              </p>
            </div>

            <button
              onClick={() => {
                setVendorFormData({
                  category: '',
                  criteria: '',
                  questions_to_ask: '',
                  estimated_cost: 20000,
                  status: 'Not Started',
                  notes: '',
                  contact_info: '',
                  deadline: currentEvent.event_date
                });
                setShowAddVendorModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#2E1065] text-white hover:bg-[#4C1D95] rounded-xl cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vendor Record</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vendors.map(vendor => (
              <div 
                key={vendor.id}
                className="bg-white rounded-3xl p-6 border border-[#E9E2D8] shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-[#E9E2D8] pb-3">
                    <div>
                      <h4 className="font-serif text-lg font-bold text-[#2E1065]">
                        {vendor.category}
                      </h4>
                      <span className="text-xs font-semibold text-[#059669]">
                        Est. {formatINR(vendor.estimated_cost)}
                      </span>
                    </div>

                    <select
                      value={vendor.status}
                      onChange={e => handleUpdateVendorStatus(vendor.id, e.target.value as VendorStatus)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${
                        vendor.status === 'Booked' || vendor.status === 'Completed'
                          ? 'bg-[#ECFDF5] text-[#065F46] border-[#D1FAE5]'
                          : vendor.status === 'Contacted' || vendor.status === 'Shortlisted'
                          ? 'bg-[#FFFBEB] text-[#92400E] border-[#FEF3C7]'
                          : 'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB]'
                      }`}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Booked">Booked</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  {vendor.criteria && (
                    <div className="text-xs text-[#4B5563]">
                      <strong className="text-[#2E1065] block mb-0.5">Selection Criteria:</strong>
                      <p className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E9E2D8]">
                        {vendor.criteria}
                      </p>
                    </div>
                  )}

                  {vendor.questions_to_ask && (
                    <div className="text-xs text-[#4B5563]">
                      <strong className="text-[#2E1065] block mb-0.5">Negotiation Questions to Ask:</strong>
                      <p className="bg-[#FAF5FF] p-2.5 rounded-xl border border-[#F3E8FF] text-[#2E1065]">
                        {vendor.questions_to_ask}
                      </p>
                    </div>
                  )}

                  {(vendor.contact_info || vendor.notes) && (
                    <div className="text-xs text-[#6B7280] space-y-1 pt-1">
                      {vendor.contact_info && <div><strong>Contact:</strong> {vendor.contact_info}</div>}
                      {vendor.notes && <div><strong>Notes:</strong> {vendor.notes}</div>}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#E9E2D8] flex items-center justify-between text-xs text-[#6B7280]">
                  <span>Deadline: {formatReadableDate(vendor.deadline)}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingVendor(vendor)}
                      className="p-1 text-[#6B7280] hover:text-[#2E1065] rounded cursor-pointer"
                      title="Edit Vendor"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteVendor(vendor.id)}
                      className="p-1 text-[#6B7280] hover:text-[#DC2626] rounded cursor-pointer"
                      title="Delete Vendor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: AI STUDIO TOOLS & CONCIERGE                       */}
      {/* ======================================================== */}
      {activeTab === 'ai-tools' && (
        <div className="space-y-6">
          {/* Sub Tab Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto bg-white p-2 rounded-2xl border border-[#E9E2D8]">
            <button
              onClick={() => setAiSubTab('chat')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                aiSubTab === 'chat'
                  ? 'bg-[#2E1065] text-white'
                  : 'text-[#4B5563] hover:text-[#2E1065]'
              }`}
            >
              💬 Ask CelebrAI Concierge
            </button>
            <button
              onClick={() => {
                setAiSubTab('theme');
                if (themeSuggestions.length === 0) handleGenerateThemes();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                aiSubTab === 'theme'
                  ? 'bg-[#2E1065] text-white'
                  : 'text-[#4B5563] hover:text-[#2E1065]'
              }`}
            >
              🎨 Theme Studio
            </button>
            <button
              onClick={() => {
                setAiSubTab('invites');
                if (!invitationDrafts) handleGenerateInvites();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                aiSubTab === 'invites'
                  ? 'bg-[#2E1065] text-white'
                  : 'text-[#4B5563] hover:text-[#2E1065]'
              }`}
            >
              💌 Multi-Tone Invitations
            </button>
            <button
              onClick={() => {
                setAiSubTab('activities');
                if (activitySuggestions.length === 0) handleGenerateActivities();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                aiSubTab === 'activities'
                  ? 'bg-[#2E1065] text-white'
                  : 'text-[#4B5563] hover:text-[#2E1065]'
              }`}
            >
              🎉 Party Games & Activities
            </button>
            <button
              onClick={() => {
                setAiSubTab('budget_opt');
                if (!budgetOptimization) handleOptimizeBudget();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                aiSubTab === 'budget_opt'
                  ? 'bg-[#2E1065] text-white'
                  : 'text-[#4B5563] hover:text-[#2E1065]'
              }`}
            >
              💡 Budget Optimization
            </button>
          </div>

          {/* Sub-view 1: Chat */}
          {aiSubTab === 'chat' && (
            <div className="bg-white rounded-3xl border border-[#E9E2D8] shadow-xs flex flex-col h-[520px] overflow-hidden">
              <div className="p-4 border-b border-[#E9E2D8] bg-[#FAF7F2] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#2E1065] text-[#F59E0B] flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#2E1065]">
                      Ask CelebrAI
                    </h4>
                    <p className="text-[10px] text-[#6B7280]">
                      Tailored specifically to {currentEvent.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#2E1065] text-white rounded-br-none'
                          : 'bg-[#FAF7F2] text-[#1F2937] border border-[#E9E2D8] rounded-bl-none whitespace-pre-wrap'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[#FAF7F2] border border-[#E9E2D8] rounded-2xl px-4 py-3 text-xs text-[#6B7280] flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2E1065]" />
                      <span>CelebrAI is formulating recommendations...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="p-3 border-t border-[#E9E2D8] bg-white flex gap-2">
                <input
                  type="text"
                  placeholder="Ask anything, e.g. 'How can I save on catering without cutting guest count?'"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl focus:bg-white focus:outline-none focus:border-[#7C3AED]"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="px-4 py-2 bg-[#2E1065] text-white hover:bg-[#4C1D95] rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          )}

          {/* Sub-view 2: Theme Studio */}
          {aiSubTab === 'theme' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#2E1065]">
                    AI Theme Concepts
                  </h4>
                  <p className="text-xs text-[#6B7280]">
                    Current Theme: <strong>{currentEvent.theme}</strong>
                  </p>
                </div>
                <button
                  onClick={handleGenerateThemes}
                  disabled={isThemeLoading}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FAF5FF] text-[#5B21B6] border border-[#F3E8FF] hover:bg-[#F3E8FF] cursor-pointer flex items-center gap-1.5"
                >
                  {isThemeLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Regenerate Themes</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {themeSuggestions.map((t, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-6 border border-[#E9E2D8] shadow-xs flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-serif text-base font-bold text-[#2E1065]">{t.name}</h5>
                        <p className="text-xs font-medium text-[#B45309] italic">{t.tagline}</p>
                      </div>
                      <p className="text-xs text-[#4B5563]">{t.description}</p>
                      <div className="flex gap-2">
                        {t.colors?.map((c: any, cIdx: number) => (
                          <div 
                            key={cIdx} 
                            className="w-7 h-7 rounded-lg border border-black/10 shadow-xs" 
                            style={{ backgroundColor: c.hex }} 
                            title={c.name}
                          />
                        ))}
                      </div>
                      {t.decor_highlights && (
                        <div className="text-[11px] text-[#6B7280] space-y-1">
                          <strong>Decor Accents:</strong>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {t.decor_highlights.map((dh: string, dhIdx: number) => (
                              <li key={dhIdx}>{dh}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleApplyTheme(t.name)}
                      className="w-full py-2 rounded-xl text-xs font-bold bg-[#FAF5FF] text-[#2E1065] hover:bg-[#F3E8FF] border border-[#F3E8FF] cursor-pointer transition-colors"
                    >
                      Apply This Theme
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-view 3: Multi-Tone Invitations */}
          {aiSubTab === 'invites' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#2E1065]">
                    Personalized Invitation Copy
                  </h4>
                  <p className="text-xs text-[#6B7280]">
                    Instant drafts in 4 distinct tones ready to paste into WhatsApp, invitations, or cards.
                  </p>
                </div>
                <button
                  onClick={handleGenerateInvites}
                  disabled={isInviteLoading}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FAF5FF] text-[#5B21B6] border border-[#F3E8FF] hover:bg-[#F3E8FF] cursor-pointer flex items-center gap-1.5"
                >
                  {isInviteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Regenerate Drafts</span>
                </button>
              </div>

              {invitationDrafts && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Formal */}
                  <div className="bg-white rounded-3xl p-6 border border-[#E9E2D8] shadow-xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-xs uppercase tracking-wider text-[#2E1065]">
                          1. Formal & Traditional
                        </span>
                        <button
                          onClick={() => handleCopyText(invitationDrafts.formal, 'formal')}
                          className="text-xs font-bold text-[#5B21B6] hover:underline cursor-pointer"
                        >
                          {copiedKey === 'formal' ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-xs text-[#4B5563] leading-relaxed whitespace-pre-line bg-[#FAF7F2] p-4 rounded-xl border border-[#E9E2D8]">
                        {invitationDrafts.formal}
                      </p>
                    </div>
                  </div>

                  {/* Casual */}
                  <div className="bg-white rounded-3xl p-6 border border-[#E9E2D8] shadow-xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-xs uppercase tracking-wider text-[#059669]">
                          2. Warm & Casual
                        </span>
                        <button
                          onClick={() => handleCopyText(invitationDrafts.casual, 'casual')}
                          className="text-xs font-bold text-[#5B21B6] hover:underline cursor-pointer"
                        >
                          {copiedKey === 'casual' ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-xs text-[#4B5563] leading-relaxed whitespace-pre-line bg-[#FAF7F2] p-4 rounded-xl border border-[#E9E2D8]">
                        {invitationDrafts.casual}
                      </p>
                    </div>
                  </div>

                  {/* Poetic */}
                  <div className="bg-white rounded-3xl p-6 border border-[#E9E2D8] shadow-xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-xs uppercase tracking-wider text-[#E11D48]">
                          3. Poetic & Emotional
                        </span>
                        <button
                          onClick={() => handleCopyText(invitationDrafts.poetic, 'poetic')}
                          className="text-xs font-bold text-[#5B21B6] hover:underline cursor-pointer"
                        >
                          {copiedKey === 'poetic' ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-xs text-[#4B5563] leading-relaxed whitespace-pre-line bg-[#FAF7F2] p-4 rounded-xl border border-[#E9E2D8]">
                        {invitationDrafts.poetic}
                      </p>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="bg-white rounded-3xl p-6 border border-[#E9E2D8] shadow-xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-xs uppercase tracking-wider text-[#059669]">
                          4. WhatsApp Motion Card Copy
                        </span>
                        <button
                          onClick={() => handleCopyText(invitationDrafts.whatsapp, 'whatsapp')}
                          className="text-xs font-bold text-[#5B21B6] hover:underline cursor-pointer"
                        >
                          {copiedKey === 'whatsapp' ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-xs text-[#4B5563] leading-relaxed whitespace-pre-line bg-[#FAF7F2] p-4 rounded-xl border border-[#E9E2D8]">
                        {invitationDrafts.whatsapp}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sub-view 4: Activities */}
          {aiSubTab === 'activities' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#2E1065]">
                    Party Games & Entertainment
                  </h4>
                  <p className="text-xs text-[#6B7280]">
                    Icebreakers and interactive segments tailored to {currentEvent.guests} guests.
                  </p>
                </div>
                <button
                  onClick={handleGenerateActivities}
                  disabled={isActivityLoading}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FAF5FF] text-[#5B21B6] border border-[#F3E8FF] hover:bg-[#F3E8FF] cursor-pointer flex items-center gap-1.5"
                >
                  {isActivityLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Regenerate Ideas</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activitySuggestions.map((act, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-6 border border-[#E9E2D8] shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-serif text-base font-bold text-[#2E1065]">{act.title}</h5>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] text-[#92400E]">
                        {act.duration}
                      </span>
                    </div>
                    <div className="text-xs text-[#6B7280]">
                      <strong>Best Time:</strong> {act.best_time}
                    </div>
                    <p className="text-xs text-[#4B5563] bg-[#FAF7F2] p-3 rounded-xl border border-[#E9E2D8]">
                      {act.how_it_works}
                    </p>
                    {act.supplies_needed && (
                      <div className="text-[11px] text-[#6B7280]">
                        <strong>Supplies Needed:</strong> {act.supplies_needed.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-view 5: Budget Optimization */}
          {aiSubTab === 'budget_opt' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#2E1065]">
                    Financial Optimization Recommendations
                  </h4>
                  <p className="text-xs text-[#6B7280]">
                    Tactical cost reduction strategies without diminishing guest hospitality.
                  </p>
                </div>
                <button
                  onClick={handleOptimizeBudget}
                  disabled={isBudgetOptLoading}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FAF5FF] text-[#5B21B6] border border-[#F3E8FF] hover:bg-[#F3E8FF] cursor-pointer flex items-center gap-1.5"
                >
                  {isBudgetOptLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Re-analyze</span>
                </button>
              </div>

              {budgetOptimization && (
                <div className="space-y-4">
                  <div className="bg-[#FAF5FF] p-4 rounded-2xl border border-[#F3E8FF] text-xs sm:text-sm text-[#2E1065]">
                    {budgetOptimization.analysis}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {budgetOptimization.tips?.map((tip: any, idx: number) => (
                      <div key={idx} className="bg-white rounded-3xl p-6 border border-[#E9E2D8] shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-serif text-base font-bold text-[#2E1065]">{tip.title}</h5>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF5] text-[#065F46]">
                            Save ~{tip.potential_saving}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-[#6B7280] block">
                          Impact Area: {tip.category}
                        </span>
                        <p className="text-xs text-[#4B5563] bg-[#FAF7F2] p-3 rounded-xl border border-[#E9E2D8]">
                          {tip.action}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Edit Event Details Modal */}
      {showEditEventModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <form onSubmit={handleSaveEventDetails} className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#E9E2D8] shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#E9E2D8] pb-2">
              <h3 className="font-serif text-lg font-bold text-[#2E1065]">
                Edit Celebration Details
              </h3>
              <button
                type="button"
                onClick={() => setShowEditEventModal(false)}
                className="p-1 text-[#6B7280] hover:text-[#2E1065] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-[#2E1065] mb-1">Event Name</label>
                <input
                  type="text"
                  value={editEventData.name}
                  onChange={e => setEditEventData({ ...editEventData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2E1065] mb-1">Event Type</label>
                <select
                  value={editEventData.event_type}
                  onChange={e => setEditEventData({ ...editEventData, event_type: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
                >
                  <option value="Wedding">Wedding</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="College Event">College Event</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Festival">Festival</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#2E1065] mb-1">Event Date</label>
                <input
                  type="date"
                  value={editEventData.event_date}
                  onChange={e => setEditEventData({ ...editEventData, event_date: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2E1065] mb-1">Location</label>
                <input
                  type="text"
                  value={editEventData.location}
                  onChange={e => setEditEventData({ ...editEventData, location: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2E1065] mb-1">Guests</label>
                <input
                  type="number"
                  min="1"
                  value={editEventData.guests === 0 ? '' : editEventData.guests}
                  onChange={e => setEditEventData({ ...editEventData, guests: e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0) })}
                  required
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-[#2E1065] mb-1">Total Target Budget (INR)</label>
                <input
                  type="number"
                  min="1000"
                  step="5000"
                  value={editEventData.total_budget === 0 ? '' : editEventData.total_budget}
                  onChange={e => setEditEventData({ ...editEventData, total_budget: e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0) })}
                  required
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2E1065] mb-1">Theme</label>
                <input
                  type="text"
                  value={editEventData.theme}
                  onChange={e => setEditEventData({ ...editEventData, theme: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2E1065] mb-1">Venue Preference</label>
                <select
                  value={editEventData.venue_preference}
                  onChange={e => setEditEventData({ ...editEventData, venue_preference: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
                >
                  <option value="Outdoor">Outdoor</option>
                  <option value="Indoor">Indoor</option>
                  <option value="Terrace">Terrace</option>
                  <option value="Banquet">Banquet</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#2E1065] mb-1">Catering</label>
                <select
                  value={editEventData.food_preference}
                  onChange={e => setEditEventData({ ...editEventData, food_preference: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
                >
                  <option value="Mixed">Mixed</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Jain">Jain</option>
                  <option value="Vegan">Vegan</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#2E1065] mb-1">Planning Style</label>
                <select
                  value={editEventData.planning_style}
                  onChange={e => setEditEventData({ ...editEventData, planning_style: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
                >
                  <option value="Balanced">Balanced</option>
                  <option value="Budget-Friendly">Budget-Friendly</option>
                  <option value="Premium">Premium</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E9E2D8]">
              <button
                type="button"
                onClick={() => setShowEditEventModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FAF7F2] text-[#4B5563]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2E1065] text-white"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Budget Item Modal */}
      {showAddBudgetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddBudgetItem} className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E9E2D8] shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#2E1065]">
              Add Expense Item
            </h3>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Category</label>
              <input
                type="text"
                placeholder="e.g. Traditional Dhol Players, Return Favors"
                value={newBudgetItem.category}
                onChange={e => setNewBudgetItem({ ...newBudgetItem, category: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Allocated Amount (INR)</label>
              <input
                type="number"
                min="0"
                step="500"
                value={newBudgetItem.allocated_amount === 0 ? '' : newBudgetItem.allocated_amount}
                onChange={e => setNewBudgetItem({ ...newBudgetItem, allocated_amount: e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0) })}
                required
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Notes / Scope</label>
              <input
                type="text"
                placeholder="Scope details or vendor notes"
                value={newBudgetItem.notes}
                onChange={e => setNewBudgetItem({ ...newBudgetItem, notes: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isCont"
                checked={newBudgetItem.is_contingency}
                onChange={e => setNewBudgetItem({ ...newBudgetItem, is_contingency: e.target.checked })}
                className="rounded cursor-pointer"
              />
              <label htmlFor="isCont" className="text-xs text-[#2E1065] font-semibold cursor-pointer">
                Mark as Contingency Reserve item
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddBudgetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FAF7F2] text-[#4B5563]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2E1065] text-white"
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Budget Item Modal */}
      {editingBudgetItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSaveEditBudgetItem} className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E9E2D8] shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#2E1065]">
              Edit Expense Item
            </h3>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Category</label>
              <input
                type="text"
                value={editingBudgetItem.category}
                onChange={e => setEditingBudgetItem({ ...editingBudgetItem, category: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Allocated Amount (INR)</label>
              <input
                type="number"
                min="0"
                step="500"
                value={editingBudgetItem.allocated_amount === 0 ? '' : editingBudgetItem.allocated_amount}
                onChange={e => setEditingBudgetItem({ ...editingBudgetItem, allocated_amount: e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0) })}
                required
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Actual Spent (INR)</label>
              <input
                type="number"
                min="0"
                step="500"
                value={editingBudgetItem.actual_spent === 0 ? '' : editingBudgetItem.actual_spent}
                onChange={e => setEditingBudgetItem({ ...editingBudgetItem, actual_spent: e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0) })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Notes / Scope</label>
              <input
                type="text"
                value={editingBudgetItem.notes}
                onChange={e => setEditingBudgetItem({ ...editingBudgetItem, notes: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="editIsCont"
                checked={editingBudgetItem.is_contingency}
                onChange={e => setEditingBudgetItem({ ...editingBudgetItem, is_contingency: e.target.checked })}
                className="rounded cursor-pointer"
              />
              <label htmlFor="editIsCont" className="text-xs text-[#2E1065] font-semibold cursor-pointer">
                Mark as Contingency Reserve item
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingBudgetItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FAF7F2] text-[#4B5563]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2E1065] text-white"
              >
                Save Expense
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Milestone Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddTask} className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E9E2D8] shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#2E1065]">
              Add Preparation Milestone
            </h3>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Milestone Title</label>
              <input
                type="text"
                placeholder="e.g. Schedule hair & makeup trial"
                value={taskFormData.title}
                onChange={e => setTaskFormData({ ...taskFormData, title: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Phase</label>
              <select
                value={taskFormData.phase}
                onChange={e => setTaskFormData({ ...taskFormData, phase: e.target.value as TimelinePhase })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              >
                <option value="Weeks Before">Weeks Before</option>
                <option value="Final Week">Final Week</option>
                <option value="Day Before">Day Before</option>
                <option value="Event Day">Event Day</option>
                <option value="Post-Event">Post-Event</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Target Date</label>
              <input
                type="date"
                value={taskFormData.due_date}
                onChange={e => setTaskFormData({ ...taskFormData, due_date: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Priority</label>
              <select
                value={taskFormData.priority}
                onChange={e => setTaskFormData({ ...taskFormData, priority: e.target.value as PriorityLevel })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Details or checklists"
                value={taskFormData.description}
                onChange={e => setTaskFormData({ ...taskFormData, description: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FAF7F2] text-[#4B5563]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2E1065] text-white"
              >
                Add Milestone
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Milestone Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSaveEditTask} className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E9E2D8] shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#2E1065]">
              Edit Preparation Milestone
            </h3>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Milestone Title</label>
              <input
                type="text"
                value={editingTask.title}
                onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Phase</label>
              <select
                value={editingTask.phase}
                onChange={e => setEditingTask({ ...editingTask, phase: e.target.value as TimelinePhase })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              >
                <option value="Weeks Before">Weeks Before</option>
                <option value="Final Week">Final Week</option>
                <option value="Day Before">Day Before</option>
                <option value="Event Day">Event Day</option>
                <option value="Post-Event">Post-Event</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Target Date</label>
              <input
                type="date"
                value={editingTask.due_date}
                onChange={e => setEditingTask({ ...editingTask, due_date: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Priority</label>
              <select
                value={editingTask.priority}
                onChange={e => setEditingTask({ ...editingTask, priority: e.target.value as PriorityLevel })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Description</label>
              <textarea
                rows={2}
                value={editingTask.description}
                onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FAF7F2] text-[#4B5563]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2E1065] text-white"
              >
                Save Milestone
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Vendor Modal */}
      {showAddVendorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddVendor} className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E9E2D8] shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#2E1065]">
              Add Vendor Checklist
            </h3>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Category</label>
              <input
                type="text"
                placeholder="e.g. Wedding Cake Designer, Safa Stylist"
                value={vendorFormData.category}
                onChange={e => setVendorFormData({ ...vendorFormData, category: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Estimated Cost (INR)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={vendorFormData.estimated_cost === 0 ? '' : vendorFormData.estimated_cost}
                onChange={e => setVendorFormData({ ...vendorFormData, estimated_cost: e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0) })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Target Deadline</label>
              <input
                type="date"
                value={vendorFormData.deadline}
                onChange={e => setVendorFormData({ ...vendorFormData, deadline: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Selection Criteria</label>
              <input
                type="text"
                placeholder="Quality standards or portfolio requirements"
                value={vendorFormData.criteria}
                onChange={e => setVendorFormData({ ...vendorFormData, criteria: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Questions to Ask</label>
              <input
                type="text"
                placeholder="Crucial negotiation questions"
                value={vendorFormData.questions_to_ask}
                onChange={e => setVendorFormData({ ...vendorFormData, questions_to_ask: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Contact Info / Vendor Name</label>
              <input
                type="text"
                placeholder="Phone number, email or studio name"
                value={vendorFormData.contact_info}
                onChange={e => setVendorFormData({ ...vendorFormData, contact_info: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Notes</label>
              <textarea
                rows={2}
                placeholder="Negotiation terms, advance paid, etc."
                value={vendorFormData.notes}
                onChange={e => setVendorFormData({ ...vendorFormData, notes: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddVendorModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FAF7F2] text-[#4B5563]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2E1065] text-white"
              >
                Save Vendor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {editingVendor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSaveEditVendor} className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E9E2D8] shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#2E1065]">
              Edit Vendor Record
            </h3>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Category</label>
              <input
                type="text"
                value={editingVendor.category}
                onChange={e => setEditingVendor({ ...editingVendor, category: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Estimated Cost (INR)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={editingVendor.estimated_cost === 0 ? '' : editingVendor.estimated_cost}
                onChange={e => setEditingVendor({ ...editingVendor, estimated_cost: e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0) })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Target Deadline</label>
              <input
                type="date"
                value={editingVendor.deadline}
                onChange={e => setEditingVendor({ ...editingVendor, deadline: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Status</label>
              <select
                value={editingVendor.status}
                onChange={e => setEditingVendor({ ...editingVendor, status: e.target.value as VendorStatus })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              >
                <option value="Not Started">Not Started</option>
                <option value="Contacted">Contacted</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Booked">Booked</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Selection Criteria</label>
              <input
                type="text"
                value={editingVendor.criteria}
                onChange={e => setEditingVendor({ ...editingVendor, criteria: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Questions to Ask</label>
              <input
                type="text"
                value={editingVendor.questions_to_ask}
                onChange={e => setEditingVendor({ ...editingVendor, questions_to_ask: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Contact Info</label>
              <input
                type="text"
                value={editingVendor.contact_info}
                onChange={e => setEditingVendor({ ...editingVendor, contact_info: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">Notes</label>
              <textarea
                rows={2}
                value={editingVendor.notes}
                onChange={e => setEditingVendor({ ...editingVendor, notes: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingVendor(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FAF7F2] text-[#4B5563]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2E1065] text-white"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
