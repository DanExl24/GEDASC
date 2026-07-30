import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth';
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path:'/dashboard',
      name:'DashboardView',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/general-entry',
      name: 'GeneralEntryView',
      component: () => import('../views/GeneralEntryView.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: "firma/:documento",
          component: () => import('../views/GeneralEntryView.vue')
        }
      ]
    },
    {
      path : '/general-exit',
      redirect: '/general-entry'
    },
    {
      path : '/general-history',
      name : 'HistoryView',
      component : () => import('../views/HistoryView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path : '/assets-history',
      name : 'AssetsHistoryView',
      component : () => import('../views/AssetsHistoryView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path : '/computer-history',
      redirect : { path: '/assets-history', query: { view: 'computers' } },
    },
    {
      path : '/vehicle-history',
      redirect : { path: '/assets-history', query: { view: 'vehicles' } },
    },
    {
      path : '/record-history',
      name : 'RecordsView',
      component : () => import('../views/RecordHistory.vue'),
      meta: { requiresAuth: true }
    },
    {
      path : '/admin-record-control',
      name : 'AdminRecordControlView',
      component : () => import('../views/AdminRecordControlView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
      path : '/admin-borrowed-assets',
      name : 'AdminBorrowedAssetsView',
      component : () => import('../views/AdminBorrowedAssetsView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
      path : '/admin-aprendices',
      name : 'AdminAprendicesView',
      component : () => import('../views/AdminAprendicesView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
      path : '/admin-alerts',
      name : 'AdminAlertsView',
      component : () => import('../views/AdminAlertsView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
      path : '/admin-horarios',
      name : 'AdminHorariosView',
      component : () => import('../views/AdminHorariosView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
      path : '/admin-programas',
      name : 'AdminProgramasView',
      component : () => import('../views/AdminProgramasView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
      path : '/mobile-view',
      name : 'MobileView',
      component : () => import('../mobile/Mobile.vue'),
      meta: { requiresAuth: true },
            children: [
        {
          path: "firma/:documento",
          name: "firma",
          component: () => import('../mobile/Mobile.vue')
        }
      ]
    },
    {
      path : '/login',
      name : 'login',
      component : () => import('../views/LoginView.vue'),
      meta: { guestOnly: true }
    },
    {
      path: '/login-view',
      redirect: '/login'
    }
  ],
})




router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.guestOnly && auth.token) {
    return next('/dashboard')
  }

  if (to.meta.requiresAuth && !auth.token) {
    return next('/login')
  }

  if (to.meta.role && auth.user?.rol !== to.meta.role) {
    return next('/dashboard')
  }

  next()
})

export default router
