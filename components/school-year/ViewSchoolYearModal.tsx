import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import type { SchoolYear } from '../../services-odoo/yearService';
import { InfoRow, InfoSection } from '../list';

interface ViewSchoolYearModalProps {
    visible: boolean;
    year: SchoolYear | null;
    onClose: () => void;
    onEdit: () => void;
}

export const ViewSchoolYearModal: React.FC<ViewSchoolYearModalProps> = ({
    visible,
    year,
    onClose,
    onEdit,
}) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ['90%'], []);

    useEffect(() => {
        if (visible) {
            bottomSheetRef.current?.present();
        } else {
            bottomSheetRef.current?.dismiss();
        }
    }, [visible]);

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

    if (!year) return null;

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
            >
                <View style={[styles.container, { paddingBottom: insets.bottom }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={[styles.iconBox, year.current && styles.iconBoxActive]}>
                                <Ionicons
                                    name="calendar"
                                    size={24}
                                    color={year.current ? '#10b981' : Colors.primary}
                                />
                            </View>
                            <View>
                                <Text style={styles.headerTitle}>{year.name}</Text>
                                {year.current && (
                                    <View style={styles.currentBadge}>
                                        <Text style={styles.currentBadgeText}>Año Actual</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                            <Ionicons name="close-circle" size={28} color={Colors.textTertiary} />
                        </TouchableOpacity>
                    </View>

                    {/* Body */}
                    <BottomSheetScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={[styles.bodyContent]}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={[{flex:1}]}>
                            {/* Estadísticas Principales */}
                            <InfoSection title="Estadísticas">
                                <View style={styles.statsGrid}>
                                    <View style={styles.statCard}>
                                        <Ionicons name="people" size={24} color="#3b82f6" />
                                        <Text style={styles.statNumber}>{year.totalStudentsCount || 0}</Text>
                                        <Text style={styles.statLabel}>Estudiantes</Text>
                                    </View>
                                    <View style={styles.statCard}>
                                        <Ionicons name="grid" size={24} color="#10b981" />
                                        <Text style={styles.statNumber}>{year.totalSectionsCount || 0}</Text>
                                        <Text style={styles.statLabel}>Secciones</Text>
                                    </View>
                                    <View style={styles.statCard}>
                                        <Ionicons name="school" size={24} color="#f59e0b" />
                                        <Text style={styles.statNumber}>{year.totalProfessorsCount || 0}</Text>
                                        <Text style={styles.statLabel}>Profesores</Text>
                                    </View>
                                </View>
                            </InfoSection>

                            {/* Tipos de Evaluación */}
                            <InfoSection title="Tipos de Evaluación">
                                <InfoRow
                                    icon="book-outline"
                                    label="Media General"
                                    value={year.evalutionTypeSecundary?.name || 'No configurado'}
                                />
                                <InfoRow
                                    icon="library-outline"
                                    label="Primaria"
                                    value={year.evalutionTypePrimary?.name || 'No configurado'}
                                />
                                <InfoRow
                                    icon="color-palette-outline"
                                    label="Preescolar"
                                    value={year.evalutionTypePree?.name || 'No configurado'}
                                />
                            </InfoSection>

                            {/* Más estadísticas */}
                            {(year.approvedStudentsCount !== undefined || year.totalStudentsCount !== undefined) && (
                                <InfoSection title="Rendimiento">
                                    <InfoRow
                                        icon="checkmark-circle-outline"
                                        label="Aprobados"
                                        value={`${year.approvedStudentsCount || 0} estudiantes`}
                                    />
                                    {!!year.totalStudentsCount && !!year.approvedStudentsCount && (
                                        <InfoRow
                                            icon="trending-up-outline"
                                            label="Tasa de Aprobación"
                                            value={`${Math.round((year.approvedStudentsCount / year.totalStudentsCount) * 100)}%`}
                                        />
                                    )}
                                </InfoSection>
                            )}
                        </View>
                    </BottomSheetScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={onEdit}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="pencil-outline" size={20} color="#fff" />
                            <Text style={styles.editButtonText}>Editar Año Escolar</Text>
                        </TouchableOpacity>
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
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconBoxActive: {
        backgroundColor: '#10b98115',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.3,
    },
    currentBadge: {
        backgroundColor: '#10b981',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginTop: 4,
    },
    currentBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#fff',
    },
    bodyContent: {
        position: 'absolute',
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginTop: 4,
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: '#fff',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 14,
        gap: 8,
    },
    editButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },
});
