import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface SchoolYearCardSkeletonProps {
    count?: number;
}

export const SchoolYearCardSkeleton: React.FC<SchoolYearCardSkeletonProps> = ({
    count = 3,
}) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <Animated.View
                    key={index}
                    entering={FadeIn.delay(index * 50).duration(200)}
                    style={styles.container}
                >
                    <View style={styles.card}>
                        <View style={styles.headerRow}>
                            {/* Icon skeleton */}
                            <View style={styles.iconSkeleton} />

                            {/* Content skeleton */}
                            <View style={styles.contentSkeleton}>
                                <View style={styles.titleRow}>
                                    <View style={styles.titleSkeleton} />
                                    <View style={styles.badgeSkeleton} />
                                </View>
                                <View style={styles.statsRow}>
                                    <View style={styles.statSkeleton} />
                                    <View style={styles.statSkeleton} />
                                    <View style={styles.statSkeleton} />
                                </View>
                            </View>

                            {/* Chevron skeleton */}
                            <View style={styles.chevronSkeleton} />
                        </View>
                    </View>
                </Animated.View>
            ))}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
            }
        }),
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconSkeleton: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: '#f3f4f6',
        marginRight: 14,
    },
    contentSkeleton: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 8,
    },
    titleSkeleton: {
        width: 120,
        height: 20,
        borderRadius: 6,
        backgroundColor: '#f3f4f6',
    },
    badgeSkeleton: {
        width: 60,
        height: 18,
        borderRadius: 10,
        backgroundColor: '#f3f4f6',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    statSkeleton: {
        width: 50,
        height: 16,
        borderRadius: 4,
        backgroundColor: '#f3f4f6',
    },
    chevronSkeleton: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#f3f4f6',
        marginLeft: 8,
    },
});
