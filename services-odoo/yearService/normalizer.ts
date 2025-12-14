/**
 * Normalizadores de datos para años escolares
 */

import { EvaluationType, SchoolYear } from './types';

/**
 * Normaliza una referencia Many2one de Odoo a EvaluationType
 */
const normalizeEvaluationType = (value: any): EvaluationType | null => {
    if (!value || value === false) return null;
    if (Array.isArray(value) && value.length >= 2) {
        return {
            id: value[0],
            name: value[1],
        };
    }
    return null;
};

/**
 * Normaliza un registro de año escolar desde Odoo
 */
export const normalizeSchoolYear = (record: any): SchoolYear => {
    return {
        id: record.id,
        name: record.name || '',
        current: record.current || false,
        state: record.state || 'draft',
        startDateReal: record.start_date_real || null,
        endDateReal: record.end_date_real || null,
        isLocked: record.is_locked || false,
        evalutionTypeSecundary: normalizeEvaluationType(record.evalution_type_secundary),
        evalutionTypePrimary: normalizeEvaluationType(record.evalution_type_primary),
        evalutionTypePree: normalizeEvaluationType(record.evalution_type_pree),
        // Campos generales
        totalStudentsCount: record.total_students_count || 0,
        approvedStudentsCount: record.approved_students_count || 0,
        totalSectionsCount: record.total_sections_count || 0,
        totalProfessorsCount: record.total_professors_count || 0,
        // Campos por nivel - Estudiantes
        studentsPreCount: record.students_pre_count || 0,
        studentsPrimaryCount: record.students_primary_count || 0,
        studentsSecundaryCount: record.students_secundary_count || 0,
        // Campos por nivel - Aprobados
        approvedPreCount: record.approved_pre_count || 0,
        approvedPrimaryCount: record.approved_primary_count || 0,
        approvedSecundaryCount: record.approved_secundary_count || 0,
        // Campos por nivel - Secciones
        sectionsPreCount: record.sections_pre_count || 0,
        sectionsPrimaryCount: record.sections_primary_count || 0,
        sectionsSecundaryCount: record.sections_secundary_count || 0,
        // Estadísticas de evaluaciones
        evaluationsStatsJson: record.evaluations_stats_json || null,
        recentEvaluationsJson: record.recent_evaluations_json || null,
    };
};

/**
 * Normaliza un array de registros de años escolares
 */
export const normalizeSchoolYears = (records: any[]): SchoolYear[] => {
    return records.map(normalizeSchoolYear);
};
