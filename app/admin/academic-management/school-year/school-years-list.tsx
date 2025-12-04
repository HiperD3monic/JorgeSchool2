import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { EmptyState, SearchBar } from '../../../../components/list';
import {
    EditSchoolYearModal,
    SchoolYearCard,
    SchoolYearCardSkeleton,
    SchoolYearSearchBarSkeleton,
    SchoolYearStatsCard,
    SchoolYearStatsCardSkeleton,
    ViewSchoolYearModal,
} from '../../../../components/school-year';
import { showAlert } from '../../../../components/showAlert';
import Colors from '../../../../constants/Colors';
import { useSchoolYears } from '../../../../hooks';
import type { SchoolYear } from '../../../../services-odoo/yearService';

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

    // Estados para modales
    const [selectedYear, setSelectedYear] = useState<SchoolYear | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

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

    const handleViewYear = (year: SchoolYear) => {
        setSelectedYear(year);
        setShowViewModal(true);
    };

    const handleEditYear = () => {
        if (isOfflineMode) {
            showAlert('Sin conexión', 'No puedes editar años escolares sin conexión a internet.');
            return;
        }
        setShowViewModal(false);
        setTimeout(() => {
            setShowEditModal(true);
        }, 200);
    };

    const handleEditFromCard = (year: SchoolYear) => {
        if (isOfflineMode) {
            showAlert('Sin conexión', 'No puedes editar años escolares sin conexión a internet.');
            return;
        }
        setSelectedYear(year);
        setShowEditModal(true);
    };

    const handleSaveSuccess = () => {
        setShowEditModal(false);
        setSelectedYear(null);
        onRefresh();
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
                                <SchoolYearStatsCardSkeleton />
                                <SchoolYearSearchBarSkeleton />
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
                                    <SchoolYearStatsCard
                                        total={totalYears}
                                        currentYear={currentYear?.name || null}
                                    />
                                )}

                                <SearchBar
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    placeholder="Buscar año escolar..."
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
                                                onPress={() => handleViewYear(year)}
                                                onEdit={() => handleEditFromCard(year)}
                                                isOfflineMode={isOfflineMode}
                                            />
                                        ))
                                    )}
                                    <View style={{ height: 120 }} />
                                </ScrollView>
                            </Animated.View>
                        )}
                    </View>

                    {/* Modales */}
                    <ViewSchoolYearModal
                        visible={showViewModal}
                        year={selectedYear}
                        onClose={() => setShowViewModal(false)}
                        onEdit={handleEditYear}
                    />

                    <EditSchoolYearModal
                        visible={showEditModal}
                        year={selectedYear}
                        onClose={() => setShowEditModal(false)}
                        onSave={handleSaveSuccess}
                    />
                </View>
            </SafeAreaProvider>
        </>
    );
}

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
            },
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
        marginBottom: 16,
        gap: 10,
    },
    offlineText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
        flex: 1,
        letterSpacing: 0.2,
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 20,
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
});
