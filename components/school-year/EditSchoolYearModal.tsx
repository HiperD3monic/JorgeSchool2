import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import type { EvaluationType, SchoolYear } from '../../services-odoo/yearService';
import * as yearService from '../../services-odoo/yearService';
import { DangerZone } from '../list';
import { showAlert } from '../showAlert';
import { Input } from '../ui';

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

interface EditSchoolYearModalProps {
    visible: boolean;
    year: SchoolYear | null;
    onClose: () => void;
    onSave: () => void;
}

export const EditSchoolYearModal: React.FC<EditSchoolYearModalProps> = ({
    visible,
    year,
    onClose,
    onSave,
}) => {
    const insets = useSafeAreaInsets();

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState('');
    const [evalTypeSecundary, setEvalTypeSecundary] = useState<number | null>(null);
    const [evalTypePrimary, setEvalTypePrimary] = useState<number | null>(null);
    const [evalTypePree, setEvalTypePree] = useState<number | null>(null);
    const [current, setCurrent] = useState(false);

    // Options
    const [evalTypesSecundary, setEvalTypesSecundary] = useState<EvaluationType[]>([]);
    const [evalTypesPrimary, setEvalTypesPrimary] = useState<EvaluationType[]>([]);
    const [evalTypesPree, setEvalTypesPree] = useState<EvaluationType[]>([]);

    // Track original values for unsaved changes
    const [originalValues, setOriginalValues] = useState({
        name: '',
        evalTypeSecundary: null as number | null,
        evalTypePrimary: null as number | null,
        evalTypePree: null as number | null,
        current: false,
    });

    // Check if there are unsaved changes
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
        if (visible && year) {
            loadEvalTypes();
            setName(year.name);
            const secId = year.evalutionTypeSecundary?.id ?? null;
            const priId = year.evalutionTypePrimary?.id ?? null;
            const preeId = year.evalutionTypePree?.id ?? null;
            setEvalTypeSecundary(secId);
            setEvalTypePrimary(priId);
            setEvalTypePree(preeId);
            setCurrent(year.current || false);

            // Store original values
            setOriginalValues({
                name: year.name,
                evalTypeSecundary: secId,
                evalTypePrimary: priId,
                evalTypePree: preeId,
                current: year.current || false,
            });
        }
    }, [visible, year]);

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
        } catch (error) {
            console.error('Error loading evaluation types:', error);
        }
    };

    const handleClose = useCallback(() => {
        if (hasUnsavedChanges) {
            showAlert(
                'Cambios sin guardar',
                '¿Estás seguro de que deseas salir? Los cambios no guardados se perderán.',
                [
                    { text: 'Continuar editando', style: 'cancel' },
                    {
                        text: 'Descartar',
                        style: 'destructive',
                        onPress: () => {
                            Keyboard.dismiss();
                            resetForm();
                            onClose();
                        },
                    },
                ]
            );
        } else {
            Keyboard.dismiss();
            resetForm();
            onClose();
        }
    }, [hasUnsavedChanges, onClose]);

    const resetForm = () => {
        setName('');
        setNameError('');
        setEvalTypeSecundary(null);
        setEvalTypePrimary(null);
        setEvalTypePree(null);
        setCurrent(false);
        setOriginalValues({
            name: '',
            evalTypeSecundary: null,
            evalTypePrimary: null,
            evalTypePree: null,
            current: false,
        });
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
        if (!year) return;
        if (!validateForm()) return;

        setSaving(true);

        try {
            const data = {
                name: name.trim(),
                evalutionTypeSecundary: evalTypeSecundary!,
                evalutionTypePrimary: evalTypePrimary!,
                evalutionTypePree: evalTypePree!,
                current: current,
            };

            const result = await yearService.updateSchoolYear(year.id, data);

            if (result.success) {
                showAlert('Éxito', 'Año escolar actualizado correctamente');
                onSave();
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
        if (!year) return;

        if ((year.totalStudentsCount || 0) > 0 || (year.totalSectionsCount || 0) > 0) {
            showAlert(
                'No se puede eliminar',
                `Este año escolar tiene ${year.totalStudentsCount || 0} estudiantes y ${year.totalSectionsCount || 0} secciones asociadas. Debes eliminarlos primero.`
            );
            return;
        }

        showAlert(
            'Eliminar Año Escolar',
            `¿Estás seguro de eliminar "${year.name}"? Esta acción no se puede deshacer.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            const result = await yearService.deleteSchoolYear(year.id);
                            if (result.success) {
                                showAlert('Éxito', 'Año escolar eliminado');
                                onSave();
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

    if (!year) return null;

    const totalStudents = year.totalStudentsCount || 0;
    const totalSections = year.totalSectionsCount || 0;
    const totalProfessors = year.totalProfessorsCount || 0;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <View style={styles.container}>
                {/* Header con Gradiente */}
                <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    style={[styles.headerGradient, { paddingTop: insets.top }]}
                >
                    <View style={styles.headerContent}>
                        {/* Centro */}
                        <View style={styles.headerCenter}>
                            <View style={styles.headerIconBg}>
                                <Ionicons name="pencil" size={24} color={Colors.primary} />
                            </View>
                            <Text style={styles.headerTitle}>Editar Año Escolar</Text>
                            <Text style={styles.headerSubtitle}>{year.name}</Text>
                        </View>

                        {/* Botón cerrar */}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleClose}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{totalStudents}</Text>
                            <Text style={styles.statLabel}>Estudiantes</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{totalSections}</Text>
                            <Text style={styles.statLabel}>Secciones</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{totalProfessors}</Text>
                            <Text style={styles.statLabel}>Profesores</Text>
                        </View>
                    </View>

                    {/* Unsaved Changes Indicator */}
                    {hasUnsavedChanges && (
                        <View style={styles.unsavedBadge}>
                            <Ionicons name="alert-circle" size={14} color="#fbbf24" />
                            <Text style={styles.unsavedText}>Cambios sin guardar</Text>
                        </View>
                    )}
                </LinearGradient>

                {/* Body */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.bodyContent, { paddingBottom: insets.bottom + 30 }]}
                    showsVerticalScrollIndicator={true}
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

                    {/* Sección: Estado del Año */}
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
                                        if (!current && !year?.current) {
                                            showAlert(
                                                'Marcar como año actual',
                                                `¿Estás seguro de marcar "${year?.name}" como año actual?`,
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
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    // Header Gradient
    headerGradient: {
        paddingBottom: 20,
    },
    headerContent: {
        position: 'relative',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 8,
    },
    headerCenter: {
        alignItems: 'center',
    },
    headerIconBg: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
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
        fontSize: 15,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.85)',
        marginTop: 4,
    },
    closeButton: {
        position: 'absolute',
        right: 20,
        top: 12,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
        paddingHorizontal: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.75)',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 36,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    unsavedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 14,
        gap: 6,
    },
    unsavedText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fbbf24',
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
            },
            android: {
                elevation: 3,
            },
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
    // Toggle
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    toggleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    toggleLabelContainer: {
        flex: 1,
    },
    toggleLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    toggleDescription: {
        fontSize: 12,
        color: Colors.textTertiary,
        marginTop: 2,
    },
    toggleSwitch: {
        width: 52,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        padding: 2,
    },
    toggleSwitchActive: {
        backgroundColor: '#10b981',
    },
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
    toggleThumbActive: {
        transform: [{ translateX: 22 }],
    },
    // Save Button
    saveSection: {
        marginBottom: 20,
    },
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
            ios: {
                shadowOpacity: 0,
            },
        }),
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
