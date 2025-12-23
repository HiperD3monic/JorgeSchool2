/**
 * QuickRegisterForm - Formulario de registro rápido de asistencia
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Colors from '../../constants/Colors';
import { searchRead } from '../../services-odoo/apiService';
import {
    ATTENDANCE_STATE_COLORS,
    ATTENDANCE_STATE_LABELS,
    AttendanceState,
    createBulkStudentAttendance,
} from '../../services-odoo/attendanceService';
import { showAlert } from '../showAlert';

interface Student {
    id: number;
    name: string;
    state: AttendanceState;
}

interface QuickRegisterFormProps {
    scheduleId: number;
    scheduleName: string;
    sectionId: number;
    sectionName: string;
    date: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const QuickRegisterForm: React.FC<QuickRegisterFormProps> = ({
    scheduleId,
    scheduleName,
    sectionId,
    sectionName,
    date,
    onSuccess,
    onCancel,
}) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Cargar estudiantes de la sección
    useEffect(() => {
        const loadStudentsData = async () => {
            setLoading(true);
            try {
                // Cargar estudiantes inscritos en la sección usando searchRead
                const result = await searchRead(
                    'school.student',
                    [['section_id', '=', sectionId], ['state', '=', 'enrolled']],
                    ['id', 'student_id'],
                    100,
                    0,
                    'id asc'
                );

                if (result.success && result.data) {
                    // Inicializar todos como presentes
                    setStudents(
                        result.data.map((s: any) => ({
                            id: s.id,
                            name: Array.isArray(s.student_id) ? s.student_id[1] : `Estudiante ${s.id}`,
                            state: 'present' as AttendanceState,
                        }))
                    );
                } else {
                    showAlert('Error', 'No se pudieron cargar los estudiantes');
                }
            } catch {
                showAlert('Error', 'Error al cargar estudiantes');
            } finally {
                setLoading(false);
            }
        };

        loadStudentsData();
    }, [sectionId]);

    // Cambiar estado de un estudiante
    const toggleStudentState = useCallback((studentId: number, newState: AttendanceState) => {
        setStudents((prev) =>
            prev.map((s) =>
                s.id === studentId ? { ...s, state: newState } : s
            )
        );
    }, []);

    // Marcar todos con un estado
    const markAllAs = useCallback((state: AttendanceState) => {
        setStudents((prev) => prev.map((s) => ({ ...s, state })));
    }, []);

    // Guardar asistencias
    const handleSave = async () => {
        setSaving(true);
        try {
            const result = await createBulkStudentAttendance({
                scheduleId,
                date,
                studentsData: students.map((s) => ({
                    studentId: s.id,
                    state: s.state,
                })),
            });

            if (result.success) {
                showAlert('Éxito', result.message || 'Asistencias registradas correctamente');
                onSuccess?.();
            } else {
                showAlert('Error', result.message || 'Error al guardar asistencias');
            }
        } catch {
            showAlert('Error', 'Error inesperado al guardar');
        } finally {
            setSaving(false);
        }
    };

    // Contadores
    const counts = students.reduce(
        (acc, s) => {
            acc[s.state]++;
            return acc;
        },
        { present: 0, absent: 0, late: 0, permission: 0 } as Record<AttendanceState, number>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Cargando estudiantes...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header con info */}
            <View style={styles.header}>
                <View style={styles.headerInfo}>
                    <Text style={styles.sectionName}>{sectionName}</Text>
                    <Text style={styles.scheduleName}>{scheduleName}</Text>
                    <Text style={styles.dateText}>{date}</Text>
                </View>
                {onCancel && (
                    <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                        <Ionicons name="close" size={24} color={Colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Contadores rápidos */}
            <View style={styles.countersRow}>
                {(['present', 'absent', 'late', 'permission'] as AttendanceState[]).map((state) => (
                    <View key={state} style={styles.counterItem}>
                        <Text style={[styles.counterValue, { color: ATTENDANCE_STATE_COLORS[state] }]}>
                            {counts[state]}
                        </Text>
                        <Text style={styles.counterLabel}>{ATTENDANCE_STATE_LABELS[state]}</Text>
                    </View>
                ))}
            </View>

            {/* Botones de acción rápida */}
            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={[styles.quickBtn, { backgroundColor: ATTENDANCE_STATE_COLORS.present + '20' }]}
                    onPress={() => markAllAs('present')}
                >
                    <Ionicons name="checkmark-circle" size={18} color={ATTENDANCE_STATE_COLORS.present} />
                    <Text style={[styles.quickBtnText, { color: ATTENDANCE_STATE_COLORS.present }]}>
                        Todos Presentes
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.quickBtn, { backgroundColor: ATTENDANCE_STATE_COLORS.absent + '20' }]}
                    onPress={() => markAllAs('absent')}
                >
                    <Ionicons name="close-circle" size={18} color={ATTENDANCE_STATE_COLORS.absent} />
                    <Text style={[styles.quickBtnText, { color: ATTENDANCE_STATE_COLORS.absent }]}>
                        Todos Ausentes
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Lista de estudiantes */}
            <ScrollView style={styles.studentList} showsVerticalScrollIndicator={false}>
                {students.map((student, index) => (
                    <StudentRow
                        key={student.id}
                        student={student}
                        index={index}
                        onStateChange={(state) => toggleStudentState(student.id, state)}
                    />
                ))}
            </ScrollView>

            {/* Botón guardar */}
            <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <>
                        <Ionicons name="save-outline" size={20} color="#fff" />
                        <Text style={styles.saveBtnText}>Guardar Asistencia</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
};

