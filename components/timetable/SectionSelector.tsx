/**
 * SectionSelector - Selector de sección para horarios
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Colors from '../../constants/Colors';
import { EDUCATION_LEVEL_COLORS, EDUCATION_LEVEL_LABELS } from '../../services-odoo/scheduleService/constants';
import type { EducationLevel } from '../../services-odoo/scheduleService/types';

export interface SectionOption {
    id: number;
    name: string;
    type: EducationLevel;
    yearId?: number;
    yearName?: string;
}

interface SectionSelectorProps {
    sections: SectionOption[];
    selectedSection?: SectionOption;
    onSelectSection: (section: SectionOption) => void;
    loading?: boolean;
    placeholder?: string;
    disabled?: boolean;
}

export const SectionSelector: React.FC<SectionSelectorProps> = ({
    sections,
    selectedSection,
    onSelectSection,
    loading = false,
    placeholder = 'Seleccionar sección',
    disabled = false,
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [filterType, setFilterType] = useState<EducationLevel | 'all'>('all');

    // Agrupar secciones por tipo
    const groupedSections = React.useMemo(() => {
        const result: Record<EducationLevel, SectionOption[]> = {
            pre: [],
            primary: [],
            secundary: [],
        };

        sections.forEach((section) => {
            if (result[section.type]) {
                result[section.type].push(section);
            }
        });

        return result;
    }, [sections]);

    // Filtrar secciones por tipo
    const filteredSections = React.useMemo(() => {
        if (filterType === 'all') {
            return sections;
        }
        return sections.filter((s) => s.type === filterType);
    }, [sections, filterType]);

    const handleSelect = (section: SectionOption) => {
        onSelectSection(section);
        setModalVisible(false);
    };

    return (
        <>
            {/* Botón de selección */}
            <TouchableOpacity
                style={[
                    styles.selector,
                    disabled && styles.selectorDisabled,
                    selectedSection && styles.selectorSelected,
                ]}
                onPress={() => !disabled && setModalVisible(true)}
                activeOpacity={0.7}
                disabled={disabled}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                    <>
                        <Ionicons
                            name="school-outline"
                            size={20}
                            color={selectedSection ? Colors.primary : Colors.textSecondary}
                        />
                        <Text
                            style={[
                                styles.selectorText,
                                selectedSection && styles.selectorTextSelected,
                            ]}
                            numberOfLines={1}
                        >
                            {selectedSection?.name || placeholder}
                        </Text>
                        <Ionicons
                            name="chevron-down"
                            size={20}
                            color={Colors.textSecondary}
                        />
                    </>
                )}
            </TouchableOpacity>

            {/* Modal de selección */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Seleccionar Sección</Text>
                            <TouchableOpacity
                                style={styles.closeBtn}
                                onPress={() => setModalVisible(false)}
                            >
                                <Ionicons name="close" size={24} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Filtros por tipo */}
                        <View style={styles.filters}>
                            <TouchableOpacity
                                style={[
                                    styles.filterBtn,
                                    filterType === 'all' && styles.filterBtnActive,
                                ]}
                                onPress={() => setFilterType('all')}
                            >
                                <Text
                                    style={[
                                        styles.filterText,
                                        filterType === 'all' && styles.filterTextActive,
                                    ]}
                                >
                                    Todos
                                </Text>
                            </TouchableOpacity>
                            {(Object.keys(EDUCATION_LEVEL_LABELS) as EducationLevel[]).map(
                                (level) => (
                                    <TouchableOpacity
                                        key={level}
                                        style={[
                                            styles.filterBtn,
                                            filterType === level && {
                                                backgroundColor: EDUCATION_LEVEL_COLORS[level] + '20',
                                                borderColor: EDUCATION_LEVEL_COLORS[level],
                                            },
                                        ]}
                                        onPress={() => setFilterType(level)}
                                    >
                                        <Text
                                            style={[
                                                styles.filterText,
                                                filterType === level && {
                                                    color: EDUCATION_LEVEL_COLORS[level],
                                                },
                                            ]}
                                        >
                                            {EDUCATION_LEVEL_LABELS[level]}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            )}
                        </View>

                        {/* Lista de secciones */}
                        <ScrollView style={styles.sectionList}>
                            {filteredSections.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>
                                        No hay secciones disponibles
                                    </Text>
                                </View>
                            ) : (
                                filteredSections.map((section) => {
                                    const isSelected = selectedSection?.id === section.id;
                                    const levelColor = EDUCATION_LEVEL_COLORS[section.type];

                                    return (
                                        <TouchableOpacity
                                            key={section.id}
                                            style={[
                                                styles.sectionItem,
                                                isSelected && styles.sectionItemSelected,
                                            ]}
                                            onPress={() => handleSelect(section)}
                                        >
                                            <View
                                                style={[
                                                    styles.levelIndicator,
                                                    { backgroundColor: levelColor },
                                                ]}
                                            />
                                            <View style={styles.sectionInfo}>
                                                <Text style={styles.sectionName}>
                                                    {section.name}
                                                </Text>
                                                <Text style={styles.sectionType}>
                                                    {EDUCATION_LEVEL_LABELS[section.type]}
                                                </Text>
                                            </View>
                                            {isSelected && (
                                                <Ionicons
                                                    name="checkmark-circle"
                                                    size={24}
                                                    color={Colors.primary}
                                                />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    // Selector button
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 10,
    },
    selectorDisabled: {
        opacity: 0.6,
    },
    selectorSelected: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary + '05',
    },
    selectorText: {
        flex: 1,
        fontSize: 15,
        color: Colors.textSecondary,
    },
    selectorTextSelected: {
        color: Colors.textPrimary,
        fontWeight: '600',
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.backgroundTertiary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Filters
    filters: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    filterBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        backgroundColor: Colors.backgroundTertiary,
    },
    filterBtnActive: {
        backgroundColor: Colors.primary + '15',
        borderColor: Colors.primary,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.textSecondary,
    },
    filterTextActive: {
        color: Colors.primary,
    },
    // Section list
    sectionList: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    sectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginVertical: 4,
        backgroundColor: Colors.backgroundTertiary,
        gap: 12,
    },
    sectionItemSelected: {
        backgroundColor: Colors.primary + '10',
    },
    levelIndicator: {
        width: 4,
        height: 32,
        borderRadius: 2,
    },
    sectionInfo: {
        flex: 1,
    },
    sectionName: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    sectionType: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    emptyState: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
});

export default SectionSelector;
