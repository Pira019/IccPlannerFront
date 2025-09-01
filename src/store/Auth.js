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
      this.claims.roles = claims?.roles  || [];
      this.claims.permissions = claims?.permissions  || [];
      this.claimsLoaded = true;
       this.authError = false; 
    },

    /* Permet de récupérer les permissions d'un utilisateur */
    async authUser() {
    try {
        const authService = await AccountService.claims()

        if (authService.status === 200) {
             this.saveUserClaims(authService.data)
        }
        this.isFetchingClaims = true;
    } catch (error)
    {
        console.log(error)
        if (error.response?.status === 401) {
           // Token expiré -> logout
            this.claims = { roles: [], permissions: [] };
            this.isAuthenticated = false;
            this.authError = false; // pas une erreur "technique"
            this.claimsLoaded = false;
            this.isFetchingClaims = false;
        } else {
            // Erreur serveur ou réseau
            this.isAuthenticated = false;
            this.authError = true;
            this.claimsLoaded = false;
            this.isFetchingClaims = false;
        }
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

