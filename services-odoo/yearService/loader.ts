/**
 * Funciones de carga y lectura de años escolares
 */

import * as odooApi from '../apiService';
import { cacheManager } from '../cache/cacheManager';
import { CACHE_KEYS, CACHE_TTL, EVALUATION_TYPE_FIELDS, MODELS, YEAR_FIELDS } from './constants';
import { normalizeSchoolYear, normalizeSchoolYears } from './normalizer';
import { EvaluationType, SchoolYear } from './types';

/**
 * ⚡ Carga todos los años escolares (con caché)
 */
export const loadSchoolYears = async (forceReload: boolean = false): Promise<SchoolYear[]> => {
    try {
        const cacheKey = CACHE_KEYS.ALL;

        if (!forceReload) {
            const cached = cacheManager.get<SchoolYear[]>(cacheKey);
            if (cached && cached.length > 0) {
                if (__DEV__) {
                    console.log(`📦 Usando caché: ${cached.length} años escolares`);
                }
                return cached;
            }
        }

        if (__DEV__) {
            console.time('⏱️ loadSchoolYears');
        }

        const result = await odooApi.searchRead(
            MODELS.YEAR,
            [],
            YEAR_FIELDS,
            100,
            0,
            'id desc'
        );

        if (!result.success) {
            if (__DEV__) {
                console.error('❌ Error cargando años escolares:', result.error);
            }

            const cached = cacheManager.get<SchoolYear[]>(cacheKey);
            if (cached) {
                if (__DEV__) {
                    console.log(`📦 Usando caché por error: ${cached.length} años`);
                }
                return cached;
            }

            return [];
        }

        const years = normalizeSchoolYears(result.data || []);
        cacheManager.set(cacheKey, years, CACHE_TTL.YEARS);

        if (__DEV__) {
            console.timeEnd('⏱️ loadSchoolYears');
            console.log(`✅ ${years.length} años escolares cargados`);
        }

        return years;
    } catch (error: any) {
        if (__DEV__) {
            console.error('❌ Error en loadSchoolYears:', error);
        }

        const cached = cacheManager.get<SchoolYear[]>(CACHE_KEYS.ALL);
        return cached || [];
    }
};

/**
 * Carga el año escolar actual
 */
export const loadCurrentYear = async (): Promise<SchoolYear | null> => {
    try {
        const cacheKey = CACHE_KEYS.CURRENT;
        const cached = cacheManager.get<SchoolYear>(cacheKey);

        if (cached) {
            if (__DEV__) {
                console.log('📦 Usando caché: año actual');
            }
            return cached;
        }

        const result = await odooApi.searchRead(
            MODELS.YEAR,
            [['current', '=', true]],
            YEAR_FIELDS,
            1,
            0
        );

        if (!result.success || !result.data || result.data.length === 0) {
            return null;
        }

        const currentYear = normalizeSchoolYear(result.data[0]);
        cacheManager.set(cacheKey, currentYear, CACHE_TTL.YEARS);

        return currentYear;
    } catch (error) {
        if (__DEV__) {
            console.error('❌ Error en loadCurrentYear:', error);
        }
        return null;
    }
};

/**
 * Obtiene un año escolar por ID
 */
export const getYearById = async (id: number): Promise<SchoolYear | null> => {
    try {
        const cacheKey = CACHE_KEYS.BY_ID(id);
        const cached = cacheManager.get<SchoolYear>(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await odooApi.read(MODELS.YEAR, [id], YEAR_FIELDS);

        if (!result.success || !result.data || result.data.length === 0) {
            return null;
        }

        const year = normalizeSchoolYear(result.data[0]);
        cacheManager.set(cacheKey, year, CACHE_TTL.YEARS);

        return year;
    } catch (error) {
        if (__DEV__) {
            console.error('❌ Error en getYearById:', error);
        }
        return null;
    }
};

/**
 * Carga los tipos de evaluación disponibles
 */
export const loadEvaluationTypes = async (type?: 'pre' | 'primary' | 'secundary'): Promise<EvaluationType[]> => {
    try {
        const domain = type ? [['type', '=', type]] : [];

        const result = await odooApi.searchRead(
            MODELS.EVALUATION_TYPE,
            domain,
            EVALUATION_TYPE_FIELDS,
            100,
            0,
            'name asc'
        );

        if (!result.success) {
            return [];
        }

        return (result.data || []).map((item: any) => ({
            id: item.id,
            name: item.name,
        }));
    } catch (error) {
        if (__DEV__) {
            console.error('❌ Error en loadEvaluationTypes:', error);
        }
        return [];
    }
};

/**
 * Obtiene el conteo de años escolares
 */
export const getSchoolYearsCount = async (): Promise<number> => {
    try {
        const result = await odooApi.searchCount(MODELS.YEAR, []);
        return result.success ? (result.data || 0) : 0;
    } catch (error) {
        if (__DEV__) {
            console.error('❌ Error obteniendo conteo:', error);
        }
        return 0;
    }
};
