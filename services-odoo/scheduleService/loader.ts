/**
 * Funciones de carga de datos para horarios y bloques de tiempo
 */

import * as odooApi from '../apiService';
import { cacheManager } from '../cache/cacheManager';
import { CACHE_KEYS, CACHE_TTL, MODELS, SCHEDULE_FIELDS, TIME_SLOT_FIELDS } from './constants';
import { normalizeSchedules, normalizeTimeSlots, normalizeWeeklySchedule } from './normalizer';
import { EducationLevel, Schedule, ScheduleFilters, ScheduleServiceResult, TimeSlot, TimeSlotFilters, WeeklySchedule } from './types';

/**
 * Carga todos los bloques de tiempo de un nivel educativo
 */
export const loadTimeSlots = async (
    filters?: TimeSlotFilters,
    forceRefresh: boolean = false
): Promise<ScheduleServiceResult<TimeSlot[]>> => {
    try {
        const cacheKey = filters?.educationLevel
            ? CACHE_KEYS.TIME_SLOTS_BY_LEVEL(filters.educationLevel)
            : CACHE_KEYS.TIME_SLOTS;

        // Intentar cache
        if (!forceRefresh) {
            const cached = cacheManager.get<TimeSlot[]>(cacheKey);
            if (cached) {
                if (__DEV__) {
                    console.log('📦 TimeSlots desde caché');
                }
                return { success: true, data: cached };
            }
        }

        if (__DEV__) {
            console.time('⏱️ loadTimeSlots');
        }

        // Construir dominio
        const domain: any[] = [];
        if (filters?.educationLevel) {
            domain.push(['education_level', '=', filters.educationLevel]);
        }
        if (filters?.isBreak !== undefined) {
            domain.push(['is_break', '=', filters.isBreak]);
        }
        if (filters?.active !== undefined) {
            domain.push(['active', '=', filters.active]);
        } else {
            domain.push(['active', '=', true]);
        }

        const result = await odooApi.searchRead(
            MODELS.TIME_SLOT,
            domain,
            TIME_SLOT_FIELDS,
            100,
            0,
            'sequence, start_time'
        );

        if (!result.success) {
            if (result.error?.isSessionExpired) {
                return { success: false, message: 'Tu sesión ha expirado' };
            }
            return {
                success: false,
                message: odooApi.extractOdooErrorMessage(result.error),
            };
        }

        const timeSlots = normalizeTimeSlots(result.data || []);

        // Guardar en caché
        cacheManager.set(cacheKey, timeSlots, CACHE_TTL.TIME_SLOTS);

        if (__DEV__) {
            console.timeEnd('⏱️ loadTimeSlots');
            console.log(`✅ ${timeSlots.length} bloques de tiempo cargados`);
        }

        return { success: true, data: timeSlots };
    } catch (error: any) {
        if (__DEV__) {
            console.error('❌ Error en loadTimeSlots:', error);
        }
        return {
            success: false,
            message: odooApi.extractOdooErrorMessage(error),
        };
    }
};

/**
 * Carga bloques de tiempo usando el método optimizado de Odoo
 */
export const loadTimeSlotsForLevel = async (
    educationLevel: EducationLevel
): Promise<ScheduleServiceResult<TimeSlot[]>> => {
    try {
        const cacheKey = CACHE_KEYS.TIME_SLOTS_BY_LEVEL(educationLevel);

        // Intentar cache
        const cached = cacheManager.get<TimeSlot[]>(cacheKey);
        if (cached) {
            if (__DEV__) {
                console.log(`📦 TimeSlots ${educationLevel} desde caché`);
            }
            return { success: true, data: cached };
        }

        if (__DEV__) {
            console.time(`⏱️ loadTimeSlotsForLevel:${educationLevel}`);
        }

        // Usar método optimizado de Odoo
        const result = await odooApi.callMethod(
            MODELS.TIME_SLOT,
            'get_time_slots_for_level',
            [educationLevel]
        );

        if (!result.success) {
            // Fallback a searchRead
            return loadTimeSlots({ educationLevel, active: true });
        }

        // Los datos ya vienen formateados desde Odoo
        const timeSlots: TimeSlot[] = (result.data || []).map((slot: any) => ({
            id: slot.id,
            name: slot.name,
            educationLevel,
            startTime: slot.start_time,
            endTime: slot.end_time,
            startTimeStr: slot.start_time_str,
            endTimeStr: slot.end_time_str,
            timeRange: slot.time_range,
            sequence: slot.sequence || 0,
            isBreak: slot.is_break || false,
            duration: slot.duration,
            durationMinutes: slot.duration_minutes,
            active: true,
        }));

        // Guardar en caché
        cacheManager.set(cacheKey, timeSlots, CACHE_TTL.TIME_SLOTS);

        if (__DEV__) {
            console.timeEnd(`⏱️ loadTimeSlotsForLevel:${educationLevel}`);
            console.log(`✅ ${timeSlots.length} bloques cargados para ${educationLevel}`);
        }

        return { success: true, data: timeSlots };
    } catch (error: any) {
        if (__DEV__) {
            console.error('❌ Error en loadTimeSlotsForLevel:', error);
        }
        return {
            success: false,
            message: odooApi.extractOdooErrorMessage(error),
        };
    }
};

/**
 * Carga horarios con filtros
 */
