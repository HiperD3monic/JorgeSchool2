/**
 * Constantes para el servicio de horarios
 * Modelos Odoo: school.schedule, school.time.slot
 */

import { DayOfWeek, EducationLevel } from './types';

// ============ MODELOS ODOO ============

export const MODELS = {
    SCHEDULE: 'school.schedule',
    TIME_SLOT: 'school.time.slot',
} as const;

// ============ CAMPOS ============

export const SCHEDULE_FIELDS = [
    'id',
    'display_name',
    'section_id',
    'mention_section_id',
    'is_mention_schedule',
    'subject_id',
    'professor_id',
    'professor_ids',
    'day_of_week',
    'start_time',
    'end_time',
    'duration',
    'classroom',
    'notes',
    'color',
    'time_slot_id',
    'year_id',
    'education_level',
    'active',
];

export const TIME_SLOT_FIELDS = [
    'id',
    'name',
    'education_level',
    'start_time',
    'end_time',
    'sequence',
    'is_break',
    'duration',
    'duration_minutes',
    'time_range',
    'active',
];

// ============ ETIQUETAS ============

export const DAY_NAMES: Record<DayOfWeek, string> = {
    '0': 'Lunes',
    '1': 'Martes',
    '2': 'Miércoles',
    '3': 'Jueves',
    '4': 'Viernes',
    '5': 'Sábado',
    '6': 'Domingo',
};

export const DAY_NAMES_SHORT: Record<DayOfWeek, string> = {
    '0': 'Lun',
    '1': 'Mar',
    '2': 'Mié',
    '3': 'Jue',
    '4': 'Vie',
    '5': 'Sáb',
    '6': 'Dom',
};

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
    pre: 'Preescolar',
    primary: 'Primaria',
    secundary: 'Media General',
};

export const TIME_SLOT_TYPE_LABELS = {
    class: 'Clase',
    break: 'Recreo',
} as const;

// ============ COLORES ============

export const TIME_SLOT_COLORS = {
    class: '#3b82f6',    // primary blue
    break: '#10b981',    // success green
    lunch: '#f59e0b',    // warning orange
    activity: '#00c070', // secondary green
} as const;

export const EDUCATION_LEVEL_COLORS: Record<EducationLevel, string> = {
    pre: '#0891b2',       // cyan
    primary: '#16a34a',   // green
    secundary: '#1e40af', // blue
};

// ============ CACHÉ ============

export const CACHE_KEYS = {
    TIME_SLOTS: 'schedule:timeslots',
    TIME_SLOTS_BY_LEVEL: (level: string) => `schedule:timeslots:${level}`,
    WEEKLY_SCHEDULE: (sectionId: number) => `schedule:weekly:${sectionId}`,
} as const;

export const CACHE_TTL = {
    TIME_SLOTS: 30 * 60 * 1000, // 30 minutos
    SCHEDULES: 5 * 60 * 1000,   // 5 minutos
} as const;

// ============ DÍAS LABORALES ============

export const WORKING_DAYS: DayOfWeek[] = ['0', '1', '2', '3', '4'];
export const ALL_DAYS: DayOfWeek[] = ['0', '1', '2', '3', '4', '5', '6'];
