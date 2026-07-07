<template>
  <div class="users-manager-viewport reveal">
    <!-- Page Header -->
    <div class="bo-page-header mb-10">
      <div class="header-left">
        <h2 class="text-4xl font-black tracking-tight">Gestion des <span class="text-accent">Utilisateurs</span></h2>
        <p class="text-muted mt-2">Liste, rôles et statuts de tous les comptes d'utilisateurs sur la plateforme.</p>
      </div>
    </div>

    <!-- Stats Cards Grid -->
    <div class="stats-grid mb-10">
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-users"></i></div>
        <div class="stat-info">
          <span class="stat-label">Total Utilisateurs</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon super-admin"><i class="fas fa-user-shield"></i></div>
        <div class="stat-info">
          <span class="stat-label">Super Admins</span>
          <span class="stat-value">{{ stats.superAdmins }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon admin"><i class="fas fa-user-tie"></i></div>
        <div class="stat-info">
          <span class="stat-label">Administrateurs</span>
          <span class="stat-value">{{ stats.admins }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon active"><i class="fas fa-check-circle"></i></div>
        <div class="stat-info">
          <span class="stat-label">Comptes Actifs</span>
          <span class="stat-value text-success">{{ stats.active }}</span>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar mb-6">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input v-model="searchQuery" type="text" placeholder="Rechercher par nom, email, téléphone..." @input="onFilterChange" />
      </div>
      <div class="filters-group">
        <div class="select-wrapper">
          <i class="fas fa-filter"></i>
          <select v-model="selectedRole" @change="onFilterChange">
            <option value="ALL">Tous les rôles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">Utilisateur</option>
          </select>
        </div>
        <div class="select-wrapper">
          <i class="fas fa-building"></i>
          <input v-model="organizationId" type="text" placeholder="UUID Organisation..." class="input-inline" @input="onFilterChange" />
        </div>
        <div class="select-wrapper">
          <i class="fas fa-toggle-on"></i>
          <select v-model="selectedStatus" @change="onFilterChange">
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actifs</option>
            <option value="INACTIVE">Inactifs</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner-elite"></div>
      <p class="text-muted mt-4">Chargement des utilisateurs...</p>
    </div>

    <!-- Users Table -->
    <div v-else class="table-wrapper-premium">
      <div v-if="users.length === 0" class="empty-state-premium">
        <div class="empty-icon"><i class="fas fa-users-slash"></i></div>
        <h3>Aucun utilisateur trouvé</h3>
        <p>Ajustez vos filtres ou termes de recherche.</p>
      </div>

      <table v-else class="table-premium">
        <thead>
          <tr>
            <th>Utilisateur</th>
            <th>Téléphone</th>
            <th>Rôle</th>
            <th>Organisation</th>
            <th>Statut</th>
            <th>Créé le</th>
            <th>Dernier Accès</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" :class="{ 'row-inactive': user.isActive === false }">
            <td>
              <div class="user-cell">
                <div :class="['avatar-circle', user.isActive === false && 'avatar-inactive']">
                  {{ user.firstName?.[0] || '' }}{{ user.lastName?.[0] || '' }}
                </div>
                <div class="user-details">
                  <span class="user-fullname">{{ user.firstName }} {{ user.lastName }}</span>
                  <span class="user-email">{{ user.email || 'Pas d\'email' }}</span>
                </div>
              </div>
            </td>
            <td><span class="font-mono">{{ user.phone }}</span></td>
            <td>
              <span :class="['role-badge', 'role-' + (user.role || 'user').toLowerCase()]">
                {{ user.role }}
              </span>
            </td>
            <td>
              <div class="org-cell" v-if="user.organizationName">
                <i class="fas fa-building text-slate-400 mr-2"></i>
                <span class="org-name">{{ user.organizationName }}</span>
              </div>
              <span class="text-muted" v-else>—</span>
            </td>
            <td>
              <div class="status-cell">
                <span :class="['pulse-dot', user.isActive !== false ? 'active' : 'inactive']"></span>
                <span class="status-text">{{ user.isActive !== false ? 'Actif' : 'Inactif' }}</span>
              </div>
            </td>
            <td><span class="date-text">{{ formatDate(user.createdAt) }}</span></td>
            <td><span class="date-text">{{ formatDate(user.lastLoginAt) || 'Jamais' }}</span></td>
            <td>
              <button
                v-if="user.role !== 'SUPER_ADMIN'"
                :class="['action-toggle-btn', user.isActive !== false ? 'btn-deactivate' : 'btn-reactivate']"
                @click="handleToggleUser(user)"
                :disabled="toggleLoading === user.id"
                :title="user.isActive !== false ? 'Désactiver ce compte' : 'Réactiver ce compte'"
              >
                <i :class="user.isActive !== false ? 'fas fa-user-slash' : 'fas fa-user-check'"></i>
                {{ user.isActive !== false ? 'Désactiver' : 'Réactiver' }}
              </button>
              <span v-else class="text-muted" style="font-size:0.75rem">— protégé</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Premium -->
    <div v-if="totalElements > pageSize" class="pagination-premium-container mt-12">
      <div class="pagination-info">
        Affichage de <strong>{{ pagedFrom }} - {{ pagedTo }}</strong> sur <strong>{{ totalElements }}</strong> utilisateurs
      </div>
      <div class="pagination-controls">
        <button 
          class="btn-page-step" 
          :disabled="currentPage === 1"
          @click="currentPage--; fetchUsers()"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <div class="page-numbers">
          <button 
            v-for="p in totalPages" 
            :key="p"
            :class="['btn-page-num', { active: currentPage === p }]"
            @click="currentPage = p; fetchUsers()"
          >
            {{ p }}
          </button>
        </div>

        <button 
          class="btn-page-step" 
          :disabled="currentPage === totalPages"
          @click="currentPage++; fetchUsers()"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import adminApi from '../../services/adminApi';

const MOCK_USERS = [
  {
    id: "u1",
    firstName: "Narcisse",
    lastName: "Adingra",
    email: "narcisse@sneezy.shop",
    phone: "+225 07070707",
    role: "ADMIN",
    isActive: true,
    organizationId: "org1",
    organizationName: "Sneezy Shop",
    createdAt: "2026-06-23T10:32:35",
    lastLoginAt: "2026-06-23T10:33:00"
  },
  {
    id: "u2",
    firstName: "Jean",
    lastName: "Koffi",
    email: "jkoffi@koffi.ci",
    phone: "+225 05050505",
    role: "USER",
    isActive: true,
    organizationId: "org2",
    organizationName: "Koffi & Fils SARL",
    createdAt: "2026-06-15T12:00:00",
    lastLoginAt: "2026-06-20T18:45:00"
  },
  {
    id: "u3",
    firstName: "System",
    lastName: "Admin",
    email: "admin@onda.ci",
    phone: "+225 01010101",
    role: "SUPER_ADMIN",
    isActive: true,
    organizationId: null,
    organizationName: null,
    createdAt: "2026-05-01T08:00:00",
    lastLoginAt: "2026-06-23T10:34:00"
  }
];

export default {
  name: 'UsersManager',
  setup() {
    const users = ref([]);
    const isLoading = ref(true);
    const searchQuery = ref('');
    const selectedRole = ref('ALL');
    const organizationId = ref('');
    const selectedStatus = ref('ALL');
    const toggleLoading = ref(null);

    // Pagination State
    const currentPage = ref(1);
    const pageSize = ref(10);
    const totalPages = ref(1);
    const totalElements = ref(0);

    const pagedFrom = computed(() => (currentPage.value - 1) * pageSize.value + 1);
    const pagedTo = computed(() => Math.min(currentPage.value * pageSize.value, totalElements.value));

    const fetchUsers = async () => {
      isLoading.value = true;
      try {
        const params = {
          page: currentPage.value - 1,
          size: pageSize.value,
          search: searchQuery.value,
          role: selectedRole.value === 'ALL' ? '' : selectedRole.value,
          organizationId: organizationId.value,
          isActive: selectedStatus.value === 'ALL' ? '' : (selectedStatus.value === 'ACTIVE' ? 'true' : 'false')
        };
        const res = await adminApi.getUsers(params);
        if (res.success && res.data) {
          if (Array.isArray(res.data)) {
            // Raw array fallback
            const filtered = res.data.filter(u => {
              const nameQuery = searchQuery.value.toLowerCase().trim();
              const matchesSearch = nameQuery === '' ||
                (u.firstName + ' ' + u.lastName).toLowerCase().includes(nameQuery) ||
                (u.email || '').toLowerCase().includes(nameQuery) ||
                u.phone.includes(nameQuery);

              const matchesRole = selectedRole.value === 'ALL' || u.role === selectedRole.value;
              const matchesStatus = selectedStatus.value === 'ALL' ||
                (selectedStatus.value === 'ACTIVE' ? u.isActive !== false : u.isActive === false);

              return matchesSearch && matchesRole && matchesStatus;
            });
            users.value = filtered.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value);
            totalElements.value = filtered.length;
            totalPages.value = Math.ceil(filtered.length / pageSize.value) || 1;
          } else {
            // Spring Page object
            users.value = res.data.content || [];
            totalPages.value = res.data.totalPages || 1;
            totalElements.value = res.data.totalElements || 0;
          }
        } else {
          // Mock data fallback
          const filtered = MOCK_USERS.filter(u => {
            const nameQuery = searchQuery.value.toLowerCase().trim();
            const matchesSearch = nameQuery === '' ||
              (u.firstName + ' ' + u.lastName).toLowerCase().includes(nameQuery);
            return matchesSearch;
          });
          users.value = filtered.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value);
          totalElements.value = filtered.length;
          totalPages.value = Math.ceil(filtered.length / pageSize.value) || 1;
        }
      } catch (error) {
        console.error('Error fetching users, using mock data...', error);
        const filtered = MOCK_USERS.filter(u => {
          const nameQuery = searchQuery.value.toLowerCase().trim();
          return nameQuery === '' || (u.firstName + ' ' + u.lastName).toLowerCase().includes(nameQuery);
        });
        users.value = filtered.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value);
        totalElements.value = filtered.length;
        totalPages.value = Math.ceil(filtered.length / pageSize.value) || 1;
      } finally {
        isLoading.value = false;
      }
    };

    const onFilterChange = () => {
      currentPage.value = 1;
      fetchUsers();
    };

    const handleToggleUser = async (user) => {
      toggleLoading.value = user.id;
      try {
        await adminApi.toggleUserActive(user.id);
        const idx = users.value.findIndex(u => u.id === user.id);
        if (idx !== -1) {
          users.value[idx] = { ...users.value[idx], isActive: !users.value[idx].isActive };
        }
      } catch (e) {
        console.error('Erreur toggle utilisateur:', e);
      } finally {
        toggleLoading.value = null;
      }
    };

    const stats = computed(() => {
      return {
        total: totalElements.value || users.value.length,
        superAdmins: users.value.filter(u => u.role === 'SUPER_ADMIN').length,
        admins: users.value.filter(u => u.role === 'ADMIN').length,
        active: users.value.filter(u => u.isActive !== false).length
      };
    });

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    };

    onMounted(fetchUsers);

    return {
      users, isLoading, searchQuery, selectedRole, organizationId, selectedStatus,
      stats, formatDate, toggleLoading, handleToggleUser,
      currentPage, pageSize, totalPages, totalElements, pagedFrom, pagedTo, onFilterChange, fetchUsers
    };
  }
};
</script>

