import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { EmptyState } from '../../../../components/list';
import { showAlert } from '../../../../components/showAlert';
import Colors from '../../../../constants/Colors';
import { useSchoolYears } from '../../../../hooks';
import type { SchoolYear } from '../../../../services-odoo/yearService';

// ============ COMPONENTES ============

interface SchoolYearCardProps {
    year: SchoolYear;
    index: number;
    onEdit: () => void;
    isOfflineMode: boolean;
}

const SchoolYearCard: React.FC<SchoolYearCardProps> = ({ year, index, onEdit, isOfflineMode }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            delay: index * 80,
            tension: 100,
            friction: 10,
            useNativeDriver: true,
        }).start();
    }, [index, scaleAnim]);

    return (
        <Animated.View
            style={[
                styles.card,
                {
                    transform: [{ scale: scaleAnim }],
                    opacity: scaleAnim,
                },
            ]}
        >
            <TouchableOpacity
                style={styles.cardContent}
                onPress={onEdit}
                activeOpacity={0.7}
                disabled={isOfflineMode}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.cardIconContainer}>
                        <Ionicons name="calendar" size={24} color={Colors.primary} />
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>{year.name}</Text>
                        {year.current && (
                            <View style={styles.currentBadge}>
                                <Ionicons name="checkmark-circle" size={14} color="#fff" />
                                <Text style={styles.currentBadgeText}>Año Actual</Text>
                            </View>
                        )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
                </View>

                <View style={styles.cardStats}>
                    <View style={styles.statItem}>
                        <Ionicons name="people" size={16} color={Colors.textSecondary} />
                        <Text style={styles.statText}>{year.totalStudentsCount || 0} estudiantes</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="grid" size={16} color={Colors.textSecondary} />
                        <Text style={styles.statText}>{year.totalSectionsCount || 0} secciones</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="school" size={16} color={Colors.textSecondary} />
                        <Text style={styles.statText}>{year.totalProfessorsCount || 0} profesores</Text>
                    </View>
                </View>

                {year.evalutionTypeSecundary && (
                    <View style={styles.evaluationInfo}>
                        <Text style={styles.evaluationLabel}>Tipo evaluación secundaria:</Text>
                        <Text style={styles.evaluationValue}>{year.evalutionTypeSecundary.name}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const SchoolYearCardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const shimmer = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        shimmer.start();
        return () => shimmer.stop();
    }, [shimmerAnim]);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <Animated.View key={i} style={[styles.card, { opacity }]}>
                    <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.cardIconContainer, styles.skeletonBg]} />
                            <View style={styles.cardInfo}>
                                <View style={[styles.skeletonLine, { width: 120, height: 18 }]} />
                                <View style={[styles.skeletonLine, { width: 80, height: 14, marginTop: 6 }]} />
                            </View>
                        </View>
                        <View style={styles.cardStats}>
                            <View style={[styles.skeletonLine, { width: 100, height: 14 }]} />
                            <View style={[styles.skeletonLine, { width: 80, height: 14 }]} />
                            <View style={[styles.skeletonLine, { width: 90, height: 14 }]} />
                        </View>
                    </View>
                </Animated.View>
            ))}
        </>
    );
};

const StatsCard: React.FC<{ total: number; currentYear: string | null }> = ({ total, currentYear }) => (
    <View style={styles.statsCard}>
        <View style={styles.statsRow}>
            <View style={styles.statBox}>
                <Text style={styles.statNumber}>{total}</Text>
                <Text style={styles.statLabel}>Total Años</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
                <Text style={styles.statNumber}>{currentYear || '-'}</Text>
                <Text style={styles.statLabel}>Año Actual</Text>
            </View>
        </View>
    </View>
);

const SearchBar: React.FC<{
    value: string;
    onChangeText: (text: string) => void;
    onClear: () => void;
}> = ({ value, onChangeText, onClear }) => (
    <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textTertiary} />
        <View style={styles.searchInputContainer}>
            <input
                type="text"
                value={value}
                onChange={(e) => onChangeText(e.target.value)}
                placeholder="Buscar año escolar..."
                style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: 16,
                    backgroundColor: 'transparent',
                    color: Colors.textPrimary,
                    width: '100%',
                }}
            />
        </View>
        {value.length > 0 && (
            <TouchableOpacity onPress={onClear} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
        )}
    </View>
);

// ============ SCREEN PRINCIPAL ============

