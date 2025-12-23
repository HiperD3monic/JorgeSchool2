import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
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
    const approvedStudents = year.approvedStudentsCount || 0;
    const approvalRate = totalStudents > 0
        ? Math.round((approvedStudents / totalStudents) * 100)
        : 0;

    // Determine card style based on state
    const getStateConfig = () => {
        switch (year.state) {
            case 'active':
                return {
                    gradient: ['#3b82f6', '#1d4ed8'] as const,
                    badgeText: 'En Curso',
                    badgeIcon: 'play-circle' as const,
                };
            case 'finished':
                return {
                    gradient: ['#64748b', '#475569'] as const,
                    badgeText: 'Finalizado',
                    badgeIcon: 'checkmark-done-circle' as const,
                };
            default:
                return {
                    gradient: ['#f59e0b', '#d97706'] as const,
                    badgeText: 'Borrador',
                    badgeIcon: 'document-outline' as const,
                };
        }
    };

    const stateConfig = getStateConfig();

    return (
        <Animated.View
            entering={FadeInUp.delay(index * 80).duration(400).springify()}
            style={styles.container}
        >
            <TouchableOpacity
                style={styles.card}
                onPress={onPress}
                activeOpacity={0.85}
                disabled={isOfflineMode}
            >
                {/* Background Gradient Accent */}
                <LinearGradient
                    colors={year.current ? ['rgba(16, 185, 129, 0.12)', 'rgba(16, 185, 129, 0.03)'] : ['rgba(59, 130, 246, 0.06)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />

                {/* Left Accent Bar */}
                <View style={[styles.accentBar, { backgroundColor: year.current ? '#10b981' : stateConfig.gradient[0] }]} />

                {/* Content */}
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.titleSection}>
                            <Text style={styles.yearName} numberOfLines={1}>{year.name}</Text>
                            <View style={styles.badges}>
                                {/* State Badge */}
                                <View style={[styles.badge, { backgroundColor: stateConfig.gradient[0] }]}>
                                    <Ionicons name={stateConfig.badgeIcon} size={11} color="#fff" />
                                    <Text style={styles.badgeText}>{stateConfig.badgeText}</Text>
                                </View>
                                {/* Current Year Badge */}
                                {year.current && (
                                    <View style={[styles.badge, styles.currentBadge]}>
                                        <Ionicons name="star" size={11} color="#fff" />
                                        <Text style={styles.badgeText}>Actual</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Chevron */}
                        <View style={[styles.chevronBox, isOfflineMode && styles.chevronDisabled]}>
                            {isOfflineMode ? (
                                <Ionicons name="cloud-offline" size={18} color={Colors.warning} />
                            ) : (
                                <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
                            )}
                        </View>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        {/* Students */}
                        <View style={styles.statCard}>
                            <View style={[styles.statIconBox, { backgroundColor: '#3b82f615' }]}>
                                <Ionicons name="people" size={16} color="#3b82f6" />
                            </View>
                            <View style={styles.statInfo}>
                                <Text style={styles.statValue}>{totalStudents}</Text>
                                <Text style={styles.statLabel}>Estudiantes</Text>
                            </View>
                        </View>

                        {/* Sections */}
                        <View style={styles.statCard}>
                            <View style={[styles.statIconBox, { backgroundColor: '#8b5cf615' }]}>
                                <Ionicons name="grid" size={16} color="#8b5cf6" />
                            </View>
                            <View style={styles.statInfo}>
                                <Text style={styles.statValue}>{totalSections}</Text>
                                <Text style={styles.statLabel}>Secciones</Text>
                            </View>
                        </View>

                        {/* Professors */}
                        <View style={styles.statCard}>
                            <View style={[styles.statIconBox, { backgroundColor: '#f59e0b15' }]}>
                                <Ionicons name="person" size={16} color="#f59e0b" />
                            </View>
                            <View style={styles.statInfo}>
                                <Text style={styles.statValue}>{totalProfessors}</Text>
                                <Text style={styles.statLabel}>Profesores</Text>
                            </View>
                        </View>

                        {/* Approval Rate */}
                        {totalStudents > 0 && (
                            <View style={styles.statCard}>
                                <View style={[
                                    styles.statIconBox,
                                    { backgroundColor: approvalRate >= 70 ? '#10b98115' : approvalRate >= 50 ? '#f59e0b15' : '#ef444415' }
                                ]}>
                                    <Ionicons
                                        name={approvalRate >= 70 ? 'checkmark-circle' : approvalRate >= 50 ? 'alert-circle' : 'close-circle'}
                                        size={16}
                                        color={approvalRate >= 70 ? '#10b981' : approvalRate >= 50 ? '#f59e0b' : '#ef4444'}
                                    />
                                </View>
                                <View style={styles.statInfo}>
                                    <Text style={[
                                        styles.statValue,
                                        { color: approvalRate >= 70 ? '#10b981' : approvalRate >= 50 ? '#f59e0b' : '#ef4444' }
                                    ]}>
                                        {approvalRate}%
                                    </Text>
                                    <Text style={styles.statLabel}>Aprobación</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 14,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
            },
            android: {
                elevation: 4,
            }
        }),
    },
    accentBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
    },
    content: {
        padding: 16,
        paddingLeft: 18,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    titleSection: {
        flex: 1,
        marginRight: 12,
    },
    yearName: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.4,
        marginBottom: 8,
    },
    badges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 4,
    },
    currentBadge: {
        backgroundColor: '#10b981',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.2,
    },
    chevronBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: Colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chevronDisabled: {
        backgroundColor: Colors.warning + '15',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    statCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        gap: 10,
        minWidth: '45%',
        flex: 1,
    },
    statIconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statInfo: {
        flex: 1,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.3,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.textTertiary,
        marginTop: 1,
    },
});
