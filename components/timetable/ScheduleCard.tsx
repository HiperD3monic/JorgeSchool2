/**
 * ScheduleCard - Tarjeta de horario para lista o detalle
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';
import { DAY_NAMES, EDUCATION_LEVEL_COLORS } from '../../services-odoo/scheduleService/constants';
import type { Schedule } from '../../services-odoo/scheduleService/types';

interface ScheduleCardProps {
    schedule: Schedule;
    onPress?: (schedule: Schedule) => void;
    showSection?: boolean;
    compact?: boolean;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
    schedule,
    onPress,
    showSection = true,
    compact = false,
}) => {
    const getLevelColor = () => {
        if (schedule.educationLevel) {
            return EDUCATION_LEVEL_COLORS[schedule.educationLevel];
        }
        return Colors.primary;
    };

    const getMainContent = () => {
        // Para Media General: mostrar materia
        if (schedule.educationLevel === 'secundary' && schedule.subjectName) {
            return schedule.subjectName;
        }
        // Para Primaria/Preescolar: mostrar profesor
        if (schedule.professorNames) {
            return schedule.professorNames;
        }
        if (schedule.professorName) {
            return schedule.professorName;
        }
        return schedule.displayName || 'Horario';
    };

    const getSecondaryContent = () => {
        // Para Media General: mostrar profesor
        if (schedule.educationLevel === 'secundary' && schedule.professorName) {
            return schedule.professorName;
        }
        // Para otros: mostrar sección
        if (showSection && schedule.sectionName) {
            return schedule.sectionName;
        }
        return null;
    };

    if (compact) {
        return (
            <TouchableOpacity
                style={styles.compactCard}
                onPress={() => onPress?.(schedule)}
                activeOpacity={onPress ? 0.7 : 1}
                disabled={!onPress}
            >
                <View style={[styles.compactIndicator, { backgroundColor: getLevelColor() }]} />
                <View style={styles.compactContent}>
                    <Text style={styles.compactTime}>
                        {schedule.startTimeStr} - {schedule.endTimeStr}
                    </Text>
                    <Text style={styles.compactTitle} numberOfLines={1}>
                        {getMainContent()}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress?.(schedule)}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            {/* Indicador de color */}
            <View style={[styles.colorIndicator, { backgroundColor: getLevelColor() }]} />

            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.timeContainer}>
                        <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.timeText}>
                            {schedule.startTimeStr} - {schedule.endTimeStr}
                        </Text>
                    </View>
                    <View style={styles.dayBadge}>
                        <Text style={styles.dayText}>
                            {DAY_NAMES[schedule.dayOfWeek]}
                        </Text>
                    </View>
                </View>

                {/* Contenido principal */}
                <Text style={styles.mainText} numberOfLines={2}>
                    {getMainContent()}
                </Text>

                {getSecondaryContent() && (
                    <Text style={styles.secondaryText} numberOfLines={1}>
                        {getSecondaryContent()}
                    </Text>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    {schedule.classroom && (
                        <View style={styles.footerItem}>
                            <Ionicons name="location-outline" size={12} color={Colors.textTertiary} />
                            <Text style={styles.footerText}>{schedule.classroom}</Text>
                        </View>
                    )}
                    {showSection && schedule.sectionName && !getSecondaryContent()?.includes(schedule.sectionName) && (
                        <View style={styles.footerItem}>
                            <Ionicons name="school-outline" size={12} color={Colors.textTertiary} />
                            <Text style={styles.footerText}>{schedule.sectionName}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    // Full card
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    colorIndicator: {
        width: 4,
    },
    content: {
        flex: 1,
        padding: 14,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    timeText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    dayBadge: {
        backgroundColor: Colors.backgroundTertiary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    dayText: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    mainText: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    secondaryText: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    footer: {
        flexDirection: 'row',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        gap: 16,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    footerText: {
        fontSize: 11,
        color: Colors.textTertiary,
    },
    // Compact card
    compactCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 6,
        overflow: 'hidden',
    },
    compactIndicator: {
        width: 3,
    },
    compactContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        gap: 12,
    },
    compactTime: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
        minWidth: 90,
    },
    compactTitle: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
});

export default ScheduleCard;
