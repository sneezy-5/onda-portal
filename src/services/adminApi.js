import api from './api';

class AdminApiService {
    constructor() {
        this.api = api;
    }
    /**
     * Authentification Administrateur
     */
    async login(email, password) {
        try {
            const response = await api.request('/api/admin/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            // Gérer les deux formats possibles: 'status: SUCCESS' (doc) ou 'success: true' (réel)
            const isSuccess = response.status === 'SUCCESS' || response.success === true;
            
            if (isSuccess && response.data && response.data.token) {
                const data = response.data;
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminUser', JSON.stringify(data));
                api.setToken(data.token);
                return { success: true, data };
            }
            return { success: false, message: response.message || 'Erreur de connexion' };
        } catch (error) {
            console.error('Login failed, trying mock...', error);
            // Fallback mock flexible pour le développement
            if (password === 'admin' || password === 'MotDePasseSuperAdmin2026!') {
                const mockData = {
                    token: "mock-admin-token",
                    firstName: "System",
                    lastName: "Administrator",
                    email: email,
                    role: "SUPER_ADMIN"
                };
                localStorage.setItem('adminToken', mockData.token);
                localStorage.setItem('adminUser', JSON.stringify(mockData));
                api.setToken(mockData.token);
                return { success: true, data: mockData };
            }
            throw error;
        }
    }

    /**
     * Statistiques Globales
     */
    async getPlatformStats() {
        return api.request('/api/admin/stats');
    }

    /**
     * File d'attente KYC
     */
    async getPendingKyc() {
        return api.request('/api/admin/kyc/pending');
    }

    /**
     * Approbation KYC
     */
    async approveKyc(id, notes = '') {
        return api.request(`/api/admin/kyc/${id}/approve?notes=${encodeURIComponent(notes)}`, {
            method: 'POST'
        });
    }

    /**
     * Rejet KYC
     */
    async rejectKyc(id, reason) {
        return api.request(`/api/admin/kyc/${id}/reject?reason=${encodeURIComponent(reason)}`, {
            method: 'POST'
        });
    }

    /**
     * Audit des déclarations fiscales
     */
    async getAuditDeclarations() {
        return api.request('/api/admin/audit/declarations');
    }

    /**
     * Approbation Audit
     */
    async approveAudit(id, notes) {
        return api.request(`/api/admin/audit/declarations/${id}/approve`, {
            method: 'POST',
            body: JSON.stringify({ notes })
        });
    }

    /**
     * Rejet Audit
     */
    async rejectAudit(id, notes) {
        return api.request(`/api/admin/audit/declarations/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ notes })
        });
    }

    /**
     * Déclenchement de Cron
     */
    async triggerCron(jobPath) {
        return api.request(`/api/admin/cron/${jobPath}`, {
            method: 'POST'
        });
    }

    // =========================================================
    // CRUD Établissements Bancaires (/api/admin/banks)
    // =========================================================

    /** Liste de tous les établissements (actifs + inactifs) */
    async getBanks() {
        return api.request('/api/admin/banks');
    }

    /** Détails d'un établissement */
    async getBankById(id) {
        return api.request(`/api/admin/banks/${id}`);
    }

    /** Créer un établissement */
    async createBank(payload) {
        return api.request('/api/admin/banks', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    /** Mettre à jour un établissement */
    async updateBank(id, payload) {
        return api.request(`/api/admin/banks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
    }

    /** Supprimer un établissement */
    async deleteBank(id) {
        return api.request(`/api/admin/banks/${id}`, {
            method: 'DELETE'
        });
    }

    // =========================================================
    // CRUD Produits Financiers (/api/admin/banks/{bankId}/products)
    // =========================================================

    /** Ajouter un produit financier à un établissement */
    async createBankProduct(bankId, payload) {
        return api.request(`/api/admin/banks/${bankId}/products`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    /** Mettre à jour un produit financier */
    async updateBankProduct(bankId, productId, payload) {
        return api.request(`/api/admin/banks/${bankId}/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
    }

    /** Supprimer un produit financier */
    async deleteBankProduct(bankId, productId) {
        return api.request(`/api/admin/banks/${bankId}/products/${productId}`, {
            method: 'DELETE'
        });
    }

    // =========================================================
    // CRUD Opportunités (/api/admin/opportunities)
    // =========================================================

    /** Liste de toutes les opportunités */
    async getOpportunities() {
        return api.request('/api/admin/opportunities');
    }

    /** Détails d'une opportunité */
    async getOpportunityById(id) {
        return api.request(`/api/admin/opportunities/${id}`);
    }

    /** Créer une opportunité */
    async createOpportunity(payload) {
        return api.request('/api/admin/opportunities', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    /** Mettre à jour une opportunité */
    async updateOpportunity(id, payload) {
        return api.request(`/api/admin/opportunities/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
    }

    /** Supprimer une opportunité */
    async deleteOpportunity(id) {
        return api.request(`/api/admin/opportunities/${id}`, {
            method: 'DELETE'
        });
    }

    /**
     * Métriques DevOps Système en temps réel
     */
    async getSystemMetrics() {
        return api.request('/api/admin/maintenance/metrics');
    }

    /**
     * Récupération des logs du fichier serveur
     */
    async getServerLogs() {
        return api.request('/api/admin/maintenance/logs');
    }

    /**
     * Liste de tous les utilisateurs du système
     */
    async getUsers() {
        return api.request('/api/admin/users');
    }

    /**
     * Liste de tous les clients (organisations)
     */
    async getClients() {
        return api.request('/api/admin/clients');
    }

    /**
     * Liste de tous les abonnements
     */
    async getSubscriptions() {
        return api.request('/api/admin/subscriptions');
    }

    /**
     * Suspendre un compte client (organisation)
     */
    async suspendClient(id, reason = '') {
        return api.request(`/api/admin/clients/${id}/suspend?reason=${encodeURIComponent(reason)}`, {
            method: 'PATCH'
        });
    }

    /**
     * Réactiver un compte client (organisation)
     */
    async activateClient(id) {
        return api.request(`/api/admin/clients/${id}/activate`, {
            method: 'PATCH'
        });
    }

    /**
     * Activer / Désactiver un utilisateur individuel
     */
    async toggleUserActive(id) {
        return api.request(`/api/admin/users/${id}/toggle-active`, {
            method: 'PATCH'
        });
    }
}

export default new AdminApiService();
