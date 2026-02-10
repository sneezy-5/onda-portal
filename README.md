# 🌊 ONDA Partner Portal

Portail web pour les partenaires intégrateurs ONDA (ERP, Fintechs, Réseaux de Franchise).

## 🚀 Démarrage Rapide

```bash
# Installation
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

---

## 📋 Fonctionnalités Implémentées

### ✅ Landing Page Moderne
- **Hero Section** avec présentation d'ONDA et statistiques
- **Section Fonctionnalités** : 6 capacités clés d'ONDA
- **Section Produits** : ONDA Business, ONDA API, ONDA Agri
- **Section API** : Présentation des endpoints avec exemples
- **Section Tarifs** : Plans FREE, PAID et ENTERPRISE avec détails Pay-as-you-go
- **Design Premium** : Animations, gradients, thème clair moderne

### ✅ Authentification Partenaire
- **Création de compte** avec tous les champs requis :
  - Nom de l'entreprise
  - Email de contact
  - Mot de passe
  - Téléphone
  - Adresse
  - Webhook URL (optionnel)
- **Connexion** via clé API
- **Affichage sécurisé** de la clé API après création

### ✅ Dashboard Partenaire
- Statistiques : Organisations, Appels API, Quota, Plan
- Graphique de consommation API (7 derniers jours)
- Gestion sécurisée de la clé API (masquée par défaut)
- Actions rapides

### ✅ Gestion des Organisations
- Liste des organisations créées
- Création de nouvelles organisations clientes
- Détails : Nom, Secteur d'activité, Régime fiscal, Date de création
- Suppression d'organisations

### ✅ Facturation & Plans
- Affichage du plan actuel (FREE/PAID)
- Suivi de la consommation API avec barre de progression
- Comparaison des 3 plans disponibles
- Upgrade vers le plan PAID
- Détails du modèle Pay-as-you-go

### ✅ Documentation API
- Documentation complète des endpoints
- Exemples de code (JavaScript, Python, cURL)
- Bonnes pratiques d'intégration

---

## 🔌 API Endpoints Implémentés (V1.6)

### 🔐 Authentification & Sécurité

**En-têtes Requis (Headers)**
| Header | Description | Exemple |
|--------|-------------|---------|
| `X-API-KEY` | Clé API (Test ou Live) ou Clé Maître | `sk_live_...` |
| `X-ONDA-SUB-ORG` | **(God Mode)** UUID de l'Organisation cible | `a1b2c3...` |

**🚀 SUPER POWER : La Clé Maître ("God Mode")**
Utilisez votre Clé Maître dans `X-API-KEY` et ajoutez l'ID du client dans `X-ONDA-SUB-ORG` pour effectuer des opérations en son nom.

### 🏗️ Gestion Partenaire (`/api/partners`)

#### 1. Enrôler un Client / Boutique
```http
POST /api/partners/organizations
```
**Payload:**
```json
{
  "name": "Supermarché Le Plateau",
  "activitySector": "GENERAL_TRADE",
  "country": "CI",
  "currency": "XOF",
  "phone": "+2250700000000",
  "parentId": "optional-uuid-siege"
}
```

#### 2. Régénérer une Clé API
```http
POST /api/partners/api-keys/regenerate
Auth: X-PARTNER-KEY
```
**Payload:** `{ "organizationId": "uuid..." }`

#### 3. Configurer Webhook
```http
PUT /api/partners/webhook
```
**Payload:** `{ "webhookUrl": "https://..." }`

**Événements Supportés:**
1. **Système & Transactions**
   - `organization.created` : Une nouvelle sous-organisation (boutique) a été provisionnée.
   - `transaction.completed` : Flux financier enregistré avec succès.
   - `api.quota.exceeded` : Quota d'appels API atteint.
2. **Alertes IA**
   - `alert.cash_critical` : Trésorerie < 3 jours de charges.
   - `alert.budget_exceeded` : Budget consommé à plus de 80%.
   - `alert.payment_overdue` : Retard de paiement détecté.
   - `alert.negative_cashflow` : Risque de négatif à 7 jours.
3. **Rapports**
   - `report.generated` : Bilan financier prêt.

### 💳 Opérations Financières (`/api/public`)
*Utilisez `X-ONDA-SUB-ORG` pour agir au nom d'un client.*

#### Trésorerie
- `GET /api/public/accounts` - Lister les comptes (Banque, Mobile Money, Caisse)
- `POST /api/public/accounts` - Créer un compte
- `GET /api/public/balance` - Solde disponible consolidé

#### Transactions & Ventes
- `POST /api/public/transactions` - Enregistrer Dépense/Revenu simple
- `POST /api/public/analytics/sales/sync` - **(Smart Sync)** Enregistrer une vente détaillée, créer les produits manquants et calculer la marge.

#### Budgets
- `POST /api/public/budgets` - Créer un budget (ex: Marketing Février)
- `GET /api/public/budgets` - Suivi de consommation budgétaire

#### Métadonnées
- `GET /api/public/categories` - Catégories (Loyer, Ventes, Salaires...)
- `GET /api/public/third-parties` - Clients & Fournisseurs

### 📊/📈 Reporting & Insights

- `GET /api/public/reports/summary` - KPIs (Cashflow, Burn Rate, Runway)
- `GET /api/public/analytics/products/profitability` - Rentabilité par produit
- `GET /api/public/reports/financial-statements` - Bilan OHADA

---

## 💳 Modèle de Tarification

### Plan FREE (Défaut)
- **Quota:** 1,000 requêtes/mois
- **Dépassement:** Bloqué (HTTP 429)
- **Usage:** Test & Développement
- **Prix:** Gratuit

### Plan PAID
- **Quota:** 1,000 requêtes incluses
- **Dépassement:** Autorisé
- **Tarif dépassement:** 0.005 USD (~3 FCFA) par requête
- **Usage:** Production intensive
- **Prix:** 49€/mois

### Plan ENTERPRISE
- **Quota:** Illimité
- **Déploiement:** On-premise disponible
- **Support:** Account manager dédié
- **Prix:** Sur mesure

### Mécanisme de Facturation
- **Réinitialisation:** 1er de chaque mois
- **Facturation automatique:** 1er du mois à 02h00 (plan PAID)
- **Génération facture:** Transaction EXPENSE avec statut DUE

---

## 🎨 Design & UX

### Palette de Couleurs
- **Primaire:** #3b82f6 (Bleu)
- **Secondaire:** #10b981 (Vert)
- **Accent:** #f59e0b (Orange)
- **Texte:** #111827 (Gris foncé)

### Caractéristiques
- ✅ Thème clair moderne et professionnel
- ✅ Animations fluides et micro-interactions
- ✅ Responsive (mobile, tablette, desktop)
- ✅ Typographie Google Fonts (Inter)
- ✅ Gradients et ombres pour effet premium
- ✅ Code window animé dans le hero
- ✅ Hover effects sur toutes les cartes

---

## 📁 Structure du Projet

```
src/
├── components/
│   ├── Header.vue          # En-tête avec déconnexion
│   └── Sidebar.vue         # Navigation latérale
├── views/
│   ├── LandingPage.vue     # Page d'accueil publique
│   ├── Login.vue           # Authentification
│   ├── Dashboard.vue       # Tableau de bord
│   ├── Organizations.vue   # Gestion organisations
│   ├── Billing.vue         # Facturation
│   └── ApiDocs.vue         # Documentation
├── services/
│   └── api.js              # Service API centralisé (V1.6)
└── App.vue                 # Composant racine
```

---

## 🔧 Configuration

### Variables d'Environnement (`.env`)
```env
VITE_API_URL=http://localhost:8082
```

### Format de Réponse Standard
```json
{
  "success": true|false,
  "message": "Message descriptif",
  "data": { ... }
}
```

---

## 🛠️ Bonnes Pratiques d'Intégration

### 1. Gestion des Erreurs
Toutes les réponses suivent le format `ApiResponse`:
```json
{
  "success": false,
  "message": "Solde insuffisant",
  "data": null
}
```

### 2. Rate Limiting
- Plan FREE: Limité à 1,000 requêtes/mois
- Gérer les erreurs `429 Too Many Requests`
- Plan PAID: Pay-as-you-go après quota

### 3. Idempotence
- Ne pas envoyer deux fois la même requête POST
- Implémenter des mécanismes de retry avec backoff

### 4. Authentification
- Header requis: `X-API-KEY: votre-cle-api`
- Utiliser `X-ONDA-SUB-ORG` pour segmenter les données par client.
- Clé API à sauvegarder de manière sécurisée
- Ne jamais exposer la clé côté client

---

## 🚀 Prochaines Étapes

1. **Connecter au backend réel** (actuellement en mode démo)
2. **Implémenter les webhooks** pour notifications temps réel
3. **Ajouter le système de paiement** (Stripe/Wave)
4. **Analytics avancés** avec graphiques détaillés
5. **Système de notifications** en temps réel
6. **Export de données** (CSV, Excel, PDF)
7. **Tests unitaires** et E2E
8. **Validation OHADA** des rapports financiers

---

## 📞 Support

- **Email:** contact@onda.africa
- **Téléphone:** +225 07 07 07 07 07
- **Documentation:** http://localhost:5174/#api

---

## 📄 Licence

© 2026 ONDA. Tous droits réservés.
