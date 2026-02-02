/* Permet de gérer les authentifications */
import AccountService from '@/service/AccountService';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    claims: { roles: [], permissions: [] },
    isFetchingClaims : false,
    authError : false,
    redirectPath : null,
    claimsLoaded: false,
  }),
  actions: {

     saveUserClaims(claims) {
      this.isAuthenticated = true
      this.claims.roles = normalizeClaimsArray(claims?.roles);
      this.claims.permissions = normalizeClaimsArray(claims?.permissions);
      this.claimsLoaded = true;
      this.authError = false;
    },

    /* Permet de récupérer les permissions d'un utilisateur */
      async authUser() {
          this.isFetchingClaims = true;  // ⚡ Mettre à true dès le début
          this.authError = false;

        try {

        const authService = await AccountService.claims()

        if (authService.status === 200) {
             this.saveUserClaims(authService.data)
         } else {
            // Statut inattendu
            this.claims = { roles: [], permissions: [] };
            this.isAuthenticated = false;
            this.claimsLoaded = false;
            this.authError = true;
        }
    } catch (error)
    {
        if (error.response?.status === 401) {
           // Token expiré -> logout
            this.claims = { roles: [], permissions: [] };
            this.isAuthenticated = false;
            this.authError = false; // pas une erreur "technique"
            this.claimsLoaded = false;
            this.isFetchingClaims = false;
        } else {
            // Erreur serveur ou réseau
            this.claims = { roles: [], permissions: [] };
            this.isAuthenticated = false;
            this.authError = true;
            this.claimsLoaded = false;
            this.isFetchingClaims = false;
        }
          }
        finally {
            this.isFetchingClaims = false;
        }
    },

    logout()
    {
      this.isAuthenticated = false;
       this.claims = { roles: [], permissions: [] };
      this.claims = {};
      this.authError = false;
      this.isFetchingClaims = false;
      this.claimsLoaded = false;
    }
  }
})

function normalizeClaimsArray(arr) {
    if (!Array.isArray(arr)) return [];

    return arr.flatMap(item => {
        // Cas 1 : string JSON → ["ADMIN"]
        if (typeof item === "string") {
            try {
                const parsed = JSON.parse(item);
                return Array.isArray(parsed) ? parsed : [item];
            } catch {
                return [item];
            }
        }

        // Cas 2 : déjà correct
        return item;
    });
}
