# Graph Report - .  (2026-08-10)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1357 nodes · 2452 edges · 154 communities (107 shown, 47 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 68 edges (avg confidence: 0.63)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9fe14af7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- procurement-v25.js
- finance-cash-trends-v323.js
- finance-workbench-v31.js
- finance-decisions-v325.js
- finance-scenarios-v324.js
- finance-unit-economics-v322.js
- offer-acts-v09.js
- activation-v20.js
- historical-cost-snapshots-v14.js
- master-cost-proposals-v11.js
- exportar_mfo_v30.py
- commerce-v14.js
- measurement-v24.js
- master-data-v10.js
- finance-procurement-v326.js
- finance-depth-v32.js
- commerce-ux-v18.js
- master-cost-materialization-v12.js
- production-v22.js
- finance-guidance-v330.js
- daily-ops-v21.js
- mfo-v30.js
- admin-v15.js
- operations-v16.js
- aire-tiempo-committee-v09.js
- operational-evidence-v330.js
- control-executive-v32.js
- finance-v27.js
- materials-v23.js
- inventory-valuation-v15.js
- host-mode.js
- offer-studio-v09.js
- package.json
- finance-executive-v327.js
- internal-shell-v31.js
- product-commerce-v304.js
- finance-demo-v329.js
- finance-readiness-v328.js
- master-cost-prospective-v13.js
- trust-v19.js
- exportar-fuente-canonica.mjs
- inventory-valuation-v15.spec.js
- control-v30.js
- offer-governance-v09.js
- public-commerce-guard-v29.js
- schema-v14.sql
- schema-v15.sql
- service-worker.js
- servidor_demo.py
- finance-inventory-valuation-v15.js
- product-v303.js
- schema-v16.sql
- preparar_sitio_materializado_v28.py
- master-cost-bridge-v13.spec.js
- finance-starter-v31.js
- product-v30.js
- product-visual-v305.js
- public-actions-v29.js
- schema-v25.sql
- experiencia.spec.js
- oferta-v09.spec.js
- schema-v19.sql
- schema-v20.sql
- schema-v24.sql
- actas-v09.spec.js
- finance-v27.spec.js
- finance-v329.spec.js
- internal-demo-v311.spec.js
- internal-v30.spec.js
- procurement-v25.spec.js
- verificar_demo.py
- schema-v23.sql
- materializar_fuentes_locales_v28.py
- migrar_runtime_canonico_v08.py
- verificar_studio_oferta_v09.py
- access-continuity-v311.spec.js
- access-review-users-v311.spec.js
- commerce-v14.spec.js
- commerce-v18.spec.js
- daily-ops-v21.spec.js
- editorial-v29.spec.js
- finance-v321.spec.js
- finance-v322.spec.js
- finance-v323.spec.js
- finance-v324.spec.js
- finance-v326.spec.js
- finance-v327.spec.js
- finance-v328.spec.js
- internal-ux-v330.spec.js
- master-cost-materialization-v12.spec.js
- materials-v23.spec.js
- navigation-v29.spec.js
- operational-evidence-v330.spec.js
- operations-v16.spec.js
- product-v305.spec.js
- production-v22.spec.js
- session-expiry-v311.spec.js
- trust-v19.spec.js
- checkout-v15.js
- verificar_actas_oferta_v09.py
- verificar_fuentes.py
- verificar_modulos_v28.py
- verificar_oferta_v09.py
- verificar_paquete_aire_tiempo_v09.py
- finance-v32.spec.js
- internal-governance-v311.spec.js
- master-cost-proposals-v11.spec.js
- master-data-v10.spec.js
- measurement-v24.spec.js
- product-v303.spec.js
- product-v304.spec.js
- schema-v22.sql
- playwright.config.js
- abrir_local_v28.sh
- refresh_graphify_knowledge.sh
- activation-v20.spec.js
- internal-legacy-compat-v311.spec.js

