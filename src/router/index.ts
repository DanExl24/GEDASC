import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path:'/',
    name:'DashboardView',
    component: () => import('../views/DashboardView.vue')
    }
  ],
})

export default router
