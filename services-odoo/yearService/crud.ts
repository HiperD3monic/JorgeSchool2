/**
 * Operaciones CRUD para años escolares
 */

import * as odooApi from '../apiService';
import { cacheManager } from '../cache/cacheManager';
import { MODELS, YEAR_FIELDS } from './constants';
import { normalizeSchoolYear } from './normalizer';
import { NewSchoolYear, SchoolYear, SchoolYearServiceResult } from './types';

/**
 * Invalida todo el caché de años escolares
 */
const invalidateYearsCache = (): void => {
    cacheManager.invalidatePattern('school_years');
    if (__DEV__) {
        console.log('🗑️ Caché de años escolares invalidado');
    }
};

/**
 * Crea un nuevo año escolar
 */
export const createSchoolYear = async (
    yearData: NewSchoolYear
): Promise<SchoolYearServiceResult<SchoolYear>> => {
    try {
        if (__DEV__) {
            console.time('⏱️ createSchoolYear');
        }

        const values: any = {
            name: yearData.name,
            evalution_type_secundary: yearData.evalutionTypeSecundary,
            evalution_type_primary: yearData.evalutionTypePrimary,
            evalution_type_pree: yearData.evalutionTypePree,
        };

        const createResult = await odooApi.create(MODELS.YEAR, values);

        if (!createResult.success) {
            if (createResult.error?.isSessionExpired) {
                return { success: false, message: 'Tu sesión ha expirado' };
            }
            return {
                success: false,
                message: odooApi.extractOdooErrorMessage(createResult.error),
            };
        }

        // Leer el año creado
        const newId = createResult.data;
        const readResult = await odooApi.read(MODELS.YEAR, [newId!], YEAR_FIELDS);

        if (!readResult.success || !readResult.data) {
            return { success: false, message: 'Error al leer el año creado' };
        }

        const newYear = normalizeSchoolYear(readResult.data[0]);

        // Invalidar caché
        invalidateYearsCache();

        if (__DEV__) {
            console.timeEnd('⏱️ createSchoolYear');
            console.log('✅ Año escolar creado');
        }

        return {
            success: true,
            data: newYear,
            schoolYear: newYear,
            message: 'Año escolar creado exitosamente',
        };
    } catch (error: any) {
        if (__DEV__) {
            console.error('❌ Error en createSchoolYear:', error);
        }
        return {
            success: false,
            message: odooApi.extractOdooErrorMessage(error),
        };
    }
};

/**
 * Actualiza un año escolar existente
 */
export const updateSchoolYear = async (
    id: number,
    yearData: Partial<NewSchoolYear>
): Promise<SchoolYearServiceResult<SchoolYear>> => {
    try {
        if (__DEV__) {
            console.time(`⏱️ updateSchoolYear:${id}`);
        }

        const values: any = {};

        if (yearData.name !== undefined) values.name = yearData.name;
        if (yearData.evalutionTypeSecundary !== undefined) {
            values.evalution_type_secundary = yearData.evalutionTypeSecundary;
        }
        if (yearData.evalutionTypePrimary !== undefined) {
            values.evalution_type_primary = yearData.evalutionTypePrimary;
        }
        if (yearData.evalutionTypePree !== undefined) {
            values.evalution_type_pree = yearData.evalutionTypePree;
        }

        const updateResult = await odooApi.update(MODELS.YEAR, [id], values);

        if (!updateResult.success) {
            if (updateResult.error?.isSessionExpired) {
                return { success: false, message: 'Tu sesión ha expirado' };
            }
            return {
                success: false,
                message: odooApi.extractOdooErrorMessage(updateResult.error),
            };
        }

        // Leer datos actualizados
        const readResult = await odooApi.read(MODELS.YEAR, [id], YEAR_FIELDS);

        if (!readResult.success || !readResult.data) {
            return { success: false, message: 'Error al leer el año actualizado' };
        }

        const updatedYear = normalizeSchoolYear(readResult.data[0]);

        // Invalidar caché
        invalidateYearsCache();

        if (__DEV__) {
            console.timeEnd(`⏱️ updateSchoolYear:${id}`);
            console.log('✅ Año escolar actualizado');
        }

        return {
            success: true,
            data: updatedYear,
            schoolYear: updatedYear,
            message: 'Año escolar actualizado exitosamente',
        };
    } catch (error: any) {
        if (__DEV__) {
            console.error('❌ Error en updateSchoolYear:', error);
        }
        return {
            success: false,
            message: odooApi.extractOdooErrorMessage(error),
        };
    }
};

/**
 * Elimina un año escolar
 */
export const deleteSchoolYear = async (id: number): Promise<SchoolYearServiceResult> => {
    try {
        if (__DEV__) {
            console.time(`⏱️ deleteSchoolYear:${id}`);
        }

        const deleteResult = await odooApi.deleteRecords(MODELS.YEAR, [id]);

        if (!deleteResult.success) {
            if (deleteResult.error?.isSessionExpired) {
                return { success: false, message: 'Tu sesión ha expirado' };
            }
            return {
                success: false,
                message: odooApi.extractOdooErrorMessage(deleteResult.error),
            };
        }

        // Invalidar caché
        invalidateYearsCache();

        if (__DEV__) {
            console.timeEnd(`⏱️ deleteSchoolYear:${id}`);
            console.log('✅ Año escolar eliminado');
        }

        return {
            success: true,
            message: 'Año escolar eliminado exitosamente',
        };
    } catch (error: any) {
        if (__DEV__) {
            console.error('❌ Error en deleteSchoolYear:', error);
        }
        return {
            success: false,
            message: odooApi.extractOdooErrorMessage(error),
        };
    }
};