## God Nodes (most connected - your core abstractions)
1. `sectionHtml()` - 17 edges
2. `die()` - 17 edges
3. `export_snapshot()` - 16 edges
4. `order()` - 16 edges
5. `render()` - 15 edges
6. `render()` - 14 edges
7. `labHtml()` - 14 edges
8. `as_text()` - 14 edges
9. `checked_value()` - 13 edges
10. `html()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `initCheckout()` --indirect_call--> `order()`  [INFERRED]
  assets/commerce-v14.js → tests/e2e/historical-cost-snapshots-v14.spec.js
- `compute()` --indirect_call--> `order()`  [INFERRED]
  assets/control-executive-v32.js → tests/e2e/historical-cost-snapshots-v14.spec.js
- `compute()` --indirect_call--> `order()`  [INFERRED]
  assets/control-v30.js → tests/e2e/historical-cost-snapshots-v14.spec.js
- `render()` --indirect_call--> `order()`  [INFERRED]
  assets/daily-ops-v21.js → tests/e2e/historical-cost-snapshots-v14.spec.js
- `operationalRequirements()` --indirect_call--> `order()`  [INFERRED]
  assets/finance-procurement-v326.js → tests/e2e/historical-cost-snapshots-v14.spec.js

## Import Cycles
- None detected.

## Communities (154 total, 47 thin omitted)

### Community 0 - "procurement-v25.js"
Cohesion: 0.10
Nodes (36): render(), sourceLabel(), actionButtons(), activeOrdersTable(), bind(), currentRequirements(), explode(), fillOrderForm() (+28 more)

### Community 1 - "finance-cash-trends-v323.js"
Cohesion: 0.13
Nodes (36): activate(), actual(), actualFlowHtml(), allCounts(), allMoves(), bind(), bridgeHtml(), cashRow() (+28 more)

### Community 2 - "finance-workbench-v31.js"
Cohesion: 0.12
Nodes (34): actual(), barChart(), bind(), cashEditor(), dashboard(), decisions(), empty(), exportJson() (+26 more)

### Community 3 - "finance-decisions-v325.js"
Cohesion: 0.16
Nodes (34): bind(), cards(), cashState(), currentPosition(), decisionId(), decorate(), detail(), difference() (+26 more)

### Community 4 - "finance-scenarios-v324.js"
Cohesion: 0.14
Nodes (34): addScenario(), benchmark(), bind(), cashChart(), cashRow(), comparisonTable(), controls(), decorate() (+26 more)

### Community 5 - "finance-unit-economics-v322.js"
Cohesion: 0.15
Nodes (34): activate(), analyseRow(), analyses(), applyBom(), bind(), bridge(), calculate(), category() (+26 more)

### Community 6 - "offer-acts-v09.js"
Cohesion: 0.11
Nodes (25): authenticate(), createAccount(), derive(), field(), findReviewAccount(), nextTarget(), openSession(), render() (+17 more)

### Community 7 - "activation-v20.js"
Cohesion: 0.13
Nodes (29): bindCopy(), copyText(), firstAdminCommand(), getClient(), healthChecklist(), renderConnected(), renderDashboard(), renderLogin() (+21 more)

### Community 8 - "historical-cost-snapshots-v14.js"
Cohesion: 0.16
Nodes (29): initControlCenter(), loadScenario(), append(), captureMovement(), captureOrder(), capturePurchase(), events(), findProduct() (+21 more)

### Community 9 - "master-cost-proposals-v11.js"
Cohesion: 0.17
Nodes (30): append(), askReason(), bind(), createProposal(), decideProposal(), events(), evidenceForMaterial(), evidenceOptions() (+22 more)

### Community 10 - "exportar_mfo_v30.py"
Cohesion: 0.27
Nodes (28): Any, Namespace, add_assumption(), as_text(), assumptions(), audit_summary(), cash_flow(), checked_value() (+20 more)

### Community 11 - "commerce-v14.js"
Cohesion: 0.17
Nodes (26): applyToData(), applyToDom(), canonicalGallery(), normalize(), resolve(), adminDashboard(), backendReady(), bindLocalAdmin() (+18 more)

### Community 12 - "measurement-v24.js"
Cohesion: 0.15
Nodes (26): allMoves(), applyCorrection(), cashEffect(), decorate(), ensureDialog(), kind(), ledgerHtml(), logHistory() (+18 more)

### Community 13 - "master-data-v10.js"
Cohesion: 0.19
Nodes (27): badge(), bind(), blankStore(), cleanMeta(), fillMaterial(), fillSupplier(), formFields(), formMeta() (+19 more)

### Community 14 - "finance-procurement-v326.js"
Cohesion: 0.18
Nodes (25): activate(), bind(), bridge(), decorate(), explode(), findFinanceProduct(), findOrderProduct(), materialMap() (+17 more)

### Community 15 - "finance-depth-v32.js"
Cohesion: 0.20
Nodes (24): activateClose(), actual(), assumptionNumber(), bindClose(), breakEven(), cashDiagnostic(), cashHtml(), cashRow() (+16 more)

### Community 16 - "commerce-ux-v18.js"
Cohesion: 0.17
Nodes (23): announce(), checkoutConfidence(), checkoutProgress(), copyText(), enhanceBankDetails(), enhanceCheckoutForm(), enhanceCheckoutSummary(), enhanceProductCards() (+15 more)

### Community 17 - "master-cost-materialization-v12.js"
Cohesion: 0.21
Nodes (23): append(), approvedProposals(), askReason(), bind(), currentStandard(), effectiveMaterial(), effectiveProductCost(), effectiveStandardCost() (+15 more)

### Community 18 - "production-v22.js"
Cohesion: 0.20
Nodes (22): actionFor(), aggregate(), bind(), consolidatedHtml(), exportPreparation(), initialDate(), itemSummary(), loadOrders() (+14 more)

### Community 19 - "finance-guidance-v330.js"
Cohesion: 0.18
Nodes (20): actual(), bind(), cashChart(), decorate(), glossary(), html(), marginChart(), months() (+12 more)

### Community 20 - "daily-ops-v21.js"
Cohesion: 0.21
Nodes (20): actionButtons(), backupPayload(), cardsHtml(), compactLegacyOrders(), counters(), detailsHtml(), exportBackup(), exportCsv() (+12 more)

### Community 21 - "mfo-v30.js"
Cohesion: 0.19
Nodes (19): actualState(), analysisPanel(), bind(), comparisonRow(), decisionPanel(), emptyPanel(), metric(), movementMonth() (+11 more)

### Community 22 - "admin-v15.js"
Cohesion: 0.23
Nodes (19): activationPanel(), adminClient(), bindDashboard(), collectCosts(), collectProducts(), dashboard(), defaultProducts(), init() (+11 more)

### Community 23 - "operations-v16.js"
Cohesion: 0.23
Nodes (19): adminClient(), averageCatalogContribution(), catalogProducts(), finance(), handleOrderStatusChange(), load(), localMovement(), localState() (+11 more)

### Community 24 - "aire-tiempo-committee-v09.js"
Cohesion: 0.24
Nodes (18): agendaHTML(), applyTemplate(), currentProductId(), decorateForm(), gateRow(), guidedIssues(), guideForGate(), init() (+10 more)

### Community 25 - "operational-evidence-v330.js"
Cohesion: 0.25
Nodes (18): activeEvidence(), allEvidence(), bind(), cancelCorrection(), cardsHtml(), factsHtml(), formHtml(), historyHtml() (+10 more)

### Community 26 - "control-executive-v32.js"
Cohesion: 0.20
Nodes (15): actions(), bar(), bind(), compute(), decorate(), explode(), findProduct(), html() (+7 more)

### Community 27 - "finance-v27.js"
Cohesion: 0.24
Nodes (16): alerts(), badge(), bind(), boot(), compute(), fixedCosts(), metric(), movementRows() (+8 more)

### Community 28 - "materials-v23.js"
Cohesion: 0.25
Nodes (16): dayOrders(), explodeProduct(), findProduct(), materialRows(), plan(), productTable(), recipeExplorer(), renderRecipe() (+8 more)

### Community 29 - "inventory-valuation-v15.js"
Cohesion: 0.33
Nodes (14): alerts(), currentStandard(), explodeProduct(), findProduct(), latestObservedMap(), materialRows(), normalizePurchaseOrder(), notify() (+6 more)

### Community 30 - "host-mode.js"
Cohesion: 0.30
Nodes (11): add(), applySpecialPageAssets(), curatePublicChrome(), curatePublicNav(), enhance(), ensureUserAccess(), hrefOf(), markActive() (+3 more)

### Community 31 - "offer-studio-v09.js"
Cohesion: 0.36
Nodes (10): criticalPending(), effectiveGate(), init(), loadGovernance(), loadModel(), productState(), progress(), renderControl() (+2 more)

### Community 32 - "package.json"
Cohesion: 0.15
Nodes (12): description, devDependencies, @playwright/test, name, version, private, releaseHistory, previousStable (+4 more)

### Community 33 - "finance-executive-v327.js"
Cohesion: 0.35
Nodes (11): bind(), decorate(), html(), metric(), months(), scenarioCash(), selectedMonth(), signature() (+3 more)

### Community 34 - "internal-shell-v31.js"
Cohesion: 0.38
Nodes (11): accessUrl(), boot(), clearExpiryTimer(), enforceSession(), escapeHtml(), read(), redirectExpired(), requestedTarget() (+3 more)

### Community 35 - "product-commerce-v304.js"
Cohesion: 0.36
Nodes (11): compareCard(), comparisonSection(), enhanceProduct(), enhanceStore(), ensureMobileBuy(), findPurchaseButton(), init(), productCard() (+3 more)

### Community 36 - "finance-demo-v329.js"
Cohesion: 0.35
Nodes (10): activeEnhance(), backup(), clearDemo(), demoFacts(), emptyEnhance(), enhance(), loadDemo(), makeDemo() (+2 more)

### Community 37 - "finance-readiness-v328.js"
Cohesion: 0.35
Nodes (10): bind(), decorate(), html(), months(), readiness(), selectedMonth(), signature(), start() (+2 more)

### Community 38 - "master-cost-prospective-v13.js"
Cohesion: 0.25
Nodes (5): baseMaterial(), baseProduct(), productCost(), resolveMaterial(), standardMaterial()

### Community 39 - "trust-v19.js"
Cohesion: 0.38
Nodes (8): adminCard(), initAccount(), localLookup(), publicClient(), remoteLookup(), settings(), supportHtml(), timelineHtml()

### Community 40 - "exportar-fuente-canonica.mjs"
Cohesion: 0.20
Nodes (6): EXPECTED_IDS, LEGACY_PARTS, OUTPUT, outputArg, ROOT, TRUSTED_PARTS

### Community 41 - "inventory-valuation-v15.spec.js"
Cohesion: 0.20
Nodes (6): PURCHASE, PURCHASE_SNAPSHOT, R1, R2, SESSION, {test,expect}

### Community 42 - "control-v30.js"
Cohesion: 0.42
Nodes (8): alertHtml(), alerts(), compute(), explode(), findProduct(), metric(), orderDate(), render()

### Community 43 - "offer-governance-v09.js"
Cohesion: 0.47
Nodes (8): applyTranslation(), arrangeMobileDetail(), governance(), init(), persistForm(), saveGovernance(), selectedProductId(), statusGroup()

### Community 44 - "public-commerce-guard-v29.js"
Cohesion: 0.47
Nodes (8): accountPreview(), apply(), cartItems(), checkoutPreview(), init(), readCart(), renderCheckoutSummary(), setText()

### Community 45 - "schema-v14.sql"
Cohesion: 0.31
Nodes (8): public.admin_users, public.fixed_costs, public.is_admin(), public.order_items, public.orders, public.payment_receipts, public.product_operations, public.public_settings

### Community 46 - "schema-v15.sql"
Cohesion: 0.39
Nodes (6): public.admin_audit_log, public.set_updated_at(), trg_fixed_costs_updated_at, trg_orders_updated_at, trg_product_operations_updated_at, trg_public_settings_updated_at

### Community 47 - "service-worker.js"
Cohesion: 0.29
Nodes (5): cacheFirst(), canonicalRequest(), COMPATIBILITY, CORE, GENERATED

### Community 48 - "servidor_demo.py"
Cohesion: 0.36
Nodes (5): available(), choose_port(), Handler, main(), Server

### Community 49 - "finance-inventory-valuation-v15.js"
Cohesion: 0.52
Nodes (6): alertList(), materialsTable(), metric(), render(), status(), varianceTable()

### Community 50 - "product-v303.js"
Cohesion: 0.52
Nodes (6): compositionHTML(), currentProduct(), enhance(), overviewHTML(), passportHTML(), signalsHTML()

### Community 51 - "schema-v16.sql"
Cohesion: 0.38
Nodes (5): public.inventory_movements, public.orders, public.product_operations, public.sync_order_inventory_v16(), trg_orders_inventory_v16

### Community 52 - "preparar_sitio_materializado_v28.py"
Cohesion: 0.67
Nodes (6): asset_ignore(), copy_surface(), main(), patch_html(), Path, verify_surface()

### Community 53 - "master-cost-bridge-v13.spec.js"
Cohesion: 0.29
Nodes (3): SESSION, STANDARD_EVENT, {test,expect}

### Community 54 - "finance-starter-v31.js"
Cohesion: 0.60
Nodes (5): create(), enhance(), months24(), publicSkuRows(), starter()

### Community 55 - "product-v30.js"
Cohesion: 0.60
Nodes (5): craftProofHTML(), currentProduct(), enhance(), renderSensory(), sectionHTML()

### Community 56 - "product-visual-v305.js"
Cohesion: 0.60
Nodes (5): captionHTML(), currentProduct(), decorateImage(), enhance(), roleForImage()

### Community 57 - "public-actions-v29.js"
Cohesion: 0.60
Nodes (5): copyOrExpose(), init(), setup(), summary(), valueOf()

### Community 58 - "schema-v25.sql"
Cohesion: 0.40
Nodes (3): public.material_purchase_orders_v25, public.material_purchase_receipts_v25, trg_material_purchase_orders_v25_updated_at

### Community 60 - "oferta-v09.spec.js"
Cohesion: 0.40
Nodes (3): openOffer(), seedInternalSession(), { test, expect }

### Community 61 - "schema-v19.sql"
Cohesion: 0.60
Nodes (4): public.lookup_order_status_v19(), public.order_status_events, public.record_order_status_event_v19(), trg_order_status_event_v19

### Community 63 - "schema-v24.sql"
Cohesion: 0.50
Nodes (3): public.material_purchases, public.material_suppliers, public.production_measurements

### Community 66 - "actas-v09.spec.js"
Cohesion: 0.50
Nodes (3): openActs(), seedInternalSession(), { test, expect }

### Community 76 - "schema-v23.sql"
Cohesion: 0.83
Nodes (3): public.material_inventory, public.material_master, public.product_bom

### Community 77 - "materializar_fuentes_locales_v28.py"
Cohesion: 0.83
Nodes (3): main(), materialize(), sha256()

### Community 78 - "migrar_runtime_canonico_v08.py"
Cohesion: 0.83
Nodes (3): migrate_workflow(), read(), write()

### Community 83 - "verificar_studio_oferta_v09.py"
Cohesion: 1.00
Nodes (3): main(), require(), text()

### Community 89 - "editorial-v29.spec.js"
Cohesion: 0.50
Nodes (3): forbiddenClosedClaims, { test, expect }, v30Ids

### Community 97 - "internal-ux-v330.spec.js"
Cohesion: 0.67
Nodes (3): financeDemo(), internalSession(), {test,expect}

### Community 103 - "product-v305.spec.js"
Cohesion: 0.50
Nodes (3): expected, pizzas, { test, expect }

## Knowledge Gaps
- **93 isolated node(s):** `public.product_operations`, `public.fixed_costs`, `public.public_settings`, `public.admin_audit_log`, `public.product_operations` (+88 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **47 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `order()` connect `procurement-v25.js` to `trust-v19.js`, `control-v30.js`, `commerce-v14.js`, `finance-procurement-v326.js`, `production-v22.js`, `daily-ops-v21.js`, `mfo-v30.js`, `operations-v16.js`, `control-executive-v32.js`, `finance-v27.js`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `initCheckout()` connect `commerce-v14.js` to `procurement-v25.js`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `orders()` connect `historical-cost-snapshots-v14.js` to `commerce-v14.js`, `admin-v15.js`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Are the 15 inferred relationships involving `order()` (e.g. with `initCheckout()` and `compute()`) actually correct?**
  _`order()` has 15 INFERRED edges - model-reasoned connections that need verification._
- **What connects `public.product_operations`, `public.fixed_costs`, `public.public_settings` to the rest of the system?**
  _93 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `procurement-v25.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10336817653890824 - nodes in this community are weakly interconnected._
- **Should `finance-cash-trends-v323.js` be split into smaller, more focused modules?**
  _Cohesion score 0.12762762762762764 - nodes in this community are weakly interconnected._