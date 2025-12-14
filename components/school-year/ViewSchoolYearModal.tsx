import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import type { SchoolYear } from '../../services-odoo/yearService';

interface ViewSchoolYearModalProps {
    visible: boolean;
    year: SchoolYear | null;
    onClose: () => void;
    onEdit: () => void;
    onStartYear?: () => Promise<void>;
    onFinishYear?: () => Promise<void>;
    isStartingYear?: boolean;
    isFinishingYear?: boolean;
}

interface StatCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    value: number;
    label: string;
    color: string;
    subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color, subtitle }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
        <View style={[styles.statIconBg, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={22} color={color} />
        </View>
        <View style={styles.statContent}>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
            {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
    </View>
);

interface LevelCardProps {
    levelName: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    students: number;
    approved: number;
    sections: number;
    evaluationType: string;
}

const LevelCard: React.FC<LevelCardProps> = ({
    levelName,
    icon,
    color,
    students,
    approved,
    sections,
    evaluationType
}) => {
    const approvalRate = students > 0 ? Math.round((approved / students) * 100) : 0;

    return (
        <View style={styles.levelCard}>
            {/* Level Header */}
            <View style={styles.levelHeader}>
                <View style={[styles.levelIconBg, { backgroundColor: color + '15' }]}>
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                <View style={styles.levelHeaderText}>
                    <Text style={styles.levelTitle}>{levelName}</Text>
                    <Text style={styles.levelSubtitle}>
                        {evaluationType || 'Sin configuración'}
                    </Text>
                </View>
            </View>

            {/* Stats Row */}
            <View style={styles.levelStatsRow}>
                <View style={styles.levelStat}>
                    <Ionicons name="people" size={16} color="#3b82f6" />
                    <Text style={styles.levelStatValue}>{students}</Text>
                    <Text style={styles.levelStatLabel}>Est.</Text>
                </View>
                <View style={styles.levelStatDivider} />
                <View style={styles.levelStat}>
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                    <Text style={styles.levelStatValue}>{approved}</Text>
                    <Text style={styles.levelStatLabel}>Apr.</Text>
                </View>
                <View style={styles.levelStatDivider} />
                <View style={styles.levelStat}>
                    <Ionicons name="grid" size={16} color="#8b5cf6" />
                    <Text style={styles.levelStatValue}>{sections}</Text>
                    <Text style={styles.levelStatLabel}>Sec.</Text>
                </View>
            </View>

            {/* Progress Bar */}
            {students > 0 && (
                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Tasa de Aprobación</Text>
                        <Text style={[
                            styles.progressPercent,
                            { color: approvalRate >= 70 ? '#10b981' : approvalRate >= 50 ? '#f59e0b' : '#ef4444' }
                        ]}>
                            {approvalRate}%
                        </Text>
                    </View>
                    <View style={styles.progressTrack}>
                        <View style={[
                            styles.progressFill,
                            {
                                width: `${approvalRate}%`,
                                backgroundColor: approvalRate >= 70 ? '#10b981' : approvalRate >= 50 ? '#f59e0b' : '#ef4444'
                            }
                        ]} />
                    </View>
                </View>
            )}
        </View>
    );
};

export const ViewSchoolYearModal: React.FC<ViewSchoolYearModalProps> = ({
    visible,
    year,
    onClose,
    onEdit,
    onStartYear,
    onFinishYear,
    isStartingYear = false,
    isFinishingYear = false,
}) => {
    const insets = useSafeAreaInsets();

    if (!year) return null;

    const totalStudents = year.totalStudentsCount || 0;
    const totalApproved = year.approvedStudentsCount || 0;
    const totalSections = year.totalSectionsCount || 0;
    const totalTeachers = year.totalProfessorsCount || 0;
    const overallRate = totalStudents > 0 ? Math.round((totalApproved / totalStudents) * 100) : 0;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header con Gradiente */}
                <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    style={[styles.headerGradient, { paddingTop: insets.top }]}
                >
                    <View style={styles.headerContent}>
                        {/* Centro - Siempre centrado */}
                        <View style={styles.headerCenter}>
                            <View style={styles.yearIconBg}>
                                <Ionicons name="calendar" size={32} color={Colors.primary} />
                            </View>
                            <Text style={styles.yearName}>{year.name}</Text>
                            <View style={styles.badgesRow}>
                                {/* State Badge */}
                                {year.state === 'draft' && (
                                    <View style={[styles.stateBadge, { backgroundColor: '#f59e0b' }]}>
                                        <Ionicons name="document-outline" size={12} color="#fff" />
                                        <Text style={styles.stateBadgeText}>Borrador</Text>
                                    </View>
                                )}
                                {year.state === 'active' && (
                                    <View style={[styles.stateBadge, { backgroundColor: '#10b981' }]}>
                                        <Ionicons name="play-circle" size={12} color="#fff" />
                                        <Text style={styles.stateBadgeText}>En Curso</Text>
                                    </View>
                                )}
                                {year.state === 'finished' && (
                                    <View style={[styles.stateBadge, { backgroundColor: '#64748b' }]}>
                                        <Ionicons name="checkmark-done-circle" size={12} color="#fff" />
                                        <Text style={styles.stateBadgeText}>Finalizado</Text>
                                    </View>
                                )}
                                {/* Current Badge */}
                                {year.current && (
                                    <View style={styles.currentBadge}>
                                        <Ionicons name="star" size={12} color="#fbbf24" />
                                        <Text style={styles.currentBadgeText}>Año Actual</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Botones flotantes */}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={onEdit}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="pencil" size={16} color="#fff" />
                            <Text style={styles.editButtonText}>Editar</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Stats Summary */}
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{totalStudents}</Text>
                            <Text style={styles.summaryLabel}>Estudiantes</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{totalSections}</Text>
                            <Text style={styles.summaryLabel}>Secciones</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{totalTeachers}</Text>
                            <Text style={styles.summaryLabel}>Profesores</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{overallRate}%</Text>
                            <Text style={styles.summaryLabel}>Aprobación</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Body */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.bodyContent, { paddingBottom: insets.bottom + 30 }]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Acciones del Año - Solo mostrar si hay acciones disponibles */}
                    {(year.state === 'draft' && onStartYear) && (
                        <View style={styles.actionSection}>
                            <TouchableOpacity
                                style={styles.startYearButton}
                                onPress={() => {
                                    Alert.alert(
                                        'Iniciar Año Escolar',
                                        '¿Está seguro de iniciar este año escolar? Esta acción marcará el año como activo.',
                                        [
                                            { text: 'Cancelar', style: 'cancel' },
                                            { text: 'Iniciar', style: 'default', onPress: onStartYear }
                                        ]
                                    );
                                }}
                                disabled={isStartingYear}
                                activeOpacity={0.8}
                            >
                                {isStartingYear ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Ionicons name="play-circle" size={20} color="#fff" />
                                        <Text style={styles.startYearButtonText}>Iniciar Año Escolar</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {(year.state === 'active' && onFinishYear) && (
                        <View style={styles.actionSection}>
                            <TouchableOpacity
                                style={styles.finishYearButton}
                                onPress={() => {
                                    Alert.alert(
                                        'Finalizar Año Escolar',
                                        '¿Está seguro de finalizar este año escolar? Esta acción bloqueará todas las inscripciones, evaluaciones y demás registros. No se podrán crear ni eliminar registros relacionados.',
                                        [
                                            { text: 'Cancelar', style: 'cancel' },
                                            { text: 'Finalizar', style: 'destructive', onPress: onFinishYear }
                                        ]
                                    );
                                }}
                                disabled={isFinishingYear}
                                activeOpacity={0.8}
                            >
                                {isFinishingYear ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Ionicons name="lock-closed" size={20} color="#fff" />
                                        <Text style={styles.finishYearButtonText}>Finalizar Año Escolar</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Resumen General */}
                    <Text style={styles.sectionTitle}>Resumen General</Text>
                    <View style={styles.statsGrid}>
                        <StatCard
                            icon="people"
                            value={totalStudents}
                            label="Estudiantes"
                            color="#3b82f6"
                            subtitle="Inscritos"
                        />
                        <StatCard
                            icon="checkmark-circle"
                            value={totalApproved}
                            label="Aprobados"
                            color="#10b981"
                            subtitle={`${overallRate}%`}
                        />
                        <StatCard
                            icon="grid"
                            value={totalSections}
                            label="Secciones"
                            color="#8b5cf6"
                            subtitle="Activas"
                        />
                        <StatCard
                            icon="person"
                            value={totalTeachers}
                            label="Profesores"
                            color="#f59e0b"
                            subtitle="Asignados"
                        />
                    </View>

                    {/* Detalle por Niveles */}
                    <Text style={styles.sectionTitle}>Detalle por Nivel Educativo</Text>

                    <LevelCard
                        levelName="Media General"
                        icon="school"
                        color="#10b981"
                        students={year.studentsSecundaryCount || 0}
                        approved={year.approvedSecundaryCount || 0}
                        sections={year.sectionsSecundaryCount || 0}
                        evaluationType={year.evalutionTypeSecundary?.name || ''}
                    />

                    <LevelCard
                        levelName="Primaria"
                        icon="book"
                        color="#3b82f6"
                        students={year.studentsPrimaryCount || 0}
                        approved={year.approvedPrimaryCount || 0}
                        sections={year.sectionsPrimaryCount || 0}
                        evaluationType={year.evalutionTypePrimary?.name || ''}
                    />

                    <LevelCard
                        levelName="Preescolar"
                        icon="color-palette"
                        color="#ec4899"
                        students={year.studentsPreCount || 0}
                        approved={year.approvedPreCount || 0}
                        sections={year.sectionsPreCount || 0}
                        evaluationType={year.evalutionTypePree?.name || ''}
                    />

                    {/* Estadísticas de Evaluaciones */}
                    {year.evaluationsStatsJson && (
                        <>
                            <Text style={styles.sectionTitle}>Estadísticas de Evaluaciones</Text>
                            <View style={styles.evalStatsCard}>
                                <View style={styles.evalStatsRow}>
                                    <View style={styles.evalStatItem}>
                                        <View style={[styles.evalStatIcon, { backgroundColor: '#3b82f615' }]}>
                                            <Ionicons name="document-text" size={20} color="#3b82f6" />
                                        </View>
                                        <Text style={styles.evalStatValue}>{year.evaluationsStatsJson.total}</Text>
                                        <Text style={styles.evalStatLabel}>Total</Text>
                                    </View>
                                    <View style={styles.evalStatItem}>
                                        <View style={[styles.evalStatIcon, { backgroundColor: '#10b98115' }]}>
                                            <Ionicons name="checkmark-done" size={20} color="#10b981" />
                                        </View>
                                        <Text style={styles.evalStatValue}>{year.evaluationsStatsJson.qualified}</Text>
                                        <Text style={styles.evalStatLabel}>Completas</Text>
                                    </View>
                                    <View style={styles.evalStatItem}>
                                        <View style={[styles.evalStatIcon, { backgroundColor: '#f59e0b15' }]}>
                                            <Ionicons name="time" size={20} color="#f59e0b" />
                                        </View>
                                        <Text style={styles.evalStatValue}>{year.evaluationsStatsJson.partial}</Text>
                                        <Text style={styles.evalStatLabel}>Parciales</Text>
                                    </View>
                                    <View style={styles.evalStatItem}>
                                        <View style={[styles.evalStatIcon, { backgroundColor: '#6b728015' }]}>
                                            <Ionicons name="create" size={20} color="#6b7280" />
                                        </View>
                                        <Text style={styles.evalStatValue}>{year.evaluationsStatsJson.draft}</Text>
                                        <Text style={styles.evalStatLabel}>Borrador</Text>
                                    </View>
                                </View>

                                {/* Por Nivel */}
                                <View style={styles.evalByLevelRow}>
                                    <View style={styles.evalByLevelItem}>
                                        <Ionicons name="school" size={16} color="#10b981" />
                                        <Text style={styles.evalByLevelValue}>{year.evaluationsStatsJson.by_type.secundary}</Text>
                                        <Text style={styles.evalByLevelLabel}>Media General</Text>
                                    </View>
                                    <View style={styles.evalByLevelItem}>
                                        <Ionicons name="book" size={16} color="#3b82f6" />
                                        <Text style={styles.evalByLevelValue}>{year.evaluationsStatsJson.by_type.primary}</Text>
                                        <Text style={styles.evalByLevelLabel}>Primaria</Text>
                                    </View>
                                    <View style={styles.evalByLevelItem}>
                                        <Ionicons name="color-palette" size={16} color="#ec4899" />
                                        <Text style={styles.evalByLevelValue}>{year.evaluationsStatsJson.by_type.pre}</Text>
                                        <Text style={styles.evalByLevelLabel}>Preescolar</Text>
                                    </View>
                                </View>
                            </View>
                        </>
                    )}

                    {/* Evaluaciones Recientes */}
                    {year.recentEvaluationsJson?.evaluations && year.recentEvaluationsJson.evaluations.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Evaluaciones Recientes</Text>
                            <View style={styles.recentEvalsCard}>
                                {year.recentEvaluationsJson.evaluations.slice(0, 5).map((evaluation, index) => (
                                    <View key={evaluation.id} style={[
                                        styles.recentEvalItem,
                                        index < 4 && styles.recentEvalItemBorder
                                    ]}>
                                        <View style={styles.recentEvalHeader}>
                                            <Text style={styles.recentEvalName} numberOfLines={1}>
                                                {evaluation.name}
                                            </Text>
                                            <View style={[
                                                styles.recentEvalState,
                                                {
                                                    backgroundColor: evaluation.state === 'all' ? '#10b98115' :
                                                        evaluation.state === 'partial' ? '#f59e0b15' : '#6b728015'
                                                }
                                            ]}>
                                                <Text style={[
                                                    styles.recentEvalStateText,
                                                    {
                                                        color: evaluation.state === 'all' ? '#10b981' :
                                                            evaluation.state === 'partial' ? '#f59e0b' : '#6b7280'
                                                    }
                                                ]}>
                                                    {evaluation.state === 'all' ? 'Completa' :
                                                        evaluation.state === 'partial' ? 'Parcial' : 'Borrador'}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.recentEvalDetails}>
                                            <Text style={styles.recentEvalDetail}>
                                                <Ionicons name="person" size={12} color="#6b7280" /> {evaluation.professor}
                                            </Text>
                                            <Text style={styles.recentEvalDetail}>
                                                <Ionicons name="grid" size={12} color="#6b7280" /> {evaluation.section}
                                            </Text>
                                            {evaluation.date && (
                                                <Text style={styles.recentEvalDetail}>
                                                    <Ionicons name="calendar" size={12} color="#6b7280" /> {evaluation.date}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    {/* Configuración */}
                    <Text style={styles.sectionTitle}>Configuración de Evaluaciones</Text>
                    <View style={styles.configCard}>
                        <View style={styles.configRow}>
                            <View style={styles.configItem}>
                                <View style={[styles.configIconBg, { backgroundColor: '#10b98115' }]}>
                                    <Ionicons name="school" size={20} color="#10b981" />
                                </View>
                                <View style={styles.configText}>
                                    <Text style={styles.configLabel}>Media General</Text>
                                    <Text style={styles.configValue}>
                                        {year.evalutionTypeSecundary?.name || 'No configurado'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.configDivider} />
                        <View style={styles.configRow}>
                            <View style={styles.configItem}>
                                <View style={[styles.configIconBg, { backgroundColor: '#3b82f615' }]}>
                                    <Ionicons name="book" size={20} color="#3b82f6" />
                                </View>
                                <View style={styles.configText}>
                                    <Text style={styles.configLabel}>Primaria</Text>
                                    <Text style={styles.configValue}>
                                        {year.evalutionTypePrimary?.name || 'No configurado'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.configDivider} />
                        <View style={styles.configRow}>
                            <View style={styles.configItem}>
                                <View style={[styles.configIconBg, { backgroundColor: '#ec489915' }]}>
                                    <Ionicons name="color-palette" size={20} color="#ec4899" />
                                </View>
                                <View style={styles.configText}>
                                    <Text style={styles.configLabel}>Preescolar</Text>
                                    <Text style={styles.configValue}>
                                        {year.evalutionTypePree?.name || 'No configurado'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    // Header Styles
    headerGradient: {
        paddingBottom: 24,
    },
    headerContent: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 8,
    },
    closeButton: {
        position: 'absolute',
        left: 20,
        top: 12,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        alignItems: 'center',
    },
    yearIconBg: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
        }),
    },
    yearName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        letterSpacing: -0.3,
    },
    currentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 8,
        gap: 6,
    },
    currentBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fbbf24',
    },
    badgesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 8,
    },
    stateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    stateBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
    editButton: {
        position: 'absolute',
        right: 20,
        top: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    editButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#fff',
    },
    // Summary Row
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        paddingHorizontal: 20,
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    summaryDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    // Body
    scrollView: {
        flex: 1,
    },
    bodyContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 16,
        letterSpacing: -0.2,
    },
    // Action Section
    actionSection: {
        marginBottom: 20,
    },
    startYearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10b981',
        paddingVertical: 14,
        borderRadius: 14,
        gap: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#10b981',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
        }),
    },
    startYearButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    finishYearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ef4444',
        paddingVertical: 14,
        borderRadius: 14,
        gap: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#ef4444',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
        }),
    },
    finishYearButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 28,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderLeftWidth: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
            },
        }),
    },
    statIconBg: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statContent: {
        flex: 1,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    statSubtitle: {
        fontSize: 11,
        color: Colors.textTertiary,
        marginTop: 2,
    },
    // Level Cards
    levelCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
            },
        }),
    },
    levelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 16,
    },
    levelIconBg: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    levelHeaderText: {
        flex: 1,
    },
    levelTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.2,
    },
    levelSubtitle: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginTop: 2,
    },
    levelStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        paddingVertical: 14,
        marginBottom: 14,
    },
    levelStat: {
        alignItems: 'center',
        flex: 1,
    },
    levelStatValue: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginTop: 4,
    },
    levelStatLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.textTertiary,
        marginTop: 2,
    },
    levelStatDivider: {
        width: 1,
        backgroundColor: Colors.border,
    },
    // Progress
    progressSection: {
        marginTop: 4,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    progressPercent: {
        fontSize: 14,
        fontWeight: '800',
    },
    progressTrack: {
        height: 8,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    // Config Card
    configCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 4,
        marginBottom: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
            },
        }),
    },
    configRow: {
        padding: 14,
    },
    configItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    configIconBg: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    configText: {
        flex: 1,
    },
    configLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    configValue: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.textSecondary,
        marginTop: 2,
    },
    configDivider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginHorizontal: 14,
    },
    // Evaluation Stats Styles
    evalStatsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
            },
        }),
    },
    evalStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    evalStatItem: {
        alignItems: 'center',
        flex: 1,
    },
    evalStatIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    evalStatValue: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.textPrimary,
    },
    evalStatLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.textTertiary,
        marginTop: 2,
    },
    evalByLevelRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        paddingVertical: 12,
    },
    evalByLevelItem: {
        alignItems: 'center',
        flex: 1,
    },
    evalByLevelValue: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginTop: 4,
    },
    evalByLevelLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: Colors.textTertiary,
        marginTop: 2,
    },
    // Recent Evaluations Styles
    recentEvalsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 4,
        marginBottom: 14,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
            },
        }),
    },
    recentEvalItem: {
        padding: 14,
    },
    recentEvalItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    recentEvalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    recentEvalName: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textPrimary,
        flex: 1,
        marginRight: 8,
    },
    recentEvalState: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    recentEvalStateText: {
        fontSize: 11,
        fontWeight: '700',
    },
    recentEvalDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    recentEvalDetail: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
});
