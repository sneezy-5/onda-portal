<template>
  <div class="backoffice-portal reveal">
    <!-- Admin Login Overlay if not authorized -->
    <div v-if="!isAdminAuthenticated" class="admin-login-overlay">
      <div class="login-card-premium">
        <div class="text-center mb-6">
          <div class="admin-badge">
            <i class="fas fa-lock"></i> Accès Sécurisé
          </div>
          <div class="admin-icon mb-4"><i class="fas fa-shield-alt"></i></div>
          <h2 class="text-2xl font-bold text-white">Onda <span class="text-gradient">Back-Office</span></h2>
          <p class="text-dim text-sm mt-2">Accès restreint aux administrateurs système.</p>
        </div>

        <form @submit.prevent="handleAdminLogin" class="admin-form">
          <div class="admin-input-group">
            <label>Email Administrateur</label>
            <div class="admin-input-wrapper">
              <i class="fas fa-envelope admin-input-icon"></i>
              <input v-model="loginForm.email" type="email" placeholder="admin@onda.ci" required />
            </div>
          </div>
          <div class="admin-input-group">
            <label>Mot de Passe</label>
            <div class="admin-input-wrapper">
              <i class="fas fa-lock admin-input-icon"></i>
              <input v-model="loginForm.password" type="password" placeholder="••••••••" required />
            </div>
          </div>
          <button type="submit" class="admin-submit-btn" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-sm"></span>
            <span>{{ isLoading ? 'Connexion...' : 'Se connecter' }}</span>
            <i v-if="!isLoading" class="fas fa-arrow-right"></i>
          </button>
        </form>
      </div>
    </div>

    <!-- Main Back-Office Layout -->
    <div v-else class="bo-layout-elite">
      <!-- Admin Sidebar Elite -->
      <aside class="sidebar-elite">
        <div class="sidebar-brand">
          <div class="logo-wrapper">
            <img src="/logo.png" alt="ONDA" class="logo-img-sidebar" />
          </div>
          <div class="brand-text">
            <span class="brand-name">ONDA</span>
            <span class="brand-tag">SYSTEM ADMIN</span>
          </div>
        </div>

        <nav class="sidebar-nav-elite">
          <div class="nav-cluster">
            <label class="cluster-label">GOUVERNANCE</label>
            
            <router-link :to="{ name: 'AdminDashboard' }" class="nav-btn-elite" active-class="active">
              <div class="btn-visual">
                <i class="btn-icon fas fa-bolt"></i>
              </div>
              <span class="btn-label">Console Centrale</span>
            </router-link>

            <router-link :to="{ name: 'AdminKyc' }" class="nav-btn-elite" active-class="active">
              <div class="btn-visual">
                <i class="btn-icon fas fa-id-card"></i>
              </div>
              <span class="btn-label">Validation KYC</span>
              <span v-if="kycCount > 0" class="nav-badge-count">{{ kycCount }}</span>
            </router-link>

            <router-link :to="{ name: 'AdminAudit' }" class="nav-btn-elite" active-class="active">
              <div class="btn-visual">
                <i class="btn-icon fas fa-shield-virus"></i>
              </div>
              <span class="btn-label">Audit Fiscal</span>
              <span v-if="auditCount > 0" class="nav-badge-count">{{ auditCount }}</span>
            </router-link>
          </div>

          <div class="nav-cluster mt-8">
            <label class="cluster-label">OPÉRATIONS</label>

            <router-link :to="{ name: 'AdminMaintenance' }" class="nav-btn-elite" active-class="active">
              <div class="btn-visual">
                <i class="btn-icon fas fa-terminal"></i>
              </div>
              <span class="btn-label">Maintenance Crons</span>
            </router-link>

            <router-link :to="{ name: 'AdminBanks' }" class="nav-btn-elite" active-class="active">
              <div class="btn-visual">
                <i class="btn-icon fas fa-university"></i>
              </div>
              <span class="btn-label">Offres Bancaires</span>
            </router-link>

            <router-link :to="{ name: 'AdminOpportunities' }" class="nav-btn-elite" active-class="active">
              <div class="btn-visual">
                <i class="btn-icon fas fa-briefcase"></i>
              </div>
              <span class="btn-label">Opportunités</span>
            </router-link>
          </div>

          <div class="nav-cluster mt-8">
            <label class="cluster-label">ADMINISTRATION</label>

            <router-link :to="{ name: 'AdminClients' }" class="nav-btn-elite" active-class="active">
              <div class="btn-visual">
                <i class="btn-icon fas fa-building"></i>
              </div>
              <span class="btn-label">Clients & Orgs</span>
            </router-link>

            <router-link :to="{ name: 'AdminUsers' }" class="nav-btn-elite" active-class="active">
              <div class="btn-visual">
                <i class="btn-icon fas fa-users-cog"></i>
              </div>
              <span class="btn-label">Utilisateurs</span>
            </router-link>
          </div>
        </nav>

        <div class="sidebar-profile-elite">
          <div class="profile-card-glass">
            <div class="user-avatar-premium admin-avatar">{{ adminUser.firstName?.[0] || 'A' }}</div>
            <div class="user-meta">
              <span class="u-name">{{ adminUser.firstName }} {{ adminUser.lastName }}</span>
              <span class="u-plan-badge">Super Admin</span>
            </div>
            <button @click="logoutAdmin" class="logout-minimal-btn">
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content Container -->
      <main class="bo-main-content">
        <header class="bo-top-header">
          <div class="header-search-box">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="Rechercher une organisation, un KYC..." />
          </div>
          
          <div class="header-actions">
            <div class="sys-health-chip mr-4">
              <span class="status-pulse online"></span>
              SYSTEM OK
            </div>
            <button class="notif-btn-premium">
              <i class="fas fa-bell"></i>
              <span class="notif-dot"></span>
            </button>
          </div>
        </header>

        <div class="bo-viewport">
          <router-view v-slot="{ Component }">
            <transition name="fade-slide" mode="out-in">
                <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import adminApi from '../services/adminApi';

