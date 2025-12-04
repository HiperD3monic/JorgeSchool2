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
        evalutionTypeSecundary: normalizeEvaluationType(record.evalution_type_secundary),
        evalutionTypePrimary: normalizeEvaluationType(record.evalution_type_primary),
        evalutionTypePree: normalizeEvaluationType(record.evalution_type_pree),
        totalStudentsCount: record.total_students_count || 0,
        approvedStudentsCount: record.approved_students_count || 0,
        totalSectionsCount: record.total_sections_count || 0,
        totalProfessorsCount: record.total_professors_count || 0,
    };
};

/**
 * Normaliza un array de registros de años escolares
 */
export const normalizeSchoolYears = (records: any[]): SchoolYear[] => {
    return records.map(normalizeSchoolYear);
};
