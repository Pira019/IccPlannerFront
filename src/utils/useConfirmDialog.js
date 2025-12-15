import { useConfirm } from 'primevue/useconfirm';
import { useI18n } from 'vue-i18n';

export function useConfirmDialog() {
    const confirm = useConfirm();
    const { t } = useI18n();

    function showConfirm({
        group,
        message,
        header = 'Confirmation',
        icon = 'pi pi-exclamation-triangle',
        acceptLabel = 'Confirm',
        acceptSeverity = 'success',
        rejectLabel = 'Cancel' ,
        onAccept
    }) {
        confirm.require({
            group,
            message : t(message),
            header: t(header),
            icon,
            rejectProps: {
                label: t(rejectLabel),
                severity: 'secondary',
                outlined: true
            },
            acceptProps: {
                label: t(acceptLabel) ,
                severity: acceptSeverity
            },
            accept: onAccept
        });
    }

    return { showConfirm };
}