export default {
  name: 'BackOfficeLayout',
  setup() {
    const isAdminAuthenticated = ref(!!localStorage.getItem('adminToken'));
    const isLoading = ref(false);
    const router = useRouter();

    const loginForm = reactive({
      email: '',
      password: ''
    });

    const adminUser = ref({
      firstName: 'Admin',
      lastName: 'System',
      role: 'SUPER_ADMIN'
    });

    const kycCount = ref(0);
    const auditCount = ref(0);

    const forceAdminLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        isAdminAuthenticated.value = false;
    };

    const refreshCounts = async () => {
      try {
        const [kycRes, auditRes] = await Promise.all([
          adminApi.getPendingKyc(),
          adminApi.getAuditDeclarations()
        ]);
        kycCount.value = kycRes.data?.length || 0;
        auditCount.value = auditRes.data?.length || 0;
      } catch (e) {
        // Si le token admin est expiré, le message d'erreur contient 'Unauthorized'
        const msg = (e.message || '').toLowerCase();
        if (msg.includes('unauthorized') || msg.includes('401') || msg.includes('403')) {
            forceAdminLogout();
        } else {
            kycCount.value = 0;
            auditCount.value = 0;
        }
      }
    };

    // Listener global pour les 401 émis par les pages enfants (KycQueue, AuditQueue, etc.)
    // Enregistré ICI, avant tout appel API, pour ne rater aucun événement.
    window.addEventListener('unauthorized', forceAdminLogout);

    const handleAdminLogin = async () => {
      isLoading.value = true;
      try {
          const res = await adminApi.login(loginForm.email, loginForm.password);
          if (res.success) {
              isAdminAuthenticated.value = true;
              adminUser.value = res.data;
              await refreshCounts();
              router.push({ name: 'AdminDashboard' });
          } else {
              alert(res.message);
          }
      } catch(e) {
          alert('Erreur serveur: ' + e.message);
      } finally {
          isLoading.value = false;
      }
    };

    const logoutAdmin = () => {
      forceAdminLogout();
      router.push({ name: 'BackOffice' });
    };

    const handleDataChanged = (event) => {
      if (event && event.detail && event.detail.type) {
        if (event.detail.type === 'kyc') {
          kycCount.value = event.detail.count;
        } else if (event.detail.type === 'audit') {
          auditCount.value = event.detail.count;
        }
      } else {
        refreshCounts();
      }
    };

    onMounted(async () => {
        const storedUser = localStorage.getItem('adminUser');
        const storedToken = localStorage.getItem('adminToken');
        if (storedUser && storedToken) {
            adminUser.value = JSON.parse(storedUser);
            adminApi.api.setToken(storedToken);
            await refreshCounts();
        }
        
        window.addEventListener('admin-data-changed', handleDataChanged);
    });

    onUnmounted(() => {
        window.removeEventListener('admin-data-changed', handleDataChanged);
        window.removeEventListener('unauthorized', forceAdminLogout);
    });

    return {
      isAdminAuthenticated, isLoading, loginForm, adminUser, kycCount, auditCount,
      handleAdminLogin, logoutAdmin
    };
  }
}
</script>

