import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';

interface SchoolYearStatsCardProps {
    total: number;
    currentYear: string | null;
    isSelected?: boolean;
    onPress?: () => void;
}

export const SchoolYearStatsCard: React.FC<SchoolYearStatsCardProps> = ({
    total,
    currentYear,
    isSelected = false,
    onPress,
}) => {
    return (
        <TouchableOpacity
            style={[styles.container, isSelected && styles.containerSelected]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            <View style={styles.row}>
                <View style={styles.statBox}>
                    <View style={styles.iconWrapper}>
                        <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                    </View>
                    <View>
                        <Text style={styles.statNumber}>{total}</Text>
                        <Text style={styles.statLabel}>Total Años</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.statBox}>
                    <View style={[styles.iconWrapper, { backgroundColor: '#10b98115' }]}>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#10b981" />
                    </View>
                    <View>
                        <Text style={[styles.statNumber, { color: '#10b981' }]}>
                            {currentYear || '-'}
                        </Text>
                        <Text style={styles.statLabel}>Año Actual</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: 'transparent',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            }
        }),
    },
    containerSelected: {
        borderColor: Colors.primary,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    statBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
        justifyContent: 'center',
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.primary,
        letterSpacing: -0.5,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '600',
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: Colors.border,
        marginHorizontal: 16,
    },
});
