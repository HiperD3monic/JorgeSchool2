/**
 * AttendanceStats - Componente de estadísticas de asistencia
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Colors from '../../constants/Colors';
import { ATTENDANCE_STATE_COLORS, AttendanceStats as AttendanceStatsType } from '../../services-odoo/attendanceService';

interface AttendanceStatsProps {
    stats: AttendanceStatsType;
    loading?: boolean;
}

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats, loading }) => {
    const rate = stats.attendanceRate || 0;
    const rateColor = rate >= 90 ? Colors.success : rate >= 70 ? Colors.warning : Colors.error;

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.skeletonCard} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Tasa de asistencia principal */}
            <View style={styles.mainCard}>
                <View style={styles.rateContainer}>
                    <Text style={[styles.rateValue, { color: rateColor }]}>
                        {rate.toFixed(1)}%
                    </Text>
                    <Text style={styles.rateLabel}>Tasa de Asistencia</Text>
                </View>
                <View style={[styles.rateBar, { backgroundColor: Colors.gray[200] }]}>
                    <View
                        style={[
                            styles.rateBarFill,
                            { width: `${Math.min(rate, 100)}%`, backgroundColor: rateColor },
                        ]}
                    />
                </View>
            </View>

            {/* Desglose por estado */}
            <View style={styles.statsRow}>
                <StatItem
                    icon="checkmark-circle"
                    label="Presentes"
                    value={stats.present}
                    color={ATTENDANCE_STATE_COLORS.present}
                />
                <StatItem
                    icon="close-circle"
                    label="Ausentes"
                    value={stats.absent}
                    color={ATTENDANCE_STATE_COLORS.absent}
                />
                <StatItem
                    icon="time"
                    label="Tardanzas"
                    value={stats.late}
                    color={ATTENDANCE_STATE_COLORS.late}
                />
                <StatItem
                    icon="document-text"
                    label="Permisos"
                    value={stats.permission}
                    color={ATTENDANCE_STATE_COLORS.permission}
                />
            </View>

            {/* Total */}
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total de registros:</Text>
                <Text style={styles.totalValue}>{stats.total}</Text>
            </View>
        </View>
    );
};

interface StatItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: number;
    color: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, color }) => (
    <View style={styles.statItem}>
        <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    skeletonCard: {
        height: 150,
        backgroundColor: Colors.skeleton.base,
        borderRadius: 12,
    },
    mainCard: {
        marginBottom: 20,
    },
    rateContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },
    rateValue: {
        fontSize: 42,
        fontWeight: '800',
        letterSpacing: -1,
    },
    rateLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: '500',
        marginTop: 2,
    },
    rateBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    rateBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 10,
        color: Colors.textTertiary,
        marginTop: 2,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        gap: 8,
    },
    totalLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    totalValue: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
});

export default AttendanceStats;
