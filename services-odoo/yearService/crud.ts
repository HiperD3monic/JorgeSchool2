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
        if (yearData.current !== undefined) {
            values.current = yearData.current;

            // Si se está marcando como actual, primero desmarcar cualquier otro año actual
            if (yearData.current === true) {
                // Buscar años que están marcados como actuales (excepto el que estamos editando)
                const searchResult = await odooApi.searchRead(
                    MODELS.YEAR,
                    [['current', '=', true], ['id', '!=', id]],
                    ['id'],
                    100,
                    0
                );

                if (searchResult.success && searchResult.data && searchResult.data.length > 0) {
                    // Desmarcar todos los años que estaban como actuales
                    const otherCurrentYearIds = searchResult.data.map((y: any) => y.id);
                    await odooApi.update(MODELS.YEAR, otherCurrentYearIds, { current: false });

                    if (__DEV__) {
                        console.log(`🔄 Desmarcados ${otherCurrentYearIds.length} años como no actuales`);
                    }
                }
            }
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

/**
 * Inicia un año escolar (cambia state de 'draft' a 'active')
 */
export const startSchoolYear = async (id: number): Promise<SchoolYearServiceResult<SchoolYear>> => {
    try {
        if (__DEV__) {
            console.time(`⏱️ startSchoolYear:${id}`);
        }

        // Llamar al método action_start_year en Odoo
        const callResult = await odooApi.callMethod(MODELS.YEAR, 'action_start_year', [[id]]);

        if (!callResult.success) {
            if (callResult.error?.isSessionExpired) {
                return { success: false, message: 'Tu sesión ha expirado' };
            }
            return {
                success: false,
                message: odooApi.extractOdooErrorMessage(callResult.error),
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
            console.timeEnd(`⏱️ startSchoolYear:${id}`);
            console.log('✅ Año escolar iniciado');
        }

        return {
            success: true,
            data: updatedYear,
            schoolYear: updatedYear,
            message: 'Año escolar iniciado exitosamente',
        };
    } catch (error: any) {
        if (__DEV__) {
            console.error('❌ Error en startSchoolYear:', error);
        }
        return {
            success: false,
            message: odooApi.extractOdooErrorMessage(error),
        };
    }
};

/**
 * Finaliza un año escolar (cambia state de 'active' a 'finished')
 */
export const finishSchoolYear = async (id: number): Promise<SchoolYearServiceResult<SchoolYear>> => {
    try {
        if (__DEV__) {
            console.time(`⏱️ finishSchoolYear:${id}`);
        }

        // Llamar al método action_finish_year en Odoo
        const callResult = await odooApi.callMethod(MODELS.YEAR, 'action_finish_year', [[id]]);

        if (!callResult.success) {
            if (callResult.error?.isSessionExpired) {
                return { success: false, message: 'Tu sesión ha expirado' };
            }
            return {
                success: false,
                message: odooApi.extractOdooErrorMessage(callResult.error),
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
            console.timeEnd(`⏱️ finishSchoolYear:${id}`);
            console.log('✅ Año escolar finalizado');
        }

        return {
            success: true,
            data: updatedYear,
            schoolYear: updatedYear,
            message: 'Año escolar finalizado exitosamente',
        };
    } catch (error: any) {
        if (__DEV__) {
            console.error('❌ Error en finishSchoolYear:', error);
        }
        return {
            success: false,
            message: odooApi.extractOdooErrorMessage(error),
        };
    }
};

/**
 * Avanza al siguiente lapso del año escolar (1 -> 2 -> 3)
 */
export const nextLapso = async (id: number): Promise<SchoolYearServiceResult<SchoolYear>> => {
    try {
        if (__DEV__) {
            console.time(`⏱️ nextLapso:${id}`);
        }

        // Llamar al método action_next_lapso en Odoo
        const callResult = await odooApi.callMethod(MODELS.YEAR, 'action_next_lapso', [[id]]);

        if (!callResult.success) {
            if (callResult.error?.isSessionExpired) {
                return { success: false, message: 'Tu sesión ha expirado' };
            }
            return {
                success: false,
                message: odooApi.extractOdooErrorMessage(callResult.error),
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
            console.timeEnd(`⏱️ nextLapso:${id}`);
            console.log('✅ Avanzado al siguiente lapso');
        }

        return {
            success: true,
            data: updatedYear,
            schoolYear: updatedYear,
            message: 'Avanzado al siguiente lapso exitosamente',
        };
    } catch (error: any) {
        if (__DEV__) {
            console.error('❌ Error en nextLapso:', error);
        }
        return {
            success: false,
            message: odooApi.extractOdooErrorMessage(error),
        };
    }
};
