/**
 * CalendarMonthView - Vista de calendario mensual
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';
import { DAY_NAMES_SHORT } from '../../services-odoo/scheduleService/constants';
import type { DayOfWeek } from '../../services-odoo/scheduleService/types';
import {
    generateMonthCalendar,
    getMonthName,
    getNextMonth,
    getPreviousMonth,
    isToday,
} from '../../utils/timetableHelpers';

interface CalendarMonthViewProps {
    year?: number;
    month?: number;
    onSelectDate?: (date: Date) => void;
    selectedDate?: Date;
    markedDates?: Map<string, { color?: string; count?: number }>;
    onMonthChange?: (year: number, month: number) => void;
}

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
    year: initialYear,
    month: initialMonth,
    onSelectDate,
    selectedDate,
    markedDates = new Map(),
    onMonthChange,
}) => {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(initialYear ?? today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(initialMonth ?? today.getMonth());

    // Generar estructura del calendario
    const weeks = useMemo(() => {
        return generateMonthCalendar(currentYear, currentMonth);
    }, [currentYear, currentMonth]);

    // Navegar al mes anterior
    const goToPreviousMonth = () => {
        const { year, month } = getPreviousMonth(currentYear, currentMonth);
        setCurrentYear(year);
        setCurrentMonth(month);
        onMonthChange?.(year, month);
    };

    // Navegar al mes siguiente
    const goToNextMonth = () => {
        const { year, month } = getNextMonth(currentYear, currentMonth);
        setCurrentYear(year);
        setCurrentMonth(month);
        onMonthChange?.(year, month);
    };

    // Ir a hoy
    const goToToday = () => {
        const now = new Date();
        setCurrentYear(now.getFullYear());
        setCurrentMonth(now.getMonth());
        onMonthChange?.(now.getFullYear(), now.getMonth());
    };

    // Verificar si una fecha está seleccionada
    const isSelected = (date: Date) => {
        if (!selectedDate) return false;
        return (
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        );
    };

    // Obtener marcador para una fecha
    const getMarker = (date: Date) => {
        const key = date.toISOString().split('T')[0]; // YYYY-MM-DD
        return markedDates.get(key);
    };

    // Días de la semana (header)
    const dayHeaders: DayOfWeek[] = ['0', '1', '2', '3', '4', '5', '6'];

    return (
        <View style={styles.container}>
            {/* Header con navegación */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.navBtn} onPress={goToPreviousMonth}>
                    <Ionicons name="chevron-back" size={24} color={Colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.titleBtn} onPress={goToToday}>
                    <Text style={styles.title}>
                        {getMonthName(currentMonth)} {currentYear}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navBtn} onPress={goToNextMonth}>
                    <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Días de la semana */}
            <View style={styles.weekDaysRow}>
                {dayHeaders.map((day) => (
                    <View key={day} style={styles.weekDayCell}>
                        <Text style={styles.weekDayText}>{DAY_NAMES_SHORT[day]}</Text>
                    </View>
                ))}
            </View>

            {/* Semanas del mes */}
            {weeks.map((week, weekIndex) => (
                <View key={weekIndex} style={styles.weekRow}>
                    {week.map((date, dayIndex) => {
                        const isCurrentMonth = date.getMonth() === currentMonth;
                        const isTodayDate = isToday(date);
                        const isSelectedDate = isSelected(date);
                        const marker = getMarker(date);

                        return (
                            <TouchableOpacity
                                key={dayIndex}
                                style={[
                                    styles.dayCell,
                                    !isCurrentMonth && styles.otherMonthCell,
                                    isTodayDate && styles.todayCell,
                                    isSelectedDate && styles.selectedCell,
                                ]}
                                onPress={() => onSelectDate?.(date)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.dayText,
                                        !isCurrentMonth && styles.otherMonthText,
                                        isTodayDate && styles.todayText,
                                        isSelectedDate && styles.selectedText,
                                    ]}
                                >
                                    {date.getDate()}
                                </Text>

                                {/* Indicador de eventos */}
                                {marker && (
                                    <View style={styles.markerContainer}>
                                        <View
                                            style={[
                                                styles.marker,
                                                { backgroundColor: marker.color || Colors.primary },
                                            ]}
                                        />
                                        {(marker.count ?? 0) > 1 && (
                                            <Text style={styles.markerCount}>
                                                +{marker.count - 1}
                                            </Text>
                                        )}
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}
        </View>
    );
};

const CELL_SIZE = 44;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    navBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.backgroundTertiary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    // Week days header
    weekDaysRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    weekDayCell: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    weekDayText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    // Week rows
    weekRow: {
        flexDirection: 'row',
    },
    dayCell: {
        flex: 1,
        height: CELL_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        position: 'relative',
    },
    otherMonthCell: {
        opacity: 0.4,
    },
    todayCell: {
        backgroundColor: Colors.primary + '15',
    },
    selectedCell: {
        backgroundColor: Colors.primary,
    },
    dayText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.textPrimary,
    },
    otherMonthText: {
        color: Colors.textTertiary,
    },
    todayText: {
        color: Colors.primary,
        fontWeight: '700',
    },
    selectedText: {
        color: '#fff',
        fontWeight: '700',
    },
    // Markers
    markerContainer: {
        position: 'absolute',
        bottom: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    marker: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    markerCount: {
        fontSize: 8,
        color: Colors.textSecondary,
    },
});

export default CalendarMonthView;
