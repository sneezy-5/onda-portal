<template>
  <div id="app" class="app-root">
    <!-- Clean background -->
    <div class="bg-mesh"></div>
    
    <Sidebar v-if="showNavigation" />
    
    <main :class="['main-content', { 'with-sidebar': showNavigation, 'admin-mode': !showNavigation && isAuthOrAdmin }]">
      <Header v-if="showNavigation" />
      
      <div :class="['content-viewport', { 'full-screen': !showNavigation }]">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Sidebar from './components/Sidebar.vue';
import Header from './components/Header.vue';

export default {
  name: 'App',
  components: {
    Sidebar,
    Header
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const tokenPresent = ref(!!localStorage.getItem('token'));

    const showNavigation = computed(() => {
      const isLandingOrLogin = route.name === 'Landing' || route.name === 'Login';
      const isAdminRoute = route.name?.toString().startsWith('Admin') || route.name === 'BackOffice';
      return tokenPresent.value && !isLandingOrLogin && !isAdminRoute;
    });

    const isAuthOrAdmin = computed(() => {
      const isLandingOrLogin = route.name === 'Landing' || route.name === 'Login';
      const isAdminRoute = route.name?.toString().startsWith('Admin') || route.name === 'BackOffice';
      return tokenPresent.value || isAdminRoute || isLandingOrLogin;
    });

    const handleUnauthorized = () => {
      console.warn('Unauthorized access detected. Logging out...');
      localStorage.removeItem('token');
      localStorage.removeItem('apiKey');
      tokenPresent.value = false;
      router.push({ name: 'Landing' });
    };

    onMounted(() => {
      window.addEventListener('unauthorized', handleUnauthorized);
    });

    onUnmounted(() => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    });

    watch(() => route.path, () => {
      tokenPresent.value = !!localStorage.getItem('token');
    });

    // Dynamic Title based on Route
    watch(() => route.name, (routeName) => {
      const titles = {
        Landing: 'Bienvenue | ONDA Infrastructure',
        Dashboard: 'Tableau de Bord | ONDA Partner',
        Organizations: 'Gestion des Clients | ONDA',
        Billing: 'Capacité & Facturation | ONDA',
        ApiDocs: 'Documentation API | ONDA Developer',
        AIConnectors: 'IA Connecteurs | ONDA Brain',
        BackOffice: 'Administration Système | ONDA',
        AdminDashboard: 'Dashboard Admin | ONDA',
        AdminKyc: 'Validation KYC | ONDA',
        AdminAudit: 'Audit Fiscal | ONDA',
        AdminMaintenance: 'Maintenance Système | ONDA'
      };
      document.title = titles[routeName] || 'ONDA Partner Portal';
    }, { immediate: true });

    return { showNavigation };
  }
};
</script>

<style>
.app-root {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: all 0.4s var(--smooth);
  width: 100%;
  position: relative;
}

.main-content.with-sidebar {
  margin-left: 280px;
}

.main-content.admin-mode {
  margin-left: 0;
}

.content-viewport {
  flex: 1;
  padding: 5rem 4rem;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
}

.content-viewport.full-screen {
  padding: 0;
  max-width: none;
  margin: 0;
  height: 100vh;
}

/* Page Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s var(--smooth);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 1024px) {
  .main-content.with-sidebar { margin-left: 0; }
  .content-viewport { padding: 1.5rem; }
}
</style>
