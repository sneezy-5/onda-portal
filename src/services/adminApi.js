import api, { API_BASE_URL } from './api';

class AdminApiService {
    constructor() {
        this.api = api;
    }

    // =========================================================
    // Centre de documents (/api/admin/documents)
    // =========================================================

    /** Liste des images de preuve, filtrables par catégorie / source / statut. */
    async getDocuments(params = {}) {
        const qs = new URLSearchParams();
        if (params.category && params.category !== 'ALL') qs.append('category', params.category);
        if (params.source && params.source !== 'ALL') qs.append('source', params.source);
        if (params.status && params.status !== 'ALL') qs.append('status', params.status);
        if (params.env && params.env !== 'ALL') qs.append('env', params.env);
        if (params.limit) qs.append('limit', params.limit);
        const s = qs.toString();
        return api.request(`/api/admin/documents${s ? '?' + s : ''}`);
    }

    /** Approuve un justificatif (ex: preuve bancaire) directement depuis le centre de documents. */
    async approveDocument(fileId, notes = '', env = 'production') {
        return api.request(`/api/admin/documents/${fileId}/approve?notes=${encodeURIComponent(notes)}&env=${encodeURIComponent(env)}`, {
            method: 'POST'
        });
    }

    /** Rejette un justificatif (ex: preuve bancaire) directement depuis le centre de documents. */
    async rejectDocument(fileId, notes = '', env = 'production') {
        return api.request(`/api/admin/documents/${fileId}/reject?notes=${encodeURIComponent(notes)}&env=${encodeURIComponent(env)}`, {
            method: 'POST'
        });
    }

    /**
     * Rattrapage : preuves bancaires uploadées avant le fix du lien fichier→compte,
     * restées orphelines (impossible à rattacher à un compte pour auditer).
     */
    async previewBankProofBackfill(env = 'production') {
        return api.request(`/api/admin/documents/bank-proof-backfill/preview?env=${encodeURIComponent(env)}`);
    }

    async applyBankProofBackfill(env = 'production') {
        return api.request(`/api/admin/documents/bank-proof-backfill/apply?env=${encodeURIComponent(env)}`, {
            method: 'POST'
        });
    }

