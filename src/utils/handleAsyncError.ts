import { ErrorModel } from '@/model/ErrorModel';
import { useToastStore } from '@/store/Index';

const storeToast = useToastStore();
// Permis de capturer les méthodes asynchrone
export const handleAsyncError = async (asyncFunc, t, setLoading?: (val: boolean) => void, showToast = false, toastDetailRess = null): Promise<{ result?: any; error?: ErrorModel }> => {
   
    if (setLoading) setLoading(true);
    try {
        const result = await asyncFunc(); // Exécute la fonction asynchrone

        //Afficher le Toast
        if (showToast) {
            const msg = toastDetailRess ? toastDetailRess : 'msgSuccess';
            storeToast.toastMsg({ isSucceed: true, msg: t?.(msg) });
        }
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
    } finally {
        if (setLoading) setLoading(false);
    }
};