export const loadSchedules = async (
    filters?: ScheduleFilters,
    forceRefresh: boolean = false
): Promise<ScheduleServiceResult<Schedule[]>> => {
    try {
        if (__DEV__) {
            console.time('⏱️ loadSchedules');
        }

        // Construir dominio
        const domain: any[] = [];

        if (filters?.sectionId) {
            domain.push(['section_id', '=', filters.sectionId]);
        }
        if (filters?.mentionSectionId) {
            domain.push(['mention_section_id', '=', filters.mentionSectionId]);
        }
        if (filters?.dayOfWeek) {
            domain.push(['day_of_week', '=', filters.dayOfWeek]);
        }
        if (filters?.professorId) {
            domain.push('|');
            domain.push(['professor_id', '=', filters.professorId]);
            domain.push(['professor_ids', 'in', [filters.professorId]]);
        }
        if (filters?.subjectId) {
            domain.push(['subject_id', '=', filters.subjectId]);
        }
        if (filters?.yearId) {
            domain.push(['year_id', '=', filters.yearId]);
        }
        if (filters?.active !== undefined) {
            domain.push(['active', '=', filters.active]);
        } else {
            domain.push(['active', '=', true]);
        }

        const result = await odooApi.searchRead(
            MODELS.SCHEDULE,
            domain,
            SCHEDULE_FIELDS,
            200,
            0,
            'section_id, day_of_week, start_time'
        );

        if (!result.success) {
            if (result.error?.isSessionExpired) {
                return { success: false, message: 'Tu sesión ha expirado' };
            }
            return {
                success: false,
                message: odooApi.extractOdooErrorMessage(result.error),
            };
        }

        const schedules = normalizeSchedules(result.data || []);

        if (__DEV__) {
            console.timeEnd('⏱️ loadSchedules');
            console.log(`✅ ${schedules.length} horarios cargados`);
        }

        return { success: true, data: schedules };
    } catch (error: any) {
        if (__DEV__) {
            console.error('❌ Error en loadSchedules:', error);
        }
        return {
            success: false,
            message: odooApi.extractOdooErrorMessage(error),
        };
    }
};

/**
 * Carga el horario semanal completo de una sección
 * Usa el método optimizado de Odoo
 */
export const loadWeeklySchedule = async (
    sectionId: number,
    forceRefresh: boolean = false
): Promise<ScheduleServiceResult<WeeklySchedule>> => {
    try {
        const cacheKey = CACHE_KEYS.WEEKLY_SCHEDULE(sectionId);

        // Intentar cache
        if (!forceRefresh) {
            const cached = cacheManager.get<WeeklySchedule>(cacheKey);
            if (cached) {
                if (__DEV__) {
                    console.log(`📦 Horario semanal ${sectionId} desde caché`);
                }
                return { success: true, data: cached };
            }
        }

        if (__DEV__) {
            console.time(`⏱️ loadWeeklySchedule:${sectionId}`);
        }

        // Usar método optimizado de Odoo
        const result = await odooApi.callMethod(
            MODELS.SCHEDULE,
            'get_weekly_schedule_enhanced',
            [sectionId]
        );

        if (!result.success) {
            if (result.error?.isSessionExpired) {
                return { success: false, message: 'Tu sesión ha expirado' };
            }
            return {
                success: false,
                message: odooApi.extractOdooErrorMessage(result.error),
            };
        }

        const weeklySchedule = normalizeWeeklySchedule(result.data);

        // Guardar en caché
        cacheManager.set(cacheKey, weeklySchedule, CACHE_TTL.SCHEDULES);

        if (__DEV__) {
            console.timeEnd(`⏱️ loadWeeklySchedule:${sectionId}`);
            console.log(`✅ Horario semanal cargado: ${weeklySchedule.sectionName}`);
        }

        return { success: true, data: weeklySchedule };
    } catch (error: any) {
        if (__DEV__) {
            console.error('❌ Error en loadWeeklySchedule:', error);
        }
        return {
            success: false,
            message: odooApi.extractOdooErrorMessage(error),
        };
    }
};

/**
 * Obtiene un horario por ID
 */
export const getScheduleById = async (
    id: number
): Promise<ScheduleServiceResult<Schedule>> => {
    try {
        const result = await odooApi.read(MODELS.SCHEDULE, [id], SCHEDULE_FIELDS);

        if (!result.success || !result.data?.length) {
            return { success: false, message: 'Horario no encontrado' };
        }

        const schedules = normalizeSchedules(result.data);
        return { success: true, data: schedules[0] };
    } catch (error: any) {
        return {
            success: false,
            message: odooApi.extractOdooErrorMessage(error),
        };
    }
};

/**
 * Obtiene un bloque de tiempo por ID
 */
export const getTimeSlotById = async (
    id: number
): Promise<ScheduleServiceResult<TimeSlot>> => {
    try {
        const result = await odooApi.read(MODELS.TIME_SLOT, [id], TIME_SLOT_FIELDS);

        if (!result.success || !result.data?.length) {
            return { success: false, message: 'Bloque de tiempo no encontrado' };
        }

        const timeSlots = normalizeTimeSlots(result.data);
        return { success: true, data: timeSlots[0] };
    } catch (error: any) {
        return {
            success: false,
            message: odooApi.extractOdooErrorMessage(error),
        };
    }
};
