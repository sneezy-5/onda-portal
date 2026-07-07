<template>
  <div class="docs-portal reveal">
    <header class="docs-hero mb-16">
      <div class="badge-pill badge-primary mb-6">DEVELOPER HUB V2.0</div>
      <h1 class="page-title mb-4">Ingénierie & <span class="text-gradient">Intégration</span></h1>
      <p class="text-muted hero-lead">Construisez des expériences financières fluides avec l'API ONDA.</p>
    </header>

    <div class="docs-layout">
      <!-- High-End Navigation Sidebar -->
      <aside class="docs-sidebar-nav">
        <div class="nav-sticky-container">
          <div class="nav-search mb-8">
            <span class="icon"><i class="fas fa-search"></i></span>
            <input type="text" placeholder="Rechercher un endpoint..." />
          </div>

          <div class="nav-sections">
            <div v-for="section in sections" :key="section.id" class="nav-group mb-8">
              <label class="nav-group-label">{{ section.label }}</label>
              <div class="nav-items-stack">
                <button 
                  v-for="item in section.items" :key="item.id"
                  :class="['nav-link-doc', { active: activeSection === item.id }]"
                  @click="activeSection = item.id"
                >
                  <span class="nav-ic"><i :class="item.icon"></i></span>
                  <span class="nav-lb">{{ item.title }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Elite Content Area -->
      <main class="docs-main-content">
        <transition name="fade-slide" mode="out-in">
          <section :key="activeSection" class="doc-content-view card-premium p-12">
            
            <!-- Overview Section -->
            <div v-if="activeSection === 'overview'">
              <h2 class="section-title mb-8">📄 ONDA PARTNER API - Documentation Officielle (V1.6)</h2>
              <p class="doc-paragraph mb-10">
                Bienvenue dans la documentation complète de l'API Partenaire ONDA. Ce guide est destiné aux intégrateurs (ERP, CRM, Logiciels de Stock) souhaitant synchroniser leurs données financières avec l'écosystème ONDA.
              </p>

              <div class="doc-callout primary mb-10 p-8">
                <div class="callout-icon">
                  <i class="fas fa-network-wired"></i>
                </div>
                <div class="callout-text">
                  <strong>Production & Sandbox (Live URL)</strong>
                  <p>Toutes les requêtes sont servies via <code>https://api.onda.network</code>.</p>
                  <p class="mt-2 text-sm">L'environnement est déterminé <strong>automatiquement</strong> par le type de clé API.</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div class="card-premium p-6 border-l-4 border-accent">
                  <h4 class="text-accent mb-2">MODE SANDBOX</h4>
                  <p class="text-sm text-dim">Clé API : <code>sk_test_...</code></p>
                  <p class="text-xs text-muted mt-2">Redirige vers la base de données de TEST.</p>
                </div>
                <div class="card-premium p-6 border-l-4 border-success">
                  <h4 class="text-success mb-2">MODE PRODUCTION</h4>
                  <p class="text-sm text-dim">Clé API : <code>sk_live_...</code></p>
                  <p class="text-xs text-muted mt-2">Redirige vers la base de données de PRODUCTION.</p>
                </div>
              </div>
            </div>

            <!-- Auth Section -->
            <div v-if="activeSection === 'auth'">
              <h2 class="section-title mb-8">1. Authentification & Sécurité</h2>
              <p class="doc-paragraph mb-8">
                Toutes les requêtes API sont servies via HTTPS. Vous n'avez pas besoin de changer d'URL entre le test et la prod, changez simplement de clé.
              </p>

              <div class="table-container card-premium p-6 mb-10">
                <table class="doc-table w-full">
                  <thead>
                    <tr>
                      <th class="text-left w-1/3">Header</th>
                      <th class="text-left">Description</th>
                      <th class="text-left">Exemple</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>Content-Type</code></td>
                      <td>Toujours application/json</td>
                      <td><code>application/json</code></td>
                    </tr>
                    <tr>
                      <td><code>X-PARTNER-KEY</code></td>
                      <td><strong>Clé Maître Partenaire</strong> (Pour le provisioning)</td>
                      <td><code>sk_live_master_...</code></td>
                    </tr>
                    <tr>
                      <td><code>X-API-KEY</code></td>
                      <td><strong>Clé API</strong> (Test ou Live)</td>
                      <td><code>sk_test_...</code> ou <code>sk_live_...</code></td>
                    </tr>
                    <tr>
                      <td><code>X-ONDA-SUB-ORG</code></td>
                      <td><strong>UUID de l'Organisation cible</strong> (Uniquement si vous utilisez une Clé Maître)</td>
                      <td><code>a1b2c3d4-e5f6...</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 class="text-2xl font-bold mb-4 mt-12 text-gradient">🚀 SUPER POWER : La Clé Maître ("God Mode")</h3>
              <p class="doc-paragraph mb-6">
                Vous n'avez pas besoin de gérer une clé API différente pour chaque client.
                <strong>Vous pouvez utiliser votre Clé Maître pour effectuer des opérations au nom de n'importe quel client.</strong>
              </p>

              <div class="step-card mb-8 p-6 card-premium bg-white border border-gray-100">
                <h4 class="mb-4">Comment ça marche ?</h4>
                <ol class="list-decimal pl-6 space-y-2 text-dim">
                  <li>Utilisez votre Clé Maître dans <code>X-API-KEY</code>.</li>
                  <li>Ajoutez l'ID de votre client dans le header <code>X-ONDA-SUB-ORG</code>.</li>
                  <li>ONDA exécutera la requête comme si c'était le client lui-même.</li>
                </ol>
              </div>
              
              <div class="doc-callout warning p-8">
                <strong>🛡️ Sécurité Critique</strong>
                <p>Ne stockez jamais votre <code>X-PARTNER-KEY</code> ou votre Clé Maître dans un code frontend (Javascript côté client).</p>
              </div>
            </div>

            <!-- Errors Section -->
            <div v-if="activeSection === 'errors'">
              <h2 class="section-title mb-8">10. GESTION DES ERREURS</h2>
              <p class="doc-paragraph mb-8">
                L'API ONDA utilise des codes d'état HTTP standards. En cas d'erreur, une réponse structurée est renvoyée.
              </p>

              <div class="code-terminal-premium mb-10">
                <div class="term-head">Format d'une Réponse d'Erreur</div>
                <pre><code>{
  <span class="k">"success"</span>: <span class="n">false</span>,
  <span class="k">"timestamp"</span>: <span class="s">"2026-02-07T12:25:00"</span>,
  <span class="k">"message"</span>: <span class="s">"Le nom de l'organisation est requis"</span>,
  <span class="k">"errors"</span>: [<span class="s">"Détail technique 1"</span>, <span class="s">"Détail technique 2"</span>]
}</code></pre>
              </div>

              <div class="table-container card-premium p-6">
                <table class="doc-table w-full">
                  <thead>
                    <tr>
                      <th class="text-left">Code</th>
                      <th class="text-left">Nom</th>
                      <th class="text-left">Cause Possible</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>200/201</td><td>OK</td><td>Succès de l'opération.</td></tr>
                    <tr><td>400</td><td>Bad Request</td><td>Paramètre manquant, erreur de validation ou logique métier invalide.</td></tr>
                    <tr><td>401</td><td>Unauthorized</td><td>Clé API manquante ou invalide.</td></tr>
                    <tr><td>403</td><td>Forbidden</td><td>Clé API valide mais n'a pas les droits pour cette opération.</td></tr>
                    <tr><td>404</td><td>Not Found</td><td>L'organisation, le compte ou la ressource demandée n'existe pas.</td></tr>
                    <tr><td>429</td><td>Too Many Requests</td><td>Quota mensuel atteint ou limite de débit dépassée.</td></tr>
                    <tr><td>500</td><td>Server Error</td><td>Erreur interne du serveur ONDA.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Partner API Items -->
            <div v-if="activeSection === 'partner-provisioning'">
              <h2 class="section-title mb-8">2. GESTION DES ORGANISATIONS (Sous-Clients)</h2>
              <p class="doc-paragraph mb-8">Cette API permet au partenaire de gérer ses clients directement depuis son infrastructure. Header requis : <code>X-API-KEY: {Master_Key}</code>.</p>
              
              <h3 class="text-xl font-bold mb-4">2.1 Enrôler un nouveau Client</h3>
              <p class="doc-paragraph mb-4">Créez un environnement ONDA isolé pour votre client.</p>
              <div class="endpoint-block mb-12">
                <div class="endpoint-meta">
                  <span class="method post">POST</span>
                  <span class="path">/api/partners/organizations</span>
                </div>
                <div class="code-terminal-premium mt-6">
                  <div class="term-head">Body JSON</div>
                  <pre><code>{
  <span class="k">"name"</span>: <span class="s">"Boulangerie du Centre"</span>,
  <span class="k">"type"</span>: <span class="s">"RETAIL"</span>,
  <span class="k">"activitySector"</span>: <span class="s">"FOOD_BEVERAGE"</span>,
  <span class="k">"country"</span>: <span class="s">"CI"</span>,
  <span class="k">"phone"</span>: <span class="s">"+225..."</span>,
  <span class="k">"email"</span>: <span class="s">"contact@boulangerie.ci"</span>
}</code></pre>
                </div>
              </div>

              <h3 class="text-xl font-bold mb-4">2.2 Lister les Organisations (Pagination)</h3>
              <p class="doc-paragraph mb-4">Récupérez la liste paginée de vos clients. Utile pour les portails à haut volume.</p>
              <div class="endpoint-block mb-12">
                <div class="endpoint-meta">
                  <span class="method get">GET</span>
                  <span class="path">/api/partners/organizations?page=0&size=20</span>
                </div>
                <div class="code-terminal-premium mt-6">
                  <div class="term-head">Réponse JSON (Page Spring)</div>
                  <pre><code>{
  <span class="k">"success"</span>: <span class="n">true</span>,
  <span class="k">"data"</span>: {
    <span class="k">"content"</span>: [
      {
        <span class="k">"id"</span>: <span class="s">"uuid-boutique-1"</span>,
        <span class="k">"name"</span>: <span class="s">"Boulangerie du Centre"</span>,
        <span class="k">"type"</span>: <span class="s">"RETAIL"</span>,
        <span class="k">"createdAt"</span>: <span class="s">"2026-01-01T10:00:00"</span>
      }
    ],
    <span class="k">"totalPages"</span>: 5,
    <span class="k">"totalElements"</span>: 98,
    <span class="k">"size"</span>: 20,
    <span class="k">"number"</span>: 0
  }
}</code></pre>
                </div>
              </div>

              <h3 class="text-xl font-bold mb-4">2.3 Modifier une Organisation</h3>
              <p class="doc-paragraph mb-4">Mettez à jour les métadonnées d'un environnement client.</p>
              <div class="endpoint-block mb-12">
                <div class="endpoint-meta">
                  <span class="method put">PUT</span>
                  <span class="path">/api/partners/organizations/{id}</span>
                </div>
                <div class="code-terminal-premium mt-6">
                  <div class="term-head">Body JSON</div>
                  <pre><code>{
  <span class="k">"name"</span>: <span class="s">"Nouveau Nom de la Boutique"</span>,
  <span class="k">"type"</span>: <span class="s">"SERVICES"</span>,
  <span class="k">"activitySector"</span>: <span class="s">"CONSULTING"</span>,
  <span class="k">"vatRate"</span>: <span class="n">18.0</span>
}</code></pre>
                </div>
              </div>

              <h3 class="text-xl font-bold mb-4">2.4 Supprimer une Organisation</h3>
              <div class="doc-callout danger p-6 mb-6">
                <strong>⚠️ Suppression Irréversible</strong>
                <p>La suppression supprime également toutes les données liées (transactions, comptes, utilisateurs). Cette opération ne peut pas être annulée.</p>
              </div>
              <div class="endpoint-block mb-12">
                <div class="endpoint-meta">
                  <span class="method delete">DELETE</span>
                  <span class="path">/api/partners/organizations/{id}</span>
                </div>
                <div class="code-terminal-premium mt-6">
                  <div class="term-head">Réponse</div>
                  <pre><code>{ <span class="k">"success"</span>: <span class="n">true</span>, <span class="k">"message"</span>: <span class="s">"Organisation supprimée"</span> }</code></pre>
                </div>
              </div>

              <h3 class="text-xl font-bold mb-4">2.5 Régénérer la Clé API d'un Client</h3>
              <p class="doc-paragraph mb-4">Générez une nouvelle clé <code>sk_live_...</code> ou <code>sk_test_...</code> pour un client.</p>
              <div class="endpoint-block mb-12">
                <div class="endpoint-meta">
                  <span class="method post">POST</span>
                  <span class="path">/api/partners/api-keys/regenerate</span>
                </div>
                <div class="code-terminal-premium mt-6">
                  <div class="term-head">Body JSON</div>
                  <pre><code>{
  <span class="k">"organizationId"</span>: <span class="s">"uuid-du-client"</span>,
  <span class="k">"environment"</span>: <span class="s">"production"</span> <span class="n">// sandbox ou production</span>
}</code></pre>
                </div>
              </div>

              <h3 class="text-xl font-bold mb-4 mt-12">Graphique de Structure (Multi-Site)</h3>
              <div class="hierarchy-diagram card-premium p-8 bg-white">
                <div class="mermaid-box flex justify-center">
                  <pre class="mermaid">
graph TD
    P[PARTENAIRE INTEGRATEUR] -->|Clé Maître| C1[CLIENT : Siège Social]
    C1 -->|Lien parentId| S1[Sous-Org : Boutique 1]
    C1 -->|Lien parentId| S2[Sous-Org : Boutique 2]
    style P fill:#2d3748,color:#fff
    style C1 fill:#3182ce,color:#fff
    style S1 fill:#48bb78,color:#fff
                  </pre>
                </div>
              </div>
            </div>

            <!-- Billing Tracking -->
            <div v-if="activeSection === 'partner-billing'">
              <h2 class="section-title mb-8">2.5 Résumé de Facturation & Dashboard</h2>
              <p class="doc-paragraph mb-8">Récupérez vos statistiques d'utilisation, votre plan actuel et vos clés API (Master & Test).</p>
              
              <div class="endpoint-block mb-10">
                <div class="endpoint-meta">
                  <span class="method get">GET</span>
                  <span class="path">/api/partners/billing-summary</span>
                </div>
                <div class="code-terminal-premium mt-6">
                  <div class="term-head">Header Requête</div>
                  <pre><code>X-PARTNER-KEY: {Master_Key}</code></pre>
                </div>
                <div class="code-terminal-premium mt-6">
                  <div class="term-head">Réponse (200 OK)</div>
                  <pre><code>{
  <span class="k">"success"</span>: <span class="n">true</span>,
  <span class="k">"data"</span>: {
    <span class="k">"plan"</span>: <span class="s">"FREE"</span>,
    <span class="k">"monthlyQuota"</span>: <span class="n">1000</span>,
    <span class="k">"currentUsage"</span>: <span class="n">125</span>,
    <span class="k">"provisionedOrganizationsCount"</span>: <span class="n">5</span>,
    <span class="k">"masterApiKey"</span>: <span class="s">"sk_live_..."</span>, 
    <span class="k">"testApiKey"</span>: <span class="s">"sk_test_..."</span>,
    <span class="k">"masterApiKeyName"</span>: <span class="s">"Live Key - WARETRACK"</span>
  }
}</code></pre>
                </div>
              </div>
            </div>

            <!-- Public API Items -->
            
            <!-- Context / Identity -->
            <div v-if="activeSection === 'public-me'">
              <h2 class="section-title mb-8">3. IDENTITÉ & CONTEXTE</h2>
              <p class="doc-paragraph mb-8">Utilisez soit la Clé du Client, soit votre Clé Maître avec <code>X-ONDA-SUB-ORG</code>.</p>
              
              <h3 class="text-xl font-bold mb-4">3.1 Qui suis-je ? (Organisation courante)</h3>
              <p class="doc-paragraph mb-4">Récupère les détails de l'organisation connectée (Devise, Secteur, Nom).</p>

              <div class="endpoint-block">
                <div class="endpoint-meta">
                  <span class="method get">GET</span>
                  <span class="path">/api/public/me</span>
                </div>
                <div class="code-terminal-premium mt-6">
                    <div class="term-head">Exemple de Réponse</div>
                    <pre><code>{
  <span class="k">"success"</span>: <span class="n">true</span>,
  <span class="k">"data"</span>: {
    <span class="k">"id"</span>: <span class="s">"uuid-organization"</span>,
    <span class="k">"name"</span>: <span class="s">"Supermarché Le Plateau"</span>,
    <span class="k">"currency"</span>: <span class="s">"XOF"</span>,
    <span class="k">"activitySector"</span>: <span class="s">"GENERAL_TRADE"</span>,
    <span class="k">"subscriptionPlan"</span>: <span class="s">"PREMIUM"</span>
  }
}</code></pre>
                  </div>
              </div>
            </div>

            <!-- Accounts -->
            <div v-if="activeSection === 'public-accounts'">
              <h2 class="section-title mb-8">4. OPÉRATIONS FINANCIÈRES (Client API)</h2>
              <p class="doc-paragraph mb-8">Utilisez soit la Clé du Client, soit votre Clé Maître avec <code>X-ONDA-SUB-ORG</code>.</p>
              
              <h3 class="text-xl font-bold mb-4">4.1 Créer un Compte de Trésorerie</h3>
              <p class="doc-paragraph mb-4">Ajoutez un compte Mobile Money, une Banque ou une Caisse physique.</p>
              <div class="endpoint-block mb-10">
                <div class="endpoint-meta">
                  <span class="method post">POST</span>
                  <span class="path">/api/public/accounts</span>
                </div>
                
                <div class="code-terminal-premium mt-6">
                  <div class="term-head">Body JSON</div>
                  <pre><code>{
  <span class="k">"label"</span>: <span class="s">"Compte Orange Money - Boutique 1"</span>,
  <span class="k">"channel"</span>: <span class="s">"MOBILE_MONEY"</span>, <span class="n">// BANK, CASH, MOBILE_MONEY</span>
  <span class="k">"provider"</span>: <span class="s">"ORANGE"</span>,     <span class="n">// MTN, MOOV, WAVE, ECOBANK, NSIA...</span>
  <span class="k">"accountNumber"</span>: <span class="s">"0708091011"</span>,
  <span class="k">"currency"</span>: <span class="s">"XOF"</span>,
  <span class="k">"initialBalance"</span>: <span class="n">0</span>
}</code></pre>
                </div>
              </div>


               <h3 class="text-xl font-bold mb-4">4.2 Lister les Comptes</h3>
               <p class="doc-paragraph mb-4">Récupérez la liste de tous les comptes configurés pour l'organisation.</p>
               <div class="endpoint-block mb-10">
                 <div class="endpoint-meta">
                   <span class="method get">GET</span>
                   <span class="path">/api/public/accounts</span>
                 </div>
                 <div class="code-terminal-premium mt-6">
                   <div class="term-head">Réponse JSON</div>
                   <pre><code>{
  <span class="k">"success"</span>: <span class="n">true</span>,
  <span class="k">"data"</span>: [
    {
      <span class="k">"id"</span>: <span class="s">"uuid-compte-1"</span>,
      <span class="k">"label"</span>: <span class="s">"Caisse Principale"</span>,
      <span class="k">"currentBalance"</span>: <span class="n">125000</span>,
      <span class="k">"channel"</span>: <span class="s">"CASH"</span>
    }
  ]
}</code></pre>
                 </div>
               </div>

               <h3 class="text-xl font-bold mb-4">4.3 Modifier un Compte</h3>
               <p class="doc-paragraph mb-4">Mettez à jour le libellé ou le statut d'un compte.</p>
               <div class="endpoint-block mb-10">
                 <div class="endpoint-meta">
                   <span class="method put">PUT</span>
                   <span class="path">/api/public/accounts/{id}</span>
                 </div>
                 <div class="code-terminal-premium mt-6">
                   <div class="term-head">Body JSON</div>
                   <pre><code>{
  <span class="k">"label"</span>: <span class="s">"Nouveau Nom du Compte"</span>,
  <span class="k">"isActive"</span>: <span class="n">true</span>
}</code></pre>
                 </div>
                 <div class="code-terminal-premium mt-4">
                   <div class="term-head">Réponse</div>
                   <pre><code>{
  <span class="k">"success"</span>: <span class="n">true</span>,
  <span class="k">"data"</span>: {
    <span class="k">"id"</span>: <span class="s">"uuid-compte"</span>,
    <span class="k">"label"</span>: <span class="s">"Nouveau Nom du Compte"</span>,
    <span class="k">"isActive"</span>: <span class="n">true</span>
  }
}</code></pre>
                 </div>
               </div>

               <h3 class="text-xl font-bold mb-4">4.4 Supprimer un Compte</h3>
               <p class="doc-paragraph mb-4">Archive définitivement un compte de trésorerie.</p>
               <div class="endpoint-block mb-10">
                 <div class="endpoint-meta">
                   <span class="method delete">DELETE</span>
                   <span class="path">/api/public/accounts/{id}</span>
                 </div>
                 <div class="code-terminal-premium mt-6">
                   <div class="term-head">Réponse</div>
                   <pre><code>{
  <span class="k">"success"</span>: <span class="n">true</span>,
  <span class="k">"message"</span>: <span class="s">"Opération réussie"</span>
}</code></pre>
                 </div>
               </div>

               <h3 class="text-xl font-bold mb-4">4.5 Consulter le Solde Disponible</h3>
               <p class="doc-paragraph mb-4">Récupère le cash total disponible (tous comptes confondus).</p>
               <div class="endpoint-block">
                <div class="endpoint-meta">
                  <span class="method get">GET</span>
                  <span class="path">/api/public/balance</span>
                </div>
                <div class="code-terminal-premium mt-6">
                  <div class="term-head">Réponse</div>
                  <pre><code>{
  <span class="k">"success"</span>: <span class="n">true</span>,
  <span class="k">"data"</span>: <span class="n">1500000.00</span> <span class="n">// Montant en devise de l'organisation</span>
}</code></pre>
                </div>
              </div>
            </div>

            <!-- Transactions -->
            <div v-if="activeSection === 'public-transactions'">
              <h2 class="section-title mb-8">4.6 Enregistrer une Transaction (Dépense/Revenu)</h2>
              <p class="doc-paragraph mb-8">Pour enregistrer un loyer, un achat de fourniture, ou une vente simple (sans détail produit).</p>
              
              <div class="endpoint-block mb-10">
                <div class="endpoint-meta">
                  <span class="method post">POST</span>
                  <span class="path">/api/public/transactions</span>
                </div>
                <div class="code-terminal-premium mt-6">
                  <div class="term-head">Body JSON</div>
                  <pre><code>{
  <span class="k">"type"</span>: <span class="s">"EXPENSE"</span>, <span class="n">// INCOME, EXPENSE, TRANSFER</span>
  <span class="k">"amount"</span>: <span class="n">25000</span>,
  <span class="k">"transactionDate"</span>: <span class="s">"2026-02-07"</span>,
  <span class="k">"description"</span>: <span class="s">"Paiement Facture Électricité CIE"</span>,
  <span class="k">"paymentMethod"</span>: <span class="s">"MOBILE_MONEY"</span>, <span class="n">// CASH, MOBILE_MONEY, BANK_TRANSFER</span>
  <span class="k">"categoryId"</span>: <span class="s">"uuid-category-optional"</span>,
  <span class="k">"thirdPartyId"</span>: <span class="s">"uuid-third-party-optional"</span>
}</code></pre>
                </div>
              </div>
            </div>

            <!-- Data & Meta -->
            <div v-if="activeSection === 'public-data'">
              <h2 class="section-title mb-8">6. CATÉGORIES ET TIERS (Metadata)</h2>
              <p class="doc-paragraph mb-8">Pour une comptabilité précise, il est recommandé d'associer vos transactions à des catégories et des tiers.</p>
              
              <h3 class="text-xl font-bold mb-4">6.1 Lister les Catégories disponibles</h3>
              <p class="doc-paragraph mb-4">Récupérez les catégories par défaut ou personnalisées (ex: Ventes, Loyer, Salaires).</p>
              <div class="endpoint-block mb-10">
                <div class="endpoint-meta">
                  <span class="method get">GET</span>
                  <span class="path">/api/public/categories</span>
                </div>
                <div class="code-terminal-premium mt-6">
                  <div class="term-head">Réponse</div>
                  <pre><code>{
  <span class="k">"success"</span>: <span class="n">true</span>,
  <span class="k">"data"</span>: [
    {
      <span class="k">"id"</span>: <span class="s">"uuid-category-1"</span>,
      <span class="k">"name"</span>: <span class="s">"Ventes de marchandises"</span>,
      <span class="k">"type"</span>: <span class="s">"INCOME"</span>,
      <span class="k">"icon"</span>: <span class="s">"shopping-cart"</span>,
      <span class="k">"color"</span>: <span class="s">"#4CAF50"</span>
    },
    {
      <span class="k">"id"</span>: <span class="s">"uuid-category-2"</span>,
      <span class="k">"name"</span>: <span class="s">"Loyers et charges locatives"</span>,
      <span class="k">"type"</span>: <span class="s">"EXPENSE"</span>,
      <span class="k">"icon"</span>: <span class="s">"home"</span>,
      <span class="k">"color"</span>: <span class="s">"#FF9800"</span>
    }
  ]
}</code></pre>
                </div>
              </div>

               <h3 class="text-xl font-bold mb-4 mt-12">6.2 Gérer les Tiers (Clients, Fournisseurs)</h3>
               
               <h4 class="text-lg font-bold mb-2">Lister les Tiers</h4>
               <div class="endpoint-block mb-8">
                <div class="endpoint-meta">
                   <span class="method get">GET</span>
                   <span class="path">/api/public/third-parties</span>
                </div>
                <div class="code-terminal-premium mt-6">
                   <div class="term-head">Réponse</div>
                   <pre><code>{
  <span class="k">"data"</span>: [
    {
      <span class="k">"id"</span>: <span class="s">"uuid-third-party-1"</span>,
      <span class="k">"name"</span>: <span class="s">"Fournisseur CIE"</span>,
      <span class="k">"type"</span>: <span class="s">"SUPPLIER"</span>
    },
    {
      <span class="k">"id"</span>: <span class="s">"uuid-third-party-2"</span>,
      <span class="k">"name"</span>: <span class="s">"Client VIP - Hôtel Ivoire"</span>,
      <span class="k">"type"</span>: <span class="s">"CLIENT"</span>
    }
  ]
}</code></pre>
                </div>
               </div>

                <h4 class="text-lg font-bold mb-2">Créer un Nouveau Tiers</h4>
                <div class="endpoint-block">
                  <div class="endpoint-meta">
                    <span class="method post">POST</span>
                    <span class="path">/api/public/third-parties?name=Fournisseur%20CIE&type=SUPPLIER</span>
                  </div>
                  <p class="text-xs text-dim mt-2 pl-4">Paramètres Query : <code>name</code> (Nom du tiers), <code>type</code> (CLIENT, SUPPLIER, EMPLOYEE).</p>
                </div>
            </div>

            <!-- Reports -->
            <div v-if="activeSection === 'public-reports'">
              <h2 class="section-title mb-8">8. DASHBOARD & INSIGHTS</h2>
              <p class="doc-paragraph mb-8">Affichez ces données sur le dashboard d'accueil de votre ERP.</p>
              
              <h3 class="text-xl font-bold mb-4">8.1 Résumé Financier (KPIs)</h3>
              <div class="endpoint-block mb-10">
                <div class="endpoint-meta">
                  <span class="method get">GET</span>
                  <span class="path">/api/public/reports/summary?period=month</span>
                </div>
                <div class="code-terminal-premium mt-6">
                  <div class="term-head">Réponse JSON</div>
                  <pre><code>{
  <span class="k">"data"</span>: {
    <span class="k">"organizationId"</span>: <span class="s">"..."</span>,
    <span class="k">"cashFlow"</span>: <span class="n">250000</span>,
    <span class="k">"burnRate"</span>: <span class="n">120000</span>,       <span class="n">// Dépenses mensuelles moyennes</span>
    <span class="k">"runwayMonths"</span>: <span class="n">8.5</span>,      <span class="n">// Mois de survie avant rupture de cash</span>
    <span class="k">"netMargin"</span>: <span class="n">15.4</span>,        <span class="n">// Marge nette globale en %</span>
    <span class="k">"topExpenseCategory"</span>: <span class="s">"Achats Marchandises"</span>
  }
}</code></pre>
                </div>
              </div>
 
               <h3 class="text-xl font-bold mb-4">8.2 Rentabilité par Produit</h3>
               <p class="doc-paragraph mb-4">Identifiez les produits qui font perdre de l'argent.</p>
               <div class="endpoint-block">
                <div class="endpoint-meta">
                  <span class="method get">GET</span>
                  <span class="path">/api/public/analytics/products/profitability</span>
                </div>
                <p class="text-xs text-dim mt-2 pl-4">Query Params: <code>start</code> (Date début), <code>end</code> (Date fin).</p>
              </div>
            </div>

            <!-- Budgets -->
            <div v-if="activeSection === 'public-budgets'">
              <h2 class="section-title mb-8">5. GESTION DES BUDGETS</h2>
              <p class="doc-paragraph mb-8">Permet de définir des limites de dépenses ou des objectifs de revenus.</p>
              
              <h3 class="text-xl font-bold mb-4">5.1 Créer un Budget</h3>
              <p class="doc-paragraph mb-4">Définissez un budget pour une catégorie spécifique (ex: max 500,000 F pour "Marketing" en Février).</p>
              <div class="endpoint-block mb-10">
                <div class="endpoint-meta">
                  <span class="method post">POST</span>
                  <span class="path">/api/public/budgets</span>
                </div>
                <div class="code-terminal-premium mt-6">
                  <div class="term-head">Body JSON</div>
                  <pre><code>{
  <span class="k">"categoryId"</span>: <span class="s">"uuid-category-marketing"</span>, <span class="n">// Optionnel (Budget global si null)</span>
  <span class="k">"amount"</span>: <span class="n">500000</span>,
  <span class="k">"startDate"</span>: <span class="s">"2026-02-01"</span>,
  <span class="k">"endDate"</span>: <span class="s">"2026-02-28"</span>,
  <span class="k">"period"</span>: <span class="s">"MONTHLY"</span>, <span class="n">// MONTHLY, QUARTERLY, YEARLY</span>
  <span class="k">"label"</span>: <span class="s">"Budget Pub Février"</span>
}</code></pre>
                </div>
              </div>

              <h3 class="text-xl font-bold mb-4">5.2 Suivi des Budgets (Liste)</h3>
              <p class="doc-paragraph mb-4">Voir l'avancement des dépenses par rapport aux budgets définis.</p>
              <div class="endpoint-block">
                <div class="endpoint-meta">
                  <span class="method get">GET</span>
                  <span class="path">/api/public/budgets</span>
                </div>
                <div class="code-terminal-premium mt-6">
                   <div class="term-head">Réponse</div>
                   <pre><code>{
  <span class="k">"data"</span>: [
    {
      <span class="k">"id"</span>: <span class="s">"uuid-budget-1"</span>,
      <span class="k">"label"</span>: <span class="s">"Budget Pub Février"</span>,
      <span class="k">"allocatedAmount"</span>: <span class="n">500000</span>,
      <span class="k">"consumedAmount"</span>: <span class="n">150000</span>,
      <span class="k">"remainingAmount"</span>: <span class="n">350000</span>,
      <span class="k">"progressPercentage"</span>: <span class="n">30.0</span>,
      <span class="k">"status"</span>: <span class="s">"ON_TRACK"</span> <span class="n">// ON_TRACK, AT_RISK, EXCEEDED</span>
    }
  ]
}</code></pre>
                </div>
              </div>
            </div>

            <!-- Sales Sync -->
            <div v-if="activeSection === 'public-sales-sync'">
              <h2 class="section-title mb-8">7. ANALYTIQUES & VENTES (Warehouse Sync)</h2>
              <p class="doc-paragraph mb-6"><em>C'est ici que réside l'intelligence ONDA.</em> Au lieu de passer une simple écriture comptable, envoyez le détail de la vente. ONDA créera les produits manquants et calculera la marge réelle.</p>

              <div class="doc-callout primary p-8 mb-10">
                <strong>5.1 Synchroniser une Vente (Auto-Provisioning)</strong>
                <p>Cet appel fait 3 choses :</p>
                <ul class="list-disc pl-5 mt-2">
                  <li>Crée les produits inconnus (basé sur <code>externalProductCode</code>).</li>
                  <li>Calcule la marge (Prix Vente - Coût Revient).</li>
                  <li>Enregistre la transaction en comptabilité.</li>
                </ul>
              </div>

              <div class="endpoint-block">
                <div class="endpoint-meta">
                  <span class="method post">POST</span>
                  <span class="path">/api/public/analytics/sales/sync</span>
                </div>

                <div class="code-terminal-premium mt-8">
                  <div class="term-head">Body JSON (Vente Complexe)</div>
                  <pre><code>{
  <span class="k">"externalSaleId"</span>: <span class="s">"INV-2024-001"</span>,
  <span class="k">"saleDate"</span>: <span class="s">"2026-02-07T14:30:00"</span>,
  <span class="k">"externalSource"</span>: <span class="s">"WareTrack"</span>,
  <span class="k">"totalAmount"</span>: <span class="n">15000</span>,
  <span class="k">"paymentMethod"</span>: <span class="s">"CASH"</span>,
  <span class="k">"transactionType"</span>: <span class="s">"INCOME"</span>, <span class="n">// INCOME (Vente) ou EXPENSE (Achat Stock)</span>
  <span class="k">"paymentStatus"</span>: <span class="s">"PAID"</span>, <span class="n">// PAID (Réglé) ou PENDING (Crédit/Dette)</span>
  <span class="k">"thirdPartyName"</span>: <span class="s">"Client Fidèle"</span>, 
  <span class="k">"thirdPartyPhone"</span>: <span class="s">"+2250707070707"</span>, <span class="n">// Optionnel : Déduplication</span>
  <span class="k">"thirdPartyEmail"</span>: <span class="s">"client@email.com"</span>, <span class="n">// Optionnel : Déduplication</span>
  <span class="k">"thirdPartyType"</span>: <span class="s">"CLIENT"</span>, 
  <span class="k">"items"</span>: [
    {
      <span class="k">"externalProductCode"</span>: <span class="s">"SKU-BURGER-XL"</span>,
      <span class="k">"productName"</span>: <span class="s">"Burger XL Fromage"</span>, 
      <span class="k">"quantity"</span>: <span class="n">2</span>,
      <span class="k">"unitPrice"</span>: <span class="n">5000</span>,
      <span class="k">"unitCost"</span>: <span class="n">3500</span> 
    }
  ]
}</code></pre>
                </div>
                <div class="code-terminal-premium mt-6">
                  <div class="term-head">Réponse</div>
                  <pre><code>{
  <span class="k">"success"</span>: <span class="n">true</span>,
  <span class="k">"data"</span>: {
    <span class="k">"id"</span>: <span class="s">"uuid-transaction-created"</span>,
    <span class="k">"netAmount"</span>: <span class="n">15000</span>,
    <span class="k">"description"</span>: <span class="s">"Ventes via WareTrack"</span>
  },
  <span class="k">"message"</span>: <span class="s">"Vente synchronisée avec succès"</span>
}</code></pre>
                </div>
              </div>
            </div>

            <!-- Webhooks & Alerts (NEW) -->
            <div v-if="activeSection === 'webhooks'">
              <h2 class="section-title mb-8">9. WEBHOOKS (Notifications)</h2>
              <p class="doc-paragraph mb-8">Recevez des alertes en temps réel sur votre serveur.</p>

              <div class="endpoint-block mb-10">
                <div class="endpoint-meta">
                   <span class="method put">PUT</span>
                   <span class="path">/api/partners/webhook</span>
                </div>
                <div class="code-terminal-premium mt-6">
                   <pre><code>{
  <span class="k">"webhookUrl"</span>: <span class="s">"https://callback.waretrack.com/onda-events"</span>
}</code></pre>
                </div>
              </div>

              <h3 class="text-xl font-bold mb-4 uppercase tracking-widest text-dim text-xs">Événements Supportés</h3>
              
              <h4 class="text-sm font-bold mb-4 text-primary uppercase">1. Système & Transactions</h4>
              <ul>
                <li class="mb-2"><code>organization.created</code> : Une nouvelle sous-organisation (boutique) a été provisionnée.</li>
                <li class="mb-2"><code>transaction.completed</code> : Une transaction (vente ou dépense) a été enregistrée avec succès.</li>
                <li class="mb-2"><code>api.quota.exceeded</code> : Le quota d'appels API gratuits a été atteint.</li>
              </ul>

              <h4 class="text-sm font-bold mb-4 mt-6 text-accent uppercase">2. Alertes Financières (Intelligence Artificielle)</h4>
              <ul>
                <li class="mb-2"><code>alert.cash_critical</code> : Le solde de trésorerie est critique (couvre moins de 3 jours).</li>
                <li class="mb-2"><code>alert.budget_exceeded</code> : Un budget a dépassé son seuil d'alerte (ex: 80% consommé).</li>
                <li class="mb-2"><code>alert.payment_overdue</code> : Des factures clients ou fournisseurs sont en retard de paiement.</li>
                <li class="mb-2"><code>alert.negative_cashflow</code> : Risque de trésorerie négative projeté à 7 jours.</li>
              </ul>

              <h4 class="text-sm font-bold mb-4 mt-6 text-success uppercase">3. Rapports</h4>
              <ul>
                 <li class="mb-2"><code>report.generated</code> : Le bilan financier mensuel est disponible pour téléchargement.</li>
              </ul>
            </div>

            <!-- Placeholder for other sections -->
            <div v-if="!['overview', 'auth', 'errors', 'partner-provisioning', 'partner-billing', 'public-sales-sync', 'webhooks', 'public-me', 'public-accounts', 'public-transactions', 'public-data', 'public-reports', 'public-budgets'].includes(activeSection)">
              <div class="empty-docs text-center py-20">
                <div class="empty-icon-large mb-6">
                  <i class="fas fa-tools opacity-20"></i>
                </div>
                <h3>Section en cours de rédaction</h3>
                <p class="text-dim">Revenez bientôt pour plus de détails sur les {{ activeSection }}.</p>
              </div>
            </div>

          </section>
        </transition>
      </main>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'ApiDocs',
  setup() {
    const activeSection = ref('overview');
    const sections = [
      {
        label: 'GÉNÉRAL',
        items: [
          { id: 'overview', title: 'Introduction', icon: 'fas fa-info-circle ' },
          { id: 'auth', title: '1. Auth & Sécurité', icon: 'fas fa-shield-alt' }
        ]
      },
      {
        label: 'API PARTENAIRE (MASTER)',
        items: [
          { id: 'partner-provisioning', title: '2. Gestion Partenaire', icon: 'fas fa-users-cog' },
          { id: 'partner-billing', title: '2.5 Facturation', icon: 'fas fa-file-invoice-dollar' }
        ]
      },
      {
        label: 'API CLIENT (OPÉRATIONS)',
        items: [
          { id: 'public-me', title: '3. Identité', icon: 'fas fa-id-card' },
          { id: 'public-accounts', title: '4. Comptes & Solde', icon: 'fas fa-wallet' },
          { id: 'public-transactions', title: '4.3 Transactions', icon: 'fas fa-exchange-alt' },
          { id: 'public-budgets', title: '5. Budgets', icon: 'fas fa-chart-line' },
          { id: 'public-data', title: '6. Catégories & Tiers', icon: 'fas fa-database' },
          { id: 'public-sales-sync', title: '7. Smart Sales Sync', icon: 'fas fa-cubes' },
          { id: 'public-reports', title: '8. Dashboard', icon: 'fas fa-chart-pie' },
          { id: 'webhooks', title: '9. Webhooks', icon: 'fas fa-bell' }
        ]
      },
      {
        label: 'SUPPORT & REFERENCE',
        items: [
           { id: 'errors', title: '10. Gestion des Erreurs', icon: 'fas fa-bug' }
        ]
      }
    ];

    return { activeSection, sections };
  }
}
</script>

