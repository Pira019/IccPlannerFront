import { useAuthStore } from "@/store/Auth"

function hasClaim(claimKey, expectedValue) {

const claims =  useAuthStore().claims || {} // objet { role: [...], permission: [...], etc. }

  if (!claims[claimKey]) return false

  // Si le claim est un tableau (ex: plusieurs rôles ou permissions)
  if (Array.isArray(claims[claimKey])) {
    return claims[claimKey].includes(expectedValue)
  }
  // Si c'est une seule valeur (string, number, bool…)
  return claims[claimKey] === expectedValue
}

/**
 * Vérifie si l'utilisateur a un claim qui commence par un préfixe donné.
 * Ex: hasClaimStartsWith('permissions', 'depart:manager') → true si "depart:manager:1,2,4" existe
 */
export function hasClaimStartsWith(claimKey, prefix) {
  const claims = useAuthStore().claims || {}
  if (!claims[claimKey] || !Array.isArray(claims[claimKey])) return false
  return claims[claimKey].some(c => c.startsWith(prefix))
}

export function checkRequiredClaims(requiredClaims) {

      if (!Array.isArray(requiredClaims)) {
        return true
    }
        // L'utilisateur doit avoir AU MOINS UNE valeur de CHAQUE claim requis
    return requiredClaims?.some(claimRequirement => {
        const { key, value, startsWith } = claimRequirement

        // Vérification par préfixe (ex: depart:manager)
        if (startsWith) {
            return hasClaimStartsWith(key, startsWith)
        }

        // Vérifier si l'utilisateur a au moins une des valeurs requises pour ce type de claim
        return value.some(requiredValue =>
            hasClaim(key, requiredValue)
        )
    })
}
