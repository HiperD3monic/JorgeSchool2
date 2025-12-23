/**
 * AttendanceList - Lista de registros de asistencia
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Colors from '../../constants/Colors';
import { AttendanceRecord } from '../../services-odoo/attendanceService';
import AttendanceCard from './AttendanceCard';

interface AttendanceListProps {
    records: AttendanceRecord[];
    loading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    onLoadMore?: () => void;
    onPressRecord?: (record: AttendanceRecord) => void;
    onEditRecord?: (record: AttendanceRecord) => void;
    hasMore?: boolean;
    emptyMessage?: string;
}

/**
 * Skeleton para loading
 */
const AttendanceCardSkeleton: React.FC<{ index: number }> = ({ index }) => (
    <View style={[styles.skeletonCard, { opacity: 1 - index * 0.15 }]}>
        <View style={styles.skeletonIndicator} />
        <View style={styles.skeletonIcon} />
        <View style={styles.skeletonContent}>
            <View style={styles.skeletonName} />
            <View style={styles.skeletonDetail} />
            <View style={styles.skeletonMeta} />
        </View>
        <View style={styles.skeletonBadge} />
    </View>
);

/**
 * Estado vacío
 */
const EmptyState: React.FC<{ message?: string }> = ({ message }) => (
    <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={64} color={Colors.textTertiary} />
        <Text style={styles.emptyTitle}>Sin registros</Text>
        <Text style={styles.emptyMessage}>
            {message || 'No hay registros de asistencia para mostrar'}
        </Text>
    </View>
);

export const AttendanceList: React.FC<AttendanceListProps> = ({
    records,
    loading,
    refreshing = false,
    onRefresh,
    onLoadMore,
    onPressRecord,
    onEditRecord,
    hasMore,
    emptyMessage,
}) => {
    // Mostrar skeleton mientras carga inicialmente
    if (loading && records.length === 0) {
        return (
            <View style={styles.container}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <AttendanceCardSkeleton key={i} index={i} />
                ))}
            </View>
        );
    }

    // Mostrar estado vacío
    if (!loading && records.length === 0) {
        return <EmptyState message={emptyMessage} />;
    }

    const renderItem = ({ item, index }: { item: AttendanceRecord; index: number }) => (
        <AttendanceCard
            record={item}
            index={index}
            onPress={onPressRecord ? () => onPressRecord(item) : undefined}
            onEdit={onEditRecord ? () => onEditRecord(item) : undefined}
        />
    );

    const renderFooter = () => {
        if (!hasMore || !loading) return null;
        return (
            <View style={styles.loadingMore}>
                <Text style={styles.loadingText}>Cargando más...</Text>
            </View>
        );
    };

    return (
        <FlatList
            data={records}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
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
            onEndReached={hasMore ? onLoadMore : undefined}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    // Skeleton styles
    skeletonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        gap: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    skeletonIndicator: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: Colors.skeleton.base,
    },
    skeletonIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: Colors.skeleton.base,
    },
    skeletonContent: {
        flex: 1,
        gap: 6,
    },
    skeletonName: {
        width: '70%',
        height: 14,
        borderRadius: 4,
        backgroundColor: Colors.skeleton.base,
    },
    skeletonDetail: {
        width: '50%',
        height: 10,
        borderRadius: 4,
        backgroundColor: Colors.skeleton.base,
    },
    skeletonMeta: {
        width: '40%',
        height: 10,
        borderRadius: 4,
        backgroundColor: Colors.skeleton.base,
    },
    skeletonBadge: {
        width: 60,
        height: 26,
        borderRadius: 8,
        backgroundColor: Colors.skeleton.base,
    },
    // Empty state
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginTop: 16,
    },
    emptyMessage: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    // Loading more
    loadingMore: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
});

export default AttendanceList;
