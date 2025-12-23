/**
 * Normalizadores de datos para horarios y bloques de tiempo
 * Transforma datos de Odoo al formato de la app
 */

import { floatToTimeString, formatTimeRange } from './helpers';
import { DayOfWeek, EducationLevel, Schedule, ScheduleEntry, TimeSlot, WeeklySchedule } from './types';

/**
 * Normaliza un registro de horario desde Odoo
 */
export const normalizeSchedule = (record: any): Schedule => {
    // Extraer section_id
    let sectionId: number | undefined;
    let sectionName: string | undefined;
    if (Array.isArray(record.section_id) && record.section_id.length >= 2) {
        sectionId = record.section_id[0];
        sectionName = record.section_id[1];
    }

    // Extraer mention_section_id
    let mentionSectionId: number | undefined;
    let mentionSectionName: string | undefined;
    if (Array.isArray(record.mention_section_id) && record.mention_section_id.length >= 2) {
        mentionSectionId = record.mention_section_id[0];
        mentionSectionName = record.mention_section_id[1];
    }

    // Extraer subject_id
    let subjectId: number | undefined;
    let subjectName: string | undefined;
    if (Array.isArray(record.subject_id) && record.subject_id.length >= 2) {
        subjectId = record.subject_id[0];
        subjectName = record.subject_id[1];
    }

    // Extraer professor_id (para Media General)
    let professorId: number | undefined;
    let professorName: string | undefined;
    if (Array.isArray(record.professor_id) && record.professor_id.length >= 2) {
        professorId = record.professor_id[0];
        professorName = record.professor_id[1];
    }

    // Extraer time_slot_id
    let timeSlotId: number | undefined;
    let timeSlotName: string | undefined;
    if (Array.isArray(record.time_slot_id) && record.time_slot_id.length >= 2) {
        timeSlotId = record.time_slot_id[0];
        timeSlotName = record.time_slot_id[1];
    }

    // Extraer year_id
    let yearId: number | undefined;
    let yearName: string | undefined;
    if (Array.isArray(record.year_id) && record.year_id.length >= 2) {
        yearId = record.year_id[0];
        yearName = record.year_id[1];
    }

    const startTime = record.start_time || 0;
    const endTime = record.end_time || 0;

    return {
        id: record.id,
        displayName: record.display_name || '',
        sectionId,
        sectionName,
        mentionSectionId,
        mentionSectionName,
        isMentionSchedule: record.is_mention_schedule || false,
        subjectId,
        subjectName,
        professorId,
        professorName,
        professorIds: record.professor_ids || [],
        professorNames: '', // Se calcula al cargar si es necesario
        dayOfWeek: (record.day_of_week || '0') as DayOfWeek,
        startTime,
        endTime,
        startTimeStr: floatToTimeString(startTime),
        endTimeStr: floatToTimeString(endTime),
        duration: record.duration || endTime - startTime,
        classroom: record.classroom || undefined,
        notes: record.notes || undefined,
        color: record.color || 0,
        timeSlotId,
        timeSlotName,
        yearId,
        yearName,
        educationLevel: record.education_level as EducationLevel | undefined,
        active: record.active !== false,
    };
};

/**
 * Normaliza múltiples registros de horarios
 */
export const normalizeSchedules = (records: any[]): Schedule[] => {
    if (!Array.isArray(records)) return [];
    return records.map(normalizeSchedule);
};

/**
 * Normaliza un bloque de tiempo desde Odoo
 */
export const normalizeTimeSlot = (record: any): TimeSlot => {
    const startTime = record.start_time || 0;
    const endTime = record.end_time || 0;

    return {
        id: record.id,
        name: record.name || '',
        educationLevel: (record.education_level || 'primary') as EducationLevel,
        startTime,
        endTime,
        startTimeStr: floatToTimeString(startTime),
        endTimeStr: floatToTimeString(endTime),
        timeRange: record.time_range || formatTimeRange(startTime, endTime),
        sequence: record.sequence || 0,
        isBreak: record.is_break || false,
        duration: record.duration || endTime - startTime,
        durationMinutes: record.duration_minutes || Math.round((endTime - startTime) * 60),
        active: record.active !== false,
    };
};

/**
 * Normaliza múltiples bloques de tiempo
 */
export const normalizeTimeSlots = (records: any[]): TimeSlot[] => {
    if (!Array.isArray(records)) return [];
    return records.map(normalizeTimeSlot);
};

/**
 * Normaliza la respuesta de get_weekly_schedule_enhanced
 */
export const normalizeWeeklySchedule = (data: any): WeeklySchedule => {
    const normalizedSchedules: Record<DayOfWeek, ScheduleEntry[]> = {
        '0': [],
        '1': [],
        '2': [],
        '3': [],
        '4': [],
        '5': [],
        '6': [],
    };

    if (data.schedules) {
        for (const day of Object.keys(data.schedules) as DayOfWeek[]) {
            const daySchedules = data.schedules[day];
            if (Array.isArray(daySchedules)) {
                normalizedSchedules[day] = daySchedules.map((entry: any) => ({
                    id: entry.id,
                    startTime: entry.start_time,
                    endTime: entry.end_time,
                    startTimeStr: entry.start_time_str || floatToTimeString(entry.start_time),
                    endTimeStr: entry.end_time_str || floatToTimeString(entry.end_time),
                    classroom: entry.classroom || '',
                    color: entry.color || 0,
                    duration: entry.duration || 0,
                    subjectName: entry.subject_name,
                    professorName: entry.professor_name,
                    professorsNames: entry.professors_names,
                    professorCount: entry.professor_count,
                }));
            }
        }
    }

    return {
        scheduleType: data.schedule_type || 'teacher',
        educationLevel: (data.education_level || 'primary') as EducationLevel,
        sectionName: data.section_name || '',
        schedules: normalizedSchedules,
    };
};
