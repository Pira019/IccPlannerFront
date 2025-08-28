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

export function checkRequiredClaims(requiredClaims) {

      if (!Array.isArray(requiredClaims)) {
        return false
    }
        // L'utilisateur doit avoir AU MOINS UNE valeur de CHAQUE claim requis
    return requiredClaims?.some(claimRequirement => {
        const { key, value } = claimRequirement

        // Vérifier si l'utilisateur a au moins une des valeurs requises pour ce type de claim
        return value.some(requiredValue =>
            hasClaim(key, requiredValue)
        )
    })
}