<style scoped>
.pagination-premium-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2.5rem;
  background: white;
  border-radius: 1.5rem;
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-sm);
}

.pagination-info { font-size: 0.9rem; color: var(--text-muted); }
.pagination-info strong { color: var(--text-main); }

.pagination-controls { display: flex; align-items: center; gap: 1rem; }
.page-numbers { display: flex; gap: 0.5rem; }

.btn-page-step, .btn-page-num {
  width: 38px; height: 38px;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-surface-dim);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--text-muted);
}

.btn-page-step:hover:not(:disabled), .btn-page-num:hover {
  background: white;
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-2px);
}

.btn-page-num.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.btn-page-step:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.input-inline {
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-main);
  width: 100px;
}

.users-manager-viewport {
  width: 100%;
  min-height: 100%;
  padding-bottom: 5rem;
}

.bo-page-header {
  display: flex;
  flex-direction: column;
}

/* Stats Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1.25rem;
  border: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: var(--shadow-sm);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-icon.super-admin {
  background: rgba(244, 63, 94, 0.1);
  color: var(--accent);
}

.stat-icon.admin {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.stat-icon.active {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  margin-top: 0.25rem;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 0.65rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  max-width: 450px;
  box-shadow: var(--shadow-sm);
}

.search-box input {
  background: none;
  border: none;
  outline: none;
  font-size: 0.9rem;
  font-weight: 600;
  width: 100%;
}

.filters-group {
  display: flex;
  gap: 0.75rem;
}

.select-wrapper {
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 0.65rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: var(--shadow-sm);
}

.select-wrapper select {
  border: none;
  background: none;
  outline: none;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-main);
  cursor: pointer;
}

.select-wrapper i {
  color: var(--text-dim);
  font-size: 0.85rem;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
}

.spinner-elite {
  width: 40px;
  height: 40px;
  border: 3.5px solid var(--border-subtle);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Table Premium */
