import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { showAlert } from '../../../../components/showAlert';
import { Input } from '../../../../components/ui';
import Colors from '../../../../constants/Colors';
import type { EvaluationType } from '../../../../services-odoo/yearService';
import * as yearService from '../../../../services-odoo/yearService';

// Componente selector de tipo de evaluación mejorado
interface EvalTypeSelectorProps {
    label: string;
    options: EvaluationType[];
    value: number | null;
    onChange: (id: number) => void;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    disabled?: boolean;
}

const EvalTypeSelector: React.FC<EvalTypeSelectorProps> = ({
    label,
    options,
    value,
    onChange,
    icon,
    color,
    disabled = false,
}) => (
    <View style={styles.selectorContainer}>
        <View style={styles.selectorHeader}>
            <View style={[styles.selectorIcon, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={styles.selectorLabel}>{label}</Text>
        </View>
        <View style={styles.optionsContainer}>
            {options.map((type) => (
                <TouchableOpacity
                    key={type.id}
                    style={[
                        styles.optionButton,
                        value === type.id && [styles.optionButtonActive, { borderColor: color, backgroundColor: color + '10' }],
                    ]}
                    onPress={() => onChange(type.id)}
                    activeOpacity={0.7}
                    disabled={disabled}
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
            ))}
            {options.length === 0 && (
                <View style={styles.emptyOptions}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                    <Text style={styles.emptyOptionsText}>Cargando opciones...</Text>
                </View>
            )}
        </View>
    </View>
);

function RegisterSchoolYearContent() {
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ yearId?: string }>();
    const isEditMode = !!params.yearId;

    const [initialLoading, setInitialLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState('');
    const [evalTypeSecundary, setEvalTypeSecundary] = useState<number | null>(null);
    const [evalTypePrimary, setEvalTypePrimary] = useState<number | null>(null);
    const [evalTypePree, setEvalTypePree] = useState<number | null>(null);

    // Options
    const [evalTypesSecundary, setEvalTypesSecundary] = useState<EvaluationType[]>([]);
    const [evalTypesPrimary, setEvalTypesPrimary] = useState<EvaluationType[]>([]);
    const [evalTypesPree, setEvalTypesPree] = useState<EvaluationType[]>([]);

    // Load evaluation types
    useEffect(() => {
        const loadEvalTypes = async () => {
            try {
                const [secundary, primary, pree] = await Promise.all([
                    yearService.loadEvaluationTypes('secundary'),
                    yearService.loadEvaluationTypes('primary'),
                    yearService.loadEvaluationTypes('pre'),
                ]);
                setEvalTypesSecundary(secundary);
                setEvalTypesPrimary(primary);
                setEvalTypesPree(pree);

                // Set defaults if available
                if (secundary.length > 0 && !evalTypeSecundary) setEvalTypeSecundary(secundary[0].id);
                if (primary.length > 0 && !evalTypePrimary) setEvalTypePrimary(primary[0].id);
                if (pree.length > 0 && !evalTypePree) setEvalTypePree(pree[0].id);
            } catch (error) {
                console.error('Error loading evaluation types:', error);
            }
        };
        loadEvalTypes();
    }, []);

    // Load existing year if editing
    useEffect(() => {
        const loadYear = async () => {
            if (!params.yearId) return;

            try {
                setInitialLoading(true);
                const year = await yearService.getYearById(parseInt(params.yearId));

                if (year) {
                    setName(year.name);
                    if (year.evalutionTypeSecundary) setEvalTypeSecundary(year.evalutionTypeSecundary.id);
                    if (year.evalutionTypePrimary) setEvalTypePrimary(year.evalutionTypePrimary.id);
                    if (year.evalutionTypePree) setEvalTypePree(year.evalutionTypePree.id);
                }
            } catch (error) {
                console.error('Error loading year:', error);
                showAlert('Error', 'No se pudo cargar el año escolar');
            } finally {
                setInitialLoading(false);
            }
        };

        loadYear();
    }, [params.yearId]);

    const handleNameChange = (text: string) => {
        setName(text);
        if (nameError) setNameError('');
    };

    const validateForm = (): boolean => {
        let isValid = true;

        if (!name.trim() || name.trim().length < 4) {
            setNameError('El nombre debe tener al menos 4 caracteres (ej: 2024-2025)');
            isValid = false;
        }

        if (!evalTypeSecundary || !evalTypePrimary || !evalTypePree) {
            showAlert('Error', 'Debes seleccionar todos los tipos de evaluación');
            isValid = false;
        }

        return isValid;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setSaving(true);

        try {
            const data = {
                name: name.trim(),
                evalutionTypeSecundary: evalTypeSecundary!,
                evalutionTypePrimary: evalTypePrimary!,
                evalutionTypePree: evalTypePree!,
            };

            let result;
            if (isEditMode && params.yearId) {
                result = await yearService.updateSchoolYear(parseInt(params.yearId), data);
            } else {
                result = await yearService.createSchoolYear(data);
            }

            if (result.success) {
                showAlert('Éxito', isEditMode ? 'Año escolar actualizado' : 'Año escolar creado correctamente');
                router.back();
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

    if (initialLoading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Cargando...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header con Gradiente */}
            <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={[styles.headerGradient, { paddingTop: insets.top }]}
            >
                <View style={styles.headerContent}>
                    {/* Botón atrás */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    {/* Centro */}
                    <View style={styles.headerCenter}>
                        <View style={styles.headerIconBg}>
                            <Ionicons
                                name={isEditMode ? "pencil" : "add"}
                                size={24}
                                color={Colors.primary}
                            />
                        </View>
                        <Text style={styles.headerTitle}>
                            {isEditMode ? 'Editar Año Escolar' : 'Nuevo Año Escolar'}
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            {isEditMode ? 'Modifica los datos del año' : 'Configura el nuevo período escolar'}
                        </Text>
                    </View>

                    {/* Espaciador */}
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            {/* Body */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.bodyContent, { paddingBottom: 120 }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Sección: Información Básica */}
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

                {/* Sección: Configuración de Evaluaciones */}
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
                            disabled={saving}
                        />

                        <View style={styles.cardDivider} />

                        <EvalTypeSelector
                            label="Primaria"
                            options={evalTypesPrimary}
                            value={evalTypePrimary}
                            onChange={setEvalTypePrimary}
                            icon="book"
                            color="#3b82f6"
                            disabled={saving}
                        />

                        <View style={styles.cardDivider} />

                        <EvalTypeSelector
                            label="Preescolar"
                            options={evalTypesPree}
                            value={evalTypePree}
                            onChange={setEvalTypePree}
                            icon="color-palette"
                            color="#ec4899"
                            disabled={saving}
                        />
                    </View>
                </View>

                {/* Info card para nuevo año */}
                {!isEditMode && (
                    <View style={styles.infoCard}>
                        <View style={styles.infoIconBg}>
                            <Ionicons name="information-circle" size={20} color={Colors.primary} />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoTitle}>Información importante</Text>
                            <Text style={styles.infoText}>
                                Al crear un nuevo año escolar, este se establecerá automáticamente como el año actual.
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Footer con botón */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.8}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name={isEditMode ? "checkmark-circle" : "add-circle"} size={22} color="#fff" />
                            <Text style={styles.saveButtonText}>
                                {isEditMode ? 'Guardar Cambios' : 'Crear Año Escolar'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default function RegisterSchoolYearScreen() {
    const params = useLocalSearchParams<{ yearId?: string }>();
    const isEditMode = !!params.yearId;

    return (
        <>
            <Head>
                <title>{isEditMode ? 'Editar Año Escolar' : 'Nuevo Año Escolar'}</title>
            </Head>
            <SafeAreaProvider>
                <StatusBar style="light" translucent />
                <RegisterSchoolYearContent />
            </SafeAreaProvider>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    // Header
    headerGradient: {
        paddingBottom: 24,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 8,
    },
    headerIconBg: {
        width: 56,
        height: 56,
        borderRadius: 16,
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
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.3,
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.85)',
        marginTop: 4,
    },
    // Body
    scrollView: {
        flex: 1,
    },
    bodyContent: {
        padding: 20,
    },
    section: {
        marginBottom: 20,
    },
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
            }
        }),
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginVertical: 16,
    },
    // Selector
    selectorContainer: {
        marginBottom: 4,
    },
    selectorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    selectorIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectorLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
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
    optionButtonActive: {
        borderWidth: 2,
    },
    optionText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    optionTextActive: {
        fontWeight: '700',
    },
    emptyOptions: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 8,
    },
    emptyOptionsText: {
        fontSize: 13,
        color: Colors.textTertiary,
    },
    // Info Card
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'flex-start',
        gap: 14,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
        }),
    },
    infoIconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    infoText: {
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 18,
        fontWeight: '500',
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
        }),
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        borderRadius: 14,
        paddingVertical: 16,
        gap: 10,
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
        opacity: 0.6,
        ...Platform.select({
            ios: {
                shadowOpacity: 0,
            },
        }),
    },
    saveButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: -0.3,
    },
});