    /**
     * Charge une image protégée (nécessite le token admin) et renvoie une object-URL
     * utilisable dans <img :src>. À révoquer avec URL.revokeObjectURL après usage.
     */
    async fetchImageObjectUrl(pathOrUrl) {
        const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${API_BASE_URL}${pathOrUrl}`;
        const headers = {};
        if (api.token) headers['Authorization'] = `Bearer ${api.token}`;
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`Image ${res.status}`);
        const blob = await res.blob();
        return URL.createObjectURL(blob);
    }

    // =========================================================
    // Certification du patrimoine (/api/admin/patrimony)
    // =========================================================

    /** File d'attente : stock / biens / capital / comptes bancaires à certifier. */
    async getPendingPatrimony() {
        return api.request('/api/admin/patrimony/pending');
    }

    /** Certifie une preuve de patrimoine. type = stock|asset|equity|bank */
    async certifyPatrimony(type, id, notes = '') {
        return api.request(`/api/admin/patrimony/${type}/${id}/certify?notes=${encodeURIComponent(notes)}`, {
            method: 'POST'
        });
    }

    /** Rejette une preuve de patrimoine. type = stock|asset|equity|bank */
    async rejectPatrimony(type, id, reason = '') {
        return api.request(`/api/admin/patrimony/${type}/${id}/reject?reason=${encodeURIComponent(reason)}`, {
            method: 'POST'
        });
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
    // Comptes d'accès au portail banque (/api/admin/banks/{bankId}/users)
    // =========================================================

    /** Liste les comptes de connexion d'un établissement bancaire */
    async getBankUsers(bankId) {
        return api.request(`/api/admin/banks/${bankId}/users`);
    }

    /** Crée un compte de connexion (email/mot de passe) pour un établissement bancaire */
    async createBankUser(bankId, payload) {
        return api.request(`/api/admin/banks/${bankId}/users`, {
            method: 'POST',
            body: JSON.stringify(payload)
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
     * Liste de tous les utilisateurs du système avec filtres et pagination
     */
    async getUsers(params = {}) {
        const queryString = new URLSearchParams();
        if (params.page !== undefined) queryString.append('page', params.page);
        if (params.size !== undefined) queryString.append('size', params.size);
        if (params.sort !== undefined) queryString.append('sort', params.sort);
        if (params.search) queryString.append('search', params.search);
        if (params.role && params.role !== 'ALL') queryString.append('role', params.role);
        if (params.organizationId) queryString.append('organizationId', params.organizationId);
        if (params.isActive !== undefined && params.isActive !== null && params.isActive !== '' && params.isActive !== 'ALL') {
            queryString.append('isActive', params.isActive);
        }
        const qs = queryString.toString();
        return api.request(`/api/admin/users${qs ? '?' + qs : ''}`);
    }

    /**
     * Liste de tous les clients (organisations) avec filtres et pagination
     */
    async getClients(params = {}) {
        const queryString = new URLSearchParams();
        if (params.page !== undefined) queryString.append('page', params.page);
        if (params.size !== undefined) queryString.append('size', params.size);
        if (params.sort !== undefined) queryString.append('sort', params.sort);
        if (params.search) queryString.append('search', params.search);
        if (params.isActive !== undefined && params.isActive !== null && params.isActive !== '' && params.isActive !== 'ALL') {
            queryString.append('isActive', params.isActive);
        }
        if (params.parentId) queryString.append('parentId', params.parentId);
        if (params.clientType && params.clientType !== 'ALL') queryString.append('clientType', params.clientType);
        const qs = queryString.toString();
        return api.request(`/api/admin/clients${qs ? '?' + qs : ''}`);
    }

    /**
     * Liste de tous les partenaires avec filtres et pagination
     */
    async getPartners(params = {}) {
        const queryString = new URLSearchParams();
        if (params.page !== undefined) queryString.append('page', params.page);
        if (params.size !== undefined) queryString.append('size', params.size);
        if (params.sort !== undefined) queryString.append('sort', params.sort);
        if (params.search) queryString.append('search', params.search);
        if (params.isActive !== undefined && params.isActive !== null && params.isActive !== '' && params.isActive !== 'ALL') {
            queryString.append('isActive', params.isActive);
        }
        const qs = queryString.toString();
        return api.request(`/api/admin/partners${qs ? '?' + qs : ''}`);
    }

    /**
     * Liste toutes les organisations gérées par un partenaire
     */
    async getPartnerOrganizations(id) {
        return api.request(`/api/admin/partners/${id}/organizations`);
    }

    /**
     * Activer / Désactiver un partenaire
     */
    async togglePartnerActive(id) {
        return api.request(`/api/admin/partners/${id}/toggle-active`, {
            method: 'PATCH'
        });
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

    // =========================================================
    // Rattrapage comptable — Solde d'Ouverture (/api/admin/accounting)
    // =========================================================

    /** Aperçu en lecture seule des comptes dont le solde d'ouverture manque au grand livre. */
    async previewOpeningBalanceBackfill() {
        return api.request('/api/admin/accounting/opening-balance-backfill/preview');
    }

    /** Applique le rattrapage pour les comptes sans ambiguïté (MATCHED). */
    async applyOpeningBalanceBackfill() {
        return api.request('/api/admin/accounting/opening-balance-backfill/apply', {
            method: 'POST'
        });
    }

    // =========================================================
    // Vue financière d'une organisation (/api/admin/clients/{id})
    // =========================================================

    /** États financiers OHADA (Bilan + Compte de Résultat) d'une organisation. */
    async getClientFinancialStatements(orgId, params = {}) {
        const qs = new URLSearchParams();
        if (params.from) qs.append('from', params.from);
        if (params.to) qs.append('to', params.to);
        const s = qs.toString();
        return api.request(`/api/admin/clients/${orgId}/financial-statements${s ? '?' + s : ''}`);
    }

    /** Score de crédit / bancabilité actuel d'une organisation. */
    async getClientScore(orgId) {
        return api.request(`/api/admin/clients/${orgId}/score`);
    }
}

export default new AdminApiService();
