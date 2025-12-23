/**
 * Normalizador de datos de asistencia
 * Convierte datos crudos de Odoo a tipos TypeScript limpios
 */

import type { AttendanceRecord, OdooAttendanceRecord } from './types';

/**
 * Normaliza un registro de asistencia de Odoo
 */
export function normalizeAttendanceRecord(raw: OdooAttendanceRecord): AttendanceRecord {
    return {
        id: raw.id,
        displayName: raw.display_name || '',
        attendanceType: raw.attendance_type,
        date: raw.date,
        state: raw.state,

        // Estudiante
        studentId: Array.isArray(raw.student_id) ? raw.student_id[0] : undefined,
        studentName: Array.isArray(raw.student_id) ? raw.student_id[1] : undefined,

        // Sección
        sectionId: Array.isArray(raw.section_id) ? raw.section_id[0] : undefined,
        sectionName: Array.isArray(raw.section_id) ? raw.section_id[1] : undefined,

        // Horario
        scheduleId: Array.isArray(raw.schedule_id) ? raw.schedule_id[0] : undefined,
        scheduleName: Array.isArray(raw.schedule_id) ? raw.schedule_id[1] : undefined,

        // Materia
        subjectId: Array.isArray(raw.subject_id) ? raw.subject_id[0] : undefined,
        subjectName: Array.isArray(raw.subject_id) ? raw.subject_id[1] : undefined,

        // Empleado
        employeeId: Array.isArray(raw.employee_id) ? raw.employee_id[0] : undefined,
        employeeName: Array.isArray(raw.employee_id) ? raw.employee_id[1] : undefined,

        // Año
        yearId: Array.isArray(raw.year_id) ? raw.year_id[0] : undefined,
        yearName: Array.isArray(raw.year_id) ? raw.year_id[1] : undefined,

        // Visitante
        visitorName: raw.visitor_name || undefined,
        visitorIdNumber: raw.visitor_id_number || undefined,
        visitorDestination: raw.visitor_destination || undefined,

        // Horarios
        checkInTime: typeof raw.check_in_time === 'number' ? raw.check_in_time : undefined,
        checkOutTime: typeof raw.check_out_time === 'number' ? raw.check_out_time : undefined,

        // Otros
        observations: raw.observations || undefined,
        weekNumber: raw.week_number,
        month: raw.month || undefined,
    };
}

/**
 * Normaliza lista de registros de asistencia
 */
export function normalizeAttendanceRecords(rawRecords: OdooAttendanceRecord[]): AttendanceRecord[] {
    return rawRecords.map(normalizeAttendanceRecord);
}

/**
 * Convierte hora float a string HH:MM
 * @param floatTime - Hora en formato float (ej: 8.5 = 08:30)
 */
export function floatToTimeString(floatTime: number | undefined): string {
    if (floatTime === undefined || floatTime === null) return '';
    const hours = Math.floor(floatTime);
    const minutes = Math.round((floatTime - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Convierte string HH:MM a hora float
 * @param timeString - Hora en formato HH:MM
 */
export function timeStringToFloat(timeString: string): number {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours + (minutes / 60);
}
