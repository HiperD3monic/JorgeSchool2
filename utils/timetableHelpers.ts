/**
 * Utilidades auxiliares para el módulo de planificación
 */

// Re-exportar helpers del servicio
export {
    calculateDuration,
    calculateDurationMinutes, checkTimeOverlap, floatToTimeString, formatDurationHours, formatDurationMinutes, formatTimeRange, generateHourSlots, getDayName,
    getShortDayName, getTimeSlotColor, isValidTimeFloat, isValidTimeString, timeStringToFloat
} from '../services-odoo/scheduleService/helpers';

// ============ HELPERS DE CALENDARIO ============

/**
 * Nombres de meses en español
 */
export const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Nombres cortos de meses
 */
export const MONTH_NAMES_SHORT = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

/**
 * Obtiene el nombre del mes
 */
export const getMonthName = (month: number): string => {
    return MONTH_NAMES[month] || '';
};

/**
 * Obtiene el nombre corto del mes
 */
export const getShortMonthName = (month: number): string => {
    return MONTH_NAMES_SHORT[month] || '';
};

/**
 * Obtiene el número de días en un mes
 */
export const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
};

/**
 * Obtiene el día de la semana del primer día del mes (0=Domingo, 1=Lunes, etc.)
 * Ajustado para que 0=Lunes
 */
export const getFirstDayOfMonth = (year: number, month: number): number => {
    const day = new Date(year, month, 1).getDay();
    // Convertir de Domingo=0 a Lunes=0
    return day === 0 ? 6 : day - 1;
};

/**
 * Verifica si una fecha es hoy
 */
export const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
};

/**
 * Verifica si dos fechas son el mismo día
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );
};

/**
 * Formatea una fecha en formato corto (DD/MM)
 */
export const formatShortDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
};

/**
 * Formatea una fecha en formato largo (DD de Mes de YYYY)
 */
export const formatLongDate = (date: Date): string => {
    const day = date.getDate();
    const month = MONTH_NAMES[date.getMonth()];
    const year = date.getFullYear();
    return `${day} de ${month} de ${year}`;
};

/**
 * Obtiene el primer día de la semana (Lunes)
 */
export const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Ajustar para que Lunes sea el inicio
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

/**
 * Obtiene el último día de la semana (Domingo)
 */
export const getWeekEnd = (date: Date): Date => {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
};

/**
 * Genera un array de fechas para una semana
 */
export const getWeekDays = (date: Date): Date[] => {
    const weekStart = getWeekStart(date);
    const days: Date[] = [];

    for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        days.push(day);
    }

    return days;
};

/**
 * Navega al mes anterior
 */
export const getPreviousMonth = (year: number, month: number): { year: number; month: number } => {
    if (month === 0) {
        return { year: year - 1, month: 11 };
    }
    return { year, month: month - 1 };
};

/**
 * Navega al mes siguiente
 */
export const getNextMonth = (year: number, month: number): { year: number; month: number } => {
    if (month === 11) {
        return { year: year + 1, month: 0 };
    }
    return { year, month: month + 1 };
};

/**
 * Genera la estructura del calendario mensual
 */
export const generateMonthCalendar = (year: number, month: number): Date[][] => {
    const weeks: Date[][] = [];
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Días del mes anterior
    const prevMonth = getPreviousMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(prevMonth.year, prevMonth.month);

    let week: Date[] = [];

    // Llenar días del mes anterior
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        week.push(new Date(prevMonth.year, prevMonth.month, day));
    }

    // Llenar días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
        week.push(new Date(year, month, day));

        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
    }

    // Llenar días del mes siguiente
    const nextMonth = getNextMonth(year, month);
    let nextDay = 1;
    while (week.length < 7 && week.length > 0) {
        week.push(new Date(nextMonth.year, nextMonth.month, nextDay));
        nextDay++;
    }

    if (week.length > 0) {
        weeks.push(week);
    }

    return weeks;
};
