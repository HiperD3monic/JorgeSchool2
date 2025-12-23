/**
 * Vista de Bloques Horarios (Time Slots)
 * Gestión de períodos académicos y recreos
 */

import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TimeSlotList } from '../../../components/timetable';
import Colors from '../../../constants/Colors';
import { useAuth } from '../../../contexts/AuthContext';
import {
    deleteTimeSlot,
    EDUCATION_LEVEL_LABELS,
    loadTimeSlots,
    type EducationLevel,
    type TimeSlot,
} from '../../../services-odoo/scheduleService';

type FilterLevel = EducationLevel | 'all';

export default function TimeSlotsScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();

    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filterLevel, setFilterLevel] = useState<FilterLevel>('all');

    const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

    // Cargar bloques al montar
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async (forceRefresh: boolean = false) => {
        setLoading(true);
        try {
            const result = await loadTimeSlots({ active: true }, forceRefresh);
            if (result.success && result.data) {
                setTimeSlots(result.data);
            }
        } catch (error) {
            console.error('Error loading time slots:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData(true);
        setRefreshing(false);
    }, []);

    // Filtrar por nivel educativo
    const filteredTimeSlots = React.useMemo(() => {
        if (filterLevel === 'all') {
            return timeSlots;
        }
        return timeSlots.filter((slot) => slot.educationLevel === filterLevel);
    }, [timeSlots, filterLevel]);

    // Contar por tipo
    const counts = React.useMemo(() => {
        const result: Record<string, number> = {
            all: timeSlots.length,
            pre: 0,
            primary: 0,
            secundary: 0,
        };
        timeSlots.forEach((slot) => {
            result[slot.educationLevel]++;
        });
        return result;
    }, [timeSlots]);

    const handlePressTimeSlot = (timeSlot: TimeSlot) => {
        // TODO: Mostrar modal de detalle
        Alert.alert(
            timeSlot.name,
            `Horario: ${timeSlot.timeRange}\nDuración: ${timeSlot.durationMinutes} minutos\nTipo: ${timeSlot.isBreak ? 'Recreo' : 'Clase'}`,
            [{ text: 'Cerrar' }]
        );
    };

    const handleDeleteTimeSlot = async (timeSlot: TimeSlot) => {
        Alert.alert(
            'Eliminar Bloque',
            `¿Estás seguro de eliminar el bloque "${timeSlot.name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await deleteTimeSlot(timeSlot.id);
                        if (result.success) {
                            Alert.alert('Éxito', 'Bloque eliminado correctamente');
                            loadData(true);
                        } else {
                            Alert.alert('Error', result.message || 'No se pudo eliminar el bloque');
                        }
                    },
                },
            ]
        );
    };

    const filterOptions: { key: FilterLevel; label: string }[] = [
        { key: 'all', label: 'Todos' },
        { key: 'pre', label: 'Preescolar' },
        { key: 'primary', label: 'Primaria' },
        { key: 'secundary', label: 'Media General' },
    ];

    return (
        <SafeAreaProvider>
            <StatusBar style="light" />
            <Head><title>Bloques Horarios</title></Head>

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
                                <Text style={styles.title}>Bloques Horarios</Text>
                                <Text style={styles.subtitle}>{timeSlots.length} bloques configurados</Text>
                            </View>
                            <TouchableOpacity style={styles.menuBtn} onPress={openDrawer}>
                                <Ionicons name="menu" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>

                {/* Filtros */}
                <View style={styles.filtersContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filtersContent}
                    >
                        {filterOptions.map((option) => (
                            <TouchableOpacity
                                key={option.key}
                                style={[
                                    styles.filterBtn,
                                    filterLevel === option.key && styles.filterBtnActive,
                                ]}
                                onPress={() => setFilterLevel(option.key)}
                            >
                                <Text
                                    style={[
                                        styles.filterText,
                                        filterLevel === option.key && styles.filterTextActive,
                                    ]}
                                >
                                    {option.label}
                                </Text>
                                <View
                                    style={[
                                        styles.filterBadge,
                                        filterLevel === option.key && styles.filterBadgeActive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.filterBadgeText,
                                            filterLevel === option.key && styles.filterBadgeTextActive,
                                        ]}
                                    >
                                        {counts[option.key]}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Lista de bloques */}
                <View style={styles.content}>
                    <TimeSlotList
                        timeSlots={filteredTimeSlots}
                        loading={loading}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        onPressTimeSlot={handlePressTimeSlot}
                        onDeleteTimeSlot={user?.role === 'admin' ? handleDeleteTimeSlot : undefined}
                        showActions={user?.role === 'admin'}
                        emptyMessage={
                            filterLevel === 'all'
                                ? 'No hay bloques horarios configurados'
                                : `No hay bloques para ${EDUCATION_LEVEL_LABELS[filterLevel as EducationLevel]}`
                        }
                        groupByLevel={filterLevel === 'all'}
                    />
                </View>

                {/* FAB para agregar (solo admin) */}
                {user?.role === 'admin' && (
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => {
                            // TODO: Abrir modal de creación
                            Alert.alert('Próximamente', 'La creación de bloques se implementará próximamente');
                        }}
                    >
                        <Ionicons name="add" size={28} color="#fff" />
                    </TouchableOpacity>
                )}
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
    // Filters
    filtersContainer: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    filtersContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.backgroundTertiary,
        marginRight: 8,
        gap: 6,
    },
    filterBtnActive: {
        backgroundColor: Colors.primary + '15',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.textSecondary,
    },
    filterTextActive: {
        color: Colors.primary,
        fontWeight: '600',
    },
    filterBadge: {
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: Colors.gray[300],
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    filterBadgeActive: {
        backgroundColor: Colors.primary,
    },
    filterBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    filterBadgeTextActive: {
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    // FAB
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
