/**
 * Operaciones CRUD para horarios y bloques de tiempo
 */

import * as odooApi from '../apiService';
import { cacheManager } from '../cache/cacheManager';
import { MODELS, SCHEDULE_FIELDS, TIME_SLOT_FIELDS } from './constants';
import { normalizeSchedule, normalizeTimeSlot } from './normalizer';
import { NewSchedule, NewTimeSlot, ProfessorAvailability, Schedule, ScheduleServiceResult, TimeSlot } from './types';

/**
 * Invalida caché de horarios
 */
const invalidateScheduleCache = (): void => {
    cacheManager.invalidatePattern('schedule');
    if (__DEV__) {
        console.log('🗑️ Caché de horarios invalidado');
    }
};

// ============ SCHEDULE CRUD ============

/**
 * Crea un nuevo horario
 */
export const createSchedule = async (
    data: NewSchedule
): Promise<ScheduleServiceResult<Schedule>> => {
    try {
        if (__DEV__) {
            console.time('⏱️ createSchedule');
        }

        const values: any = {
            day_of_week: data.dayOfWeek,
            start_time: data.startTime,
            end_time: data.endTime,
        };

        if (data.sectionId) values.section_id = data.sectionId;
        if (data.mentionSectionId) values.mention_section_id = data.mentionSectionId;
        if (data.subjectId) values.subject_id = data.subjectId;
        if (data.professorIds?.length) values.professor_ids = [[6, 0, data.professorIds]];
        if (data.classroom) values.classroom = data.classroom;
        if (data.notes) values.notes = data.notes;
        if (data.timeSlotId) values.time_slot_id = data.timeSlotId;

        const createResult = await odooApi.create(MODELS.SCHEDULE, values);

        if (!createResult.success) {
            if (createResult.error?.isSessionExpired) {
                return { success: false, message: 'Tu sesión ha expirado' };
            }
            return {
                success: false,
                message: odooApi.extractOdooErrorMessage(createResult.error),
            };
        }

        // Leer el horario creado
        const newId = createResult.data;
        const readResult = await odooApi.read(MODELS.SCHEDULE, [newId!], SCHEDULE_FIELDS);

        if (!readResult.success || !readResult.data?.length) {
            return { success: false, message: 'Error al leer el horario creado' };
        }

        const schedule = normalizeSchedule(readResult.data[0]);

        // Invalidar caché
        invalidateScheduleCache();

        if (__DEV__) {
            console.timeEnd('⏱️ createSchedule');
            console.log('✅ Horario creado:', schedule.id);
        }

        return {
            success: true,
            data: schedule,
            message: 'Horario creado exitosamente',
        };
    } catch (error: any) {
        if (__DEV__) {
            console.error('❌ Error en createSchedule:', error);
        }
        return {
            success: false,
            message: odooApi.extractOdooErrorMessage(error),
        };
    }
};

/**
 * Actualiza un horario existente
 */
export const updateSchedule = async (
    id: number,
    data: Partial<NewSchedule>
): Promise<ScheduleServiceResult<Schedule>> => {
    try {
        if (__DEV__) {
            console.time(`⏱️ updateSchedule:${id}`);
        }

        const values: any = {};

        if (data.dayOfWeek !== undefined) values.day_of_week = data.dayOfWeek;
        if (data.startTime !== undefined) values.start_time = data.startTime;
        if (data.endTime !== undefined) values.end_time = data.endTime;
        if (data.sectionId !== undefined) values.section_id = data.sectionId;
        if (data.mentionSectionId !== undefined) values.mention_section_id = data.mentionSectionId;
        if (data.subjectId !== undefined) values.subject_id = data.subjectId;
        if (data.professorIds !== undefined) values.professor_ids = [[6, 0, data.professorIds]];
        if (data.classroom !== undefined) values.classroom = data.classroom;
        if (data.notes !== undefined) values.notes = data.notes;
        if (data.timeSlotId !== undefined) values.time_slot_id = data.timeSlotId;

        const updateResult = await odooApi.update(MODELS.SCHEDULE, [id], values);

        if (!updateResult.success) {
            if (updateResult.error?.isSessionExpired) {
                return { success: false, message: 'Tu sesión ha expirado' };
            }
            return {
                success: false,
                message: odooApi.extractOdooErrorMessage(updateResult.error),
            };
        }

        // Leer datos actualizados
        const readResult = await odooApi.read(MODELS.SCHEDULE, [id], SCHEDULE_FIELDS);

        if (!readResult.success || !readResult.data?.length) {
            return { success: false, message: 'Error al leer el horario actualizado' };
        }

        const schedule = normalizeSchedule(readResult.data[0]);

        // Invalidar caché
        invalidateScheduleCache();

        if (__DEV__) {
            console.timeEnd(`⏱️ updateSchedule:${id}`);
            console.log('✅ Horario actualizado');
        }

        return {
            success: true,
            data: schedule,
            message: 'Horario actualizado exitosamente',
        };
    } catch (error: any) {
        if (__DEV__) {
            console.error('❌ Error en updateSchedule:', error);
        }
        return {
            success: false,
            message: odooApi.extractOdooErrorMessage(error),
        };
    }
};

