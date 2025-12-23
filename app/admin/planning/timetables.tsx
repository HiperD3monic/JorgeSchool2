/**
 * Vista de Horarios de Clase (Timetables)
 * Grid semanal con selector de sección
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
    SectionSelector,
    TimetableGrid,
    type SectionOption,
} from '../../../components/timetable';
import Colors from '../../../constants/Colors';
import { useAuth } from '../../../contexts/AuthContext';
import {
    loadTimeSlotsForLevel,
    loadWeeklySchedule,
    type TimeSlot,
    type WeeklySchedule,
} from '../../../services-odoo/scheduleService';
import { loadSections, type Section } from '../../../services-odoo/sectionService';

export default function TimetablesScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();

    const [sections, setSections] = useState<SectionOption[]>([]);
    const [selectedSection, setSelectedSection] = useState<SectionOption | undefined>();
    const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule | undefined>();
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingSections, setLoadingSections] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

    // Cargar secciones al montar
    useEffect(() => {
        loadSectionsData();
    }, []);

    // Cargar horario cuando cambia la sección
    useEffect(() => {
        if (selectedSection) {
            loadScheduleData(selectedSection.id, selectedSection.type);
        }
    }, [selectedSection]);

    const loadSectionsData = async () => {
        setLoadingSections(true);
        try {
            const sectionsData = await loadSections();
            const sectionOptions: SectionOption[] = sectionsData.map((s: Section) => ({
                id: s.id,
                name: s.name,
                type: s.type,
            }));
            setSections(sectionOptions);
        } catch (error) {
            console.error('Error loading sections:', error);
        } finally {
            setLoadingSections(false);
        }
    };

    const loadScheduleData = async (sectionId: number, educationLevel: SectionOption['type']) => {
        setLoading(true);
        try {
            // Cargar horario semanal
            const scheduleResult = await loadWeeklySchedule(sectionId);
            if (scheduleResult.success && scheduleResult.data) {
                setWeeklySchedule(scheduleResult.data);
            }

            // Cargar bloques horarios del nivel
            const slotsResult = await loadTimeSlotsForLevel(educationLevel);
            if (slotsResult.success && slotsResult.data) {
                setTimeSlots(slotsResult.data);
            }
        } catch (error) {
            console.error('Error loading schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSection = (section: SectionOption) => {
        setSelectedSection(section);
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        if (selectedSection) {
            await loadScheduleData(selectedSection.id, selectedSection.type);
        }
        setRefreshing(false);
    }, [selectedSection]);

    return (
        <SafeAreaProvider>
            <StatusBar style="light" />
            <Head><title>Horarios de Clase</title></Head>

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
                                <Text style={styles.title}>Horarios de Clase</Text>
                                <Text style={styles.subtitle}>Vista semanal</Text>
                            </View>
                            <TouchableOpacity style={styles.menuBtn} onPress={openDrawer}>
                                <Ionicons name="menu" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>

                {/* Selector de sección */}
                <View style={styles.selectorContainer}>
                    <SectionSelector
                        sections={sections}
                        selectedSection={selectedSection}
                        onSelectSection={handleSelectSection}
                        loading={loadingSections}
                        placeholder="Seleccionar sección para ver horario"
                    />
                </View>

                {/* Grid de horarios */}
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
                    <TimetableGrid
                        weeklySchedule={weeklySchedule}
                        timeSlots={timeSlots}
                        loading={loading}
                        emptyMessage={
                            selectedSection
                                ? 'No hay horarios configurados para esta sección'
                                : 'Selecciona una sección para ver su horario'
                        }
                    />
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
    selectorContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    content: {
        flex: 1,
    },
});
