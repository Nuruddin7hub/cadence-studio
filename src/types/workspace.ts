export type ThemeMode = 'dark' | 'light';

export type WorkspaceTab =
  | 'planner'
  | 'tasks'
  | 'focus'
  | 'analytics'
  | 'overview';

export type CalendarMode = 'day' | 'three_day' | 'workweek' | 'week' | 'month' | 'agenda';

export type TaskViewMode = 'list' | 'kanban' | 'matrix';

export type EventCategory = 'deep' | 'meeting' | 'personal' | 'health' | 'deadline';

export type CalendarLayerId = 'work' | 'team' | 'personal' | 'wellness';

export type TaskPriority = 'p1' | 'p2' | 'p3' | 'p4';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'done';

export type EisenhowerQuadrant = 'do' | 'schedule' | 'delegate' | 'eliminate';

export type RecurrenceRule = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';

export type TaskListId = 'inbox' | 'today' | 'upcoming' | 'overdue' | 'completed' | 'work' | 'design' | 'personal';

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startMinutes: number; // 0..1440
  durationMinutes: number; // 15..720
  allDay?: boolean;
  category: EventCategory;
  calendarId: CalendarLayerId;
  location?: string;
  videoLink?: string;
  notes?: string;
  recurrence: RecurrenceRule;
  linkedTaskId?: string;
  reminderMinutes?: number; // 5, 10, 15, 30
  completed?: boolean;
  attendees?: string[];
}

export interface TodoTask {
  id: string;
  title: string;
  notes?: string;
  listId: 'inbox' | 'work' | 'design' | 'personal';
  priority: TaskPriority;
  status: TaskStatus;
  quadrant: EisenhowerQuadrant;
  dueDate?: string; // YYYY-MM-DD
  scheduledDate?: string; // YYYY-MM-DD
  scheduledStartMinutes?: number;
  estimatedMinutes: number;
  tags: string[];
  subtasks: Subtask[];
  recurrence: RecurrenceRule;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  order: number;
}

export interface HabitItem {
  id: string;
  name: string;
  category: 'focus' | 'health' | 'craft' | 'mindset';
  targetPerWeek: number;
  accent: string;
  history: Record<string, boolean>; // YYYY-MM-DD -> completed
}

export interface DailyNote {
  date: string; // YYYY-MM-DD
  content: string;
  mood: number; // 1..5
  energy: number; // 1..5
  extractedLines: string[];
}

export interface FocusSessionRecord {
  id: string;
  taskId?: string;
  taskTitle: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  mode: 'focus' | 'short_break' | 'long_break';
  completedAt: string;
}

export interface AvailabilitySlot {
  id: string;
  date: string;
  startMinutes: number;
  durationMinutes: number;
}

export interface ToastItem {
  id: string;
  message: string;
  detail?: string;
  canUndo?: boolean;
  tone?: 'default' | 'success' | 'warning';
}

export interface WorkspacePreferences {
  theme: ThemeMode;
  secondaryTimezone: 'UTC' | 'America/New_York' | 'Europe/London' | 'Asia/Tokyo';
  weekStartsOn: 0 | 1; // 0 = Sun, 1 = Mon
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  soundEnabled: boolean;
  showSecondaryTz: boolean;
  workingHourStart: number;
  workingHourEnd: number;
}

export interface WorkspaceSnapshot {
  events: CalendarEvent[];
  tasks: TodoTask[];
  habits: HabitItem[];
  notes: Record<string, DailyNote>;
  focusHistory: FocusSessionRecord[];
  enabledLayers: Record<CalendarLayerId, boolean>;
  preferences: WorkspacePreferences;
}
