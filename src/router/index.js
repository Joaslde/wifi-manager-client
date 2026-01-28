import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import Dashboard from '../views/Dashboard.vue';
import { useAuthStore } from '../store/auth';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
  { 
    path: '/dashboard', 
    component: Dashboard,
    beforeEnter: (to, from, next) => {
      const auth = useAuthStore();
      auth.client ? next() : next('/login');
    }
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});