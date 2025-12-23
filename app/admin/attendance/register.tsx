/**
 * Pantalla de Registro Rápido de Asistencia
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { QuickRegisterForm } from '../../../components/attendance';
import { showAlert } from '../../../components/showAlert';
import Colors from '../../../constants/Colors';
import { searchRead } from '../../../services-odoo/apiService';
import * as sectionService from '../../../services-odoo/sectionService';

interface Section {
    id: number;
    name: string;
    type: string;
}

interface Schedule {
    id: number;
    name: string;
    subjectName?: string;
}

export default function RegisterAttendance() {
    const [step, setStep] = useState<'select' | 'register'>('select');
    const [loading, setLoading] = useState(true);
    const [sections, setSections] = useState<Section[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [selectedSection, setSelectedSection] = useState<Section | null>(null);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

    // Fecha de hoy
    const today = new Date().toISOString().split('T')[0];

    // Cargar secciones
    useEffect(() => {
        const loadSectionsData = async () => {
            setLoading(true);
            try {
                // loadSections devuelve Section[] directamente
                const sectionsData = await sectionService.loadSections();
                setSections(sectionsData);
            } catch {
                showAlert('Error', 'No se pudieron cargar las secciones');
            } finally {
                setLoading(false);
            }
        };
        loadSectionsData();
    }, []);

    // Cargar horarios cuando se selecciona sección
    const handleSelectSection = async (section: Section) => {
        setSelectedSection(section);
        setSelectedSchedule(null);
        setLoading(true);
        try {
            // Cargar horarios directamente con searchRead
            const result = await searchRead(
                'school.schedule',
                [['section_id', '=', section.id], ['active', '=', true]],
                ['id', 'display_name', 'subject_id'],
                100,
                0,
                'display_name asc'
            );

            if (result.success && result.data) {
                const schedulesData = result.data.map((s: any) => ({
                    id: s.id,
                    name: s.display_name || `Horario ${s.id}`,
                    subjectName: Array.isArray(s.subject_id) ? s.subject_id[1] : undefined,
                }));
                setSchedules(schedulesData);
            } else {
                setSchedules([]);
            }
        } catch {
            showAlert('Error', 'No se pudieron cargar los horarios');
        } finally {
            setLoading(false);
        }
    };

    // Seleccionar horario e ir a registro
    const handleSelectSchedule = (schedule: Schedule) => {
        setSelectedSchedule(schedule);
        setStep('register');
    };

    // Éxito en registro
    const handleSuccess = () => {
        router.back();
    };

    // Cancelar
    const handleCancel = () => {
        if (step === 'register') {
            setStep('select');
            setSelectedSchedule(null);
        } else {
            router.back();
        }
    };

    return (
        <SafeAreaProvider>
            <StatusBar style="dark" />
            <Head><title>Registro de Asistencia</title></Head>

            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={handleCancel}>
                        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>
                        {step === 'select' ? 'Seleccionar Clase' : 'Registrar Asistencia'}
                    </Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Step: Seleccionar sección y horario */}
                {step === 'select' && (
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={Colors.primary} />
                                <Text style={styles.loadingText}>Cargando...</Text>
                            </View>
                        ) : (
                            <>
                                {/* Secciones */}
                                <Text style={styles.sectionTitle}>
                                    {selectedSection ? 'Sección seleccionada' : 'Selecciona una sección'}
                                </Text>

                                {!selectedSection ? (
                                    <View style={styles.grid}>
                                        {sections.map((section) => (
                                            <TouchableOpacity
                                                key={section.id}
                                                style={styles.sectionCard}
                                                onPress={() => handleSelectSection(section)}
                                            >
                                                <Ionicons
                                                    name={
                                                        section.type === 'pre'
                                                            ? 'happy-outline'
                                                            : section.type === 'primary'
                                                                ? 'book-outline'
                                                                : 'school-outline'
                                                    }
                                                    size={28}
                                                    color={Colors.primary}
                                                />
                                                <Text style={styles.sectionName}>{section.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ) : (
                                    <>
                                        {/* Sección seleccionada */}
                                        <TouchableOpacity
                                            style={styles.selectedCard}
                                            onPress={() => {
                                                setSelectedSection(null);
                                                setSchedules([]);
                                            }}
                                        >
                                            <View style={styles.selectedInfo}>
                                                <Ionicons name="school-outline" size={24} color={Colors.primary} />
                                                <Text style={styles.selectedName}>{selectedSection.name}</Text>
                                            </View>
                                            <Ionicons name="close-circle" size={24} color={Colors.textTertiary} />
                                        </TouchableOpacity>

                                        {/* Horarios */}
                                        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
                                            Selecciona un horario
                                        </Text>

                                        {schedules.length === 0 ? (
                                            <View style={styles.emptyState}>
                                                <Ionicons name="calendar-outline" size={48} color={Colors.textTertiary} />
                                                <Text style={styles.emptyText}>No hay horarios activos</Text>
                                            </View>
                                        ) : (
                                            <View style={styles.scheduleList}>
                                                {schedules.map((schedule) => (
                                                    <TouchableOpacity
                                                        key={schedule.id}
                                                        style={styles.scheduleCard}
                                                        onPress={() => handleSelectSchedule(schedule)}
                                                    >
                                                        <Ionicons name="time-outline" size={20} color={Colors.primary} />
                                                        <View style={styles.scheduleInfo}>
                                                            <Text style={styles.scheduleName}>{schedule.name}</Text>
                                                            {schedule.subjectName && (
                                                                <Text style={styles.scheduleSubject}>{schedule.subjectName}</Text>
                                                            )}
                                                        </View>
                                                        <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </ScrollView>
                )}

                {/* Step: Formulario de registro */}
                {step === 'register' && selectedSection && selectedSchedule && (
                    <QuickRegisterForm
                        scheduleId={selectedSchedule.id}
                        scheduleName={selectedSchedule.name}
                        sectionId={selectedSection.id}
                        sectionName={selectedSection.name}
                        date={today}
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                )}
            </View>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? 44 : 54,
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    sectionCard: {
        width: '47%',
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 14,
        padding: 20,
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    sectionName: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    selectedCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.primary + '10',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.primary + '30',
    },
    selectedInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    selectedName: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.primary,
    },
    scheduleList: {
        gap: 10,
    },
    scheduleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 12,
        padding: 14,
        gap: 12,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    scheduleInfo: {
        flex: 1,
    },
    scheduleName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    scheduleSubject: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
});
