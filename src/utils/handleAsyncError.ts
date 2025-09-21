import { ErrorModel } from '@/model/ErrorModel';
import { useToastStore } from '@/store/Index';
import { useI18n } from 'vue-i18n';

export function useHandleAsyncError() {
    const { t } = useI18n();
    const storeToast = useToastStore();

    const handleAsyncError = async (asyncFunc: () => Promise<any>, setLoading?: (val: boolean) => void, showToast = false, toastDetailRess: string | null = null): Promise<{ result?: any; error?: ErrorModel }> => {
        if (setLoading) setLoading(true);
        try {
            const result = await asyncFunc();

            if (showToast) {
                const msg = toastDetailRess ?? 'msgSuccess';
                storeToast.toastMsg({ isSucceed: true, msg: t(msg) });
            }

            return { result: result.data };
        } catch (error: any) {
            const errorModel: ErrorModel = {
                success: false,
                statusCode: error?.response?.data?.statusCode,
                message: error?.response?.data?.message || t('internalError'),
                validationErrors: error?.response?.data?.validationErrors
            };
            return { error: errorModel };
        } finally {
            if (setLoading) setLoading(false);
        }
    };

    return { handleAsyncError };
}
