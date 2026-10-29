export type EventType = 
  | 'Wedding'
  | 'Birthday'
  | 'Anniversary'
  | 'College Event'
  | 'Corporate'
  | 'Festival'
  | 'Other';

export type PlanningStyle = 'Budget-Friendly' | 'Balanced' | 'Premium' | 'Luxury';

export type VenuePreference = 'Indoor' | 'Outdoor' | 'Terrace' | 'Banquet' | 'Lakeside' | 'Flexible';

export type FoodPreference = 'Vegetarian' | 'Non-Vegetarian' | 'Mixed' | 'Jain' | 'Vegan';

export interface OverviewConcept {
  concept: string;
  theme: string;
  atmosphere: string;
  target_audience: string;
  personalized_description: string;
  key_considerations: string[];
}

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface MenuSuggestions {
  welcome_drinks: string[];
  appetizers: string[];
  mains: string[];
  desserts: string[];
}

export interface CreativeBlueprint {
  theme_ideas: string[];
  color_palette: ColorSwatch[];
  decorations: string[];
  menu_suggestions: MenuSuggestions;
  entertainment_ideas: string[];
  invitation_draft: string;
  guest_engagement: string[];
}

export interface RiskManagement {
  weather_contingency: string;
  backup_venue: string;
  emergency_supplies: string;
  schedule_delays: string;
  budget_overruns: string;
}

export interface BudgetItem {
  id: string;
  event_id: string;
  category: string;
  allocated_amount: number;
  actual_spent: number;
  notes?: string;
  is_contingency?: boolean;
}

export interface BudgetSummary {
  total_budget: number;
  total_budget_formatted: string;
  total_planned: number;
  total_planned_formatted: string;
  contingency: number;
  contingency_formatted: string;
  total_allocated: number;
  total_allocated_formatted: string;
  remaining_budget: number;
  remaining_budget_formatted: string;
  is_over_budget: boolean;
  overage_amount: number;
  overage_formatted: string;
  utilization_percentage: number;
  items: (BudgetItem & {
    allocated_formatted: string;
    actual_formatted: string;
    percentage: number;
  })[];
}

export type TimelinePhase = 
  | 'Weeks Before'
  | 'Final Week'
  | 'Day Before'
  | 'Event Day'
  | 'Post-Event';

export type PriorityLevel = 'Urgent' | 'High' | 'Medium' | 'Low';

export interface TimelineTask {
  id: string;
  event_id: string;
  title: string;
  description: string;
  phase: TimelinePhase;
  due_date: string;
  priority: PriorityLevel;
  is_completed: boolean;
  order_index?: number;
}

export type VendorStatus = 'Not Started' | 'Contacted' | 'Shortlisted' | 'Booked' | 'Completed';

export interface Vendor {
  id: string;
  event_id: string;
  category: string;
  criteria: string;
  questions_to_ask: string;
  estimated_cost: number;
  status: VendorStatus;
  notes: string;
  contact_info: string;
  deadline: string;
}

export interface CelebrationEvent {
  id: string;
  name: string;
  event_type: EventType | string;
  event_date: string;
  location: string;
  guests: number;
  total_budget: number;
  theme: string;
  venue_preference: VenuePreference | string;
  food_preference: FoodPreference | string;
  duration?: string;
  special_requirements?: string;
  planning_style: PlanningStyle | string;
  overview?: OverviewConcept;
  creative?: CreativeBlueprint;
  risk?: RiskManagement;
  status?: 'Planning' | 'In Progress' | 'Confirmed' | 'Completed';
  created_at: string;
  updated_at?: string;
}


export interface DashboardMetrics {
  total_events: number;
  upcoming_events: number;
  total_budget_sum: number;
  completed_tasks: number;
  total_tasks: number;
}

export interface GeneratedPlanResult {
  is_ai_generated: boolean;
  mode?: string;
  notice?: string;
  warning?: string;
  model?: string;
  overview: OverviewConcept;
  budget_breakdown: {
    category: string;
    allocated_amount: number;
    notes: string;
    is_contingency: boolean;
  }[];
  preparation_timeline: {
    title: string;
    description: string;
    phase: TimelinePhase;
    offset_days?: number;
    due_date?: string;
    priority: PriorityLevel;
  }[];
  vendor_checklist: {
    category: string;
    criteria: string;
    questions_to_ask: string;
    estimated_cost: number;
    deadline?: string;
    deadline_offset_days?: number;
  }[];
  creative_recommendations: CreativeBlueprint;
  risk_management: RiskManagement;
}
