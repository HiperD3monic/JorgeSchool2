/**
 * Vista principal de Planificación
 * Muestra las 3 tarjetillas principales con navegación
 */

import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
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

import { CalendarMonthView, TimetableTabSelector, type PlanningTab } from '../../../components/timetable';
import Colors from '../../../constants/Colors';
import { useAuth } from '../../../contexts/AuthContext';

export default function PlanningIndex() {
    const { user } = useAuth();
    const navigation = useNavigation();

    const [activeTab, setActiveTab] = useState<PlanningTab>('calendar');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

    const handleTabChange = (tab: PlanningTab) => {
        setActiveTab(tab);

        // Navegar a la ruta correspondiente
        switch (tab) {
            case 'calendar':
                // Quedarse aquí o ir a calendar.tsx
                break;
            case 'timetables':
                router.push('/admin/planning/timetables');
                break;
            case 'timeSlots':
                router.push('/admin/planning/time-slots');
                break;
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        // TODO: Recargar datos
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setRefreshing(false);
    }, []);

    const handleSelectDate = (date: Date) => {
        setSelectedDate(date);
        // TODO: Cargar eventos del día seleccionado
    };

    // Obtener fecha formateada
    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-VE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

    return (
        <SafeAreaProvider>
            <StatusBar style="light" />
            <Head><title>Planificación</title></Head>

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
                                <Text style={styles.title}>Planificación</Text>
                                <Text style={styles.subtitle}>{formattedDate}</Text>
                            </View>
                            <View style={styles.placeholder} />
                        </View>
                    </View>
                </LinearGradient>

                {/* Tab Selector */}
                <TimetableTabSelector
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
                    {/* Vista de Calendario */}
                    {activeTab === 'calendar' && (
                        <View style={styles.calendarContainer}>
                            <CalendarMonthView
                                selectedDate={selectedDate}
                                onSelectDate={handleSelectDate}
                            />

                            {/* Eventos del día seleccionado */}
                            <View style={styles.dayEventsSection}>
                                <Text style={styles.sectionTitle}>
                                    Eventos del {selectedDate.getDate()} de{' '}
                                    {selectedDate.toLocaleDateString('es-VE', { month: 'long' })}
                                </Text>
                                <View style={styles.emptyEvents}>
                                    <Ionicons
                                        name="calendar-outline"
                                        size={40}
                                        color={Colors.textTertiary}
                                    />
                                    <Text style={styles.emptyText}>
                                        No hay eventos programados para este día
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Accesos rápidos para otras pestañas */}
                    {activeTab === 'timetables' && (
                        <View style={styles.quickAccess}>
                            <Ionicons name="time-outline" size={64} color={Colors.textTertiary} />
                            <Text style={styles.quickAccessTitle}>Horarios de Clase</Text>
                            <Text style={styles.quickAccessText}>
                                Visualiza y gestiona los horarios de todas las secciones
                            </Text>
                            <TouchableOpacity
                                style={styles.quickAccessBtn}
                                onPress={() => router.push('/admin/planning/timetables')}
                            >
                                <Text style={styles.quickAccessBtnText}>Ver Horarios</Text>
                                <Ionicons name="arrow-forward" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {activeTab === 'timeSlots' && (
                        <View style={styles.quickAccess}>
                            <Ionicons name="layers-outline" size={64} color={Colors.textTertiary} />
                            <Text style={styles.quickAccessTitle}>Bloques Horarios</Text>
                            <Text style={styles.quickAccessText}>
                                Configura los períodos y recreos del día escolar
                            </Text>
                            <TouchableOpacity
                                style={styles.quickAccessBtn}
                                onPress={() => router.push('/admin/planning/time-slots')}
                            >
                                <Text style={styles.quickAccessBtnText}>Ver Bloques</Text>
                                <Ionicons name="arrow-forward" size={18} color="#fff" />
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
        textTransform: 'capitalize',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    // Calendar
    calendarContainer: {
        padding: 16,
    },
    dayEventsSection: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 12,
    },
    emptyEvents: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 12,
        textAlign: 'center',
    },
    // Quick access
    quickAccess: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 32,
    },
    quickAccessTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginTop: 16,
    },
    quickAccessText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    quickAccessBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 24,
        gap: 8,
    },
    quickAccessBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
