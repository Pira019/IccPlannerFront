import AppLayout from '@/layout/AppLayout.vue';
import { Permission } from '@/model/Enum/Permission';
import { Role } from '@/model/Enum/Role';
import { useAuthStore } from '@/store/Auth';
import { checkRequiredClaims } from '@/utils/claims';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            meta: { requiresAuth: true},
            children: [
                {
                    path: '/',
                    name: 'dashboard', 
                    component: () => import('@/views/Dashboard.vue'), 
                },
                {
                    path: '/ministry',
                    name: 'ministry',
                    component: () => import('@/views/ministry/Ministry.vue')

                },
                {
                    path: '/profil',
                    name: 'profil',
                    component: () => import('@/views/pages/Profil.vue')
                },
                {
                    path: '/members',
                    name: 'members', 
                    component: () => import('@/views/pages/Profil.vue')
                },
                {
                    path: '/departments', 
                    children: [
                        {
                        path:'',
                        name: 'department-list',
                        component: () => import('@/views/department/Department.vue'), 
                        },
                        {
                        path: ':id',
                        name: 'department-details',
                        props: true,
                        component: () => import('@/views/department/DepartmentDetails.vue'), 
                        }
                    ]
                },

                {
                    path: '/programs',
                    name: 'programs',
                    component: () => import('@/views/program/Program.vue'), 
                },
                {
                    path: '/availability',
                    name: 'Availability',
                    component: () => import('@/views/Availability/Availability.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue')
                },
                {
                    path: '/role-management',
                    name: 'role-management', 
                    component: () => import('@/views/pages/RoleManag.vue')
                }
            ]
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        },
    ]
});


router.beforeEach( async (to, from, next) => {

    const auth = useAuthStore();
     // Vérifier si on a besoin d'authentification pour cette route
    const requiresAuth = to.meta?.requiresAuth;
    const requiredClaim = to.meta?.requiredClaim;

    // Si la route n'a besoin ni d'auth ni de claims → continuer
    if (!requiresAuth && !requiredClaim ) {
      return next()
    }

     if (!auth.isFetchingClaims  && !auth.claimsLoaded ) {

         await auth.authUser(); 
    }

    if (auth.authError) {
        return next({ name: "error" });
    }


    if (requiresAuth && !auth.isAuthenticated) {
        // Si erreur d'auth (problème réseau, serveur, etc.) → page d'erreur
        auth.redirectPath = to.name;
        return next({
            name: 'login',
            query: { redirect: to.name }
        })
    }
   // Vérifier les claims seulement si authentifié
   if (requiredClaim && auth.isAuthenticated) {
        if (!checkRequiredClaims(requiredClaim)) {
            return next({ name: 'accessDenied' })
        }
    }
     next()
});

export default router;


export function redirigeVers(routeName) {
    router.push({ name: routeName });
}