<style scoped>
.docs-hero { display: flex; flex-direction: column; align-items: center; text-align: center; }
.hero-lead { font-size: 1.25rem; font-weight: 500; }

.docs-layout { display: grid; grid-template-columns: 320px 1fr; gap: 4rem; align-items: start; }
.nav-sticky-container { position: sticky; top: 8rem; }

.nav-search { display: flex; align-items: center; gap: 1rem; background: var(--bg-surface-dim); padding: 0.75rem 1.25rem; border-radius: 1rem; border: 1px solid var(--border-strong); }
.nav-search input { background: none; border: none; outline: none; font-weight: 600; font-family: var(--font-body); width: 100%; font-size: 0.9rem; }

.nav-group-label { font-size: 0.7rem; font-weight: 900; color: var(--text-dim); letter-spacing: 0.15em; display: block; margin-bottom: 1.25rem; }
.nav-items-stack { display: flex; flex-direction: column; gap: 0.5rem; }

.nav-link-doc { display: flex; align-items: center; gap: 1rem; padding: 0.8rem 1.25rem; background: none; border: none; border-radius: 0.75rem; cursor: pointer; transition: all 0.3s; font-family: var(--font-heading); font-weight: 700; color: var(--text-muted); text-align: left; }
.nav-link-doc:hover { background: white; color: var(--primary); transform: translateX(5px); }
.nav-link-doc.active { background: white; color: var(--primary); box-shadow: var(--shadow-md); border-left: 4px solid var(--primary); }

