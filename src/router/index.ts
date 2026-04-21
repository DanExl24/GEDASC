import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth';
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path:'/',
    name:'DashboardView',
    component: () => import('../views/DashboardView.vue')
    },
    {
      path: '/general-entry',
      name: 'GeneralEntryView',
      component: () => import('../views/GeneralEntryView.vue'),
      children: [
        {
          path: "firma/:documento",
          component: () => import('../views/GeneralEntryView.vue')
        }
      ]
    },
    {
      path : '/general-exit',
      name : 'GeneralExitView',
      component : () => import('../views/GeneralExitView.vue'),
    },
    {
      path : '/general-history',
      name : 'HistoryView',
      component : () => import('../views/HistoryView.vue'),
    },
    {
      path : '/assets-history',
      name : 'AssetsHistoryView',
      component : () => import('../views/AssetsHistoryView.vue'),
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
    },
    {
      path : '/admin-record-control',
      name : 'AdminRecordControlView',
      component : () => import('../views/AdminRecordControlView.vue'),
      meta: { role: 'ADMIN' }
    },
    {
      path : '/admin-borrowed-assets',
      name : 'AdminBorrowedAssetsView',
      component : () => import('../views/AdminBorrowedAssetsView.vue'),
      meta: { role: 'ADMIN' }
    },
    {
      path : '/admin-aprendices',
      name : 'AdminAprendicesView',
      component : () => import('../views/AdminAprendicesView.vue'),
      meta: { role: 'ADMIN' }
    },
    {
      path : '/admin-alerts',
      name : 'AdminAlertsView',
      component : () => import('../views/AdminAlertsView.vue'),
      meta: { role: 'ADMIN' }
    },
    {
      path : '/mobile-view',
      name : 'MobileView',
      component : () => import('../mobile/Mobile.vue'),
            children: [
        {
          path: "firma/:documento",
          name: "firma",
          component: () => import('../mobile/Mobile.vue')
        }
      ]
    },
    {
      path : '/login-view',
      name : 'login',
      component : () => import('../views/LoginView.vue')
    }
  ],
})


const isMobile = () => window.innerWidth <= 768;


router.beforeEach((to, from, next) => {
  if (isMobile() && !to.path.startsWith("/mobile-view")) {
    return next("/mobile-view");
  }
  next();
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.token) {
    return next('/login')
  }

  if (to.meta.role && auth.user?.rol !== to.meta.role) {
    return next('/403')
  }

  next()
})

export default router
