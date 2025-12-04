/**
 * Tipos e interfaces para el servicio de años escolares
 * Modelo Odoo: school.year
 */

export interface EvaluationType {
    id: number;
    name: string;
}

export interface SchoolYear {
    id: number;
    name: string;
    current: boolean;
    evalutionTypeSecundary: EvaluationType | null;
    evalutionTypePrimary: EvaluationType | null;
    evalutionTypePree: EvaluationType | null;
    // Campos computados (solo lectura)
    totalStudentsCount?: number;
    approvedStudentsCount?: number;
    totalSectionsCount?: number;
    totalProfessorsCount?: number;
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
};

export interface SchoolYearStats {
    total: number;
    current: number | null;
}
