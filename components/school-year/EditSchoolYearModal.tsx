import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import * as authService from '../../services-odoo/authService';
import { deleteSchoolYear, updateSchoolYear, type SchoolYear } from '../../services-odoo/yearService';
import { DangerZone } from '../list';
import { showAlert } from '../showAlert';
import { Input } from '../ui';

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
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const [formData, setFormData] = useState<{ name: string }>({ name: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ['90%'], []);

    // Keyboard listeners
    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => setKeyboardHeight(e.endCoordinates.height)
        );
        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => setKeyboardHeight(0)
        );
        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, []);

    useEffect(() => {
        if (visible) {
            bottomSheetRef.current?.present();
        } else {
            bottomSheetRef.current?.dismiss();
        }
    }, [visible]);

    useEffect(() => {
        if (!visible) {
            setFormData({ name: '' });
            setErrors({});
            return;
        }
        if (year) {
            setFormData({ name: year.name });
        }
    }, [visible, year]);

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        if (!formData.name || formData.name.trim().length < 4) {
            newErrors.name = 'El nombre debe tener al menos 4 caracteres (ej: 2024-2025)';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSave = async () => {
        if (!year) return;

        const serverHealth = await authService.checkServerHealth();
        if (!serverHealth.ok) {
            showAlert('Sin conexión', 'No se puede actualizar sin conexión a internet.');
            return;
        }

        if (!validateForm()) {
            showAlert('Error', 'Complete todos los campos correctamente');
            return;
        }

        setIsLoading(true);

        try {
            const result = await updateSchoolYear(year.id, { name: formData.name });

            if (result.success) {
                showAlert('Éxito', 'Año escolar actualizado correctamente');
                onSave();
                onClose();
            } else {
                showAlert('Error', result.message || 'No se pudo actualizar');
            }
        } catch (error: any) {
            showAlert('Error', error.message || 'Ocurrió un error inesperado');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!year) return;

        showAlert(
            '¿Eliminar año escolar?',
            `¿Estás seguro de eliminar "${year.name}"? Esta acción no se puede deshacer.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        const serverHealth = await authService.checkServerHealth();
                        if (!serverHealth.ok) {
                            showAlert('Sin conexión', 'No se puede eliminar sin conexión a internet.');
                            return;
                        }

                        onClose();
                        setTimeout(async () => {
                            try {
                                const result = await deleteSchoolYear(year.id);
                                if (result.success) {
                                    showAlert('Éxito', 'Año escolar eliminado correctamente');
                                    onSave();
                                } else {
                                    showAlert('Error', result.message || 'No se pudo eliminar');
                                }
                            } catch (error: any) {
                                showAlert('Error', error.message || 'Ocurrió un error inesperado');
                            }
                        }, 300);
                    },
                },
            ]
        );
    };

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
            />
        ),
        []
    );

    const handleSheetChanges = useCallback((index: number) => {
        if (index === -1) {
            onClose();
        }
    }, [onClose]);

    return (
        <>
            {visible && <StatusBar style="light" />}

            <BottomSheetModal
                ref={bottomSheetRef}
                index={1}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                backdropComponent={renderBackdrop}
                enablePanDownToClose={true}
                handleIndicatorStyle={styles.handleIndicator}
                backgroundStyle={styles.bottomSheetBackground}
                topInset={insets.top}
                enableContentPanningGesture={false}
                enableHandlePanningGesture={true}
                enableOverDrag={false}
                keyboardBehavior="fillParent"
                keyboardBlurBehavior="restore"
                android_keyboardInputMode="adjustPan"
            >
                <View style={[styles.container, { paddingBottom: insets.bottom }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={styles.iconBox}>
                                <Ionicons name="pencil" size={22} color={Colors.primary} />
                            </View>
                            <Text style={styles.headerTitle}>Editar Año Escolar</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                            <Ionicons name="close-circle" size={28} color={Colors.error} />
                        </TouchableOpacity>
                    </View>

                    {/* Body */}
                    <BottomSheetScrollView
                        contentContainerStyle={[
                            styles.bodyContent,
                            { paddingBottom: keyboardHeight }
                        ]}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Input
                            label="Nombre del Año Escolar"
                            value={formData.name}
                            onChangeText={(value) => updateField('name', value)}
                            placeholder="Ej: 2024-2025"
                            error={errors.name}
                            leftIcon="calendar-outline"
                            editable={!isLoading}
                        />

                        {year?.current && (
                            <View style={styles.infoBox}>
                                <Ionicons name="information-circle" size={20} color={Colors.primary} />
                                <Text style={styles.infoText}>
                                    Este es el año escolar actual. Al editar, los cambios se aplicarán inmediatamente.
                                </Text>
                            </View>
                        )}

                        <DangerZone
                            label="Esta acción no se puede deshacer. Todos los datos del año escolar serán eliminados permanentemente."
                            actionText="Eliminar Año Escolar"
                            onPress={handleDelete}
                            loading={isLoading}
                        />
                    </BottomSheetScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        {isLoading ? (
                            <View style={styles.saveBtn}>
                                <ActivityIndicator size="small" color="#fff" />
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.saveBtn}
                                onPress={handleSave}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                                <Text style={styles.saveBtnLabel}>Guardar Cambios</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </BottomSheetModal>
        </>
    );
};

const styles = StyleSheet.create({
    handleIndicator: {
        backgroundColor: Colors.border,
        width: 40,
        height: 4,
    },
    bottomSheetBackground: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -6 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
            },
        }),
    },
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: '#fff',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.3,
    },
    bodyContent: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.primary + '10',
        padding: 16,
        borderRadius: 12,
        gap: 12,
        marginBottom: 20,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: '#fff',
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 14,
        gap: 8,
    },
    saveBtnLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },
});