// Componente de fila de estudiante
interface StudentRowProps {
    student: Student;
    index: number;
    onStateChange: (state: AttendanceState) => void;
}

const StudentRow: React.FC<StudentRowProps> = ({ student, index, onStateChange }) => {
    const isPresent = student.state === 'present';
    const stateColor = ATTENDANCE_STATE_COLORS[student.state];

    return (
        <View style={[styles.studentRow, index % 2 === 0 && styles.studentRowAlt]}>
            <View style={[styles.studentIndicator, { backgroundColor: stateColor }]} />
            <Text style={styles.studentName} numberOfLines={1}>
                {student.name}
            </Text>

            {/* Toggle rápido presente/ausente */}
            <Switch
                value={isPresent}
                onValueChange={(value) => onStateChange(value ? 'present' : 'absent')}
                trackColor={{ false: Colors.error + '40', true: Colors.success + '40' }}
                thumbColor={isPresent ? Colors.success : Colors.error}
            />

            {/* Selector de estado expandido */}
            <View style={styles.stateSelector}>
                {(['present', 'absent', 'late', 'permission'] as AttendanceState[]).map((state) => (
                    <TouchableOpacity
                        key={state}
                        style={[
                            styles.stateOption,
                            student.state === state && { backgroundColor: ATTENDANCE_STATE_COLORS[state] + '30' },
                        ]}
                        onPress={() => onStateChange(state)}
                    >
                        <Ionicons
                            name={
                                state === 'present'
                                    ? 'checkmark'
                                    : state === 'absent'
                                        ? 'close'
                                        : state === 'late'
                                            ? 'time'
                                            : 'document'
                            }
                            size={14}
                            color={student.state === state ? ATTENDANCE_STATE_COLORS[state] : Colors.textTertiary}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    headerInfo: {
        flex: 1,
    },
    sectionName: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    scheduleName: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    dateText: {
        fontSize: 12,
        color: Colors.textTertiary,
        marginTop: 4,
    },
    cancelBtn: {
        padding: 4,
    },
    countersRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.backgroundSecondary,
        gap: 8,
    },
    counterItem: {
        flex: 1,
        alignItems: 'center',
    },
    counterValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    counterLabel: {
        fontSize: 10,
        color: Colors.textTertiary,
        marginTop: 2,
    },
    quickActions: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    quickBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
    },
    quickBtnText: {
        fontSize: 12,
        fontWeight: '600',
    },
    studentList: {
        flex: 1,
        paddingHorizontal: 16,
    },
    studentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginBottom: 4,
        gap: 10,
    },
    studentRowAlt: {
        backgroundColor: Colors.backgroundSecondary,
    },
    studentIndicator: {
        width: 4,
        height: 28,
        borderRadius: 2,
    },
    studentName: {
        flex: 1,
        fontSize: 14,
        color: Colors.textPrimary,
        fontWeight: '500',
    },
    stateSelector: {
        flexDirection: 'row',
        gap: 4,
    },
    stateOption: {
        width: 28,
        height: 28,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        marginHorizontal: 16,
        marginVertical: 16,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    saveBtnDisabled: {
        opacity: 0.7,
    },
    saveBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});

export default QuickRegisterForm;
