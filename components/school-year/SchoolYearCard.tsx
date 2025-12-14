import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import Colors from '../../constants/Colors';
import type { SchoolYear } from '../../services-odoo/yearService';

interface SchoolYearCardProps {
    year: SchoolYear;
    index: number;
    onPress: () => void;
    isOfflineMode?: boolean;
}

export const SchoolYearCard: React.FC<SchoolYearCardProps> = ({
    year,
    index,
    onPress,
    isOfflineMode = false,
}) => {
    const totalStudents = year.totalStudentsCount || 0;
    const totalSections = year.totalSectionsCount || 0;
    const totalProfessors = year.totalProfessorsCount || 0;
    const approvalRate = totalStudents > 0
        ? Math.round(((year.approvedStudentsCount || 0) / totalStudents) * 100)
        : 0;

    return (
        <Animated.View
            entering={FadeInRight.delay(index * 60).duration(350)}
            style={styles.container}
        >
            <TouchableOpacity
                style={styles.card}
                onPress={onPress}
                activeOpacity={0.8}
                disabled={isOfflineMode}
            >
                {/* Gradiente de fondo para año actual */}
                {year.current && (
                    <LinearGradient
                        colors={['rgba(16, 185, 129, 0.08)', 'rgba(16, 185, 129, 0.02)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    />
                )}

                {/* Header Row */}
                <View style={styles.headerRow}>
                    <View style={[
                        styles.iconContainer,
                        { backgroundColor: year.current ? '#10b98115' : Colors.primary + '15' }
                    ]}>
                        <Ionicons
                            name="calendar"
                            size={26}
                            color={year.current ? '#10b981' : Colors.primary}
                        />
                    </View>

                    <View style={styles.headerContent}>
                        <View style={styles.titleRow}>
                            <Text style={styles.name} numberOfLines={1}>
                                {year.name}
                            </Text>
                            {/* State Badge */}
                            {year.state === 'draft' && (
                                <View style={[styles.stateBadge, { backgroundColor: '#f59e0b' }]}>
                                    <Ionicons name="document-outline" size={10} color="#fff" />
                                    <Text style={styles.stateBadgeText}>Borrador</Text>
                                </View>
                            )}
                            {year.state === 'active' && (
                                <View style={[styles.stateBadge, { backgroundColor: '#3b82f6' }]}>
                                    <Ionicons name="play-circle" size={10} color="#fff" />
                                    <Text style={styles.stateBadgeText}>En Curso</Text>
                                </View>
                            )}
                            {year.state === 'finished' && (
                                <View style={[styles.stateBadge, { backgroundColor: '#64748b' }]}>
                                    <Ionicons name="checkmark-done-circle" size={10} color="#fff" />
                                    <Text style={styles.stateBadgeText}>Finalizado</Text>
                                </View>
                            )}
                            {/* Current Badge */}
                            {year.current && (
                                <View style={styles.currentBadge}>
                                    <Ionicons name="star" size={10} color="#fff" />
                                    <Text style={styles.currentBadgeText}>Actual</Text>
                                </View>
                            )}
                        </View>

                        {/* Mini Stats Row */}
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Ionicons name="people" size={14} color="#3b82f6" />
                                <Text style={styles.statValue}>{totalStudents}</Text>
                                <Text style={styles.statLabel}>Est.</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Ionicons name="grid" size={14} color="#8b5cf6" />
                                <Text style={styles.statValue}>{totalSections}</Text>
                                <Text style={styles.statLabel}>Sec.</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Ionicons name="person" size={14} color="#f59e0b" />
                                <Text style={styles.statValue}>{totalProfessors}</Text>
                                <Text style={styles.statLabel}>Prof.</Text>
                            </View>
                            {totalStudents > 0 && (
                                <>
                                    <View style={styles.statDivider} />
                                    <View style={styles.approvalItem}>
                                        <View style={[
                                            styles.approvalBadge,
                                            { backgroundColor: approvalRate >= 70 ? '#10b98115' : approvalRate >= 50 ? '#f59e0b15' : '#ef444415' }
                                        ]}>
                                            <Ionicons
                                                name={approvalRate >= 70 ? 'checkmark-circle' : approvalRate >= 50 ? 'alert-circle' : 'close-circle'}
                                                size={12}
                                                color={approvalRate >= 70 ? '#10b981' : approvalRate >= 50 ? '#f59e0b' : '#ef4444'}
                                            />
                                            <Text style={[
                                                styles.approvalText,
                                                { color: approvalRate >= 70 ? '#10b981' : approvalRate >= 50 ? '#f59e0b' : '#ef4444' }
                                            ]}>
                                                {approvalRate}%
                                            </Text>
                                        </View>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        {isOfflineMode && (
                            <View style={styles.offlineBadge}>
                                <Ionicons name="cloud-offline" size={14} color={Colors.warning} />
                            </View>
                        )}
                        <View style={styles.chevronContainer}>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={isOfflineMode ? Colors.textTertiary : Colors.textSecondary}
                            />
                        </View>
                    </View>
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
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 16,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    headerContent: {
        flex: 1,
        justifyContent: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    name: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.3,
    },
    currentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10b981',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        gap: 3,
    },
    currentBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#fff',
    },
    stateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        gap: 3,
    },
    stateBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#fff',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.textTertiary,
        marginLeft: 1,
    },
    statDivider: {
        width: 1,
        height: 12,
        backgroundColor: '#e5e7eb',
        marginHorizontal: 4,
    },
    statSpacer: {
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginLeft: 8,
    },
    offlineBadge: {
        width: 30,
        height: 30,
        borderRadius: 10,
        backgroundColor: Colors.warning + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chevronContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    approvalItem: {
        justifyContent: 'center',
        marginLeft: 4,
    },
    approvalBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    approvalText: {
        fontSize: 12,
        fontWeight: '700',
    },
});
