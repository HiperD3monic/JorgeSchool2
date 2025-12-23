/**
 * Lista de Asistencias de Personal
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AttendanceList } from '../../../components/attendance';
import Colors from '../../../constants/Colors';
import {
    ATTENDANCE_PAGE_SIZE,
    AttendanceRecord,
    loadEmployeeAttendance,
} from '../../../services-odoo/attendanceService';

export default function StaffAttendance() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    const totalPages = Math.ceil(total / ATTENDANCE_PAGE_SIZE);
    const hasMore = page < totalPages;

    const loadData = useCallback(async (pageNum: number = 1, append: boolean = false) => {
        if (!append) setLoading(true);
        try {
            const result = await loadEmployeeAttendance(
                {},
                { limit: ATTENDANCE_PAGE_SIZE, offset: (pageNum - 1) * ATTENDANCE_PAGE_SIZE }
            );

            if (result.success && result.data) {
                if (append) {
                    setRecords((prev) => [...prev, ...result.data!.records]);
                } else {
                    setRecords(result.data.records);
                }
                setTotal(result.data.total);
                setPage(pageNum);
            }
        } catch {
            // Error silenciado
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData(1, false);
        setRefreshing(false);
    }, [loadData]);

    const loadMore = useCallback(() => {
        if (hasMore && !loading) {
            loadData(page + 1, true);
        }
    }, [hasMore, loading, page, loadData]);

    const handlePressRecord = (record: AttendanceRecord) => {
        // TODO: Navegar a detalle
        console.log('Press:', record.id);
    };

    return (
        <SafeAreaProvider>
            <StatusBar style="dark" />
            <Head><title>Asistencia de Personal</title></Head>

            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Personal</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInput}>
                        <Ionicons name="search" size={18} color={Colors.textTertiary} />
                        <TextInput
                            style={styles.searchField}
                            placeholder="Buscar empleado..."
                            placeholderTextColor={Colors.textTertiary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <Text style={styles.searchCount}>{total} registros</Text>
                </View>

                {/* List */}
                <AttendanceList
                    records={records}
                    loading={loading}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    onLoadMore={loadMore}
                    onPressRecord={handlePressRecord}
                    hasMore={hasMore}
                    emptyMessage="No hay registros de asistencia de personal"
                />
            </View>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundSecondary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? 44 : 54,
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    placeholder: {
        width: 40,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        gap: 12,
    },
    searchInput: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 40,
        gap: 8,
    },
    searchField: {
        flex: 1,
        fontSize: 14,
        color: Colors.textPrimary,
    },
    searchCount: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
});
