import { useAuthStore } from "@/store/Auth"
import { useRouter } from "vue-router"
import { checkRequiredClaims } from "./claims"

 export function filterMenuByPermissions(menuItems) {
    const router = useRouter()
    
    function filterMenuItem(item) {
        // Si l'item a un lien (to), vérifier ses permissions
        if (item.to) {
            const route = router.resolve(item.to)
            const routeMeta = route.meta
            
            // Vérifier si la route nécessite une authentification
            if (routeMeta?.requiresAuth && !useAuthStore().isAuthenticated) {
                return null // Exclure si pas authentifié
            }
            
            // Vérifier les claims requis
            if (!routeMeta?.requiredClaim) {
                if (!checkRequiredClaims(routeMeta.requiredClaim)) {
                    return null // Exclure si pas les bonnes permissions
                }
            }
        }
        
        // Si l'item a des sous-items, les filtrer récursivement
        if (item.items && Array.isArray(item.items)) {
            const filteredItems = item.items
                .map(subItem => filterMenuItem(subItem))
                .filter(subItem => subItem !== null)
            
            // Si après filtrage il ne reste aucun sous-item, exclure l'item parent
            // sauf s'il a lui-même un lien direct
            if (filteredItems.length === 0 && !item.to) {
                return null
            }
            
            return {
                ...item,
                items: filteredItems
            }
        }
        
        return item
    }
    
    return menuItems
        .map(item => filterMenuItem(item))
        .filter(item => item !== null)
}