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
    'evalution_type_secundary',
    'evalution_type_primary',
    'evalution_type_pree',
    'total_students_count',
    'approved_students_count',
    'total_sections_count',
    'total_professors_count',
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