/**
 * Elimina un horario
 */
export const deleteSchedule = async (id: number): Promise<ScheduleServiceResult> => {
    try {
        if (__DEV__) {
            console.time(`⏱️ deleteSchedule:${id}`);
        }

        const deleteResult = await odooApi.deleteRecords(MODELS.SCHEDULE, [id]);

        if (!deleteResult.success) {
            if (deleteResult.error?.isSessionExpired) {
                return { success: false, message: 'Tu sesión ha expirado' };
            }
            return {
                success: false,
                message: odooApi.extractOdooErrorMessage(deleteResult.error),
            };
        }

        // Invalidar caché
        invalidateScheduleCache();

        if (__DEV__) {
            console.timeEnd(`⏱️ deleteSchedule:${id}`);
            console.log('✅ Horario eliminado');
        }

        return {
            success: true,
            message: 'Horario eliminado exitosamente',
        };
    } catch (error: any) {
        if (__DEV__) {
            console.error('❌ Error en deleteSchedule:', error);
        }
        return {
            success: false,
            message: odooApi.extractOdooErrorMessage(error),
        };
    }
};

/**
 * Valida disponibilidad de un profesor
 */
export const validateProfessorAvailability = async (
    professorId: number,
    dayOfWeek: string,
    startTime: number,
    endTime: number,
    excludeScheduleId?: number
): Promise<ScheduleServiceResult<ProfessorAvailability>> => {
    try {
        const result = await odooApi.callMethod(
            MODELS.SCHEDULE,
            'validate_professor_availability',
            [professorId, dayOfWeek, startTime, endTime, excludeScheduleId]
        );

        if (!result.success) {
            return {
                success: false,
                message: odooApi.extractOdooErrorMessage(result.error),
            };
        }

        return {
            success: true,
            data: {
                available: result.data?.available ?? true,
                conflictSchedule: result.data?.conflict_schedule,
                conflictSection: result.data?.conflict_section,
                conflictTime: result.data?.conflict_time,
            },
        };
    } catch (error: any) {
        return {
            success: false,
            message: odooApi.extractOdooErrorMessage(error),
        };
    }
};

// ============ TIME SLOT CRUD ============

/**
 * Crea un nuevo bloque de tiempo
 */
