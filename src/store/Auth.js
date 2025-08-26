/* Permet de gérer les authentifications */
import AccountService from '@/service/AccountService';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    claims: { roles: [], permissions: [] },
    isFetchingClaims : false,
    authError : false,
  }),
  actions: {

     saveUserClaims(claims) {
      this.isAuthenticated = true
      this.claims.roles = claims?.roles;
      this.claims.permissions = claims?.permissions;
    },

    /* Permet de récupérer les permissions d'un utilisateur */
async authUser() {
  this.isFetchingClaims = true
  try {
    const authService = await AccountService.claims()

    if (authService.status === 200) {
      this.saveUserClaims(authService.data)
    }
  } catch (error)
  { 
    this.isFetchingClaims = false;
    if (!error.response) {
      this.authError = true;
    }
  }
},

    logout()
    {
      this.isAuthenticated = false
      this.claims = {},
      this.authError = false;
      this.isFetchingClaims = false
    }
  }
})

