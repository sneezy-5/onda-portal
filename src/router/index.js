import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '../views/LandingPage.vue';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import Organizations from '../views/Organizations.vue';
import AIConnectors from '../views/AIConnectors.vue';
import ApiDocs from '../views/ApiDocs.vue';
import Billing from '../views/Billing.vue';
import BackOffice from '../views/BackOffice.vue';
import AdminDashboard from '../views/admin/Dashboard.vue';
import AdminKyc from '../views/admin/KycQueue.vue';
import AdminAudit from '../views/admin/AuditQueue.vue';
import AdminMaintenance from '../views/admin/Maintenance.vue';
import AdminBanks from '../views/admin/BanksManager.vue';
import AdminOpportunities from '../views/admin/OpportunitiesManager.vue';
import AdminUsers from '../views/admin/UsersManager.vue';
import AdminClients from '../views/admin/ClientsManager.vue';

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: LandingPage,
    meta: { public: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { public: true }
  },
  {
    path: '/system-admin-portal',
    name: 'BackOffice',
    component: BackOffice,
    meta: { public: true },
    children: [
      {
        path: '',
        redirect: { name: 'AdminDashboard' }
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: AdminDashboard
      },
      {
        path: 'kyc',
        name: 'AdminKyc',
        component: AdminKyc
      },
      {
        path: 'audit',
        name: 'AdminAudit',
        component: AdminAudit
      },
      {
        path: 'maintenance',
        name: 'AdminMaintenance',
        component: AdminMaintenance
      },
      {
        path: 'banks',
        name: 'AdminBanks',
        component: AdminBanks
      },
      {
        path: 'opportunities',
        name: 'AdminOpportunities',
        component: AdminOpportunities
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: AdminUsers
      },
      {
        path: 'clients',
        name: 'AdminClients',
        component: AdminClients
      }
    ]
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/organizations',
    name: 'Organizations',
    component: Organizations
  },
  {
    path: '/ai-connectors',
    name: 'AIConnectors',
    component: AIConnectors
  },
  {
    path: '/api-docs',
    name: 'ApiDocs',
    component: ApiDocs
  },
  {
    path: '/billing',
    name: 'Billing',
    component: Billing
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Protect routes
router.beforeEach((to, from, next) => {
  // If accessing system admin portal routes, do not require partner token
  if (to.path.startsWith('/system-admin-portal')) {
    next();
    return;
  }

  const loggedIn = !!localStorage.getItem('token');
  
  if (!to.meta.public && !loggedIn) {
    next({ name: 'Login' });
  } else if (to.meta.public && loggedIn && to.name === 'Login') {
    // If already logged in, skip the Login page only (redirect to dashboard)
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router;
