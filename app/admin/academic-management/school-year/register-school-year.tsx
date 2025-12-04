import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { showAlert } from '../../../../components/showAlert';
import { Input } from '../../../../components/ui';
import Colors from '../../../../constants/Colors';
import type { EvaluationType } from '../../../../services-odoo/yearService';
import * as yearService from '../../../../services-odoo/yearService';

// Componente selector de tipo de evaluación
interface EvalTypeSelectorProps {
    label: string;
    options: EvaluationType[];
    value: number | null;
    onChange: (id: number) => void;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

const EvalTypeSelector: React.FC<EvalTypeSelectorProps> = ({
    label,
    options,
    value,
    onChange,
    icon,
    color,
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
                        value === type.id && [styles.optionButtonActive, { borderColor: color }],
                    ]}
                    onPress={() => onChange(type.id)}
                    activeOpacity={0.7}
                >
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
                    <Text style={styles.emptyOptionsText}>Cargando opciones...</Text>
                </View>
            )}
        </View>
    </View>
);

export default function RegisterSchoolYearScreen() {
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
                showAlert('Éxito', isEditMode ? 'Año escolar actualizado' : 'Año escolar creado');
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
            <SafeAreaProvider>
                <View style={[styles.container, styles.centered]}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Cargando...</Text>
                </View>
            </SafeAreaProvider>
        );
    }

    return (
        <>
            <Head>
                <title>{isEditMode ? 'Editar Año Escolar' : 'Nuevo Año Escolar'}</title>
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
                            <Text style={styles.headerTitle}>
                                {isEditMode ? 'Editar Año Escolar' : 'Nuevo Año Escolar'}
                            </Text>
                        </View>
                        <View style={{ width: 40 }} />
                    </LinearGradient>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Nombre del año usando Input */}
                        <Input
                            label="Nombre del Año Escolar"
                            value={name}
                            onChangeText={handleNameChange}
                            placeholder="Ej: 2024-2025"
                            leftIcon="calendar-outline"
                            error={nameError}
                        />

                        {/* Selectores de tipo de evaluación */}
                        <EvalTypeSelector
                            label="Media General"
                            options={evalTypesSecundary}
                            value={evalTypeSecundary}
                            onChange={setEvalTypeSecundary}
                            icon="school"
                            color="#10b981"
                        />

                        <EvalTypeSelector
                            label="Primaria"
                            options={evalTypesPrimary}
                            value={evalTypePrimary}
                            onChange={setEvalTypePrimary}
                            icon="book"
                            color="#3b82f6"
                        />

                        <EvalTypeSelector
                            label="Preescolar"
                            options={evalTypesPree}
                            value={evalTypePree}
                            onChange={setEvalTypePree}
                            icon="color-palette"
                            color="#ec4899"
                        />

                        {/* Info card */}
                        {!isEditMode && (
                            <View style={styles.infoCard}>
                                <Ionicons name="information-circle" size={22} color={Colors.primary} />
                                <Text style={styles.infoText}>
                                    Al crear un nuevo año escolar, este se establecerá automáticamente como el año actual.
                                </Text>
                            </View>
                        )}

                        <View style={{ height: 100 }} />
                    </ScrollView>

                    {/* Save button */}
                    <View style={styles.footer}>
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
                                    <Ionicons name="checkmark-circle" size={22} color="#fff" />
                                    <Text style={styles.saveButtonText}>
                                        {isEditMode ? 'Guardar Cambios' : 'Crear Año Escolar'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
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
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.textSecondary,
        fontWeight: '500',
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
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    // Selector styles
    selectorContainer: {
        marginBottom: 24,
    },
    selectorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
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
        letterSpacing: -0.2,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    optionButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderWidth: 2,
        borderColor: Colors.border,
        minWidth: 100,
        alignItems: 'center',
    },
    optionButtonActive: {
        backgroundColor: Colors.primary + '10',
    },
    optionText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    optionTextActive: {
        fontWeight: '700',
    },
    emptyOptions: {
        padding: 16,
    },
    emptyOptionsText: {
        fontSize: 14,
        color: Colors.textTertiary,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: Colors.primary + '10',
        borderRadius: 16,
        padding: 16,
        gap: 12,
        alignItems: 'flex-start',
        marginTop: 8,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
        fontWeight: '500',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            }
        }),
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        borderRadius: 16,
        paddingVertical: 16,
        gap: 10,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: -0.3,
    },
});
