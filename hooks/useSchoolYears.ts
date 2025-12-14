import { useCallback, useEffect, useState } from 'react';
import * as authService from '../services-odoo/authService';
import type { SchoolYear } from '../services-odoo/yearService';
import * as yearService from '../services-odoo/yearService';

const ITEMS_PER_PAGE = 8;

/**
 * Ordena los años escolares con el año actual primero
 */
const sortYearsWithCurrentFirst = (years: SchoolYear[]): SchoolYear[] => {
    return [...years].sort((a, b) => {
        // El año actual va primero
        if (a.current && !b.current) return -1;
        if (!a.current && b.current) return 1;
        // Luego ordenar por nombre descendente (más reciente primero)
        return b.name.localeCompare(a.name);
    });
};

interface UseSchoolYearsResult {
    years: SchoolYear[];
    currentYear: SchoolYear | null;
    loading: boolean;
    initialLoading: boolean;
    refreshing: boolean;
    searchQuery: string;
    searchMode: boolean;
    totalYears: number;
    currentPage: number;
    totalPages: number;
    isOfflineMode: boolean;
    setSearchQuery: (query: string) => void;
    exitSearchMode: () => void;
    goToPage: (page: number) => void;
    onRefresh: () => Promise<void>;
    handleDelete: (id: number) => Promise<void>;
}

export const useSchoolYears = (): UseSchoolYearsResult => {
    const [years, setYears] = useState<SchoolYear[]>([]);
    const [allYears, setAllYears] = useState<SchoolYear[]>([]);
    const [currentYear, setCurrentYear] = useState<SchoolYear | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
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

            // Cargar años (con caché en offline) y ordenar
            const yearsData = await yearService.loadSchoolYears(!isOffline);
            const sortedYears = sortYearsWithCurrentFirst(yearsData);
            setAllYears(sortedYears);
            setYears(sortedYears);

            // Identificar año actual
            const current = sortedYears.find(y => y.current);
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
     * Búsqueda de años escolares (sin paginación)
     */
    useEffect(() => {
        const performSearch = () => {
            if (searchQuery.trim().length === 0) {
                setSearchMode(false);
                // Aplicar paginación al salir de búsqueda
                const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
                const endIndex = startIndex + ITEMS_PER_PAGE;
                setYears(allYears.slice(startIndex, endIndex));
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

                // En modo búsqueda, mostrar TODOS los resultados sin paginación
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
    }, [searchQuery, allYears, currentPage]);

    /**
     * Aplicar paginación cuando cambia la página o los datos (solo en modo normal)
     */
    useEffect(() => {
        if (!searchMode && allYears.length > 0) {
            const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            setYears(allYears.slice(startIndex, endIndex));
        }
    }, [currentPage, allYears, searchMode]);

    /**
     * Salir del modo búsqueda
     */
    const exitSearchMode = useCallback(() => {
        setSearchQuery('');
        setSearchMode(false);
        setCurrentPage(1); // Volver a página 1
        // La paginación se aplicará automáticamente por el useEffect
    }, []);

    /**
     * Cambiar de página
     */
    const goToPage = useCallback((page: number) => {
        const totalPages = Math.ceil(allYears.length / ITEMS_PER_PAGE);
        if (page < 1 || page > totalPages || page === currentPage || searchMode) return;
        setCurrentPage(page);
    }, [allYears.length, currentPage, searchMode]);

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

            // Forzar recarga desde servidor y ordenar
            const yearsData = await yearService.loadSchoolYears(true);
            const sortedYears = sortYearsWithCurrentFirst(yearsData);
            setAllYears(sortedYears);

            // Si está en búsqueda, mantener resultados
            if (!searchMode) {
                setYears(sortedYears);
            }

            // Actualizar año actual
            const current = sortedYears.find(y => y.current);
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
    }, [currentYear]);

    const totalPages = Math.ceil(allYears.length / ITEMS_PER_PAGE);

    return {
        years,
        currentYear,
        loading,
        initialLoading,
        refreshing,
        searchQuery,
        searchMode,
        totalYears: allYears.length,
        currentPage,
        totalPages,
        isOfflineMode,
        setSearchQuery,
        exitSearchMode,
        goToPage,
        onRefresh,
        handleDelete,
    };
};
