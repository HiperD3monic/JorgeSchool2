/**
 * Tipos e interfaces para el servicio de asistencias
 * Modelo Odoo: school.attendance
 */

/**
 * Tipo de asistencia
 */
export type AttendanceType = 'student' | 'employee' | 'visitor';

/**
 * Estado de asistencia
 */
export type AttendanceState = 'present' | 'absent' | 'late' | 'permission';

/**
 * Registro de asistencia normalizado
 */
export interface AttendanceRecord {
    id: number;
    displayName: string;
    attendanceType: AttendanceType;
    date: string;
    state: AttendanceState;

    // Para estudiantes
    studentId?: number;
    studentName?: string;
    sectionId?: number;
    sectionName?: string;
    scheduleId?: number;
    scheduleName?: string;
    subjectId?: number;
    subjectName?: string;

    // Para empleados
    employeeId?: number;
    employeeName?: string;

    // Para visitantes
    visitorName?: string;
    visitorIdNumber?: string;
    visitorDestination?: string;

    // Horarios
    checkInTime?: number;  // Float en formato 24h (ej: 8.5 = 08:30)
    checkOutTime?: number;

    // Otros
    yearId?: number;
    yearName?: string;
    observations?: string;
    weekNumber?: number;
    month?: string;
}

/**
 * Datos crudos de Odoo
 */
export interface OdooAttendanceRecord {
    id: number;
    display_name: string;
    attendance_type: AttendanceType;
    date: string;
    state: AttendanceState;
    student_id: [number, string] | false;
    employee_id: [number, string] | false;
    section_id: [number, string] | false;
    schedule_id: [number, string] | false;
    subject_id: [number, string] | false;
    year_id: [number, string] | false;
    visitor_name: string | false;
    visitor_id_number: string | false;
    visitor_destination: string | false;
    check_in_time: number | false;
    check_out_time: number | false;
    observations: string | false;
    week_number: number;
    month: string | false;
    is_student: boolean;
    is_employee: boolean;
}

/**
 * Estadísticas de asistencia
 */
export interface AttendanceStats {
    total: number;
    present: number;
    absent: number;
    late: number;
    permission: number;
    attendanceRate: number;
}

/**
 * Filtros para consultas
 */
export interface AttendanceFilters {
    dateFrom?: string;
    dateTo?: string;
    sectionId?: number;
    scheduleId?: number;
    studentId?: number;
    employeeId?: number;
    state?: AttendanceState;
    attendanceType?: AttendanceType;
    yearId?: number;
}

/**
 * Datos para crear asistencia de estudiante
 */
export interface CreateStudentAttendanceData {
    studentId: number;
    scheduleId: number;
    date: string;
    state?: AttendanceState;
    checkInTime?: number;
    checkOutTime?: number;
    observations?: string;
}

/**
 * Datos para crear asistencia de empleado
 */
export interface CreateEmployeeAttendanceData {
    employeeId: number;
    date: string;
    state?: AttendanceState;
    checkInTime?: number;
    checkOutTime?: number;
    observations?: string;
}

/**
 * Datos para registro masivo de estudiantes
 */
export interface BulkStudentAttendanceData {
    scheduleId: number;
    date: string;
    studentsData: Array<{
        studentId: number;
        state: AttendanceState;
        checkInTime?: number;
        checkOutTime?: number;
        observations?: string;
    }>;
}

/**
 * Resultado del servicio
 */
export interface AttendanceServiceResult<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: {
        message: string;
        isSessionExpired?: boolean;
    };
}
