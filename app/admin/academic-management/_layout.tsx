/**
 * Academic Management Layout
 * Required for nested routing in Expo Router
 */
import { Stack } from 'expo-router';
import React from 'react';

export default function AcademicManagementLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        />
    );
}
