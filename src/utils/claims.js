import { useAuthStore } from "@/store/Auth"

export function hasClaim(claimKey, expectedValue) {
  const auth = useAuthStore()

   // Adapter à votre structure claims: { roles: [], permissions: [] }
  let claimValue

  if (claimKey === 'role') {
    claimValue = auth.claims.roles
  } else {
    claimValue = auth.claims.permissions
  }

  if (!claimValue || !Array.isArray(claimValue)) return false

  // Si la valeur attendue est une liste -> vérifier l'inclusion
  if (Array.isArray(expectedValue)) {
   return expectedValue.some(val => claimValue.includes(val))
  }

  // Si le claim est une liste (ex: permissions) -> vérifier si ça contient la valeur attendue
  if (Array.isArray(claimValue)) {
    return claimValue.includes(expectedValue)
  }

  // Comparaison simple
  return claimValue === expectedValue
}
