import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/rgs',
    name: 'RGs',
    component: () => import('../views/RGsView.vue')
  },
  {
    path: '/rg/:id',
    name: 'RGDetail',
    component: () => import('../views/RGDetailView.vue')
  },
  {
    path: '/visit/:propertyId',
    name: 'Visit',
    component: () => import('../views/VisitView.vue')
  },
  {
    path: '/summary',
    name: 'Summary',
    component: () => import('../views/SummaryView.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
