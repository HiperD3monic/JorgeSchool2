/**
 * School Year Dashboard Page - Dynamic Route
 * Displays a complete dashboard for a specific school year
 * Mirrors the main admin dashboard but for any year (historical or current)
 */
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Keyboard,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    AnimatedBadge,
    DashboardGeneralTab,
    EvaluationsTab,
    GlassButton,
    KPICard,
    LevelTab,
    ProfessorsTab,
    StudentsTab,
    TecnicoMedioTab
} from '../../../../components/dashboard';
import { DangerZone } from '../../../../components/list';
import { showAlert } from '../../../../components/showAlert';
import { Input } from '../../../../components/ui';
import Colors from '../../../../constants/Colors';
import type { DashboardData } from '../../../../services-odoo/dashboardService';
import { getSchoolYearDashboardById } from '../../../../services-odoo/dashboardService';
import type { EvaluationType } from '../../../../services-odoo/yearService';
import * as yearService from '../../../../services-odoo/yearService';

type DashboardTab = 'dashboard' | 'secundary' | 'tecnico' | 'primary' | 'pre' | 'students' | 'professors' | 'evaluations' | 'settings';

type LapsoFilter = 'all' | '1' | '2' | '3';

const LAPSO_OPTIONS: { id: LapsoFilter; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: '1', label: '1er Lapso' },
    { id: '2', label: '2do Lapso' },
    { id: '3', label: '3er Lapso' },
];

const DASHBOARD_TABS: { id: DashboardTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'dashboard', label: 'General', icon: 'grid-outline' },
    { id: 'settings', label: 'Configuración', icon: 'settings-outline' },
    { id: 'secundary', label: 'Media G.', icon: 'school-outline' },
    { id: 'tecnico', label: 'Técnico', icon: 'construct-outline' },
    { id: 'primary', label: 'Primaria', icon: 'book-outline' },
    { id: 'pre', label: 'Preescolar', icon: 'happy-outline' },
    { id: 'students', label: 'Estudiantes', icon: 'people-outline' },
    { id: 'professors', label: 'Profesores', icon: 'person-outline' },
    { id: 'evaluations', label: 'Evaluaciones', icon: 'clipboard-outline' },
];

const TabTransition = ({ children, activeTab }: { children: React.ReactNode, activeTab: string }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        opacity.setValue(0);
        translateY.setValue(20);
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 400, useNativeDriver: true })
        ]).start();
    }, [activeTab]);

    return <Animated.View style={{ opacity, transform: [{ translateY }], flex: 1 }}>{children}</Animated.View>;
};

