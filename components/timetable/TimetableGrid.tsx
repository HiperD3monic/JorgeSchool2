/**
 * TimetableGrid - Grid semanal de horarios estilo tabla
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Colors from '../../constants/Colors';
import { WORKING_DAYS } from '../../services-odoo/scheduleService/constants';
import { floatToTimeString } from '../../services-odoo/scheduleService/helpers';
import type { DayOfWeek, ScheduleEntry, TimeSlot, WeeklySchedule } from '../../services-odoo/scheduleService/types';
import TimetableCell, { CELL_HEIGHT } from './TimetableCell';
import TimetableHeader from './TimetableHeader';

interface TimetableGridProps {
    weeklySchedule?: WeeklySchedule;
    timeSlots?: TimeSlot[];
    loading?: boolean;
    onPressCell?: (schedule: ScheduleEntry) => void;
    days?: DayOfWeek[];
    emptyMessage?: string;
}

const TIME_COLUMN_WIDTH = 60;

export const TimetableGrid: React.FC<TimetableGridProps> = ({
    weeklySchedule,
    timeSlots = [],
    loading = false,
    onPressCell,
    days = WORKING_DAYS,
    emptyMessage = 'Selecciona una sección para ver su horario',
}) => {
    // Generar filas de tiempo basadas en time slots o rangos de hora
    const timeRows = useMemo(() => {
        if (timeSlots.length > 0) {
            return timeSlots
                .filter(slot => !slot.isBreak) // Solo clases
                .sort((a, b) => a.startTime - b.startTime);
        }

        // Fallback: horas estándar 7:00 - 17:00
        const rows: { startTime: number; endTime: number; label: string }[] = [];
        for (let hour = 7; hour <= 16; hour++) {
            rows.push({
                startTime: hour,
                endTime: hour + 1,
                label: `${floatToTimeString(hour)}`,
            });
        }
        return rows;
    }, [timeSlots]);

    // Función para encontrar el horario en una celda específica
    const findScheduleForCell = (
        dayOfWeek: DayOfWeek,
        startTime: number,
        endTime: number
    ): ScheduleEntry | undefined => {
        if (!weeklySchedule?.schedules) return undefined;

        const daySchedules = weeklySchedule.schedules[dayOfWeek] || [];

        // Buscar horario que coincida o se solape con este bloque
        return daySchedules.find((schedule) => {
            // El horario comienza dentro del bloque
            return schedule.startTime >= startTime && schedule.startTime < endTime;
        });
    };

    // Loading state
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Cargando horario...</Text>
            </View>
        );
    }

    // Empty state (no section selected)
    if (!weeklySchedule) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={64} color={Colors.textTertiary} />
                <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Información de la sección */}
            <View style={styles.sectionInfo}>
                <Text style={styles.sectionTitle}>{weeklySchedule.sectionName}</Text>
                <Text style={styles.scheduleType}>
                    {weeklySchedule.scheduleType === 'subject' ? 'Por materia' : 'Por profesor'}
                </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                    {/* Header con días */}
                    <TimetableHeader
                        days={days}
                        showTimeColumn
                        timeColumnWidth={TIME_COLUMN_WIDTH}
                    />

                    {/* Grid de celdas */}
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {timeRows.map((timeRow, index) => (
                            <View key={index} style={styles.row}>
                                {/* Columna de hora */}
                                <View style={[styles.timeCell, { width: TIME_COLUMN_WIDTH }]}>
                                    <Text style={styles.timeText}>
                                        {'startTimeStr' in timeRow
                                            ? timeRow.startTimeStr
                                            : timeRow.label}
                                    </Text>
                                </View>

                                {/* Celdas de cada día */}
                                {days.map((day) => {
                                    const startTime = 'startTime' in timeRow
                                        ? (timeRow as TimeSlot).startTime
                                        : (timeRow as any).startTime;
                                    const endTime = 'endTime' in timeRow
                                        ? (timeRow as TimeSlot).endTime
                                        : (timeRow as any).endTime;

                                    const schedule = findScheduleForCell(day, startTime, endTime);

                                    return (
                                        <TimetableCell
                                            key={day}
                                            schedule={schedule}
                                            scheduleType={weeklySchedule.scheduleType}
                                            onPress={onPressCell}
                                            isEmpty={!schedule}
                                        />
                                    );
                                })}
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>

            {/* Leyenda */}
            {weeklySchedule.scheduleType === 'subject' && (
                <View style={styles.legend}>
                    <Text style={styles.legendTitle}>Leyenda:</Text>
                    <Text style={styles.legendText}>
                        Tap en una celda para ver detalles
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    // Section info
    sectionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    scheduleType: {
        fontSize: 12,
        color: Colors.textSecondary,
        backgroundColor: Colors.backgroundTertiary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    // Grid
    row: {
        flexDirection: 'row',
    },
    timeCell: {
        height: CELL_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.gray[100],
        borderWidth: 0.5,
        borderColor: Colors.borderLight,
    },
    timeText: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 64,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: Colors.textSecondary,
    },
    // Empty
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 64,
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 16,
    },
    // Legend
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: Colors.backgroundTertiary,
        gap: 8,
    },
    legendTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    legendText: {
        fontSize: 12,
        color: Colors.textTertiary,
    },
});

export default TimetableGrid;
