const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('token') || '';
        this.apiKey = localStorage.getItem('apiKey') || '';
        this.subOrgId = localStorage.getItem('subOrgId') || '';
    }

    /**
     * Authentification avec email et mot de passe
     */
    async login(email, password) {
        const response = await this.request('/api/partners/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }
        return response;
    }

    /**
     * Vérification OTP et Auto-Login
     */
    async verifyOtp(email, otp) {
        const response = await this.request('/api/partners/auth/otp/verify', {
            method: 'POST',
            body: JSON.stringify({ email, otp })
        });

        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }
        return response;
    }

    /**
     * Renvoyer un OTP
     */
    async sendOtp(email) {
        return this.request('/api/partners/auth/otp/send', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('apiKey', key);
    }

    setSubOrgId(id) {
        this.subOrgId = id;
        if (id) {
            localStorage.setItem('subOrgId', id);
        } else {
            localStorage.removeItem('subOrgId');
        }
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        } else if (this.apiKey) {
            headers['X-API-KEY'] = this.apiKey;
        }

        if (this.subOrgId) {
            headers['X-ONDA-SUB-ORG'] = this.subOrgId;
        }

        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Une erreur est survenue');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ========================================
    // API de Gestion Partenaire (/api/partners)
    // ========================================

    /**
     * POST /api/partners/register
     * Créer un compte partenaire
     */
    async registerPartner(payload) {
        return this.request('/api/partners/register', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    /**
     * POST /api/partners/organizations
     * Créer une sous-organisation (client) ou une boutique.
     * Payload: { name, activitySector, country, currency, phone, email, parentId }
     */
    async createOrganization(payload) {
        return this.request('/api/partners/organizations', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    /**
     * GET /api/partners/organizations
     * Lister les organisations clientes
     */
    async getOrganizations() {
        return this.request('/api/partners/organizations'); // Returns object with 'data' array
    }

    /**
     * POST /api/partners/api-keys/regenerate
     * Régénérer une clé API (Master si orgId est null, Client sinon)
     * @param {string|null} organizationId - L'ID de l'organisation
     * @param {string|null} environment - 'sandbox' ou 'production'
     */
    async regenerateApiKey(organizationId = null, environment = null) {
        const payload = {};
        if (organizationId) payload.organizationId = organizationId;
        if (environment) payload.environment = environment;

        const headers = {};

        // Docs specify X-PARTNER-KEY for this endpoint
        if (this.apiKey) {
            headers['X-PARTNER-KEY'] = this.apiKey;
        }

        return this.request('/api/partners/api-keys/regenerate', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });
    }

    /**
     * PUT /api/partners/webhook
     * Configurer l'URL de Webhook
     */
    async updateWebhook(webhookUrl) {
        return this.request('/api/partners/webhook', {
            method: 'PUT',
            body: JSON.stringify({ webhookUrl })
        });
    }

    /**
     * GET /api/partners/billing-summary
     * Obtenir le statut du quota API et la consommation
     */
    async getBillingSummary() {
        return this.request('/api/partners/billing-summary');
    }

    /**
     * POST /api/partners/upgrade-plan
     * Changer de plan (FREE ou PAID)
     */
    async upgradePlan(plan) {
        return this.request('/api/partners/upgrade-plan', {
            method: 'POST',
            body: JSON.stringify({ plan })
        });
    }

    // ========================================
    // API Publique des Opérations (/api/public)
    // ========================================

    // 🆔 Identité & État

    /**
     * GET /api/public/me
     * Vérifier la validité de la clé et récupérer les infos de l'organisation liée
     */
    async getMe() {
        return this.request('/api/public/me');
    }

    // 💰 Trésorerie & Comptes

    /**
     * GET /api/public/accounts
     * Lister les comptes bancaires/caisse de l'organisation
     */
    async getAccounts() {
        return this.request('/api/public/accounts');
    }

    /**
     * POST /api/public/accounts
     * Créer un nouveau compte (ex: "Caisse Principale")
     */
    async createAccount(payload) {
        return this.request('/api/public/accounts', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    /**
     * PUT /api/public/accounts/{id}
     * Modifier un compte
     */
    async updateAccount(id, payload) {
        return this.request(`/api/public/accounts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
    }

    /**
     * DELETE /api/public/accounts/{id}
     * Supprimer un compte
     */
    async deleteAccount(id) {
        return this.request(`/api/public/accounts/${id}`, {
            method: 'DELETE'
        });
    }

    /**
     * GET /api/public/balance
     * Obtenir le solde consolidé en temps réel
     */
    async getBalance() {
        return this.request('/api/public/balance');
    }

    // 📝 Transactions

    /**
     * POST /api/public/transactions
     * Enregistrer une vente ou une dépense
     */
    async createTransaction(payload) {
        return this.request('/api/public/transactions', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    /**
     * GET /api/public/transactions
     * Historique paginé des transactions
     */
    async getTransactions(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/api/public/transactions${queryString ? '?' + queryString : ''}`);
    }

    /**
     * DELETE /api/public/transactions/{id}
     * Annuler une transaction
     */
    async deleteTransaction(id) {
        return this.request(`/api/public/transactions/${id}`, {
            method: 'DELETE'
        });
    }

    /**
     * POST /api/public/import/transactions
     * Upload massif (Excel)
     */
    async importTransactions(file) {
        const formData = new FormData();
        formData.append('file', file);

        return this.request('/api/public/import/transactions', {
            method: 'POST',
            body: formData,
            headers: {
                'X-API-KEY': this.apiKey
            }
        });
    }

    // 🏷️ Métadonnées (Configuration)

    /**
     * GET /api/public/categories
     * Lister les catégories disponibles
     */
    async getCategories() {
        return this.request('/api/public/categories');
    }

    /**
     * GET /api/public/third-parties
     * Lister les clients et fournisseurs
     */
    async getThirdParties() {
        return this.request('/api/public/third-parties');
    }

    /**
     * POST /api/public/third-parties
     * Créer un nouveau tiers
     */
    async createThirdParty(payload) {
        return this.request('/api/public/third-parties', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    // 📅 Budgets & Prévisions

    /**
     * GET /api/public/budgets
     * Voir les objectifs budgétaires
     */
    async getBudgets() {
        return this.request('/api/public/budgets');
    }

    /**
     * POST /api/public/budgets
     * Définir un nouveau budget
     */
    async createBudget(payload) {
        return this.request('/api/public/budgets', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    // 7. ANALYTIQUES & VENTES (Warehouse Sync)

    /**
     * POST /api/public/analytics/sales/sync
     * Synchroniser une Vente (Auto-Provisioning)
     * Crée les produits manquants, calcule la marge, enregistre la transaction.
     */
    async syncSales(payload) {
        return this.request('/api/public/analytics/sales/sync', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    // 📊 Reporting & Analytics

    /**
     * GET /api/public/reports/summary
     * Résumé financier (KPIs: CashFlow, BurnRate, Runway...)
     */
    async getReportSummary(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/api/public/reports/summary${queryString ? '?' + queryString : ''}`);
    }

    /**
     * GET /api/public/analytics/products/profitability
     * Rentabilité par Produit
     */
    async getProductProfitability(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/api/public/analytics/products/profitability${queryString ? '?' + queryString : ''}`);
    }

    /**
     * GET /api/public/reports/financial-statements
     * Génère le Bilan OHADA et le Compte de Résultat conformes
     */
    async getFinancialStatements() {
        return this.request('/api/public/reports/financial-statements');
    }

    /**
     * GET /api/public/reports/forecast
     * Prévisions de trésorerie (Runway)
     */
    async getForecast() {
        return this.request('/api/public/reports/forecast');
    }

    // 🔔 Alertes

    /**
     * GET /api/public/alerts
     * Récupérer les alertes financières
     */
    async getAlerts() {
        return this.request('/api/public/alerts');
    }
}

export default new ApiService();
