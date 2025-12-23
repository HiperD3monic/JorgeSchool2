/**
 * Tipos para el módulo de Planificación
 * Re-exporta tipos del servicio de horarios
 */

// Re-exportar tipos del servicio
export type {
    DayOfWeek,
    EducationLevel, NewSchedule,
    NewTimeSlot, ProfessorAvailability, Schedule, ScheduleConflict, ScheduleEntry, ScheduleFilters, ScheduleServiceResult, TimeSlot, TimeSlotFilters, TimeSlotType, WeeklySchedule
} from '../services-odoo/scheduleService/types';

// Re-exportar constantes útiles
export {
    ALL_DAYS, DAY_NAMES,
    DAY_NAMES_SHORT, EDUCATION_LEVEL_COLORS, EDUCATION_LEVEL_LABELS, TIME_SLOT_COLORS, TIME_SLOT_TYPE_LABELS, WORKING_DAYS
} from '../services-odoo/scheduleService/constants';

// ============ TIPOS ADICIONALES PARA UI ============

/**
 * Tab activo en la vista de planificación
 */
export type PlanningTab = 'calendar' | 'timetables' | 'timeSlots';

/**
 * Vista de calendario
 */
export type CalendarView = 'month' | 'week' | 'day';

/**
 * Configuración de tab
 */
export interface PlanningTabConfig {
    id: PlanningTab;
    label: string;
    icon: string;
}

/**
 * Día del calendario con indicadores
 */
export interface CalendarDay {
    date: Date;
    dayNumber: number;
    isToday: boolean;
    isCurrentMonth: boolean;
    hasEvents: boolean;
    eventCount: number;
}

/**
 * Semana del calendario
 */
export interface CalendarWeek {
    weekNumber: number;
    days: CalendarDay[];
}

/**
 * Datos del calendario mensual
 */
export interface MonthCalendarData {
    year: number;
    month: number;
    monthName: string;
    weeks: CalendarWeek[];
}
