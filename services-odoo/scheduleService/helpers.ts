/**
 * Helpers para conversión de tiempo y utilidades de horarios
 */

import { DAY_NAMES, DAY_NAMES_SHORT } from './constants';
import { DayOfWeek } from './types';

/**
 * Convierte un float de Odoo a string de hora (HH:MM)
 * Ejemplo: 8.5 -> "08:30", 14.75 -> "14:45"
 */
export const floatToTimeString = (floatTime: number | undefined | null): string => {
    if (floatTime === undefined || floatTime === null) return '00:00';

    const hours = Math.floor(floatTime);
    const minutes = Math.round((floatTime - hours) * 60);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Convierte un string de hora (HH:MM) a float de Odoo
 * Ejemplo: "08:30" -> 8.5, "14:45" -> 14.75
 */
export const timeStringToFloat = (timeStr: string): number => {
    if (!timeStr || typeof timeStr !== 'string') return 0;

    const [hoursStr, minutesStr] = timeStr.split(':');
    const hours = parseInt(hoursStr, 10) || 0;
    const minutes = parseInt(minutesStr, 10) || 0;

    return hours + (minutes / 60);
};

/**
 * Calcula la duración en horas entre dos tiempos float
 */
export const calculateDuration = (startTime: number, endTime: number): number => {
    return endTime - startTime;
};

/**
 * Calcula la duración en minutos entre dos tiempos float
 */
export const calculateDurationMinutes = (startTime: number, endTime: number): number => {
    return Math.round((endTime - startTime) * 60);
};

/**
 * Formatea un rango de tiempo
 * Ejemplo: (8.5, 9.5) -> "08:30 - 09:30"
 */
export const formatTimeRange = (startTime: number, endTime: number): string => {
    return `${floatToTimeString(startTime)} - ${floatToTimeString(endTime)}`;
};

/**
 * Verifica si dos rangos de tiempo se solapan
 */
export const checkTimeOverlap = (
    start1: number,
    end1: number,
    start2: number,
    end2: number
): boolean => {
    return start1 < end2 && end1 > start2;
};

/**
 * Obtiene el nombre completo del día
 */
export const getDayName = (day: DayOfWeek): string => {
    return DAY_NAMES[day] || '';
};

/**
 * Obtiene el nombre corto del día
 */
export const getShortDayName = (day: DayOfWeek): string => {
    return DAY_NAMES_SHORT[day] || '';
};

/**
 * Valida si un string es un formato de hora válido (HH:MM)
 */
export const isValidTimeString = (time: string): boolean => {
    if (!time || typeof time !== 'string') return false;
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
};

/**
 * Valida si un float es una hora válida (0-24)
 */
export const isValidTimeFloat = (time: number): boolean => {
    return typeof time === 'number' && time >= 0 && time < 24;
};

/**
 * Genera slots de hora para un timeline
 * Ejemplo: generateHourSlots(7, 14) -> [7, 8, 9, 10, 11, 12, 13, 14]
 */
export const generateHourSlots = (startHour: number = 7, endHour: number = 18): number[] => {
    const slots: number[] = [];
    for (let h = startHour; h <= endHour; h++) {
        slots.push(h);
    }
    return slots;
};

/**
 * Obtiene el color para un bloque según si es recreo o clase
 */
export const getTimeSlotColor = (isBreak: boolean): string => {
    return isBreak ? '#10b981' : '#3b82f6';
};

/**
 * Formatea duración en minutos a texto
 * Ejemplo: 45 -> "45 min", 90 -> "1h 30min"
 */
export const formatDurationMinutes = (minutes: number): string => {
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${mins}min`;
};

/**
 * Formatea duración en horas (float) a texto
 */
export const formatDurationHours = (hours: number): string => {
    const minutes = Math.round(hours * 60);
    return formatDurationMinutes(minutes);
};
