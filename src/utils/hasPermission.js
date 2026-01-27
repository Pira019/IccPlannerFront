import { Role } from "../model/Enum/Role";
import { useAuthStore } from "../store/Auth";

 
/**
 * Vérifie si l'utilisateur a le role ADMIN ou un claim/permission
 * ou un claim avec une valeur spécifique.
 *
 * @param {string} claimName - le nom du claim ou permission
 * @param {any} value - optionnel, valeur à vérifier dans le claim
 * @returns {boolean}
 */
export function hasPermission(claimName, value = undefined) {
    const auth = useAuthStore();

    if (!auth.claims) return false; 
    if (auth.claims.roles.includes(Role.Admin)) return true;

    // Vérifier les permissions
    if (!auth.claims.permissions) return false;

    return auth.claims.permissions.some(p => {
        // 1️ claim simple
        if (typeof p === "string") {
            return value === undefined && p === claimName;
        }

        // 2️ claim avec valeurs
        if (typeof p === "object" && p[claimName]) {
            if (value !== undefined) {
                return p[claimName].includes(value); // vérifier valeur spécifique
            }
            return true; // claim existe → true même si le tableau n’est pas vide
        }

        return false;
    });
}
