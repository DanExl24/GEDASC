import { createRouter, createWebHistory } from 'vue-router'

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
      path : '/mobile-view',
      name : 'MobileView',
      component : () => import('../mobile/Mobile.vue'),
    },
  ],
})

// 🔥 DETECTOR DE MÓVIL
const isMobile = () => window.innerWidth <= 768;

// 🔥 GUARD GLOBAL
router.beforeEach((to, from, next) => {
  if (isMobile() && to.path !== "/mobile-view") {
    return next("/mobile-view");
  }
  next();
});

export default router
