/**
 * AttendanceCard - Tarjeta de registro de asistencia
 * Estilo similar a StudentCard.tsx
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';
import {
    ATTENDANCE_STATE_COLORS,
    ATTENDANCE_STATE_ICONS,
    ATTENDANCE_STATE_LABELS,
    AttendanceRecord,
    AttendanceState,
    floatToTimeString,
} from '../../services-odoo/attendanceService';

interface AttendanceCardProps {
    record: AttendanceRecord;
    onPress?: () => void;
    onEdit?: () => void;
    index?: number;
}

/**
 * Obtiene el color del estado
 */
const getStateColor = (state: AttendanceState): string => {
    return ATTENDANCE_STATE_COLORS[state] || Colors.textSecondary;
};

/**
 * Obtiene el icono del estado
 */
const getStateIcon = (state: AttendanceState): keyof typeof Ionicons.glyphMap => {
    return (ATTENDANCE_STATE_ICONS[state] || 'help-circle') as keyof typeof Ionicons.glyphMap;
};

export const AttendanceCard: React.FC<AttendanceCardProps> = React.memo(
    ({ record, onPress, onEdit, index = 0 }) => {
        const fadeAnim = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                delay: index * 50,
                useNativeDriver: true,
            }).start();
        }, [fadeAnim, index]);

        const stateColor = getStateColor(record.state);
        const stateIcon = getStateIcon(record.state);
        const stateLabel = ATTENDANCE_STATE_LABELS[record.state] || record.state;

        // Determinar nombre a mostrar
        const displayName = record.studentName || record.employeeName || record.visitorName || 'Sin nombre';

        // Determinar subtítulo
        const subtitle = record.attendanceType === 'student'
            ? record.sectionName || record.scheduleName
            : record.attendanceType === 'employee'
                ? 'Personal'
                : record.visitorDestination || 'Visitante';

        return (
            <Animated.View style={{ opacity: fadeAnim }}>
                <TouchableOpacity
                    style={styles.card}
                    onPress={onPress}
                    activeOpacity={0.7}
                    disabled={!onPress}
                >
                    {/* Indicador de estado */}
                    <View style={[styles.stateIndicator, { backgroundColor: stateColor }]} />

                    {/* Icono de estado */}
                    <View style={[styles.iconContainer, { backgroundColor: stateColor + '15' }]}>
                        <Ionicons name={stateIcon} size={24} color={stateColor} />
                    </View>

                    {/* Información */}
                    <View style={styles.info}>
                        <Text style={styles.name} numberOfLines={1}>
                            {displayName}
                        </Text>
                        <Text style={styles.detail} numberOfLines={1}>
                            {subtitle}
                        </Text>
                        <View style={styles.metaRow}>
                            {/* Fecha */}
                            <View style={styles.metaItem}>
                                <Ionicons name="calendar-outline" size={12} color={Colors.textTertiary} />
                                <Text style={styles.metaText}>{record.date}</Text>
                            </View>
                            {/* Hora de entrada */}
                            {record.checkInTime !== undefined && (
                                <View style={styles.metaItem}>
                                    <Ionicons name="time-outline" size={12} color={Colors.textTertiary} />
                                    <Text style={styles.metaText}>{floatToTimeString(record.checkInTime)}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Badge de estado */}
                    <View style={[styles.stateBadge, { backgroundColor: stateColor + '15' }]}>
                        <Text style={[styles.stateText, { color: stateColor }]}>
                            {stateLabel}
                        </Text>
                    </View>

                    {/* Botón editar */}
                    {onEdit && (
                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={onEdit}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="create-outline" size={18} color={Colors.primary} />
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>
            </Animated.View>
        );
    },
    (prevProps, nextProps) => {
        return (
            prevProps.record.id === nextProps.record.id &&
            prevProps.record.state === nextProps.record.state &&
            prevProps.index === nextProps.index
        );
    }
);

AttendanceCard.displayName = 'AttendanceCard';

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        gap: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    stateIndicator: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        borderTopLeftRadius: 14,
        borderBottomLeftRadius: 14,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
        minWidth: 0,
    },
    name: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    detail: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 11,
        color: Colors.textTertiary,
    },
    stateBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    stateText: {
        fontSize: 11,
        fontWeight: '700',
    },
    editBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.primary + '12',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AttendanceCard;
