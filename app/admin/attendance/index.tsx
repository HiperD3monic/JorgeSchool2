/**
 * Vista principal de Asistencias
 * Muestra las 4 tarjetillas y contenido según tab seleccionado
 */

import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
    AttendanceList,
    AttendanceStats,
    AttendanceTab,
    AttendanceTabSelector,
} from '../../../components/attendance';
import Colors from '../../../constants/Colors';
import { useAuth } from '../../../contexts/AuthContext';
import {
    AttendanceRecord,
    AttendanceStats as AttendanceStatsType,
    getAttendanceStats,
    loadAttendanceRecords,
    loadEmployeeAttendance,
    loadStudentAttendance,
} from '../../../services-odoo/attendanceService';

export default function AttendanceIndex() {
    const { user } = useAuth();
    const navigation = useNavigation();

    const [activeTab, setActiveTab] = useState<AttendanceTab>('register');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [stats, setStats] = useState<AttendanceStatsType>({
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        permission: 0,
        attendanceRate: 0,
    });

    // Fecha de hoy
    const today = new Date().toISOString().split('T')[0];

    // Cargar datos según tab
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            let result;

            switch (activeTab) {
                case 'students':
                    result = await loadStudentAttendance({ dateFrom: today, dateTo: today });
                    break;
                case 'staff':
                    result = await loadEmployeeAttendance({ dateFrom: today, dateTo: today });
                    break;
                case 'all':
                    result = await loadAttendanceRecords({ dateFrom: today, dateTo: today });
                    break;
                default:
                    // Tab de registro no carga lista
                    setLoading(false);
                    return;
            }

            if (result.success && result.data) {
                setRecords(result.data.records);
            }

            // Cargar estadísticas
            const statsResult = await getAttendanceStats({ dateFrom: today, dateTo: today });
            if (statsResult.success && statsResult.data) {
                setStats(statsResult.data);
            }
        } catch {
            // Error silenciado
        } finally {
            setLoading(false);
        }
    }, [activeTab, today]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

    const handleTabChange = (tab: AttendanceTab) => {
        setActiveTab(tab);
        if (tab === 'register') {
            router.push('/admin/attendance/register');
        }
    };

    const handlePressRecord = (record: AttendanceRecord) => {
        // TODO: Navegar a detalle del registro
        console.log('Press record:', record.id);
    };

    return (
        <SafeAreaProvider>
            <StatusBar style="light" />
            <Head><title>Asistencias</title></Head>

            <View style={styles.container}>
                {/* Header */}
                <LinearGradient
                    colors={[Colors.primary, '#1e3a8a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.headerTop}>
                            <TouchableOpacity style={styles.menuBtn} onPress={openDrawer}>
                                <Ionicons name="menu" size={24} color="#fff" />
                            </TouchableOpacity>
                            <View style={styles.headerCenter}>
                                <Text style={styles.title}>Asistencias</Text>
                                <Text style={styles.subtitle}>{today}</Text>
                            </View>
                            <View style={styles.placeholder} />
                        </View>
                    </View>
                </LinearGradient>

                {/* Tab Selector */}
                <AttendanceTabSelector
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                />

                {/* Content */}
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.primary]}
                            tintColor={Colors.primary}
                        />
                    }
                >
                    {/* Estadísticas (siempre visibles) */}
                    <View style={styles.statsContainer}>
                        <AttendanceStats stats={stats} loading={loading} />
                    </View>

                    {/* Lista de registros (no para tab registro) */}
                    {activeTab !== 'register' && (
                        <AttendanceList
                            records={records}
                            loading={loading}
                            onPressRecord={handlePressRecord}
                            emptyMessage={
                                activeTab === 'students'
                                    ? 'No hay registros de estudiantes para hoy'
                                    : activeTab === 'staff'
                                        ? 'No hay registros de personal para hoy'
                                        : 'No hay registros para hoy'
                            }
                        />
                    )}

                    {/* Mensaje para tab registro */}
                    {activeTab === 'register' && !loading && (
                        <View style={styles.registerPrompt}>
                            <Ionicons name="checkbox-outline" size={48} color={Colors.primary} />
                            <Text style={styles.registerTitle}>Registro Rápido</Text>
                            <Text style={styles.registerText}>
                                Selecciona una sección y horario para registrar asistencia
                            </Text>
                            <TouchableOpacity
                                style={styles.registerBtn}
                                onPress={() => router.push('/admin/attendance/register')}
                            >
                                <Ionicons name="add-circle" size={20} color="#fff" />
                                <Text style={styles.registerBtnText}>Nuevo Registro</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </View>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundSecondary,
    },
    header: {
        paddingTop: Platform.OS === 'android' ? 44 : 54,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        paddingHorizontal: 20,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    menuBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    subtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    statsContainer: {
        padding: 16,
    },
    registerPrompt: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 32,
    },
    registerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginTop: 16,
    },
    registerText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    registerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 24,
        gap: 8,
    },
    registerBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