.table-wrapper-premium {
  background: white;
  border-radius: 1.5rem;
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.table-premium {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.table-premium th {
  background: var(--bg-surface-dim);
  padding: 1.15rem 1.5rem;
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.08em;
  border-bottom: 1px solid var(--border-subtle);
}

.table-premium td {
  padding: 1.15rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.9rem;
  vertical-align: middle;
}

.table-premium tr:last-child td {
  border-bottom: none;
}

/* User Cell */
.user-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent) 0%, #ff718b 100%);
  color: white;
  font-weight: 800;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(244, 63, 94, 0.2);
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-fullname {
  font-weight: 800;
  color: var(--text-main);
}

.user-email {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
}

/* Badges */
.role-badge {
  display: inline-flex;
  padding: 0.25rem 0.65rem;
  border-radius: 99rem;
  font-size: 0.65rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.role-super_admin {
  background: rgba(244, 63, 94, 0.1);
  color: var(--accent);
  border: 1px solid rgba(244, 63, 94, 0.2);
}

.role-admin {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.role-user {
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
  border: 1px solid rgba(100, 116, 139, 0.2);
}

/* Org Cell */
.org-cell {
  display: flex;
  align-items: center;
}

.org-name {
  font-weight: 700;
  color: var(--text-main);
}

/* Status Cell */
.status-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.pulse-dot.active {
  background: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  animation: pulse-green 2s infinite;
}

.pulse-dot.inactive {
  background: #cbd5e1;
}

@keyframes pulse-green {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.status-text {
  font-weight: 700;
  font-size: 0.8rem;
}

.date-text {
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.8rem;
}

/* Empty State */
.empty-state-premium {
  text-align: center;
  padding: 5rem 2rem;
}

.empty-icon {
  font-size: 2.5rem;
  color: var(--text-dim);
  margin-bottom: 1rem;
}

.empty-state-premium h3 {
  font-size: 1.25rem;
  font-weight: 800;
}

.empty-state-premium p {
  color: var(--text-muted);
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-box {
    max-width: none;
  }
  .filters-group {
    justify-content: space-between;
  }
}

/* Row inactive */
.row-inactive td {
  opacity: 0.6;
  background: #f9fafb;
}

.avatar-inactive {
  opacity: 0.5;
  filter: grayscale(1);
}

/* Action Toggle Button */
.action-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 800;
  transition: all 0.15s ease;
}

.action-toggle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-deactivate {
  background: rgba(244, 63, 94, 0.1);
  color: #f43f5e;
}

.btn-deactivate:hover:not(:disabled) {
  background: rgba(244, 63, 94, 0.2);
}

.btn-reactivate {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.btn-reactivate:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.2);
}
</style>
