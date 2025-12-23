/**
 * Operaciones CRUD para el servicio de asistencias
 */

import { callMethod, create, deleteRecords, update } from '../apiService';
import { ATTENDANCE_MODEL } from './constants';
import type {
    AttendanceServiceResult,
    AttendanceStats,
    BulkStudentAttendanceData,
    CreateEmployeeAttendanceData,
    CreateStudentAttendanceData,
} from './types';

/**
 * Crea un registro de asistencia para estudiante
 */
export async function createStudentAttendance(
    data: CreateStudentAttendanceData
): Promise<AttendanceServiceResult<number>> {
    try {
        const values: Record<string, any> = {
            attendance_type: 'student',
            student_id: data.studentId,
            schedule_id: data.scheduleId,
            date: data.date,
            state: data.state || 'present',
        };

        if (data.checkInTime !== undefined) {
            values.check_in_time = data.checkInTime;
        }
        if (data.checkOutTime !== undefined) {
            values.check_out_time = data.checkOutTime;
        }
        if (data.observations) {
            values.observations = data.observations;
        }

        const result = await create(ATTENDANCE_MODEL, values);

        if (!result.success) {
            return {
                success: false,
                message: result.error?.message || 'Error al crear registro de asistencia',
                error: result.error,
            };
        }

        return {
            success: true,
            data: result.data,
            message: 'Asistencia registrada correctamente',
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido',
        };
    }
}

/**
 * Crea un registro de asistencia para empleado
 */
export async function createEmployeeAttendance(
    data: CreateEmployeeAttendanceData
): Promise<AttendanceServiceResult<number>> {
    try {
        const values: Record<string, any> = {
            attendance_type: 'employee',
            employee_id: data.employeeId,
            date: data.date,
            state: data.state || 'present',
        };

        if (data.checkInTime !== undefined) {
            values.check_in_time = data.checkInTime;
        }
        if (data.checkOutTime !== undefined) {
            values.check_out_time = data.checkOutTime;
        }
        if (data.observations) {
            values.observations = data.observations;
        }

        const result = await create(ATTENDANCE_MODEL, values);

        if (!result.success) {
            return {
                success: false,
                message: result.error?.message || 'Error al crear registro de asistencia',
                error: result.error,
            };
        }

        return {
            success: true,
            data: result.data,
            message: 'Asistencia de personal registrada correctamente',
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido',
        };
    }
}

/**
 * Crea registros de asistencia masivos para estudiantes usando el método de Odoo
 */
export async function createBulkStudentAttendance(
    data: BulkStudentAttendanceData
): Promise<AttendanceServiceResult<number[]>> {
    try {
        // Usar el método de Odoo para crear asistencias en bulk
        const studentsData = data.studentsData.map((s) => ({
            student_id: s.studentId,
            state: s.state,
            check_in_time: s.checkInTime,
            check_out_time: s.checkOutTime,
            observations: s.observations,
        }));

        const result = await callMethod(
            ATTENDANCE_MODEL,
            'create_student_attendance_for_schedule',
            [data.scheduleId, data.date, studentsData]
        );

        if (!result.success) {
            return {
                success: false,
                message: result.error?.message || 'Error al crear registros de asistencia',
                error: result.error,
            };
        }

        return {
            success: true,
            data: result.data,
            message: `${data.studentsData.length} registros de asistencia creados`,
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido',
        };
    }
}

/**
 * Actualiza un registro de asistencia
 */
export async function updateAttendance(
    id: number,
    data: Partial<{
        state: string;
        checkInTime: number;
        checkOutTime: number;
        observations: string;
    }>
): Promise<AttendanceServiceResult<boolean>> {
    try {
        const values: Record<string, any> = {};

        if (data.state) values.state = data.state;
        if (data.checkInTime !== undefined) values.check_in_time = data.checkInTime;
        if (data.checkOutTime !== undefined) values.check_out_time = data.checkOutTime;
        if (data.observations !== undefined) values.observations = data.observations;

        const result = await update(ATTENDANCE_MODEL, [id], values);

        if (!result.success) {
            return {
                success: false,
                message: result.error?.message || 'Error al actualizar asistencia',
                error: result.error,
            };
        }

        return {
            success: true,
            data: true,
            message: 'Asistencia actualizada correctamente',
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido',
        };
    }
}

/**
 * Elimina registros de asistencia
 */
export async function deleteAttendance(
    ids: number[]
): Promise<AttendanceServiceResult<boolean>> {
    try {
        const result = await deleteRecords(ATTENDANCE_MODEL, ids);

        if (!result.success) {
            return {
                success: false,
                message: result.error?.message || 'Error al eliminar asistencia',
                error: result.error,
            };
        }

        return {
            success: true,
            data: true,
            message: 'Asistencia eliminada correctamente',
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido',
        };
    }
}

/**
 * Obtiene estadísticas de asistencia usando el método de Odoo
 */
export async function getAttendanceStats(params: {
    dateFrom?: string;
    dateTo?: string;
    sectionId?: number;
}): Promise<AttendanceServiceResult<AttendanceStats>> {
    try {
        const result = await callMethod(
            ATTENDANCE_MODEL,
            'get_attendance_statistics',
            [params.dateFrom, params.dateTo, params.sectionId]
        );

        if (!result.success) {
            return {
                success: false,
                message: result.error?.message || 'Error al obtener estadísticas',
                error: result.error,
            };
        }

        const stats: AttendanceStats = {
            total: result.data?.total || 0,
            present: result.data?.present || 0,
            absent: result.data?.absent || 0,
            late: result.data?.late || 0,
            permission: result.data?.permission || 0,
            attendanceRate: result.data?.attendance_rate || 0,
        };

        return {
            success: true,
            data: stats,
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido',
        };
    }
}

/**
 * Crea asistencia diaria para empleados en bulk
 */
export async function createBulkEmployeeAttendance(
    date: string,
    employeesData: Array<{
        employeeId: number;
        state?: string;
        checkInTime?: number;
        checkOutTime?: number;
    }>
): Promise<AttendanceServiceResult<number[]>> {
    try {
        const data = employeesData.map((e) => ({
            employee_id: e.employeeId,
            state: e.state || 'present',
            check_in_time: e.checkInTime,
            check_out_time: e.checkOutTime,
        }));

        const result = await callMethod(
            ATTENDANCE_MODEL,
            'create_employee_daily_attendance_bulk',
            [date, data]
        );

        if (!result.success) {
            return {
                success: false,
                message: result.error?.message || 'Error al crear registros de asistencia',
                error: result.error,
            };
        }

        return {
            success: true,
            data: result.data,
            message: `${employeesData.length} registros de asistencia de personal creados`,
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido',
        };
    }
}
