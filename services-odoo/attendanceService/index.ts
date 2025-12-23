/**
 * Servicio de asistencias
 * Modelo Odoo: school.attendance
 */

// Types
export type {
    AttendanceFilters, AttendanceRecord, AttendanceServiceResult, AttendanceState, AttendanceStats, AttendanceType, BulkStudentAttendanceData, CreateEmployeeAttendanceData, CreateStudentAttendanceData
} from './types';

// Constants
export {
    ATTENDANCE_FIELDS, ATTENDANCE_MODEL, ATTENDANCE_PAGE_SIZE, ATTENDANCE_STATE_COLORS,
    ATTENDANCE_STATE_ICONS, ATTENDANCE_STATE_LABELS, ATTENDANCE_SUMMARY_FIELDS, ATTENDANCE_TYPE_LABELS
} from './constants';

// Normalizer
export {
    floatToTimeString, normalizeAttendanceRecord,
    normalizeAttendanceRecords, timeStringToFloat
} from './normalizer';

// CRUD
export {
    createBulkEmployeeAttendance, createBulkStudentAttendance, createEmployeeAttendance, createStudentAttendance, deleteAttendance,
    getAttendanceStats, updateAttendance
} from './crud';

// Loaders
export {
    checkExistingAttendance, loadAttendanceByDate, loadAttendanceBySection, loadAttendanceRecords, loadEmployeeAttendance, loadEmployeeAttendanceHistory, loadStudentAttendance, loadStudentAttendanceHistory
} from './loader';

