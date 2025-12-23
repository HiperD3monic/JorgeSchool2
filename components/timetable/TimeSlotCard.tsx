/**
 * TimeSlotCard - Tarjeta de bloque horario
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';
import { EDUCATION_LEVEL_LABELS } from '../../services-odoo/scheduleService/constants';
import { formatDurationMinutes } from '../../services-odoo/scheduleService/helpers';
import type { TimeSlot } from '../../services-odoo/scheduleService/types';

interface TimeSlotCardProps {
    timeSlot: TimeSlot;
    onPress?: (timeSlot: TimeSlot) => void;
    onEdit?: (timeSlot: TimeSlot) => void;
    onDelete?: (timeSlot: TimeSlot) => void;
    showActions?: boolean;
}

export const TimeSlotCard: React.FC<TimeSlotCardProps> = ({
    timeSlot,
    onPress,
    onEdit,
    onDelete,
    showActions = false,
}) => {
    const getTypeColor = () => {
        return timeSlot.isBreak ? Colors.success : Colors.primary;
    };

    const getTypeIcon = (): keyof typeof Ionicons.glyphMap => {
        return timeSlot.isBreak ? 'cafe-outline' : 'book-outline';
    };

    const getTypeLabel = () => {
        return timeSlot.isBreak ? 'Recreo' : 'Clase';
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress?.(timeSlot)}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            {/* Borde izquierdo con color */}
            <View style={[styles.colorBar, { backgroundColor: getTypeColor() }]} />

            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name={getTypeIcon()}
                            size={20}
                            color={getTypeColor()}
                        />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.name}>{timeSlot.name}</Text>
                        <Text style={styles.timeRange}>{timeSlot.timeRange}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: getTypeColor() + '20' }]}>
                        <Text style={[styles.badgeText, { color: getTypeColor() }]}>
                            {getTypeLabel()}
                        </Text>
                    </View>
                </View>

                {/* Details */}
                <View style={styles.details}>
                    <View style={styles.detailItem}>
                        <Ionicons name="timer-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.detailText}>
                            {formatDurationMinutes(timeSlot.durationMinutes)}
                        </Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="school-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.detailText}>
                            {EDUCATION_LEVEL_LABELS[timeSlot.educationLevel]}
                        </Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="list-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.detailText}>
                            #{timeSlot.sequence}
                        </Text>
                    </View>
                </View>

                {/* Actions */}
                {showActions && (
                    <View style={styles.actions}>
                        {onEdit && (
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => onEdit(timeSlot)}
                            >
                                <Ionicons name="pencil-outline" size={16} color={Colors.primary} />
                                <Text style={styles.actionText}>Editar</Text>
                            </TouchableOpacity>
                        )}
                        {onDelete && (
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.deleteBtn]}
                                onPress={() => onDelete(timeSlot)}
                            >
                                <Ionicons name="trash-outline" size={16} color={Colors.error} />
                                <Text style={[styles.actionText, styles.deleteText]}>Eliminar</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    colorBar: {
        width: 4,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: Colors.backgroundTertiary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerInfo: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    timeRange: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    details: {
        flexDirection: 'row',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        gap: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    actions: {
        flexDirection: 'row',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        gap: 12,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: Colors.backgroundTertiary,
        gap: 6,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.primary,
    },
    deleteBtn: {
        backgroundColor: Colors.error + '10',
    },
    deleteText: {
        color: Colors.error,
    },
});

export default TimeSlotCard;
