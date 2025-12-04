import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import Colors from '../../constants/Colors';
import type { SchoolYear } from '../../services-odoo/yearService';

interface SchoolYearCardProps {
    year: SchoolYear;
    index: number;
    onPress: () => void;
    onEdit?: () => void;
    isOfflineMode?: boolean;
}

export const SchoolYearCard: React.FC<SchoolYearCardProps> = ({
    year,
    index,
    onPress,
    onEdit,
    isOfflineMode = false,
}) => {
    const accentColor = year.current ? '#10b981' : Colors.primary;

    return (
        <Animated.View
            entering={FadeInRight.delay(index * 50).duration(300)}
            style={styles.container}
        >
            <TouchableOpacity
                style={[styles.card, { borderLeftColor: accentColor }]}
                onPress={onPress}
                activeOpacity={0.7}
                disabled={isOfflineMode}
            >
                {/* Indicador de tipo */}
                <View style={[styles.iconContainer, { backgroundColor: accentColor + '15' }]}>
                    <Ionicons name="calendar" size={32} color={accentColor} />
                </View>

                {/* Contenido */}
                <View style={styles.content}>
                    <Text style={styles.name} numberOfLines={1}>
                        {year.name}
                    </Text>
                    {year.current && (
                        <View style={styles.currentBadge}>
                            <Ionicons name="checkmark-circle" size={12} color="#fff" />
                            <Text style={styles.currentBadgeText}>Año Actual</Text>
                        </View>
                    )}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="people-outline" size={14} color={Colors.textSecondary} />
                            <Text style={styles.statText}>{year.totalStudentsCount || 0}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="grid-outline" size={14} color={Colors.textSecondary} />
                            <Text style={styles.statText}>{year.totalSectionsCount || 0}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="school-outline" size={14} color={Colors.textSecondary} />
                            <Text style={styles.statText}>{year.totalProfessorsCount || 0}</Text>
                        </View>
                    </View>
                </View>

                {/* Acción */}
                <View style={styles.actions}>
                    {isOfflineMode && (
                        <View style={styles.offlineBadge}>
                            <Ionicons name="cloud-offline" size={12} color={Colors.warning} />
                        </View>
                    )}
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={isOfflineMode ? Colors.textTertiary : Colors.textSecondary}
                    />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderLeftWidth: 4,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            }
        }),
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 17,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 4,
        letterSpacing: -0.2,
    },
    currentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#10b981',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        gap: 4,
        marginBottom: 6,
    },
    currentBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#fff',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginLeft: 8,
    },
    offlineBadge: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: Colors.warning + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