export default function SchoolYearsListScreen() {
    const {
        years,
        currentYear,
        loading,
        initialLoading,
        refreshing,
        searchQuery,
        searchMode,
        totalYears,
        isOfflineMode,
        setSearchQuery,
        exitSearchMode,
        onRefresh,
    } = useSchoolYears();

    const [selectedYear, setSelectedYear] = useState<SchoolYear | null>(null);

    // Estados para crossfade
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const [showSkeleton, setShowSkeleton] = useState(true);

    // Crossfade suave cuando hay datos
    useEffect(() => {
        if (!initialLoading && showSkeleton) {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setShowSkeleton(false);
                fadeAnim.setValue(0);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }).start();
            });
        }
    }, [initialLoading, showSkeleton, fadeAnim]);

    const handleEdit = (year: SchoolYear) => {
        if (isOfflineMode) {
            showAlert('Sin conexión', 'No puedes editar años escolares sin conexión a internet.');
            return;
        }
        setSelectedYear(year);
        // TODO: Abrir modal de edición o navegar a pantalla de edición
        router.push({
            pathname: '/admin/academic-management/school-year/register-school-year' as any,
            params: { yearId: year.id.toString() }
        });
    };

    return (
        <>
            <Head>
                <title>Años Escolares</title>
            </Head>
            <SafeAreaProvider>
                <StatusBar style="light" translucent />
                <View style={styles.container}>
                    <LinearGradient
                        colors={[Colors.primary, Colors.primaryDark]}
                        style={styles.header}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerTitle}>Años Escolares</Text>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.addButton,
                                (isOfflineMode || showSkeleton) && styles.disabledButton,
                            ]}
                            onPress={() => {
                                if (isOfflineMode) {
                                    showAlert('Sin conexión', 'No puedes crear años escolares sin conexión a internet.');
                                    return;
                                }
                                if (!showSkeleton) {
                                    router.push('/admin/academic-management/school-year/register-school-year' as any);
                                }
                            }}
                            disabled={isOfflineMode || showSkeleton}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="add" size={24} color={(isOfflineMode || showSkeleton) ? '#9ca3af' : '#fff'} />
                        </TouchableOpacity>
                    </LinearGradient>

                    <View style={styles.content}>
                        {showSkeleton ? (
                            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                                <View style={styles.statsCard}>
                                    <View style={styles.statsRow}>
                                        <View style={[styles.skeletonLine, { width: 60, height: 30 }]} />
                                        <View style={[styles.skeletonLine, { width: 100, height: 30 }]} />
                                    </View>
                                </View>
                                <View style={[styles.searchContainer, { opacity: 0.5 }]}>
                                    <View style={[styles.skeletonLine, { width: '100%', height: 20 }]} />
                                </View>
                                <ScrollView
                                    style={styles.listContainer}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={styles.listContent}
                                >
                                    <SchoolYearCardSkeleton count={4} />
                                </ScrollView>
                            </Animated.View>
                        ) : (
                            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                                {isOfflineMode && (
                                    <View style={styles.offlineBanner}>
                                        <Ionicons name="cloud-offline" size={20} color="#fff" />
                                        <Text style={styles.offlineText}>
                                            Sin conexión • Mostrando datos guardados
                                        </Text>
                                    </View>
                                )}

                                {!searchMode && (
                                    <StatsCard
                                        total={totalYears}
                                        currentYear={currentYear?.name || null}
                                    />
                                )}

                                <SearchBar
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    onClear={exitSearchMode}
                                />

                                <ScrollView
                                    style={styles.listContainer}
                                    showsVerticalScrollIndicator={false}
                                    removeClippedSubviews={true}
                                    contentContainerStyle={styles.listContent}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing}
                                            onRefresh={onRefresh}
                                            colors={[Colors.primary]}
                                            tintColor={Colors.primary}
                                            title="Actualizando..."
                                            titleColor={Colors.textSecondary}
                                        />
                                    }
                                >
                                    {years.length === 0 ? (
                                        loading ? (
                                            <SchoolYearCardSkeleton count={4} />
                                        ) : isOfflineMode ? (
                                            <View style={styles.emptyContainer}>
                                                <View style={styles.emptyIconContainer}>
                                                    <Ionicons name="cloud-offline-outline" size={64} color={Colors.textTertiary} />
                                                </View>
                                                <Text style={styles.emptyTitle}>Sin conexión</Text>
                                                <Text style={styles.emptyText}>
                                                    No hay datos guardados. Conecta a internet para cargar años escolares.
                                                </Text>
                                            </View>
                                        ) : searchMode && searchQuery.trim().length < 2 ? (
                                            <View style={styles.emptyContainer}>
                                                <View style={styles.emptyIconContainer}>
                                                    <Ionicons name="search-outline" size={64} color={Colors.textTertiary} />
                                                </View>
                                                <Text style={styles.emptyTitle}>Escribe para buscar</Text>
                                                <Text style={styles.emptyText}>
                                                    Ingresa al menos 2 caracteres para comenzar
                                                </Text>
                                            </View>
                                        ) : (
                                            <EmptyState
                                                hasSearchQuery={searchMode && searchQuery.trim().length >= 2}
                                                entityName="años escolares"
                                            />
                                        )
                                    ) : (
                                        years.map((year, index) => (
                                            <SchoolYearCard
                                                key={year.id}
                                                year={year}
                                                index={index}
                                                onEdit={() => handleEdit(year)}
                                                isOfflineMode={isOfflineMode}
                                            />
                                        ))
                                    )}
                                    <View style={{ height: 120 }} />
                                </ScrollView>
                            </Animated.View>
                        )}
                    </View>
                </View>
            </SafeAreaProvider>
        </>
    );
}

// ============ ESTILOS ============

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? 60 : 70,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            }
        }),
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.3,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    offlineBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f59e0b',
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 16,
        marginBottom: 20,
        gap: 10,
    },
    offlineText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
        flex: 1,
        letterSpacing: 0.2,
    },
    statsCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.primary,
        letterSpacing: -0.5,
    },
    statLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: '600',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: Colors.border,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 16,
        gap: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    searchInputContainer: {
        flex: 1,
    },
    clearButton: {
        padding: 4,
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 14,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    cardContent: {
        padding: 18,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    cardIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: `${Colors.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.textPrimary,
        letterSpacing: -0.3,
    },
    currentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.success,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        gap: 4,
        marginTop: 6,
        alignSelf: 'flex-start',
    },
    currentBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
    cardStats: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    evaluationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    evaluationLabel: {
        fontSize: 12,
        color: Colors.textTertiary,
        fontWeight: '500',
    },
    evaluationValue: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.backgroundTertiary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 12,
        letterSpacing: -0.3,
    },
    emptyText: {
        fontSize: 15,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '500',
    },
    skeletonBg: {
        backgroundColor: Colors.backgroundTertiary,
    },
    skeletonLine: {
        backgroundColor: Colors.backgroundTertiary,
        borderRadius: 6,
    },
});
