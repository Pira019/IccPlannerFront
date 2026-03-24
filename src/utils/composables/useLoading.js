
import { ref, watch } from 'vue'

export function useLoading(emit) {
  const loading = ref(false)
  const errorReq = ref(false)

  if (emit) {
    watch(loading, val => emit('update:loading', val))
    watch(errorReq, val => emit('update:errorReq', val))
  }

  return { loading, errorReq }
}
