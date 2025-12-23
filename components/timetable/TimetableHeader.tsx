/**
 * TimetableHeader - Encabezado del grid de horario con días de la semana
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Colors from '../../constants/Colors';
import { DAY_NAMES_SHORT, WORKING_DAYS } from '../../services-odoo/scheduleService/constants';
import type { DayOfWeek } from '../../services-odoo/scheduleService/types';
import { CELL_WIDTH } from './TimetableCell';

interface TimetableHeaderProps {
    days?: DayOfWeek[];
    showTimeColumn?: boolean;
    timeColumnWidth?: number;
}

export const TimetableHeader: React.FC<TimetableHeaderProps> = ({
    days = WORKING_DAYS,
    showTimeColumn = true,
    timeColumnWidth = 60,
}) => {
    // Obtener el día actual (0=Lunes, 6=Domingo)
    const today = new Date().getDay();
    const todayIndex = today === 0 ? 6 : today - 1; // Convertir a nuestro formato
    const todayStr = todayIndex.toString() as DayOfWeek;

    return (
        <View style={styles.container}>
            {showTimeColumn && (
                <View style={[styles.timeCell, { width: timeColumnWidth }]}>
                    <Text style={styles.timeCellText}>Hora</Text>
                </View>
            )}
            {days.map((day) => {
                const isToday = day === todayStr;
                return (
                    <View
                        key={day}
                        style={[
                            styles.dayCell,
                            isToday && styles.todayCell,
                        ]}
                    >
                        <Text
                            style={[
                                styles.dayText,
                                isToday && styles.todayText,
                            ]}
                        >
                            {DAY_NAMES_SHORT[day]}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden',
    },
    timeCell: {
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 0.5,
        borderRightColor: 'rgba(255,255,255,0.2)',
    },
    timeCellText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    dayCell: {
        width: CELL_WIDTH,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 0.5,
        borderRightColor: 'rgba(255,255,255,0.2)',
    },
    todayCell: {
        backgroundColor: Colors.primaryLight,
    },
    dayText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#fff',
    },
    todayText: {
        color: '#fff',
    },
});

export default TimetableHeader;
