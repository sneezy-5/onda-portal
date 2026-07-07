<template>
  <aside class="sidebar-elite">
    <!-- Brand Context -->
    <div class="sidebar-brand">
      <div class="logo-wrapper">
        <img src="/logo.png" alt="ONDA" class="logo-img-sidebar" />
      </div>
      <div class="brand-text">
        <span class="brand-name">ONDA</span>
        <span class="brand-tag">INFRASTRUCTURE</span>
      </div>
    </div>

    <!-- Main Navigation -->
    <nav class="sidebar-nav-elite">
      <div class="nav-cluster">
        <label class="cluster-label">MON ESPACE</label>
        <button 
          v-for="item in menuItems" :key="item.id"
          :class="['nav-btn-elite', { active: currentRouteName === item.routeName }]"
          @click="navigate(item.routeName)"
        >
          <div class="btn-visual">
            <i :class="['btn-icon', item.icon]"></i>
          </div>
          <span class="btn-label">{{ item.label }}</span>
          <div v-if="currentRouteName === item.routeName" class="active-indicator"></div>
        </button>
      </div>

      <!-- Quick Actions / Support -->
      <div class="nav-cluster mt-12">
        <label class="cluster-label">RESSOURCES</label>
        <a href="#" class="extra-nav-link">
          <span class="ex-ic"><i class="fas fa-tools"></i></span>
          <span>API Status</span>
          <span class="status-chip-live">UP</span>
        </a>
      </div>
    </nav>

    <!-- User Profile: High-End -->
    <div class="sidebar-profile-elite">
      <div class="profile-card-glass">
        <div class="user-avatar-premium">P</div>
        <div class="user-meta">
          <span class="u-name">Partenaire ONDA</span>
          <span class="u-plan-badge">Elite Production</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
  name: 'Sidebar',
  setup() {
    const route = useRoute();
    const router = useRouter();

    const currentRouteName = computed(() => route.name);

    const menuItems = [
      { id: 'dashboard', label: 'Console', icon: 'fas fa-bolt', routeName: 'Dashboard' },
      { id: 'organizations', label: 'Organisations', icon: 'fas fa-building', routeName: 'Organizations' },
      { id: 'ai_connectors', label: 'IA Connecteurs', icon: 'fas fa-brain', routeName: 'AIConnectors' },
      { id: 'billing', label: 'Capacité', icon: 'fas fa-credit-card', routeName: 'Billing' },
      { id: 'docs', label: 'Docs API', icon: 'fas fa-book-open', routeName: 'ApiDocs' }
    ];

    const navigate = (routeName) => {
      router.push({ name: routeName });
    };

    return { 
      menuItems, 
      currentRouteName,
      navigate 
    };
  }
}
</script>

<style scoped>
.sidebar-elite {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 280px;
  background: var(--bg-surface-inverse);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  color: white;
}

.sidebar-brand { display: flex; align-items: center; gap: 1.25rem; padding: 3rem 1.5rem; }
.logo-wrapper { width: 52px; height: 52px; background: white; border-radius: 1rem; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
.logo-img-sidebar { width: 38px; height: auto; }
.brand-text { display: flex; flex-direction: column; overflow: hidden; }
.brand-name { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.04em; color: white; line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.brand-tag { font-size: 0.6rem; font-weight: 800; color: var(--primary); letter-spacing: 0.2em; margin-top: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.sidebar-nav-elite { flex: 1; padding: 0 1.5rem; overflow-y: auto; overflow-x: hidden; }
.cluster-label { font-size: 0.65rem; font-weight: 900; color: #64748B; letter-spacing: 0.15em; display: block; margin-bottom: 1.5rem; padding-left: 1rem; }

.nav-btn-elite {
  width: 100%; display: flex; align-items: center; gap: 1.25rem;
  padding: 1rem 1.25rem; background: transparent; border: none;
  border-radius: 1rem; cursor: pointer; color: #94A3B8;
  font-family: var(--font-heading); font-weight: 700; transition: all 0.3s;
  position: relative; margin-bottom: 0.5rem; overflow: hidden;
}

.nav-btn-elite:hover { background: rgba(255,255,255,0.05); color: white; }
.nav-btn-elite.active { background: rgba(14, 165, 233, 0.1); color: var(--primary-light); }

.btn-visual { width: 40px; height: 40px; background: rgba(255,255,255,0.03); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; transition: all 0.3s; flex-shrink: 0; }
.nav-btn-elite.active .btn-visual { background: var(--primary); color: white; }

.btn-label { flex: 1; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.active-indicator { position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 24px; background: var(--primary); border-radius: 0 4px 4px 0; }

.extra-nav-link { display: flex; align-items: center; gap: 1.25rem; padding: 1rem 1.25rem; text-decoration: none; color: #64748B; font-weight: 700; font-size: 0.9rem; transition: all 0.2s; }
.extra-nav-link:hover { color: white; }
.status-chip-live { margin-left: auto; font-size: 0.6rem; background: #064E3B; color: #34D399; padding: 0.25rem 0.5rem; border-radius: 4px; border: 1px solid #065F46; }

/* Profile Card */
.sidebar-profile-elite { padding: 2.5rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); }
.profile-card-glass { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 1.25rem; border-radius: 1.25rem; display: flex; align-items: center; gap: 1rem; }
.user-avatar-premium { width: 44px; height: 44px; background: var(--primary-gradient); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3); }
.user-meta { display: flex; flex-direction: column; }
.u-name { font-weight: 800; font-size: 0.9rem; color: white; }
.u-plan-badge { font-size: 0.65rem; font-weight: 800; color: var(--primary); letter-spacing: 0.05em; }

@media (max-width: 1024px) {
  .sidebar-elite { transform: translateX(-100%); }
}
</style>