// --- Settings Tab Component ---
interface SettingsTabProps {
    yearId: number;
    yearData: DashboardData;
    onSaveSuccess: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ yearId, yearData, onSaveSuccess }) => {
    const insets = useSafeAreaInsets();
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Form fields
    const [name, setName] = useState(yearData.schoolYear.name);
    const [nameError, setNameError] = useState('');
    const [evalTypeSecundary, setEvalTypeSecundary] = useState<number | null>(
        yearData.evaluationConfigs?.secundary?.id ?? null
    );
    const [evalTypePrimary, setEvalTypePrimary] = useState<number | null>(
        yearData.evaluationConfigs?.primary?.id ?? null
    );
    const [evalTypePree, setEvalTypePree] = useState<number | null>(
        yearData.evaluationConfigs?.pre?.id ?? null
    );
    const [current, setCurrent] = useState(yearData.schoolYear.current);

    // Options
    const [evalTypesSecundary, setEvalTypesSecundary] = useState<EvaluationType[]>([]);
    const [evalTypesPrimary, setEvalTypesPrimary] = useState<EvaluationType[]>([]);
    const [evalTypesPree, setEvalTypesPree] = useState<EvaluationType[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    // Original values for unsaved changes detection
    const originalValues = useMemo(() => ({
        name: yearData.schoolYear.name,
        evalTypeSecundary: yearData.evaluationConfigs?.secundary?.id ?? null,
        evalTypePrimary: yearData.evaluationConfigs?.primary?.id ?? null,
        evalTypePree: yearData.evaluationConfigs?.pre?.id ?? null,
        current: yearData.schoolYear.current,
    }), [yearData]);

    const hasUnsavedChanges = useMemo(() => {
        return (
            name !== originalValues.name ||
            evalTypeSecundary !== originalValues.evalTypeSecundary ||
            evalTypePrimary !== originalValues.evalTypePrimary ||
            evalTypePree !== originalValues.evalTypePree ||
            current !== originalValues.current
        );
    }, [name, evalTypeSecundary, evalTypePrimary, evalTypePree, current, originalValues]);

    useEffect(() => {
        loadEvalTypes();
    }, []);

    const loadEvalTypes = async () => {
        try {
            setLoadingOptions(true);
            const [secundary, primary, pree] = await Promise.all([
                yearService.loadEvaluationTypes('secundary'),
                yearService.loadEvaluationTypes('primary'),
                yearService.loadEvaluationTypes('pre'),
            ]);
            setEvalTypesSecundary(secundary);
            setEvalTypesPrimary(primary);
            setEvalTypesPree(pree);
        } catch (error) {
            console.error('Error loading evaluation types:', error);
        } finally {
            setLoadingOptions(false);
        }
    };

    const handleNameChange = (text: string) => {
        setName(text);
        if (nameError) setNameError('');
    };

    const validateForm = (): boolean => {
        let isValid = true;

        if (!name.trim() || name.trim().length < 4) {
            setNameError('El nombre debe tener al menos 4 caracteres');
            isValid = false;
        }

        if (!evalTypeSecundary || !evalTypePrimary || !evalTypePree) {
            showAlert('Error', 'Debes seleccionar todos los tipos de evaluación');
            isValid = false;
        }

        return isValid;
    };

    const handleSaveYear = async () => {
        if (!validateForm()) return;
        Keyboard.dismiss();

        setSaving(true);
        try {
            const data = {
                name: name.trim(),
                evalutionTypeSecundary: evalTypeSecundary!,
                evalutionTypePrimary: evalTypePrimary!,
                evalutionTypePree: evalTypePree!,
                current: current,
            };

            const result = await yearService.updateSchoolYear(yearId, data);

            if (result.success) {
                showAlert('Éxito', 'Año escolar actualizado correctamente');
                onSaveSuccess();
            } else {
                showAlert('Error', result.message || 'Ocurrió un error');
            }
        } catch (error: any) {
            console.error('Error saving year:', error);
            showAlert('Error', error.message || 'Ocurrió un error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteYear = async () => {
        const totalStudents = yearData.kpis.totalStudentsCount || 0;
        const totalSections = yearData.kpis.totalSectionsCount || 0;

        if (totalStudents > 0 || totalSections > 0) {
            showAlert(
                'No se puede eliminar',
                `Este año escolar tiene ${totalStudents} estudiantes y ${totalSections} secciones asociadas. Debes eliminarlos primero.`
            );
            return;
        }

        showAlert(
            'Eliminar Año Escolar',
            `¿Estás seguro de eliminar "${yearData.schoolYear.name}"? Esta acción no se puede deshacer.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            const result = await yearService.deleteSchoolYear(yearId);
                            if (result.success) {
                                showAlert('Éxito', 'Año escolar eliminado');
                                router.back();
                            } else {
                                showAlert('Error', result.message || 'Ocurrió un error');
                            }
                        } catch (error: any) {
                            console.error('Error deleting year:', error);
                            showAlert('Error', error.message || 'Ocurrió un error al eliminar');
                        } finally {
                            setDeleting(false);
                        }
                    },
                },
            ]
        );
    };

    const EvalTypeSelector = ({
        label,
        options,
        value,
        onChange,
        icon,
        color,
    }: {
        label: string;
        options: EvaluationType[];
        value: number | null;
        onChange: (id: number) => void;
        icon: keyof typeof Ionicons.glyphMap;
        color: string;
    }) => (
        <View style={styles.selectorContainer}>
            <View style={styles.selectorHeader}>
                <View style={[styles.selectorIcon, { backgroundColor: color + '15' }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                <Text style={styles.selectorLabel}>{label}</Text>
            </View>
            <View style={styles.optionsContainer}>
                {loadingOptions ? (
                    <View style={styles.emptyOptions}>
                        <ActivityIndicator size="small" color={Colors.primary} />
                        <Text style={styles.emptyOptionsText}>Cargando opciones...</Text>
                    </View>
                ) : (
                    options.map((type) => (
                        <TouchableOpacity
                            key={type.id}
                            style={[
                                styles.optionButton,
                                value === type.id && [styles.optionButtonActive, { borderColor: color, backgroundColor: color + '10' }],
                            ]}
                            onPress={() => onChange(type.id)}
                            activeOpacity={0.7}
                            disabled={saving}
                        >
                            {value === type.id && (
                                <Ionicons name="checkmark-circle" size={16} color={color} style={{ marginRight: 6 }} />
                            )}
                            <Text
                                style={[
                                    styles.optionText,
                                    value === type.id && [styles.optionTextActive, { color }],
                                ]}
                            >
                                {type.name}
                            </Text>
                        </TouchableOpacity>
                    ))
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.settingsContainer}>
            {/* Información Básica */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información Básica</Text>
                <View style={styles.card}>
                    <Input
                        label="Nombre del Año Escolar"
                        value={name}
                        onChangeText={handleNameChange}
                        placeholder="Ej: 2024-2025"
                        leftIcon="calendar-outline"
                        error={nameError}
                    />
                </View>
            </View>

            {/* Configuración de Evaluaciones */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Configuración de Evaluaciones</Text>
                <View style={styles.card}>
                    <EvalTypeSelector
                        label="Media General"
                        options={evalTypesSecundary}
                        value={evalTypeSecundary}
                        onChange={setEvalTypeSecundary}
                        icon="school"
                        color="#10b981"
                    />

                    <View style={styles.cardDivider} />

                    <EvalTypeSelector
                        label="Primaria"
                        options={evalTypesPrimary}
                        value={evalTypePrimary}
                        onChange={setEvalTypePrimary}
                        icon="book"
                        color="#3b82f6"
                    />

                    <View style={styles.cardDivider} />

                    <EvalTypeSelector
                        label="Preescolar"
                        options={evalTypesPree}
                        value={evalTypePree}
                        onChange={setEvalTypePree}
                        icon="color-palette"
                        color="#ec4899"
                    />
                </View>
            </View>

            {/* Estado del Año */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Estado del Año</Text>
                <View style={styles.card}>
                    <View style={styles.toggleContainer}>
                        <View style={styles.toggleInfo}>
                            <View style={[styles.selectorIcon, { backgroundColor: '#10b98115' }]}>
                                <Ionicons name="star" size={20} color="#10b981" />
                            </View>
                            <View style={styles.toggleLabelContainer}>
                                <Text style={styles.toggleLabel}>Marcar como año actual</Text>
                                <Text style={styles.toggleDescription}>
                                    Solo puede haber un año actual a la vez
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.toggleSwitch,
                                current && styles.toggleSwitchActive
                            ]}
                            onPress={() => {
                                if (!current && !yearData.schoolYear.current) {
                                    showAlert(
                                        'Marcar como año actual',
                                        `¿Estás seguro de marcar "${yearData.schoolYear.name}" como año actual?`,
                                        [
                                            { text: 'Cancelar', style: 'cancel' },
                                            { text: 'Confirmar', onPress: () => setCurrent(true) }
                                        ]
                                    );
                                } else {
                                    setCurrent(!current);
                                }
                            }}
                            disabled={saving}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.toggleThumb, current && styles.toggleThumbActive]} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Botón Guardar */}
            {hasUnsavedChanges && (
                <View style={styles.unsavedBanner}>
                    <Ionicons name="alert-circle" size={18} color="#fbbf24" />
                    <Text style={styles.unsavedText}>Tienes cambios sin guardar</Text>
                </View>
            )}

            <View style={styles.saveSection}>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        (!hasUnsavedChanges || saving) && styles.saveButtonDisabled
                    ]}
                    onPress={handleSaveYear}
                    disabled={!hasUnsavedChanges || saving || deleting}
                    activeOpacity={0.8}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
                            <Text style={styles.saveButtonText}>
                                {hasUnsavedChanges ? 'Guardar Cambios' : 'Sin cambios'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Zona de Peligro */}
            <DangerZone
                label="Eliminar año escolar"
                actionText="Eliminar"
                onPress={handleDeleteYear}
                loading={deleting}
            />
        </View>
    );
};

// --- Main Component ---
export default function SchoolYearDashboardPage() {
    const { yearId } = useLocalSearchParams<{ yearId: string }>();
    const yearIdNum = parseInt(yearId, 10);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
    const [isStartingYear, setIsStartingYear] = useState(false);
    const [isFinishingYear, setIsFinishingYear] = useState(false);
    const [isAdvancingLapso, setIsAdvancingLapso] = useState(false);
    const [selectedLapso, setSelectedLapso] = useState<LapsoFilter>('all');

    // Animation refs
    const headerOpacity = useRef(new Animated.Value(0)).current;

    const loadDashboardData = useCallback(async () => {
        try {
            const result = await getSchoolYearDashboardById(yearIdNum);
            if (result.success && result.data) {
                setDashboardData(result.data);
            } else {
                showAlert('Error', result.message || 'No se pudo cargar el año escolar');
            }
        } catch (error: any) {
            showAlert('Error', error.message || 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    }, [yearIdNum]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    }, [loadDashboardData]);

    useEffect(() => {
        loadDashboardData();
        Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, [loadDashboardData]);

    const handleStartYear = async () => {
        if (!dashboardData) return;

        showAlert(
            'Iniciar Año Escolar',
            `¿Estás seguro de iniciar el año "${dashboardData.schoolYear.name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Iniciar',
                    onPress: async () => {
                        setIsStartingYear(true);
                        try {
                            const result = await yearService.startSchoolYear(yearIdNum);
                            if (result.success) {
                                showAlert('Éxito', 'Año escolar iniciado correctamente');
                                await loadDashboardData();
                            } else {
                                showAlert('Error', result.message || 'No se pudo iniciar el año');
                            }
                        } catch (error: any) {
                            showAlert('Error', error.message || 'Error al iniciar el año');
                        } finally {
                            setIsStartingYear(false);
                        }
                    },
                },
            ]
        );
    };

    const handleFinishYear = async () => {
        if (!dashboardData) return;

        showAlert(
            'Finalizar Año Escolar',
            `¿Estás seguro de finalizar el año "${dashboardData.schoolYear.name}"? Esta acción bloqueará todas las notas.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Finalizar',
                    style: 'destructive',
                    onPress: async () => {
                        setIsFinishingYear(true);
                        try {
                            const result = await yearService.finishSchoolYear(yearIdNum);
                            if (result.success) {
                                showAlert('Éxito', 'Año escolar finalizado correctamente');
                                await loadDashboardData();
                            } else {
                                showAlert('Error', result.message || 'No se pudo finalizar el año');
                            }
                        } catch (error: any) {
                            showAlert('Error', error.message || 'Error al finalizar el año');
                        } finally {
                            setIsFinishingYear(false);
                        }
                    },
                },
            ]
        );
    };

    const handleNextLapso = async () => {
        if (!dashboardData) return;

        const currentLapso = dashboardData.schoolYear.currentLapso || '1';
        const nextLapsoNum = parseInt(currentLapso) + 1;
        const lapsoNames = { '2': 'Segundo Lapso', '3': 'Tercer Lapso' };

        if (currentLapso === '3') {
            showAlert(
                'Ya está en el Tercer Lapso',
                'Para cerrar el año escolar, use el botón "Finalizar Año" cuando esté listo.'
            );
            return;
        }

        showAlert(
            'Avanzar Lapso',
            `¿Estás seguro de avanzar al ${lapsoNames[nextLapsoNum.toString() as '2' | '3']}? Las evaluaciones nuevas se crearán en este lapso.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Avanzar',
                    onPress: async () => {
                        setIsAdvancingLapso(true);
                        try {
                            const result = await yearService.nextLapso(yearIdNum);
                            if (result.success) {
                                showAlert('Éxito', `Avanzado al ${lapsoNames[nextLapsoNum.toString() as '2' | '3']}`);
                                await loadDashboardData();
                            } else {
                                showAlert('Error', result.message || 'No se pudo avanzar el lapso');
                            }
                        } catch (error: any) {
                            showAlert('Error', error.message || 'Error al avanzar el lapso');
                        } finally {
                            setIsAdvancingLapso(false);
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaProvider>
                <StatusBar style="light" />
                <View style={[styles.container, styles.loadingContainer]}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Cargando año escolar...</Text>
                </View>
            </SafeAreaProvider>
        );
    }

    if (!dashboardData) {
        return (
            <SafeAreaProvider>
                <StatusBar style="light" />
                <View style={[styles.container, styles.loadingContainer]}>
                    <Ionicons name="alert-circle" size={64} color={Colors.error} />
                    <Text style={styles.errorText}>No se encontró el año escolar</Text>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Text style={styles.backBtnText}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaProvider>
        );
    }

    const yearName = dashboardData.schoolYear.name;
    const d = dashboardData;
    const state = dashboardData.schoolYear.state;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardGeneralTab data={d} loading={false} />;
            case 'secundary': return <LevelTab level="secundary" levelName="Media General" data={d} color={Colors.primary} loading={false} />;
            case 'tecnico': return <TecnicoMedioTab data={d} loading={false} />;
            case 'primary': return <LevelTab level="primary" levelName="Primaria" data={d} color={Colors.success} loading={false} />;
            case 'pre': return <LevelTab level="pre" levelName="Preescolar" data={d} color="#ec4899" loading={false} />;
            case 'students': return <StudentsTab data={d} loading={false} />;
            case 'professors': return <ProfessorsTab data={d} loading={false} />;
            case 'evaluations': return <EvaluationsTab data={d} loading={false} selectedLapso={selectedLapso} />;
            case 'settings': return <SettingsTab yearId={yearIdNum} yearData={d} onSaveSuccess={loadDashboardData} />;
            default: return null;
        }
    };

    return (
        <SafeAreaProvider>
            <StatusBar style="light" />
            <Head><title>{yearName} - Dashboard</title></Head>
            <View style={styles.container}>
                {/* Header */}
                <LinearGradient
                    colors={[Colors.primary, '#1e3a8a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <View style={styles.headerPattern} />

                    <Animated.View style={[styles.headerContent, { opacity: headerOpacity }]}>
                        <View style={styles.headerTop}>
                            <GlassButton onPress={() => router.back()}>
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </GlassButton>

                            <View style={styles.headerCenter}>
                                <Text style={styles.yearName}>{yearName}</Text>
                                <AnimatedBadge
                                    value={state === 'active' ? 'En Curso' : state === 'finished' ? 'Finalizado' : 'Borrador'}
                                    color={state === 'active' ? '#34d399' : state === 'finished' ? '#9ca3af' : '#f59e0b'}
                                    pulse={state === 'active'}
                                />
                            </View>

                            <View style={{ width: 42 }} />
                        </View>

                        <View style={styles.greetingRow}>
                            <View>
                                <Text style={styles.greeting}>Historial de Año</Text>
                                <Text style={styles.subtitle}>Vista detallada del año escolar</Text>
                            </View>
                        </View>

                        {/* Lapso Display - Only for active years */}
                        {state === 'active' && d.schoolYear.currentLapso && (
                            <View style={styles.lapsoContainer}>
                                <View style={styles.lapsoInfo}>
                                    <View style={styles.lapsoIconBox}>
                                        <Ionicons name="calendar" size={18} color="#fff" />
                                    </View>
                                    <View>
                                        <Text style={styles.lapsoLabel}>Lapso Actual</Text>
                                        <Text style={styles.lapsoValue}>
                                            {d.schoolYear.lapsoDisplay || `Lapso ${d.schoolYear.currentLapso}`}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.lapsoActions}>
                                    {d.schoolYear.currentLapso !== '3' && (
                                        <TouchableOpacity
                                            style={styles.lapsoButton}
                                            onPress={handleNextLapso}
                                            disabled={isAdvancingLapso}
                                        >
                                            {isAdvancingLapso ? (
                                                <ActivityIndicator size="small" color="#fff" />
                                            ) : (
                                                <>
                                                    <Text style={styles.lapsoButtonText}>Siguiente</Text>
                                                    <Ionicons name="arrow-forward" size={14} color="#fff" />
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                    {d.schoolYear.currentLapso === '3' && (
                                        <TouchableOpacity
                                            style={[styles.lapsoButton, styles.finishLapsoButton]}
                                            onPress={handleFinishYear}
                                            disabled={isFinishingYear}
                                        >
                                            {isFinishingYear ? (
                                                <ActivityIndicator size="small" color="#fff" />
                                            ) : (
                                                <>
                                                    <Text style={styles.lapsoButtonText}>Finalizar Año</Text>
                                                    <Ionicons name="checkmark-done" size={14} color="#fff" />
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        )}
                        {/* Year State Action Button - Only for draft state */}
                        {state === 'draft' && (
                            <View style={styles.lapsoContainer}>
                                <View style={styles.lapsoInfo}>
                                    <View style={[styles.lapsoIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.3)' }]}>
                                        <Ionicons name="document-outline" size={18} color="#fff" />
                                    </View>
                                    <View>
                                        <Text style={styles.lapsoLabel}>Estado</Text>
                                        <Text style={styles.lapsoValue}>Año no iniciado</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={styles.lapsoButton}
                                    onPress={handleStartYear}
                                    disabled={isStartingYear}
                                >
                                    {isStartingYear ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <Text style={styles.lapsoButtonText}>Iniciar Año</Text>
                                            <Ionicons name="play" size={14} color="#fff" />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* KPI Cards */}
                        <Animated.View>
                            <View style={[styles.kpiRow, { marginBottom: 65, marginTop: 15 }]}>
                                <KPICard icon="people" value={d.kpis.totalStudentsCount} label="Estudiantes" color={Colors.primary} loading={false} />
                                <KPICard icon="checkmark-circle" value={d.kpis.approvedStudentsCount} label="Aprobados" color={Colors.success} loading={false} />
                            </View>
                            <View style={styles.kpiRow}>
                                <KPICard icon="layers" value={d.kpis.totalSectionsCount} label="Secciones" color={Colors.info} loading={false} />
                                <KPICard icon="person" value={d.kpis.totalProfessorsCount} label="Profesores" color={Colors.warning} loading={false} />
                            </View>
                        </Animated.View>
                    </Animated.View>
                </LinearGradient>

                <View style={styles.mainContainer}>
                    {/* Tab Navigation */}
                    <View style={styles.tabContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
                            {DASHBOARD_TABS.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <TouchableOpacity
                                        key={tab.id}
                                        style={[styles.tab, isActive && styles.tabActive]}
                                        onPress={() => setActiveTab(tab.id)}
                                    >
                                        <Ionicons
                                            name={tab.icon}
                                            size={18}
                                            color={isActive ? Colors.primary : Colors.textSecondary}
                                            style={isActive ? styles.activeIcon : {}}
                                        />
                                        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
                                        {isActive && <View style={styles.activeIndicator} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Lapso Filter Selector */}
                    {(state === 'active' || state === 'finished') && (
                        <View style={styles.lapsoFilterContainer}>
                            <View style={styles.lapsoFilterLabel}>
                                <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                                <Text style={styles.lapsoFilterText}>Ver lapso:</Text>
                            </View>
                            <View style={styles.lapsoFilterOptions}>
                                {LAPSO_OPTIONS.map((option) => {
                                    const isActive = selectedLapso === option.id;
                                    // Only show lapso options up to current lapso for active years
                                    const currentLapsoNum = parseInt(d.schoolYear.currentLapso || '3');
                                    const optionNum = option.id === 'all' ? 0 : parseInt(option.id);
                                    const isAvailable = state === 'finished' || option.id === 'all' || optionNum <= currentLapsoNum;

                                    if (!isAvailable) return null;

                                    return (
                                        <TouchableOpacity
                                            key={option.id}
                                            style={[styles.lapsoFilterOption, isActive && styles.lapsoFilterOptionActive]}
                                            onPress={() => setSelectedLapso(option.id)}
                                        >
                                            <Text style={[styles.lapsoFilterOptionText, isActive && styles.lapsoFilterOptionTextActive]}>
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* Content Area */}
                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />}
                    >
                        <View style={styles.contentInner}>
                            <TabTransition activeTab={activeTab}>
                                {renderTabContent()}
                            </TabTransition>
                            <View style={{ height: 100 }} />
                        </View>
                    </ScrollView>
                </View>
            </View>
        </SafeAreaProvider >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.backgroundSecondary },
    loadingContainer: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 16, fontSize: 16, color: Colors.textSecondary },
    errorText: { marginTop: 16, fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
    backBtn: { marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: Colors.primary, borderRadius: 12 },
    backBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

    // Header
    header: {
        paddingTop: Platform.OS === 'android' ? 44 : 54,
        paddingBottom: 75,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        overflow: 'hidden',
        zIndex: 1,
    },
    headerPattern: {
        zIndex: 1,
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.1,
        backgroundColor: Colors.primary,
    },
    headerContent: { paddingHorizontal: 20, zIndex: 1 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, zIndex: 1 },
    headerCenter: { alignItems: 'center', flex: 1, zIndex: 1 },
    yearName: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4, zIndex: 1 },
    greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 4, zIndex: 1 },
    greeting: { fontSize: 26, fontWeight: '800', color: '#fff', zIndex: 1 },
    subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4, zIndex: 1 },

    // Action buttons
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.success,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    finishButton: {
        backgroundColor: Colors.warning,
    },
    actionButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },

    // Lapso display styles
    lapsoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: 14,
        marginTop: 12,
    },
    lapsoInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    lapsoIconBox: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lapsoLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
    },
    lapsoValue: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    lapsoActions: {
        flexDirection: 'row',
        gap: 8,
    },
    lapsoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(16, 185, 129, 0.9)',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
    },
    finishLapsoButton: {
        backgroundColor: 'rgba(245, 158, 11, 0.9)',
    },
    lapsoButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 13,
    },

    // Main Container & KPI
    mainContainer: { flex: 1 },
    kpiRow: { flexDirection: 'row', gap: 12, zIndex: 1 },

    // Lapso Filter Selector
    lapsoFilterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    lapsoFilterLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    lapsoFilterText: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    lapsoFilterOptions: {
        flexDirection: 'row',
        gap: 6,
    },
    lapsoFilterOption: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: Colors.backgroundTertiary,
    },
    lapsoFilterOptionActive: {
        backgroundColor: Colors.primary,
    },
    lapsoFilterOptionText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    lapsoFilterOptionTextActive: {
        color: '#fff',
    },

    // Tab Navigation
    tabContainer: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
        paddingTop: 13,
        marginTop: -10,
        paddingVertical: 4,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4 },
        })
    },
    tabScroll: { paddingHorizontal: 16, gap: 4 },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
        position: 'relative',
    },
    tabActive: { backgroundColor: Colors.primary + '08' },
    activeIcon: { transform: [{ scale: 1.1 }] },
    tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
    tabTextActive: { color: Colors.primary, fontWeight: '700' },
    activeIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 16,
        right: 16,
        height: 3,
        backgroundColor: Colors.primary,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3
    },

    // Content
    content: { flex: 1 },
    contentInner: { padding: 16, paddingBottom: 100 },

    // Settings Tab Styles
    settingsContainer: { paddingBottom: 20 },
    section: { marginBottom: 20 },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textSecondary,
        marginBottom: 10,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 18,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
            android: { elevation: 3 },
        }),
    },
    cardDivider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 16 },

    // Selector
    selectorContainer: { marginBottom: 4 },
    selectorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
    selectorIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    selectorLabel: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
    optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#f8fafc',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
    },
    optionButtonActive: { borderWidth: 2 },
    optionText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
    optionTextActive: { fontWeight: '700' },
    emptyOptions: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
    emptyOptionsText: { fontSize: 13, color: Colors.textTertiary },

    // Toggle
    toggleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    toggleInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
    toggleLabelContainer: { flex: 1 },
    toggleLabel: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
    toggleDescription: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
    toggleSwitch: {
        width: 52,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        padding: 2,
    },
    toggleSwitchActive: { backgroundColor: '#10b981' },
    toggleThumb: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#fff',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 3,
            },
        }),
    },
    toggleThumbActive: { transform: [{ translateX: 22 }] },

    // Unsaved changes
    unsavedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef3c7',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 16,
        gap: 10,
    },
    unsavedText: { fontSize: 14, fontWeight: '600', color: '#92400e' },

    // Save Button
    saveSection: { marginBottom: 20 },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 14,
        gap: 8,
        ...Platform.select({
            ios: {
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
        }),
    },
    saveButtonDisabled: {
        backgroundColor: '#94a3b8',
        ...Platform.select({
            ios: { shadowOpacity: 0 },
        }),
    },
    saveButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
