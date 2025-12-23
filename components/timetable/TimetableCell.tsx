/**
 * TimetableCell - Celda individual del grid de horario
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';
import type { ScheduleEntry } from '../../services-odoo/scheduleService/types';

interface TimetableCellProps {
    schedule?: ScheduleEntry;
    scheduleType: 'subject' | 'teacher';
    onPress?: (schedule: ScheduleEntry) => void;
    isEmpty?: boolean;
}

export const TimetableCell: React.FC<TimetableCellProps> = ({
    schedule,
    scheduleType,
    onPress,
    isEmpty = false,
}) => {
    if (isEmpty || !schedule) {
        return (
            <View style={[styles.cell, styles.emptyCell]}>
                <Text style={styles.emptyText}>—</Text>
            </View>
        );
    }

    // Obtener color de fondo basado en el color numérico de Odoo
    const getCellColor = () => {
        // Odoo usa números 0-11 para colores
        const colorMap: Record<number, string> = {
            0: '#ffffff',
            1: '#f8bbd9', // Rosa
            2: '#b2ebf2', // Cyan
            3: '#dcedc8', // Verde claro
            4: '#ffe0b2', // Naranja claro
            5: '#e1bee7', // Púrpura
            6: '#f0f4c3', // Lima
            7: '#cfd8dc', // Gris azul
            8: '#ffccbc', // Salmón
            9: '#c5cae9', // Indigo claro
            10: '#b3e5fc', // Azul claro
            11: '#fff9c4', // Amarillo
        };
        return colorMap[schedule.color] || Colors.primary + '15';
    };

    // Obtener contenido principal
    const getMainText = () => {
        if (scheduleType === 'subject') {
            return schedule.subjectName || 'Sin materia';
        }
        return schedule.professorsNames || 'Sin profesor';
    };

    // Obtener texto secundario
    const getSecondaryText = () => {
        if (scheduleType === 'subject') {
            return schedule.professorName;
        }
        return schedule.professorCount && schedule.professorCount > 1
            ? `${schedule.professorCount} profesores`
            : undefined;
    };

    return (
        <TouchableOpacity
            style={[styles.cell, { backgroundColor: getCellColor() }]}
            onPress={() => onPress?.(schedule)}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            <Text style={styles.mainText} numberOfLines={2}>
                {getMainText()}
            </Text>
            {getSecondaryText() && (
                <Text style={styles.secondaryText} numberOfLines={1}>
                    {getSecondaryText()}
                </Text>
            )}
            {schedule.classroom && (
                <Text style={styles.roomText} numberOfLines={1}>
                    {schedule.classroom}
                </Text>
            )}
        </TouchableOpacity>
    );
};

// Altura mínima de una celda
export const CELL_HEIGHT = 70;
export const CELL_WIDTH = 100;

const styles = StyleSheet.create({
    cell: {
        width: CELL_WIDTH,
        minHeight: CELL_HEIGHT,
        padding: 6,
        borderWidth: 0.5,
        borderColor: Colors.borderLight,
        justifyContent: 'center',
    },
    emptyCell: {
        backgroundColor: Colors.backgroundTertiary,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.textTertiary,
        fontSize: 12,
    },
    mainText: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    secondaryText: {
        fontSize: 9,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 2,
    },
    roomText: {
        fontSize: 9,
        color: Colors.textTertiary,
        textAlign: 'center',
        marginTop: 2,
        fontStyle: 'italic',
    },
});

export default TimetableCell;