export const createTimeSlot = async (
    data: NewTimeSlot
): Promise<ScheduleServiceResult<TimeSlot>> => {
    try {
        if (__DEV__) {
            console.time('⏱️ createTimeSlot');
        }

        const values: any = {
            name: data.name,
            education_level: data.educationLevel,
            start_time: data.startTime,
            end_time: data.endTime,
        };

        if (data.sequence !== undefined) values.sequence = data.sequence;
        if (data.isBreak !== undefined) values.is_break = data.isBreak;

        const createResult = await odooApi.create(MODELS.TIME_SLOT, values);

        if (!createResult.success) {
            if (createResult.error?.isSessionExpired) {
                return { success: false, message: 'Tu sesión ha expirado' };
            }
            return {
                success: false,
                message: odooApi.extractOdooErrorMessage(createResult.error),
            };
        }

        // Leer el bloque creado
        const newId = createResult.data;
        const readResult = await odooApi.read(MODELS.TIME_SLOT, [newId!], TIME_SLOT_FIELDS);

        if (!readResult.success || !readResult.data?.length) {
            return { success: false, message: 'Error al leer el bloque de tiempo creado' };
        }

        const timeSlot = normalizeTimeSlot(readResult.data[0]);

        // Invalidar caché
        invalidateScheduleCache();

        if (__DEV__) {
            console.timeEnd('⏱️ createTimeSlot');
            console.log('✅ Bloque de tiempo creado:', timeSlot.id);
        }

        return {
            success: true,
            data: timeSlot,
            message: 'Bloque de tiempo creado exitosamente',
        };
    } catch (error: any) {
        if (__DEV__) {
            console.error('❌ Error en createTimeSlot:', error);
        }
        return {
            success: false,
            message: odooApi.extractOdooErrorMessage(error),
        };
    }
};

/**
 * Actualiza un bloque de tiempo existente
 */
export const updateTimeSlot = async (
    id: number,
    data: Partial<NewTimeSlot>
): Promise<ScheduleServiceResult<TimeSlot>> => {
    try {
        if (__DEV__) {
            console.time(`⏱️ updateTimeSlot:${id}`);
        }

        const values: any = {};

        if (data.name !== undefined) values.name = data.name;
        if (data.educationLevel !== undefined) values.education_level = data.educationLevel;
        if (data.startTime !== undefined) values.start_time = data.startTime;
        if (data.endTime !== undefined) values.end_time = data.endTime;
        if (data.sequence !== undefined) values.sequence = data.sequence;
        if (data.isBreak !== undefined) values.is_break = data.isBreak;

        const updateResult = await odooApi.update(MODELS.TIME_SLOT, [id], values);

        if (!updateResult.success) {
            if (updateResult.error?.isSessionExpired) {
                return { success: false, message: 'Tu sesión ha expirado' };
            }
            return {
                success: false,
                message: odooApi.extractOdooErrorMessage(updateResult.error),
            };
        }

        // Leer datos actualizados
        const readResult = await odooApi.read(MODELS.TIME_SLOT, [id], TIME_SLOT_FIELDS);

        if (!readResult.success || !readResult.data?.length) {
            return { success: false, message: 'Error al leer el bloque de tiempo actualizado' };
        }

        const timeSlot = normalizeTimeSlot(readResult.data[0]);

        // Invalidar caché
        invalidateScheduleCache();

        if (__DEV__) {
            console.timeEnd(`⏱️ updateTimeSlot:${id}`);
            console.log('✅ Bloque de tiempo actualizado');
        }

        return {
            success: true,
            data: timeSlot,
            message: 'Bloque de tiempo actualizado exitosamente',
        };
    } catch (error: any) {
        if (__DEV__) {
            console.error('❌ Error en updateTimeSlot:', error);
        }
        return {
            success: false,
            message: odooApi.extractOdooErrorMessage(error),
        };
    }
};

/**
 * Elimina un bloque de tiempo
 */
export const deleteTimeSlot = async (id: number): Promise<ScheduleServiceResult> => {
    try {
        if (__DEV__) {
            console.time(`⏱️ deleteTimeSlot:${id}`);
        }

        const deleteResult = await odooApi.deleteRecords(MODELS.TIME_SLOT, [id]);

        if (!deleteResult.success) {
            if (deleteResult.error?.isSessionExpired) {
                return { success: false, message: 'Tu sesión ha expirado' };
            }
            return {
                success: false,
                message: odooApi.extractOdooErrorMessage(deleteResult.error),
            };
        }

        // Invalidar caché
        invalidateScheduleCache();

        if (__DEV__) {
            console.timeEnd(`⏱️ deleteTimeSlot:${id}`);
            console.log('✅ Bloque de tiempo eliminado');
        }

        return {
            success: true,
            message: 'Bloque de tiempo eliminado exitosamente',
        };
    } catch (error: any) {
        if (__DEV__) {
            console.error('❌ Error en deleteTimeSlot:', error);
        }
        return {
            success: false,
            message: odooApi.extractOdooErrorMessage(error),
        };
    }
};
