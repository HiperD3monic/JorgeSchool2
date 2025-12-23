/**
 * Funciones de carga de datos de asistencia
 */

import { searchCount, searchRead } from '../apiService';
import { ATTENDANCE_FIELDS, ATTENDANCE_MODEL, ATTENDANCE_PAGE_SIZE, ATTENDANCE_SUMMARY_FIELDS } from './constants';
import { normalizeAttendanceRecords } from './normalizer';
import type { AttendanceFilters, AttendanceRecord, AttendanceServiceResult, OdooAttendanceRecord } from './types';

/**
 * Construye el dominio de búsqueda de Odoo desde los filtros
 */
function buildDomain(filters?: AttendanceFilters): any[] {
    const domain: any[] = [];

    if (filters?.dateFrom) {
        domain.push(['date', '>=', filters.dateFrom]);
    }
    if (filters?.dateTo) {
        domain.push(['date', '<=', filters.dateTo]);
    }
    if (filters?.sectionId) {
        domain.push(['section_id', '=', filters.sectionId]);
    }
    if (filters?.scheduleId) {
        domain.push(['schedule_id', '=', filters.scheduleId]);
    }
    if (filters?.studentId) {
        domain.push(['student_id', '=', filters.studentId]);
    }
    if (filters?.employeeId) {
        domain.push(['employee_id', '=', filters.employeeId]);
    }
    if (filters?.state) {
        domain.push(['state', '=', filters.state]);
    }
    if (filters?.attendanceType) {
        domain.push(['attendance_type', '=', filters.attendanceType]);
    }
    if (filters?.yearId) {
        domain.push(['year_id', '=', filters.yearId]);
    }

    return domain;
}

/**
 * Carga registros de asistencia con filtros y paginación
 */
export async function loadAttendanceRecords(
    filters?: AttendanceFilters,
    options?: {
        limit?: number;
        offset?: number;
        summaryOnly?: boolean;
    }
): Promise<AttendanceServiceResult<{ records: AttendanceRecord[]; total: number }>> {
    try {
        const domain = buildDomain(filters);
        const limit = options?.limit || ATTENDANCE_PAGE_SIZE;
        const offset = options?.offset || 0;
        const fields = options?.summaryOnly ? ATTENDANCE_SUMMARY_FIELDS : ATTENDANCE_FIELDS;

        // Obtener total
        const countResult = await searchCount(ATTENDANCE_MODEL, domain);
        if (!countResult.success) {
            return {
                success: false,
                message: countResult.error?.message || 'Error al contar registros',
                error: countResult.error,
            };
        }

        // Obtener registros
        const result = await searchRead(
            ATTENDANCE_MODEL,
            domain,
            fields,
            limit,
            offset,
            'date DESC, check_in_time DESC'
        );

        if (!result.success) {
            return {
                success: false,
                message: result.error?.message || 'Error al cargar registros',
                error: result.error,
            };
        }

        const records = normalizeAttendanceRecords(result.data as OdooAttendanceRecord[]);

        return {
            success: true,
            data: {
                records,
                total: countResult.data || 0,
            },
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido',
        };
    }
}

/**
 * Carga asistencias de estudiantes
 */
export async function loadStudentAttendance(
    filters?: Omit<AttendanceFilters, 'attendanceType'>,
    options?: { limit?: number; offset?: number }
): Promise<AttendanceServiceResult<{ records: AttendanceRecord[]; total: number }>> {
    return loadAttendanceRecords(
        { ...filters, attendanceType: 'student' },
        options
    );
}

/**
 * Carga asistencias de personal
 */
export async function loadEmployeeAttendance(
    filters?: Omit<AttendanceFilters, 'attendanceType'>,
    options?: { limit?: number; offset?: number }
): Promise<AttendanceServiceResult<{ records: AttendanceRecord[]; total: number }>> {
    return loadAttendanceRecords(
        { ...filters, attendanceType: 'employee' },
        options
    );
}

/**
 * Carga asistencias por sección
 */
export async function loadAttendanceBySection(
    sectionId: number,
    date?: string,
    options?: { limit?: number; offset?: number }
): Promise<AttendanceServiceResult<{ records: AttendanceRecord[]; total: number }>> {
    const filters: AttendanceFilters = {
        sectionId,
        attendanceType: 'student',
    };

    if (date) {
        filters.dateFrom = date;
        filters.dateTo = date;
    }

    return loadAttendanceRecords(filters, options);
}

/**
 * Carga asistencias por fecha
 */
export async function loadAttendanceByDate(
    date: string,
    attendanceType?: 'student' | 'employee',
    options?: { limit?: number; offset?: number }
): Promise<AttendanceServiceResult<{ records: AttendanceRecord[]; total: number }>> {
    const filters: AttendanceFilters = {
        dateFrom: date,
        dateTo: date,
    };

    if (attendanceType) {
        filters.attendanceType = attendanceType;
    }

    return loadAttendanceRecords(filters, options);
}

/**
 * Carga el historial de asistencia de un estudiante
 */
export async function loadStudentAttendanceHistory(
    studentId: number,
    options?: {
        dateFrom?: string;
        dateTo?: string;
        limit?: number;
        offset?: number;
    }
): Promise<AttendanceServiceResult<{ records: AttendanceRecord[]; total: number }>> {
    return loadAttendanceRecords(
        {
            studentId,
            attendanceType: 'student',
            dateFrom: options?.dateFrom,
            dateTo: options?.dateTo,
        },
        { limit: options?.limit, offset: options?.offset }
    );
}

/**
 * Carga el historial de asistencia de un empleado
 */
export async function loadEmployeeAttendanceHistory(
    employeeId: number,
    options?: {
        dateFrom?: string;
        dateTo?: string;
        limit?: number;
        offset?: number;
    }
): Promise<AttendanceServiceResult<{ records: AttendanceRecord[]; total: number }>> {
    return loadAttendanceRecords(
        {
            employeeId,
            attendanceType: 'employee',
            dateFrom: options?.dateFrom,
            dateTo: options?.dateTo,
        },
        { limit: options?.limit, offset: options?.offset }
    );
}

/**
 * Verifica si ya existe asistencia para un estudiante en una fecha y horario
 */
export async function checkExistingAttendance(
    studentId: number,
    scheduleId: number,
    date: string
): Promise<AttendanceServiceResult<boolean>> {
    try {
        const countResult = await searchCount(ATTENDANCE_MODEL, [
            ['student_id', '=', studentId],
            ['schedule_id', '=', scheduleId],
            ['date', '=', date],
        ]);

        if (!countResult.success) {
            return {
                success: false,
                message: countResult.error?.message || 'Error al verificar existencia',
                error: countResult.error,
            };
        }

        return {
            success: true,
            data: (countResult.data || 0) > 0,
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido',
        };
    }
}
