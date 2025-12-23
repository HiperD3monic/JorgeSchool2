/**
 * Tipos e interfaces para el servicio de horarios (school.schedule)
 * y bloques de tiempo (school.time.slot)
 */

// ============ TIPOS BASE ============

/**
 * Día de la semana (0=Lunes, 6=Domingo)
 */
export type DayOfWeek = '0' | '1' | '2' | '3' | '4' | '5' | '6';

/**
 * Nivel educativo
 */
export type EducationLevel = 'pre' | 'primary' | 'secundary';

/**
 * Tipo de bloque horario
 */
export type TimeSlotType = 'class' | 'break';

// ============ SCHEDULE (Horarios) ============

/**
 * Horario de clase normalizado
 */
export interface Schedule {
    id: number;
    displayName: string;

    // Sección (para secciones regulares)
    sectionId?: number;
    sectionName?: string;

    // Mención (para técnico medio)
    mentionSectionId?: number;
    mentionSectionName?: string;
    isMentionSchedule: boolean;

    // Materia (para Media General)
    subjectId?: number;
    subjectName?: string;

    // Profesor(es)
    professorId?: number;
    professorName?: string;
    professorIds?: number[];
    professorNames?: string;

    // Día y horario
    dayOfWeek: DayOfWeek;
    startTime: number; // Float: 8.5 = 8:30
    endTime: number;   // Float: 9.5 = 9:30
    startTimeStr: string; // "08:30"
    endTimeStr: string;   // "09:30"
    duration: number;  // En horas (float)

    // Información adicional
    classroom?: string;
    notes?: string;
    color?: number;

    // Bloque de tiempo asociado
    timeSlotId?: number;
    timeSlotName?: string;

    // Año escolar
    yearId?: number;
    yearName?: string;

    // Nivel educativo
    educationLevel?: EducationLevel;

    // Estado
    active: boolean;
}

/**
 * Horario semanal agrupado por día
 */
export interface WeeklySchedule {
    scheduleType: 'subject' | 'teacher';
    educationLevel: EducationLevel;
    sectionName: string;
    schedules: {
        '0': ScheduleEntry[]; // Lunes
        '1': ScheduleEntry[]; // Martes
        '2': ScheduleEntry[]; // Miércoles
        '3': ScheduleEntry[]; // Jueves
        '4': ScheduleEntry[]; // Viernes
        '5': ScheduleEntry[]; // Sábado
        '6': ScheduleEntry[]; // Domingo
    };
}

/**
 * Entrada de horario para vista semanal
 */
export interface ScheduleEntry {
    id: number;
    startTime: number;
    endTime: number;
    startTimeStr: string;
    endTimeStr: string;
    classroom: string;
    color: number;
    duration: number;

    // Para Media General
    subjectName?: string;
    professorName?: string;

    // Para Primaria/Preescolar
    professorsNames?: string;
    professorCount?: number;
}

// ============ TIME SLOT (Bloques Horarios) ============

/**
 * Bloque de tiempo normalizado
 */
export interface TimeSlot {
    id: number;
    name: string;
    educationLevel: EducationLevel;
    startTime: number;
    endTime: number;
    startTimeStr: string;
    endTimeStr: string;
    timeRange: string; // "08:00 - 08:45"
    sequence: number;
    isBreak: boolean;
    duration: number; // En horas
    durationMinutes: number;
    active: boolean;
}

// ============ FILTROS Y RESULTADOS ============

export interface ScheduleFilters {
    sectionId?: number;
    mentionSectionId?: number;
    dayOfWeek?: DayOfWeek;
    professorId?: number;
    subjectId?: number;
    yearId?: number;
    active?: boolean;
}

export interface TimeSlotFilters {
    educationLevel?: EducationLevel;
    isBreak?: boolean;
    active?: boolean;
}

export interface ScheduleServiceResult<T = any> {
    success: boolean;
    message?: string;
    data?: T;
}

// ============ CONFLICTOS ============

export interface ScheduleConflict {
    type: 'section' | 'professor' | 'student';
    scheduleId: number;
    conflictingScheduleId: number;
    conflictSection: string;
    conflictTime: string;
    message: string;
}

export interface ProfessorAvailability {
    available: boolean;
    conflictSchedule?: number;
    conflictSection?: string;
    conflictTime?: string;
}

// ============ DATOS PARA CREACIÓN ============

export type NewSchedule = {
    sectionId?: number;
    mentionSectionId?: number;
    subjectId?: number;
    professorIds?: number[];
    dayOfWeek: DayOfWeek;
    startTime: number;
    endTime: number;
    classroom?: string;
    notes?: string;
    timeSlotId?: number;
};

export type NewTimeSlot = {
    name: string;
    educationLevel: EducationLevel;
    startTime: number;
    endTime: number;
    sequence?: number;
    isBreak?: boolean;
};
