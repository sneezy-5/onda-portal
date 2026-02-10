<template>
  <div id="app" class="app-root">
    <!-- Clean background -->
    <div class="bg-mesh"></div>
    
    <Sidebar v-if="isAuthenticated" :currentView="currentView" @navigate="handleNavigate($event)" />
    
    <main :class="['main-content', { 'with-sidebar': isAuthenticated }]">
      <Header v-if="isAuthenticated" @logout="handleLogout" />
      
      <div class="content-viewport">
        <transition name="fade-slide" mode="out-in">
          <component 
            :is="currentComponent" 
            :key="currentComponent"
            @login="handleLogin" 
            @navigate="handleNavigate" 
          />
        </transition>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import Sidebar from './components/Sidebar.vue';
import Header from './components/Header.vue';
import LandingPage from './views/LandingPage.vue';
import Login from './views/Login.vue';
import Dashboard from './views/Dashboard.vue';
import Organizations from './views/Organizations.vue';
import Billing from './views/Billing.vue';
import ApiDocs from './views/ApiDocs.vue';

export default {
  name: 'App',
  components: {
    Sidebar,
    Header,
    LandingPage,
    Login,
    Dashboard,
    Organizations,
    Billing,
    ApiDocs
  },
  setup() {
    const currentView = ref(sessionStorage.getItem('currentView') || 'landing');
    const isAuthenticated = ref(!!localStorage.getItem('apiKey') || !!localStorage.getItem('token'));

    const currentComponent = computed(() => {
      if (!isAuthenticated.value) {
        return currentView.value === 'login' ? 'Login' : 'LandingPage';
      }
      return {
        dashboard: 'Dashboard',
        organizations: 'Organizations',
        billing: 'Billing',
        docs: 'ApiDocs'
      }[currentView.value] || 'Dashboard';
    });

    watch(currentView, (newView) => {
      const titles = {
        landing: 'Bienvenue | ONDA Infrastructure',
        login: 'Connexion | Console Partenaire ONDA',
        dashboard: 'Tableau de Bord | ONDA Partner',
        organizations: 'Gestion des Clients | ONDA',
        billing: 'Capacité & Facturation | ONDA',
        docs: 'Documentation API | ONDA Developer'
      };
      document.title = titles[newView] || 'ONDA Partner Portal';
    }, { immediate: true });

    const handleNavigate = (view) => {
      currentView.value = view;
      sessionStorage.setItem('currentView', view);
    };

    const handleLogin = () => {
      isAuthenticated.value = true;
      currentView.value = 'dashboard';
      sessionStorage.setItem('currentView', 'dashboard');
    };

    const handleLogout = () => {
      localStorage.removeItem('apiKey');
      localStorage.removeItem('token');
      sessionStorage.removeItem('currentView');
      isAuthenticated.value = false;
      currentView.value = 'landing';
    };

    return { currentView, isAuthenticated, currentComponent, handleNavigate, handleLogin, handleLogout };
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

.content-viewport {
  flex: 1;
  padding: 5rem 4rem; /* Increased significantly */
  max-width: 1600px; /* Wider for more air */
  width: 100%;
  margin: 0 auto;
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
