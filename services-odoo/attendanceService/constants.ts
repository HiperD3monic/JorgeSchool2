/**
 * Constantes para el servicio de asistencias
 */

export const ATTENDANCE_MODEL = 'school.attendance';

/**
 * Campos a solicitar de Odoo para listados
 */
export const ATTENDANCE_FIELDS = [
    'id',
    'display_name',
    'attendance_type',
    'date',
    'state',
    'student_id',
    'employee_id',
    'section_id',
    'schedule_id',
    'subject_id',
    'year_id',
    'visitor_name',
    'visitor_id_number',
    'visitor_destination',
    'check_in_time',
    'check_out_time',
    'observations',
    'week_number',
    'month',
    'is_student',
    'is_employee',
];

/**
 * Campos mínimos para listas resumidas
 */
export const ATTENDANCE_SUMMARY_FIELDS = [
    'id',
    'display_name',
    'attendance_type',
    'date',
    'state',
    'student_id',
    'employee_id',
    'section_id',
    'check_in_time',
];

/**
 * Etiquetas de estados para UI
 */
export const ATTENDANCE_STATE_LABELS: Record<string, string> = {
    present: 'Presente',
    absent: 'Ausente',
    late: 'Tardanza',
    permission: 'Permiso',
};

/**
 * Etiquetas de tipos para UI
 */
export const ATTENDANCE_TYPE_LABELS: Record<string, string> = {
    student: 'Estudiante',
    employee: 'Personal',
    visitor: 'Visitante',
};

/**
 * Colores para estados (deben coincidir con Colors.ts)
 */
export const ATTENDANCE_STATE_COLORS = {
    present: '#16a34a',   // success
    absent: '#dc2626',    // error
    late: '#f59e0b',      // warning
    permission: '#3b82f6', // info/primary
} as const;

/**
 * Iconos para estados (Ionicons)
 */
export const ATTENDANCE_STATE_ICONS = {
    present: 'checkmark-circle',
    absent: 'close-circle',
    late: 'time',
    permission: 'document-text',
} as const;

/**
 * Items por página para paginación
 */
export const ATTENDANCE_PAGE_SIZE = 20;
