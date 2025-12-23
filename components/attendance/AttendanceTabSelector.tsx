/**
 * AttendanceTabSelector - Selector horizontal de tabs para asistencias
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';

export type AttendanceTab = 'register' | 'students' | 'staff' | 'all';

interface TabConfig {
    id: AttendanceTab;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabConfig[] = [
    { id: 'register', label: 'Registro', icon: 'checkbox-outline' },
    { id: 'students', label: 'Estudiantes', icon: 'people-outline' },
    { id: 'staff', label: 'Personal', icon: 'briefcase-outline' },
    { id: 'all', label: 'Todos', icon: 'list-outline' },
];

interface AttendanceTabSelectorProps {
    activeTab: AttendanceTab;
    onTabChange: (tab: AttendanceTab) => void;
}

export const AttendanceTabSelector: React.FC<AttendanceTabSelectorProps> = ({
    activeTab,
    onTabChange,
}) => {
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <TouchableOpacity
                            key={tab.id}
                            style={[styles.tab, isActive && styles.tabActive]}
                            onPress={() => onTabChange(tab.id)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={tab.icon}
                                size={20}
                                color={isActive ? Colors.primary : Colors.textSecondary}
                            />
                            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                                {tab.label}
                            </Text>
                            {isActive && <View style={styles.activeIndicator} />}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
        paddingTop: 8,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 6,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
        position: 'relative',
    },
    tabActive: {
        backgroundColor: Colors.primary + '10',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    tabTextActive: {
        color: Colors.primary,
        fontWeight: '700',
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 16,
        right: 16,
        height: 3,
        backgroundColor: Colors.primary,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },
});

export default AttendanceTabSelector;
