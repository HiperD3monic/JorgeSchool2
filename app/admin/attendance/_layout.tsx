/**
 * Layout para rutas de Asistencias
 */

import { Stack } from 'expo-router';
import React from 'react';

export default function AttendanceLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="register" />
            <Stack.Screen name="students" />
            <Stack.Screen name="staff" />
        </Stack>
    );
}