.doc-content-view { border-radius: var(--radius-lg); min-height: 700px; }

.section-title { font-size: 2.25rem; }
.doc-paragraph { font-size: 1.15rem; color: var(--text-muted); line-height: 1.6; }

.doc-callout { display: flex; gap: 1.5rem; padding: 2rem; border-radius: 1.25rem; }
.doc-callout.primary { background: #E0F2FE; border: 1px solid #BAE6FD; }
.callout-icon { font-size: 2rem; }
.callout-text strong { display: block; font-size: 1.1rem; margin-bottom: 0.25rem; color: var(--primary-dark); }
.callout-text p { color: var(--primary-dark); font-weight: 600; opacity: 0.8; }

.base-url-box { background: var(--bg-surface-inverse); color: white; border-radius: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
.base-url-box label { font-size: 0.65rem; font-weight: 900; color: #94A3B8; letter-spacing: 0.1em; }
.base-url-box code { font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; color: #34D399; }

/* Endpoint Block */
.endpoint-meta { display: flex; align-items: center; gap: 1rem; background: #F8FAFC; padding: 1rem 1.5rem; border-radius: 0.75rem; border: 1px solid var(--border-strong); }
.method { padding: 0.25rem 0.75rem; border-radius: 6px; font-weight: 900; font-size: 0.7rem; }
.method.post { background: #DCFCE7; color: #166534; }
.method.get { background: #DBEAFE; color: #1E40AF; } /* Added GET style */
.path { font-family: monospace; font-weight: 800; color: var(--text-main); font-size: 1rem; }

.code-terminal-premium { background: var(--bg-surface-inverse); border-radius: 1rem; overflow: hidden; }
.term-head { padding: 0.75rem 1.5rem; background: #1E293B; font-size: 0.75rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; }
.code-terminal-premium pre { padding: 2rem; font-family: 'JetBrains Mono', monospace; line-height: 1.7; }
.k { color: #818CF8; }
.s { color: #34D399; }
.n { color: #F472B6; }

.empty-icon-large { font-size: 4rem; }

@media (max-width: 1024px) {
  .docs-layout { grid-template-columns: 1fr; }
  .docs-sidebar-nav { display: none; }
}

/* Workflow Steps (NEW Design) */
.workflow-steps-vertical {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-card {
  position: relative;
  overflow: hidden;
}

.step-number {
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 5rem;
  font-weight: 900;
  color: var(--text-main);
  opacity: 0.05;
  user-select: none;
}

.step-card h4 {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-main);
}

.badge-type {
  background: var(--bg-surface-dim);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 900;
  color: var(--primary);
  border: 1px solid var(--border-strong);
}
</style>
