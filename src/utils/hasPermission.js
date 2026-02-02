import { Role } from "../model/Enum/Role";
import { useAuthStore } from "../store/Auth";


export function hasPermission(permission, value = null) {
    const auth = useAuthStore();
    if (!auth.claims) return false;

    // ADMIN = full access
    if (auth.claims.roles?.includes(Role.Admin)) return true;

    const permissions = auth.claims.permissions;
    if (!Array.isArray(permissions)) return false;

    // 🔹 Cas 1 : juste savoir si le claim existe
    if (value === null) {
        return permissions.some(p =>
            p === permission || p.startsWith(`${permission}:`)
        );
    }

    // 🔹 Cas 2 : vérifier une valeur précise
    return permissions.includes(`${permission}:${value}`);
}

