/**
 * Hook para gestión de años escolares
 * Maneja estado, carga, búsqueda y operaciones CRUD
 */

import { useCallback, useEffect, useState } from 'react';
import * as authService from '../services-odoo/authService';
import type { SchoolYear } from '../services-odoo/yearService';
import * as yearService from '../services-odoo/yearService';

interface UseSchoolYearsResult {
    years: SchoolYear[];
    currentYear: SchoolYear | null;
    loading: boolean;
    initialLoading: boolean;
    refreshing: boolean;
    searchQuery: string;
    searchMode: boolean;
    totalYears: number;
    isOfflineMode: boolean;
    setSearchQuery: (query: string) => void;
    exitSearchMode: () => void;
    onRefresh: () => Promise<void>;
    handleDelete: (id: number) => Promise<void>;
}

export const useSchoolYears = (): UseSchoolYearsResult => {
    const [years, setYears] = useState<SchoolYear[]>([]);
    const [allYears, setAllYears] = useState<SchoolYear[]>([]);
    const [currentYear, setCurrentYear] = useState<SchoolYear | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchMode, setSearchMode] = useState(false);
    const [isOfflineMode, setIsOfflineMode] = useState(false);

    /**
     * Carga inicial de años escolares
     */
    const loadInitialYears = useCallback(async () => {
        try {
            if (__DEV__) {
                console.log('🔄 Cargando años escolares...');
            }

            // Verificar conectividad
            const serverHealth = await authService.checkServerHealth();
            const isOffline = !serverHealth.ok;
            setIsOfflineMode(isOffline);

            if (isOffline) {
                if (__DEV__) {
                    console.log('📡 Modo offline - usando caché');
                }
            }

            // Cargar años (con caché en offline)
            const yearsData = await yearService.loadSchoolYears(!isOffline);
            setAllYears(yearsData);
            setYears(yearsData);

            // Identificar año actual
            const current = yearsData.find(y => y.current);
            setCurrentYear(current || null);

            if (__DEV__) {
                console.log(`✅ ${yearsData.length} años escolares cargados`);
            }
        } catch (error) {
            if (__DEV__) {
                console.error('❌ Error en carga inicial:', error);
            }
            setIsOfflineMode(true);
        } finally {
            setInitialLoading(false);
        }
    }, []);

    /**
     * Efecto de carga inicial
     */
    useEffect(() => {
        loadInitialYears();
    }, [loadInitialYears]);

    /**
     * Búsqueda de años escolares
     */
    useEffect(() => {
        const performSearch = () => {
            if (searchQuery.trim().length === 0) {
                setSearchMode(false);
                setYears(allYears);
                return;
            }

            setSearchMode(true);
            setLoading(true);

            try {
                const query = searchQuery.toLowerCase().trim();

                const results = allYears.filter(year => {
                    const matchesName = year.name.toLowerCase().includes(query);
                    const matchesCurrent = query.includes('actual') && year.current;
                    return matchesName || matchesCurrent;
                });

                setYears(results);
            } catch (error) {
                if (__DEV__) {
                    console.error('❌ Error en búsqueda:', error);
                }
                setYears([]);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(performSearch, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery, allYears]);

    /**
     * Salir del modo búsqueda
     */
    const exitSearchMode = useCallback(() => {
        setSearchQuery('');
        setSearchMode(false);
        setYears(allYears);
    }, [allYears]);

    /**
     * Refrescar datos
     */
    const onRefresh = useCallback(async () => {
        setRefreshing(true);

        try {
            const serverHealth = await authService.checkServerHealth();
            const isOffline = !serverHealth.ok;
            setIsOfflineMode(isOffline);

            if (isOffline) {
                if (__DEV__) {
                    console.log('⚠️ Sin conexión durante refresh');
                }
                return;
            }

            // Forzar recarga desde servidor
            const yearsData = await yearService.loadSchoolYears(true);
            setAllYears(yearsData);

            // Si está en búsqueda, mantener resultados
            if (!searchMode) {
                setYears(yearsData);
            }

            // Actualizar año actual
            const current = yearsData.find(y => y.current);
            setCurrentYear(current || null);

            if (__DEV__) {
                console.log('✅ Datos actualizados');
            }
        } catch (error) {
            if (__DEV__) {
                console.error('❌ Error en refresh:', error);
            }
        } finally {
            setRefreshing(false);
        }
    }, [searchMode]);

    /**
     * Eliminar un año escolar
     */
    const handleDelete = useCallback(async (id: number) => {
        try {
            if (__DEV__) {
                console.log(`🗑️ Eliminando año escolar ${id}...`);
            }

            const result = await yearService.deleteSchoolYear(id);

            if (result.success) {
                // Actualizar estado local
                setAllYears(prev => prev.filter(y => y.id !== id));
                setYears(prev => prev.filter(y => y.id !== id));

                // Actualizar año actual si fue eliminado
                if (currentYear?.id === id) {
                    setCurrentYear(null);
                }

                if (__DEV__) {
                    console.log('✅ Año escolar eliminado');
                }
            } else {
                throw new Error(result.message || 'Error al eliminar');
            }
        } catch (error: any) {
            if (__DEV__) {
                console.error('❌ Error eliminando año escolar:', error);
            }
            throw error;
        }
    }, [currentYear, onRefresh]);

    return {
        years,
        currentYear,
        loading,
        initialLoading,
        refreshing,
        searchQuery,
        searchMode,
        totalYears: allYears.length,
        isOfflineMode,
        setSearchQuery,
        exitSearchMode,
        onRefresh,
        handleDelete,
    };
};
