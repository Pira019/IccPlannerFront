import { ErrorModel } from '@/model/ErrorModel';

// Permis de capturer les méthodes asynchrone
export const handleAsyncError = async (asyncFunc, t): Promise<{ result?: any; error?: ErrorModel }> => {
    try {
        const result = await asyncFunc(); // Exécute la fonction asynchrone
        return {
            result: result.data
        };
    } catch (error: any) {
        // Gérer l'erreur
        const errorModel: ErrorModel = {
            success: false,
            statusCode: error?.response?.data?.statusCode,
            message: error?.response?.data?.message || t?.('internalError'),
            validationErrors: error?.response?.data?.validationErrors
        };
        return { error: errorModel };
    }
};
