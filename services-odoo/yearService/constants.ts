/**
 * Constantes para el servicio de años escolares
 * Modelo Odoo: school.year
 */

export const MODELS = {
    YEAR: 'school.year',
    EVALUATION_TYPE: 'school.evaluation.type',
} as const;

export const YEAR_FIELDS = [
    'id',
    'name',
    'current',
    'state',
    'start_date_real',
    'end_date_real',
    'is_locked',
    'evalution_type_secundary',
    'evalution_type_primary',
    'evalution_type_pree',
    'total_students_count',
    'approved_students_count',
    'total_sections_count',
    'total_professors_count',
    // Campos por nivel
    'students_pre_count',
    'students_primary_count',
    'students_secundary_count',
    'approved_pre_count',
    'approved_primary_count',
    'approved_secundary_count',
    'sections_pre_count',
    'sections_primary_count',
    'sections_secundary_count',
    // Estadísticas de evaluaciones
    'evaluations_stats_json',
    'recent_evaluations_json',
];

export const EVALUATION_TYPE_FIELDS = [
    'id',
    'name',
    'type',
];

export const CACHE_KEYS = {
    ALL: 'school_years:all',
    CURRENT: 'school_years:current',
    BY_ID: (id: number) => `school_years:id:${id}`,
    EVALUATION_TYPES: 'evaluation_types:all',
} as const;

export const CACHE_TTL = {
    YEARS: 10 * 60 * 1000, // 10 minutos
    EVALUATION_TYPES: 30 * 60 * 1000, // 30 minutos
} as const;
