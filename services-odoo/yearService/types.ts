/**
 * Tipos e interfaces para el servicio de años escolares
 * Modelo Odoo: school.year
 */

export interface EvaluationType {
    id: number;
    name: string;
}

// Estados del año escolar
export type SchoolYearState = 'draft' | 'active' | 'finished';

export interface SchoolYear {
    id: number;
    name: string;
    current: boolean;
    state: SchoolYearState;
    startDateReal?: string | null;
    endDateReal?: string | null;
    isLocked?: boolean;
    evalutionTypeSecundary: EvaluationType | null;
    evalutionTypePrimary: EvaluationType | null;
    evalutionTypePree: EvaluationType | null;
    // Campos computados generales
    totalStudentsCount?: number;
    approvedStudentsCount?: number;
    totalSectionsCount?: number;
    totalProfessorsCount?: number;
    // Campos por nivel - Estudiantes
    studentsPreCount?: number;
    studentsPrimaryCount?: number;
    studentsSecundaryCount?: number;
    // Campos por nivel - Aprobados
    approvedPreCount?: number;
    approvedPrimaryCount?: number;
    approvedSecundaryCount?: number;
    // Campos por nivel - Secciones
    sectionsPreCount?: number;
    sectionsPrimaryCount?: number;
    sectionsSecundaryCount?: number;
    // Estadísticas de evaluaciones
    evaluationsStatsJson?: EvaluationsStats;
    recentEvaluationsJson?: RecentEvaluations;
}

export interface EvaluationsStats {
    total: number;
    qualified: number;
    partial: number;
    draft: number;
    by_type: {
        secundary: number;
        primary: number;
        pre: number;
    };
}

export interface RecentEvaluation {
    id: number;
    name: string;
    date: string;
    professor: string;
    section: string;
    subject: string;
    state: 'draft' | 'partial' | 'all';
    average: number;
}

export interface RecentEvaluations {
    evaluations: RecentEvaluation[];
}

export interface SchoolYearServiceResult<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    schoolYear?: SchoolYear;
}

export type NewSchoolYear = {
    name: string;
    evalutionTypeSecundary: number;
    evalutionTypePrimary: number;
    evalutionTypePree: number;
    current?: boolean;
};

export interface SchoolYearStats {
    total: number;
    current: number | null;
}