<style scoped>
.backoffice-portal {
  min-height: 100vh;
  width: 100%;
  color: var(--text-main);
  background: #f1f5f9; /* Plus sombre pour faire ressortir les cartes blanches */
}

/* Admin Login Overlay Styles */
.admin-login-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: radial-gradient(circle at top right, rgba(244, 63, 94, 0.08) 0%, rgba(15, 23, 42, 0.98) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  backdrop-filter: blur(16px);
}

.login-card-premium {
  width: 100%;
  max-width: 420px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(244, 63, 94, 0.1);
  padding: 3rem 2.25rem !important;
  color: white;
  transition: all 0.3s;
}

.admin-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.2);
  border-radius: 99rem;
  color: #fda4af;
  font-size: 0.65rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1.25rem;
}

.admin-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto;
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.25);
  border-radius: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  font-size: 1.75rem;
  box-shadow: 0 8px 16px rgba(244, 63, 94, 0.15);
}

.text-gradient {
  background: linear-gradient(135deg, var(--accent) 0%, #ff718b 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-dim {
  color: #94a3b8;
}

/* Custom Admin Form Controls */
.admin-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.admin-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.admin-input-group label {
  font-size: 0.7rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: left;
}

.admin-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.admin-input-icon {
  position: absolute;
  left: 1.25rem;
  color: #64748b;
  font-size: 0.95rem;
  transition: color 0.3s;
}

.admin-input-wrapper input {
  width: 100%;
  padding: 0.875rem 1.25rem 0.875rem 2.75rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.85rem;
  color: white;
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s;
}

.admin-input-wrapper input:focus {
  outline: none;
  border-color: var(--accent);
  background: rgba(30, 41, 59, 0.8);
  box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.15);
}

.admin-input-wrapper input:focus + .admin-input-icon {
  color: var(--accent);
}

.admin-submit-btn {
  width: 100%;
  padding: 0.875rem;
  border-radius: 0.85rem;
  background: var(--accent);
  color: white;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3);
  margin-top: 1rem;
}

.admin-submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(244, 63, 94, 0.4);
  background: #e11d48;
}

