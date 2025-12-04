/**
 * Funciones auxiliares para años escolares
 */

import { SchoolYear } from './types';

/**
 * Formatea el nombre del año escolar para visualización
 */
export const formatYearName = (name: string | null | undefined): string => {
    if (!name) return 'Sin nombre';
    return name;
};

/**
 * Verifica si un año es el actual
 */
export const isCurrentYear = (year: SchoolYear): boolean => {
    return year.current === true;
};

/**
 * Formatea las estadísticas del año para mostrar
 */
export const formatYearStats = (year: SchoolYear): string => {
    const students = year.totalStudentsCount || 0;
    const sections = year.totalSectionsCount || 0;
    const professors = year.totalProfessorsCount || 0;

    return `${students} estudiantes • ${sections} secciones • ${professors} profesores`;
};

/**
 * Obtiene el porcentaje de aprobación
 */
export const getApprovalRate = (year: SchoolYear): number => {
    const total = year.totalStudentsCount || 0;
    const approved = year.approvedStudentsCount || 0;

    if (total === 0) return 0;
    return Math.round((approved / total) * 100);
};
