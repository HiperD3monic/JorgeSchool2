/**
 * Layout para el módulo de Planificación
 */

import { Stack } from 'expo-router';
import React from 'react';

export default function PlanningLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="calendar" />
            <Stack.Screen name="timetables" />
            <Stack.Screen name="time-slots" />
        </Stack>
    );
}