.admin-submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.admin-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-sm {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.bo-layout-elite {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

/* Sidebar Elite Styles (Synced with Partner Portal) */
.sidebar-elite {
  position: fixed;
  left: 0; top: 0; bottom: 0;
  width: 280px;
  background: var(--bg-surface-inverse);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  color: white;
}

.sidebar-brand { display: flex; align-items: center; gap: 1.25rem; padding: 2.5rem 1.5rem; }
.logo-wrapper { width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
.logo-img-sidebar { width: 34px; height: auto; }
.brand-text { display: flex; flex-direction: column; overflow: hidden; }
.brand-name { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.04em; color: white; line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.brand-tag { font-size: 0.55rem; font-weight: 800; color: var(--accent); letter-spacing: 0.2em; margin-top: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.sidebar-nav-elite { flex: 1; padding: 0 1.5rem; overflow-y: auto; overflow-x: hidden; }
.cluster-label { font-size: 0.6rem; font-weight: 900; color: #64748B; letter-spacing: 0.2em; display: block; margin-bottom: 1.25rem; padding-left: 1rem; }

.nav-btn-elite {
  width: 100%; display: flex; align-items: center; gap: 1rem;
  padding: 0.875rem 1.25rem; background: transparent; border: none;
  border-radius: 1rem; cursor: pointer; color: #94A3B8;
  font-family: var(--font-heading); font-weight: 700; transition: all 0.3s;
  position: relative; margin-bottom: 0.4rem; text-decoration: none;
  overflow: hidden;
}

.nav-btn-elite:hover { background: rgba(255,255,255,0.05); color: white; }
.nav-btn-elite.active { background: rgba(244, 63, 94, 0.15); color: #FDA4AF; }

.btn-visual { width: 36px; height: 36px; background: rgba(255,255,255,0.03); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; transition: all 0.3s; flex-shrink: 0; }
.nav-btn-elite.active .btn-visual { background: var(--accent); color: white; box-shadow: 0 4px 12px rgba(244, 63, 94, 0.4); }

.btn-label { flex: 1; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.nav-badge-count { margin-left: auto; background: var(--accent); color: white; font-size: 0.65rem; padding: 0.2rem 0.5rem; border-radius: 20px; font-weight: 900; flex-shrink: 0; }

/* Admin Visual Differentiator */
.sidebar-elite {
  border-right: 1px solid rgba(244, 63, 94, 0.2);
}

.brand-tag { color: var(--accent); }
.bo-main-content {
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
}

.bo-top-header {
  height: 80px;
  background: white;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4rem;
  position: sticky;
  top: 0;
  z-index: 900;
}

.header-search-box {
  background: var(--bg-surface-dim);
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
}

.header-search-box input {
  background: none; border: none; outline: none; font-weight: 600; font-size: 0.9rem; width: 100%;
}

.header-actions { display: flex; align-items: center; gap: 1.5rem; }

.sys-health-chip {
  background: #DCFCE7;
  color: #166534;
  font-size: 0.65rem;
  font-weight: 900;
  padding: 0.5rem 1rem;
  border-radius: 99rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-pulse {
  width: 6px; height: 6px; border-radius: 50%; background: #10B981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulse-green 2s infinite;
}

@keyframes pulse-green {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.notif-btn-premium {
  width: 44px; height: 44px; border-radius: 12px; background: var(--bg-surface-dim); border: none; cursor: pointer; position: relative; color: var(--text-muted); font-size: 1.2rem;
}

.notif-dot { position: absolute; top: 12px; right: 12px; width: 8px; height: 8px; background: var(--accent); border: 2px solid white; border-radius: 50%; }

.bo-viewport {
  padding: 3rem 4rem;
  flex: 1;
}

/* Sidebar Profile */
.sidebar-profile-elite { padding: 2rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); }
.profile-card-glass { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 1rem; border-radius: 1.25rem; display: flex; align-items: center; gap: 0.75rem; }
.admin-avatar { width: 40px; height: 40px; background: var(--accent-gradient); box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3); }
.u-name { font-weight: 800; font-size: 0.85rem; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px; }
.u-plan-badge { font-size: 0.6rem; color: var(--accent); font-weight: 800; text-transform: uppercase; }

.logout-minimal-btn { background: none; border: none; color: #64748B; cursor: pointer; padding: 0.5rem; transition: color 0.3s; }
.logout-minimal-btn:hover { color: #FDA4AF; }

@media (max-width: 1024px) {
  .sidebar-elite { transform: translateX(-100%); }
  .bo-main-content { margin-left: 0; }
  .bo-top-header { padding: 0 1.5rem; }
  .bo-viewport { padding: 1.5rem; }
}
</style>
