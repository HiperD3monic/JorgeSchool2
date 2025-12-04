import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { showAlert } from '../../../../components/showAlert';
import Colors from '../../../../constants/Colors';
import type { EvaluationType } from '../../../../services-odoo/yearService';
import * as yearService from '../../../../services-odoo/yearService';

export default function RegisterSchoolYearScreen() {
    const params = useLocalSearchParams<{ yearId?: string }>();
    const isEditMode = !!params.yearId;

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);

    // Form fields
    const [name, setName] = useState('');
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

    const handleSave = async () => {
        // Validation
        if (!name.trim()) {
            showAlert('Error', 'El nombre del año escolar es requerido');
            return;
        }
        if (!evalTypeSecundary || !evalTypePrimary || !evalTypePree) {
            showAlert('Error', 'Debes seleccionar todos los tipos de evaluación');
            return;
        }

        setSaving(true);

        try {
            const data = {
                name: name.trim(),
                evalutionTypeSecundary: evalTypeSecundary,
                evalutionTypePrimary: evalTypePrimary,
                evalutionTypePree: evalTypePree,
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
                    >
                        {/* Nombre del año */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Nombre del Año Escolar *</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Ej: 2024-2025"
                                placeholderTextColor={Colors.textTertiary}
                            />
                            <Text style={styles.hint}>
                                Este nombre identificará el período escolar
                            </Text>
                        </View>

                        {/* Tipo de evaluación Secundaria */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Tipo de Evaluación - Media General *</Text>
                            <View style={styles.optionsContainer}>
                                {evalTypesSecundary.map((type) => (
                                    <TouchableOpacity
                                        key={type.id}
                                        style={[
                                            styles.optionButton,
                                            evalTypeSecundary === type.id && styles.optionButtonActive,
                                        ]}
                                        onPress={() => setEvalTypeSecundary(type.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                evalTypeSecundary === type.id && styles.optionTextActive,
                                            ]}
                                        >
                                            {type.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Tipo de evaluación Primaria */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Tipo de Evaluación - Primaria *</Text>
                            <View style={styles.optionsContainer}>
                                {evalTypesPrimary.map((type) => (
                                    <TouchableOpacity
                                        key={type.id}
                                        style={[
                                            styles.optionButton,
                                            evalTypePrimary === type.id && styles.optionButtonActive,
                                        ]}
                                        onPress={() => setEvalTypePrimary(type.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                evalTypePrimary === type.id && styles.optionTextActive,
                                            ]}
                                        >
                                            {type.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Tipo de evaluación Preescolar */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Tipo de Evaluación - Preescolar *</Text>
                            <View style={styles.optionsContainer}>
                                {evalTypesPree.map((type) => (
                                    <TouchableOpacity
                                        key={type.id}
                                        style={[
                                            styles.optionButton,
                                            evalTypePree === type.id && styles.optionButtonActive,
                                        ]}
                                        onPress={() => setEvalTypePree(type.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                evalTypePree === type.id && styles.optionTextActive,
                                            ]}
                                        >
                                            {type.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Info card */}
                        <View style={styles.infoCard}>
                            <Ionicons name="information-circle" size={24} color={Colors.info} />
                            <Text style={styles.infoText}>
                                Al crear un nuevo año escolar, este se establecerá automáticamente como el año actual.
                                Los años anteriores se marcarán como no actuales.
                            </Text>
                        </View>

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
            }
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
    formGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 10,
        letterSpacing: -0.2,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 16,
        fontSize: 16,
        color: Colors.textPrimary,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
            },
        }),
    },
    hint: {
        fontSize: 13,
        color: Colors.textTertiary,
        marginTop: 8,
        fontWeight: '500',
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
        backgroundColor: `${Colors.primary}10`,
        borderColor: Colors.primary,
    },
    optionText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    optionTextActive: {
        color: Colors.primary,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: `${Colors.info}15`,
        borderRadius: 16,
        padding: 16,
        gap: 12,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: Colors.info,
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
            },
            android: {
                elevation: 8,
            },
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
