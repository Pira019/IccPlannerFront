import { defineStore } from "pinia";

export const useToastStore = defineStore( 'toast',
    {
        state : () => ({ msg : null, isSucceed : null}),
        actions:{
            //payLoad see type ToastModel
            toastMsg(payLoad)
            {
                this.msg = payLoad.msg,
                this.isSucceed = payLoad.isSucceed
            },

             toastReset()
            {
                this.isSucceed = null
            },
        }

    }
)
