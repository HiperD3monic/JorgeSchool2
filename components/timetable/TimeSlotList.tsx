/**
 * TimeSlotList - Lista de bloques horarios
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Colors from '../../constants/Colors';
import { EDUCATION_LEVEL_LABELS } from '../../services-odoo/scheduleService/constants';
import type { EducationLevel, TimeSlot } from '../../services-odoo/scheduleService/types';
import TimeSlotCard from './TimeSlotCard';

interface TimeSlotListProps {
    timeSlots: TimeSlot[];
    loading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    onPressTimeSlot?: (timeSlot: TimeSlot) => void;
    onEditTimeSlot?: (timeSlot: TimeSlot) => void;
    onDeleteTimeSlot?: (timeSlot: TimeSlot) => void;
    showActions?: boolean;
    emptyMessage?: string;
    groupByLevel?: boolean;
}

export const TimeSlotList: React.FC<TimeSlotListProps> = ({
    timeSlots,
    loading = false,
    refreshing = false,
    onRefresh,
    onPressTimeSlot,
    onEditTimeSlot,
    onDeleteTimeSlot,
    showActions = false,
    emptyMessage = 'No hay bloques horarios configurados',
    groupByLevel = false,
}) => {
    // Skeleton loading
    if (loading && timeSlots.length === 0) {
        return (
            <View style={styles.container}>
                {[1, 2, 3, 4].map((i) => (
                    <View key={i} style={styles.skeleton}>
                        <View style={styles.skeletonBar} />
                        <View style={styles.skeletonContent}>
                            <View style={styles.skeletonIcon} />
                            <View style={styles.skeletonText}>
                                <View style={styles.skeletonTitle} />
                                <View style={styles.skeletonSubtitle} />
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        );
    }

    // Empty state
    if (!loading && timeSlots.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="layers-outline" size={64} color={Colors.textTertiary} />
                <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
        );
    }

    // Agrupar por nivel educativo
    const renderGroupedList = () => {
        const grouped: Record<EducationLevel, TimeSlot[]> = {
            pre: [],
            primary: [],
            secundary: [],
        };

        timeSlots.forEach((slot) => {
            if (grouped[slot.educationLevel]) {
                grouped[slot.educationLevel].push(slot);
            }
        });

        return (
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    onRefresh ? (
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.primary]}
                            tintColor={Colors.primary}
                        />
                    ) : undefined
                }
            >
                {(Object.keys(grouped) as EducationLevel[]).map((level) => {
                    if (grouped[level].length === 0) return null;

                    return (
                        <View key={level} style={styles.group}>
                            <View style={styles.groupHeader}>
                                <Text style={styles.groupTitle}>
                                    {EDUCATION_LEVEL_LABELS[level]}
                                </Text>
                                <Text style={styles.groupCount}>
                                    {grouped[level].length} bloques
                                </Text>
                            </View>
                            {grouped[level].map((slot) => (
                                <TimeSlotCard
                                    key={slot.id}
                                    timeSlot={slot}
                                    onPress={onPressTimeSlot}
                                    onEdit={onEditTimeSlot}
                                    onDelete={onDeleteTimeSlot}
                                    showActions={showActions}
                                />
                            ))}
                        </View>
                    );
                })}
            </ScrollView>
        );
    };

    // Lista simple
    const renderItem = ({ item }: { item: TimeSlot }) => (
        <TimeSlotCard
            timeSlot={item}
            onPress={onPressTimeSlot}
            onEdit={onEditTimeSlot}
            onDelete={onDeleteTimeSlot}
            showActions={showActions}
        />
    );

    if (groupByLevel) {
        return renderGroupedList();
    }

    return (
        <FlatList
            data={timeSlots}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListFooterComponent={
                loading ? (
                    <ActivityIndicator
                        size="small"
                        color={Colors.primary}
                        style={styles.loadingMore}
                    />
                ) : null
            }
        />
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
    },
    container: {
        padding: 16,
    },
    listContent: {
        padding: 16,
    },
    // Skeleton
    skeleton: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
    },
    skeletonBar: {
        width: 4,
        backgroundColor: Colors.gray[300],
    },
    skeletonContent: {
        flex: 1,
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    skeletonIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: Colors.gray[200],
    },
    skeletonText: {
        flex: 1,
        gap: 8,
    },
    skeletonTitle: {
        height: 16,
        width: '60%',
        backgroundColor: Colors.gray[200],
        borderRadius: 4,
    },
    skeletonSubtitle: {
        height: 12,
        width: '40%',
        backgroundColor: Colors.gray[200],
        borderRadius: 4,
    },
    // Empty
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 16,
    },
    // Groups
    group: {
        marginBottom: 24,
    },
    groupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    groupTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    groupCount: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    loadingMore: {
        marginVertical: 16,
    },
});

export default TimeSlotList;
