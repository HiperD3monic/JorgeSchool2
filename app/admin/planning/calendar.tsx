/**
 * Vista de Calendario
 * Calendario mensual con eventos programados
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

import { CalendarMonthView, ScheduleCard } from '../../../components/timetable';
import Colors from '../../../constants/Colors';
import { useAuth } from '../../../contexts/AuthContext';
import type { Schedule } from '../../../services-odoo/scheduleService';
import { getMonthName } from '../../../utils/timetableHelpers';

export default function CalendarScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [daySchedules, setDaySchedules] = useState<Schedule[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);

    const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

    const handleSelectDate = async (date: Date) => {
        setSelectedDate(date);
        // TODO: Cargar horarios del día seleccionado
        // Por ahora, mostrar estado vacío
        setDaySchedules([]);
    };

    const handleMonthChange = (year: number, month: number) => {
        setCurrentYear(year);
        setCurrentMonth(month);
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        // TODO: Recargar datos
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setRefreshing(false);
    }, []);

    // Formatear fecha seleccionada
    const formatSelectedDate = () => {
        const day = selectedDate.getDate();
        const month = getMonthName(selectedDate.getMonth());
        const year = selectedDate.getFullYear();
        return `${day} de ${month} de ${year}`;
    };

    // Obtener día de la semana
    const getDayOfWeek = () => {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return days[selectedDate.getDay()];
    };

    return (
        <SafeAreaProvider>
            <StatusBar style="light" />
            <Head><title>Calendario</title></Head>

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
                            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </TouchableOpacity>
                            <View style={styles.headerCenter}>
                                <Text style={styles.title}>Calendario</Text>
                                <Text style={styles.subtitle}>
                                    {getMonthName(currentMonth)} {currentYear}
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.menuBtn} onPress={openDrawer}>
                                <Ionicons name="menu" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>

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
                    {/* Calendario mensual */}
                    <View style={styles.calendarContainer}>
                        <CalendarMonthView
                            year={currentYear}
                            month={currentMonth}
                            selectedDate={selectedDate}
                            onSelectDate={handleSelectDate}
                            onMonthChange={handleMonthChange}
                        />
                    </View>

                    {/* Información del día seleccionado */}
                    <View style={styles.selectedDaySection}>
                        <View style={styles.selectedDayHeader}>
                            <View style={styles.selectedDayInfo}>
                                <Text style={styles.selectedDayName}>{getDayOfWeek()}</Text>
                                <Text style={styles.selectedDayDate}>{formatSelectedDate()}</Text>
                            </View>
                            {/* <TouchableOpacity style={styles.addEventBtn}>
                                <Ionicons name="add" size={20} color={Colors.primary} />
                                <Text style={styles.addEventText}>Agregar</Text>
                            </TouchableOpacity> */}
                        </View>

                        {/* Lista de horarios/eventos del día */}
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <Text style={styles.loadingText}>Cargando...</Text>
                            </View>
                        ) : daySchedules.length > 0 ? (
                            <View style={styles.schedulesList}>
                                {daySchedules.map((schedule) => (
                                    <ScheduleCard
                                        key={schedule.id}
                                        schedule={schedule}
                                        compact
                                    />
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyDay}>
                                <Ionicons
                                    name="calendar-outline"
                                    size={48}
                                    color={Colors.textTertiary}
                                />
                                <Text style={styles.emptyTitle}>Sin actividades</Text>
                                <Text style={styles.emptyText}>
                                    No hay clases ni eventos programados para este día
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Leyenda */}
                    <View style={styles.legend}>
                        <Text style={styles.legendTitle}>Información</Text>
                        <Text style={styles.legendText}>
                            • Toca un día para ver sus actividades{'\n'}
                            • Usa las flechas para navegar entre meses{'\n'}
                            • Toca el nombre del mes para ir a hoy
                        </Text>
                    </View>
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
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
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
    content: {
        flex: 1,
    },
    // Calendar
    calendarContainer: {
        padding: 16,
    },
    // Selected day
    selectedDaySection: {
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    selectedDayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    selectedDayInfo: {},
    selectedDayName: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    selectedDayDate: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    addEventBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: Colors.primary + '10',
        gap: 6,
    },
    addEventText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.primary,
    },
    schedulesList: {
        gap: 8,
    },
    loadingContainer: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    emptyDay: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginTop: 12,
    },
    emptyText: {
        fontSize: 13,
        color: Colors.textTertiary,
        textAlign: 'center',
        marginTop: 4,
    },
    // Legend
    legend: {
        margin: 16,
        padding: 16,
        backgroundColor: Colors.info + '10',
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: Colors.info,
    },
    legendTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.info,
        marginBottom: 8,
    },
    legendText: {
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
});
