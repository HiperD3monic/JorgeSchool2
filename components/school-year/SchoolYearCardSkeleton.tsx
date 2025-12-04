import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';

// Skeleton para SchoolYearStatsCard
export const SchoolYearStatsCardSkeleton: React.FC = () => {
    const shimmerAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(shimmerAnimation, {
                toValue: 1,
                duration: 800,
                easing: Easing.ease,
                useNativeDriver: true,
            })
        ).start();
    }, [shimmerAnimation]);

    const opacity = shimmerAnimation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.3, 0.7, 0.3],
    });

    return (
        <View style={styles.statsContainer}>
            <Animated.View style={[styles.statsCard, { opacity }]} />
        </View>
    );
};

// Skeleton para SearchBar
export const SchoolYearSearchBarSkeleton: React.FC = () => {
    const shimmerAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(shimmerAnimation, {
                toValue: 1,
                duration: 800,
                easing: Easing.ease,
                useNativeDriver: true,
            })
        ).start();
    }, [shimmerAnimation]);

    const opacity = shimmerAnimation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.3, 0.7, 0.3],
    });

    return (
        <View style={styles.searchContainer}>
            <Animated.View style={[styles.searchBar, { opacity }]} />
        </View>
    );
};

// Skeleton para SchoolYearCard individual
export const SchoolYearCardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
    const shimmerAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(shimmerAnimation, {
                toValue: 1,
                duration: 800,
                easing: Easing.ease,
                useNativeDriver: true,
            })
        ).start();
    }, [shimmerAnimation]);

    const opacity = shimmerAnimation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.3, 0.7, 0.3],
    });

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <View key={index} style={styles.cardContainer}>
                    <View style={styles.card}>
                        {/* Indicador de tipo (icono) */}
                        <Animated.View style={[styles.typeIndicator, { opacity }]} />

                        {/* Contenido */}
                        <View style={styles.content}>
                            {/* Nombre */}
                            <Animated.View style={[styles.nameSkeleton, { opacity }]} />
                            {/* Badge */}
                            <Animated.View style={[styles.badgeSkeleton, { opacity }]} />
                            {/* Stats row */}
                            <View style={styles.statsRow}>
                                <Animated.View style={[styles.statItem, { opacity }]} />
                                <Animated.View style={[styles.statItem, { opacity }]} />
                                <Animated.View style={[styles.statItem, { opacity }]} />
                            </View>
                        </View>

                        {/* Chevron */}
                        <Animated.View style={[styles.chevronSkeleton, { opacity }]} />
                    </View>
                </View>
            ))}
        </>
    );
};

const styles = StyleSheet.create({
    // Stats Card
    statsContainer: {
        marginBottom: 16,
    },
    statsCard: {
        height: 90,
        width: '100%',
        borderRadius: 20,
        backgroundColor: '#e5e7eb',
    },

    // Search Bar
    searchContainer: {
        marginBottom: 8,
    },
    searchBar: {
        height: 52,
        borderRadius: 12,
        backgroundColor: '#e5e7eb',
    },

    // Card
    cardContainer: {
        marginBottom: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#e5e7eb',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            }
        }),
    },
    typeIndicator: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: '#e5e7eb',
        marginRight: 14,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    nameSkeleton: {
        height: 18,
        backgroundColor: '#e5e7eb',
        borderRadius: 6,
        marginBottom: 6,
        width: '60%',
    },
    badgeSkeleton: {
        height: 20,
        backgroundColor: '#e5e7eb',
        borderRadius: 8,
        width: 80,
        marginBottom: 8,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statItem: {
        width: 40,
        height: 14,
        borderRadius: 4,
        backgroundColor: '#e5e7eb',
    },
    chevronSkeleton: {
        width: 20,
        height: 20,
        borderRadius: 4,
        backgroundColor: '#e5e7eb',
        marginLeft: 8,
    },
});
