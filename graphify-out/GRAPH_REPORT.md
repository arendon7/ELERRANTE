# Graph Report - .  (2026-08-21)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1803 nodes · 3248 edges · 194 communities (128 shown, 66 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 102 edges (avg confidence: 0.61)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a281a8ab`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- procurement-v25.js
- approved_for_promotion
- finance-cash-trends-v323.js
- finance-usability-v351.js
- finance-workbench-v31.js
- master-data-v10.js
- commerce-v14.js
- finance-decisions-v325.js
- finance-scenarios-v324.js
- finance-unit-economics-v322.js
- offer-acts-v09.js
- activation-v20.js
- historical-cost-snapshots-v14.js
- master-cost-proposals-v11.js
- commerce-ux-v18.js
- exportar_mfo_v30.py
- daily-close-v36.js
- measurement-v24.js
- internal-ux-v39.js
- pilot-operations-v37.js
- finance-procurement-v326.js
- finance-depth-v32.js
- management-pulse-v35.js
- pilot-daily-v374.js
- master-cost-materialization-v12.js
- production-v22.js
- finance-guidance-v330.js
- daily-ops-v21.js
- mfo-v30.js
- pilot-order-intake-v372.js
- admin-v15.js
- operations-v16.js
- aire-tiempo-committee-v09.js
- operational-evidence-v330.js
- control-executive-v32.js
- internal-shell-v31.js
- business-pulse-v34.js
- finance-v27.js
- host-mode.js
- materials-v23.js
- internal-ux-v38.js
- pilot-exit-v373.js
- inventory-valuation-v15.js
- operational-forms-v40.js
- offer-studio-v09.js
- package.json
- finance-executive-v327.js
- product-commerce-v304.js
- finance-demo-v329.js
- finance-readiness-v328.js
- master-cost-prospective-v13.js
- public-actions-v29.js
- exportar-fuente-canonica.mjs
- inventory-valuation-v15.spec.js
- pilot-exit-v373.spec.js
- brand-v4-public.js
- control-v30.js
- product-visual-v305.js
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
- pilot-daily-v374.spec.js
- pilot-intake-v372.spec.js
- pilot-rehearsal-v371.spec.js
- finance-starter-v31.js
- product-v30.js
- schema-v25.sql
- brand-v4-first-paint.spec.js
- experiencia.spec.js
- oferta-v09.spec.js
- pilot-operations-v37.spec.js
- schema-v19.sql
- schema-v20.sql
- schema-v24.sql
- actas-v09.spec.js
- daily-close-v36.spec.js
- finance-v27.spec.js
- finance-v329.spec.js
- internal-demo-v311.spec.js
- internal-v30.spec.js
- management-pulse-v35.spec.js
- pilot-readiness-v3741.spec.js
- procurement-v25.spec.js
- verificar_demo.py
- schema-v23.sql
- materializar_fuentes_locales_v28.py
- migrar_runtime_canonico_v08.py
- verificar_studio_oferta_v09.py
- access-continuity-v311.spec.js
- access-review-users-v311.spec.js
- business-pulse-v34.spec.js
- commerce-v14.spec.js
- commerce-v18.spec.js
- daily-ops-v21.spec.js
- editorial-v29.spec.js
- finance-usability-v351.spec.js
- finance-v321.spec.js
- finance-v322.spec.js
- finance-v323.spec.js
- finance-v324.spec.js
- finance-v326.spec.js
- finance-v327.spec.js
- finance-v328.spec.js
- internal-ux-v330.spec.js
- internal-ux-v38.spec.js
- internal-ux-v39.spec.js
- master-cost-materialization-v12.spec.js
- materials-v23.spec.js
- navigation-v29.spec.js
- operational-evidence-v330.spec.js
- operational-forms-v40.spec.js
- operations-v16.spec.js
- product-v305.spec.js
- production-v22.spec.js
- session-expiry-v311.spec.js
- trust-v19.spec.js
- v4-checkout.spec.js
- checkout-v15.js
- verificar_actas_oferta_v09.py
- verificar_fuentes.py
- verificar_modulos_v28.py
- verificar_oferta_v09.py
- verificar_paquete_aire_tiempo_v09.py
- access-v4-brand.spec.js
- brand-v4-assets.spec.js
- brand-v4-commerce.spec.js
- brand-v4-editorial.spec.js
- brand-v4-utility.spec.js
- finance-v32.spec.js
- internal-governance-v311.spec.js
- master-cost-proposals-v11.spec.js
- master-data-v10.spec.js
- measurement-v24.spec.js
- offline-v4.spec.js
- product-v303.spec.js
- product-v304.spec.js
- v4-account.spec.js
- v4-public-handoff.spec.js
- v4-store-catalog.spec.js
- schema-v22.sql
- playwright.config.js
- abrir_local_v28.sh
- refresh_graphify_knowledge.sh
- activation-v20.spec.js
- brand-v4-home.spec.js
- internal-legacy-compat-v311.spec.js

## God Nodes (most connected - your core abstractions)
1. `order()` - 18 edges
2. `sectionHtml()` - 17 edges
3. `approved_for_promotion` - 17 edges
4. `die()` - 17 edges
5. `export_snapshot()` - 16 edges
6. `render()` - 15 edges
7. `render()` - 14 edges
8. `labHtml()` - 14 edges
9. `as_text()` - 14 edges
10. `render()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `hydrateVisualSurface()` --indirect_call--> `resolve()`  [INFERRED]
  tests/e2e/v4-visual-smoke.spec.js → assets/brand-canon-v28.js
- `compute()` --indirect_call--> `order()`  [INFERRED]
  assets/business-pulse-v34.js → tests/e2e/historical-cost-snapshots-v14.spec.js
- `initCheckout()` --indirect_call--> `order()`  [INFERRED]
  assets/commerce-v14.js → tests/e2e/historical-cost-snapshots-v14.spec.js
- `compute()` --indirect_call--> `order()`  [INFERRED]
  assets/control-executive-v32.js → tests/e2e/historical-cost-snapshots-v14.spec.js
- `compute()` --indirect_call--> `order()`  [INFERRED]
  assets/control-v30.js → tests/e2e/historical-cost-snapshots-v14.spec.js

## Import Cycles
- None detected.

## Communities (194 total, 66 thin omitted)

### Community 0 - "procurement-v25.js"
Cohesion: 0.08
Nodes (44): render(), sourceLabel(), actionButtons(), activeOrdersTable(), bind(), currentRequirements(), explode(), fillOrderForm() (+36 more)

### Community 1 - "approved_for_promotion"
Cohesion: 0.05
Nodes (37): assets, excluded, import_commit, integrity, note, 14-crea-la-tuya-v4.webp, 16-ayuda-v4.webp, 19-seguimiento-v4.webp (+29 more)

### Community 2 - "finance-cash-trends-v323.js"
Cohesion: 0.13
Nodes (36): activate(), actual(), actualFlowHtml(), allCounts(), allMoves(), bind(), bridgeHtml(), cashRow() (+28 more)

### Community 3 - "finance-usability-v351.js"
Cohesion: 0.14
Nodes (36): actual(), addMove(), allMoves(), api(), bind(), cashRow(), cashTable(), countBox() (+28 more)

### Community 4 - "finance-workbench-v31.js"
Cohesion: 0.12
Nodes (34): actual(), barChart(), bind(), cashEditor(), dashboard(), decisions(), empty(), exportJson() (+26 more)

### Community 5 - "master-data-v10.js"
Cohesion: 0.13
Nodes (35): badge(), bind(), blankStore(), cleanMeta(), fillMaterial(), fillSupplier(), formFields(), formMeta() (+27 more)

### Community 6 - "commerce-v14.js"
Cohesion: 0.12
Nodes (29): applyToData(), applyToDom(), canonicalGallery(), normalize(), resolve(), adminDashboard(), backendReady(), bindLocalAdmin() (+21 more)

### Community 7 - "finance-decisions-v325.js"
Cohesion: 0.16
Nodes (34): bind(), cards(), cashState(), currentPosition(), decisionId(), decorate(), detail(), difference() (+26 more)

### Community 8 - "finance-scenarios-v324.js"
Cohesion: 0.14
Nodes (34): addScenario(), benchmark(), bind(), cashChart(), cashRow(), comparisonTable(), controls(), decorate() (+26 more)

### Community 9 - "finance-unit-economics-v322.js"
Cohesion: 0.15
Nodes (34): activate(), analyseRow(), analyses(), applyBom(), bind(), bridge(), calculate(), category() (+26 more)

### Community 10 - "offer-acts-v09.js"
Cohesion: 0.11
Nodes (25): authenticate(), createAccount(), derive(), field(), findReviewAccount(), nextTarget(), openSession(), render() (+17 more)

### Community 11 - "activation-v20.js"
Cohesion: 0.13
Nodes (29): bindCopy(), copyText(), firstAdminCommand(), getClient(), healthChecklist(), renderConnected(), renderDashboard(), renderLogin() (+21 more)

### Community 12 - "historical-cost-snapshots-v14.js"
Cohesion: 0.16
Nodes (29): initControlCenter(), loadScenario(), append(), captureMovement(), captureOrder(), capturePurchase(), events(), findProduct() (+21 more)

### Community 13 - "master-cost-proposals-v11.js"
Cohesion: 0.17
Nodes (30): append(), askReason(), bind(), createProposal(), decideProposal(), events(), evidenceForMaterial(), evidenceOptions() (+22 more)

### Community 14 - "commerce-ux-v18.js"
Cohesion: 0.13
Nodes (28): announce(), checkoutConfidence(), checkoutProgress(), copyText(), enhanceBankDetails(), enhanceCheckoutForm(), enhanceCheckoutSummary(), enhanceProductCards() (+20 more)

### Community 15 - "exportar_mfo_v30.py"
Cohesion: 0.27
Nodes (28): Any, Namespace, add_assumption(), as_text(), assumptions(), audit_summary(), cash_flow(), checked_value() (+20 more)

### Community 16 - "daily-close-v36.js"
Cohesion: 0.17
Nodes (28): activeClose(), bind(), capacityIssues(), capacityPolicy(), carryHtml(), carryoverFromPrevious(), closeDay(), continuityIssues() (+20 more)

### Community 17 - "measurement-v24.js"
Cohesion: 0.15
Nodes (26): allMoves(), applyCorrection(), cashEffect(), decorate(), ensureDialog(), kind(), ledgerHtml(), logHistory() (+18 more)

### Community 18 - "internal-ux-v39.js"
Cohesion: 0.20
Nodes (26): addTriggers(), boot(), buildResume(), closeDialog(), createLayer(), currentVisit(), escapeHtml(), filteredItems() (+18 more)

### Community 19 - "pilot-operations-v37.js"
Cohesion: 0.23
Nodes (26): appendEvent(), beginPilot(), bind(), boot(), buildBackup(), checkpoint(), datasetManifest(), demos() (+18 more)

### Community 20 - "finance-procurement-v326.js"
Cohesion: 0.18
Nodes (25): activate(), bind(), bridge(), decorate(), explode(), findFinanceProduct(), findOrderProduct(), materialMap() (+17 more)

### Community 21 - "finance-depth-v32.js"
Cohesion: 0.20
Nodes (24): activateClose(), actual(), assumptionNumber(), bindClose(), breakEven(), cashDiagnostic(), cashHtml(), cashRow() (+16 more)

### Community 22 - "management-pulse-v35.js"
Cohesion: 0.18
Nodes (24): bind(), capacityHistory(), capacityHistoryHtml(), capacityState(), capacitySummary(), closeReadiness(), closeState(), controlHtml() (+16 more)

### Community 23 - "pilot-daily-v374.js"
Cohesion: 0.19
Nodes (24): activeClose(), activeRows(), bind(), checkpointDay(), countsForDate(), currentDate(), dayState(), eventDate() (+16 more)

### Community 24 - "master-cost-materialization-v12.js"
Cohesion: 0.21
Nodes (23): append(), approvedProposals(), askReason(), bind(), currentStandard(), effectiveMaterial(), effectiveProductCost(), effectiveStandardCost() (+15 more)

### Community 25 - "production-v22.js"
Cohesion: 0.20
Nodes (22): actionFor(), aggregate(), bind(), consolidatedHtml(), exportPreparation(), initialDate(), itemSummary(), loadOrders() (+14 more)

### Community 26 - "finance-guidance-v330.js"
Cohesion: 0.18
Nodes (20): actual(), bind(), cashChart(), decorate(), glossary(), html(), marginChart(), months() (+12 more)

### Community 27 - "daily-ops-v21.js"
Cohesion: 0.21
Nodes (20): actionButtons(), backupPayload(), cardsHtml(), compactLegacyOrders(), counters(), detailsHtml(), exportBackup(), exportCsv() (+12 more)

### Community 28 - "mfo-v30.js"
Cohesion: 0.19
Nodes (19): actualState(), analysisPanel(), bind(), comparisonRow(), decisionPanel(), emptyPanel(), metric(), movementMonth() (+11 more)

### Community 29 - "pilot-order-intake-v372.js"
Cohesion: 0.23
Nodes (20): attachReceipt(), bind(), catalog(), collectLines(), createOrder(), formTemplate(), init(), lineTemplate() (+12 more)

### Community 30 - "admin-v15.js"
Cohesion: 0.23
Nodes (19): activationPanel(), adminClient(), bindDashboard(), collectCosts(), collectProducts(), dashboard(), defaultProducts(), init() (+11 more)

### Community 31 - "operations-v16.js"
Cohesion: 0.23
Nodes (19): adminClient(), averageCatalogContribution(), catalogProducts(), finance(), handleOrderStatusChange(), load(), localMovement(), localState() (+11 more)

### Community 32 - "aire-tiempo-committee-v09.js"
Cohesion: 0.24
Nodes (18): agendaHTML(), applyTemplate(), currentProductId(), decorateForm(), gateRow(), guidedIssues(), guideForGate(), init() (+10 more)

### Community 33 - "operational-evidence-v330.js"
Cohesion: 0.25
Nodes (18): activeEvidence(), allEvidence(), bind(), cancelCorrection(), cardsHtml(), factsHtml(), formHtml(), historyHtml() (+10 more)

### Community 34 - "control-executive-v32.js"
Cohesion: 0.20
Nodes (15): actions(), bar(), bind(), compute(), decorate(), explode(), findProduct(), html() (+7 more)

### Community 35 - "internal-shell-v31.js"
Cohesion: 0.24
Nodes (17): accessUrl(), boot(), clearExpiryTimer(), enforceSession(), ensureEfficiencyScript(), ensureEfficiencyStyle(), ensureUxScript(), ensureUxStyle() (+9 more)

### Community 36 - "business-pulse-v34.js"
Cohesion: 0.24
Nodes (16): action(), compute(), coverage(), explode(), financeHtml(), findProduct(), horizonBars(), normalizePurchase() (+8 more)

### Community 37 - "finance-v27.js"
Cohesion: 0.24
Nodes (16): alerts(), badge(), bind(), boot(), compute(), fixedCosts(), metric(), movementRows() (+8 more)

### Community 38 - "host-mode.js"
Cohesion: 0.25
Nodes (15): add(), applySpecialPageAssets(), applyUtilityV4(), curatePublicChrome(), curatePublicNav(), currentPath(), enhance(), ensureStylesheet() (+7 more)

### Community 39 - "materials-v23.js"
Cohesion: 0.25
Nodes (16): dayOrders(), explodeProduct(), findProduct(), materialRows(), plan(), productTable(), recipeExplorer(), renderRecipe() (+8 more)

### Community 40 - "internal-ux-v38.js"
Cohesion: 0.28
Nodes (15): addSkipLink(), boot(), buildMobileShell(), closeMenu(), decorateMessages(), decorateNav(), decorateScrollRegions(), focusables() (+7 more)

### Community 41 - "pilot-exit-v373.js"
Cohesion: 0.26
Nodes (15): bind(), dataRows(), decision(), download(), exportDecision(), formMap(), init(), message() (+7 more)

### Community 42 - "inventory-valuation-v15.js"
Cohesion: 0.33
Nodes (14): alerts(), currentStandard(), explodeProduct(), findProduct(), latestObservedMap(), materialRows(), normalizePurchaseOrder(), notify() (+6 more)

### Community 43 - "operational-forms-v40.js"
Cohesion: 0.32
Nodes (13): annotateFields(), enhanceAll(), enhanceForm(), ensureGuide(), ensurePreview(), fieldName(), guardSubmit(), observe() (+5 more)

### Community 44 - "offer-studio-v09.js"
Cohesion: 0.36
Nodes (10): criticalPending(), effectiveGate(), init(), loadGovernance(), loadModel(), productState(), progress(), renderControl() (+2 more)

### Community 45 - "package.json"
Cohesion: 0.15
Nodes (12): description, devDependencies, @playwright/test, name, version, private, releaseHistory, previousStable (+4 more)

### Community 46 - "finance-executive-v327.js"
Cohesion: 0.35
Nodes (11): bind(), decorate(), html(), metric(), months(), scenarioCash(), selectedMonth(), signature() (+3 more)

### Community 47 - "product-commerce-v304.js"
Cohesion: 0.36
Nodes (11): compareCard(), comparisonSection(), enhanceProduct(), enhanceStore(), ensureMobileBuy(), findPurchaseButton(), init(), productCard() (+3 more)

### Community 48 - "finance-demo-v329.js"
Cohesion: 0.35
Nodes (10): activeEnhance(), backup(), clearDemo(), demoFacts(), emptyEnhance(), enhance(), loadDemo(), makeDemo() (+2 more)

### Community 49 - "finance-readiness-v328.js"
Cohesion: 0.35
Nodes (10): bind(), decorate(), html(), months(), readiness(), selectedMonth(), signature(), start() (+2 more)

### Community 50 - "master-cost-prospective-v13.js"
Cohesion: 0.25
Nodes (5): baseMaterial(), baseProduct(), productCost(), resolveMaterial(), standardMaterial()

### Community 51 - "public-actions-v29.js"
Cohesion: 0.38
Nodes (9): backendConfig(), configuredOrdering(), copyOrExpose(), handoffMarkup(), init(), localOrdering(), setup(), summary() (+1 more)

### Community 52 - "exportar-fuente-canonica.mjs"
Cohesion: 0.20
Nodes (6): EXPECTED_IDS, LEGACY_PARTS, OUTPUT, outputArg, ROOT, TRUSTED_PARTS

### Community 53 - "inventory-valuation-v15.spec.js"
Cohesion: 0.20
Nodes (6): PURCHASE, PURCHASE_SNAPSHOT, R1, R2, SESSION, {test,expect}

### Community 54 - "pilot-exit-v373.spec.js"
Cohesion: 0.22
Nodes (7): attestations, dataPersistence, roleNeeds, seedCompleteClosedPilot(), surfaceUse, {test,expect}, today()

### Community 55 - "brand-v4-public.js"
Cohesion: 0.42
Nodes (8): installShell(), promoteCatalogCards(), promoteCheckoutTrust(), promoteEnCasaSupport(), promotePageAssets(), promoteProductDetail(), promoteRecipeLibrary(), promoteTools()

### Community 56 - "control-v30.js"
Cohesion: 0.42
Nodes (8): alertHtml(), alerts(), compute(), explode(), findProduct(), metric(), orderDate(), render()

### Community 57 - "product-visual-v305.js"
Cohesion: 0.33
Nodes (7): captionHTML(), currentProduct(), decorateImage(), enhance(), roleForImage(), ids, { test, expect }

### Community 58 - "public-commerce-guard-v29.js"
Cohesion: 0.47
Nodes (8): accountPreview(), apply(), cartItems(), checkoutPreview(), init(), readCart(), renderCheckoutSummary(), setText()

### Community 59 - "schema-v14.sql"
Cohesion: 0.31
Nodes (8): public.admin_users, public.fixed_costs, public.is_admin(), public.order_items, public.orders, public.payment_receipts, public.product_operations, public.public_settings

### Community 60 - "schema-v15.sql"
Cohesion: 0.39
Nodes (6): public.admin_audit_log, public.set_updated_at(), trg_fixed_costs_updated_at, trg_orders_updated_at, trg_product_operations_updated_at, trg_public_settings_updated_at

### Community 61 - "service-worker.js"
Cohesion: 0.29
Nodes (5): cacheFirst(), canonicalRequest(), COMPATIBILITY, CORE, GENERATED

### Community 62 - "servidor_demo.py"
Cohesion: 0.36
Nodes (5): available(), choose_port(), Handler, main(), Server

### Community 63 - "finance-inventory-valuation-v15.js"
Cohesion: 0.52
Nodes (6): alertList(), materialsTable(), metric(), render(), status(), varianceTable()

### Community 64 - "product-v303.js"
Cohesion: 0.52
Nodes (6): compositionHTML(), currentProduct(), enhance(), overviewHTML(), passportHTML(), signalsHTML()

### Community 65 - "schema-v16.sql"
Cohesion: 0.38
Nodes (5): public.inventory_movements, public.orders, public.product_operations, public.sync_order_inventory_v16(), trg_orders_inventory_v16

### Community 66 - "preparar_sitio_materializado_v28.py"
Cohesion: 0.67
Nodes (6): asset_ignore(), copy_surface(), main(), patch_html(), Path, verify_surface()

### Community 67 - "master-cost-bridge-v13.spec.js"
Cohesion: 0.29
Nodes (3): SESSION, STANDARD_EVENT, {test,expect}

### Community 68 - "pilot-daily-v374.spec.js"
Cohesion: 0.33
Nodes (4): attestations, begin(), {test,expect}, today()

### Community 69 - "pilot-intake-v372.spec.js"
Cohesion: 0.33
Nodes (4): fillBaseOrder(), RECEIPT_PNG, {test,expect}, today()

### Community 71 - "finance-starter-v31.js"
Cohesion: 0.60
Nodes (5): create(), enhance(), months24(), publicSkuRows(), starter()

### Community 72 - "product-v30.js"
Cohesion: 0.60
Nodes (5): craftProofHTML(), currentProduct(), enhance(), renderSensory(), sectionHTML()

### Community 73 - "schema-v25.sql"
Cohesion: 0.40
Nodes (3): public.material_purchase_orders_v25, public.material_purchase_receipts_v25, trg_material_purchase_orders_v25_updated_at

### Community 76 - "oferta-v09.spec.js"
Cohesion: 0.40
Nodes (3): openOffer(), seedInternalSession(), { test, expect }

### Community 78 - "schema-v19.sql"
Cohesion: 0.60
Nodes (4): public.lookup_order_status_v19(), public.order_status_events, public.record_order_status_event_v19(), trg_order_status_event_v19

### Community 80 - "schema-v24.sql"
Cohesion: 0.50
Nodes (3): public.material_purchases, public.material_suppliers, public.production_measurements

### Community 83 - "actas-v09.spec.js"
Cohesion: 0.50
Nodes (3): openActs(), seedInternalSession(), { test, expect }

### Community 89 - "management-pulse-v35.spec.js"
Cohesion: 0.50
Nodes (3): financeDemo(), internalSession(), {test,expect}

### Community 96 - "schema-v23.sql"
Cohesion: 0.83
Nodes (3): public.material_inventory, public.material_master, public.product_bom

### Community 97 - "materializar_fuentes_locales_v28.py"
Cohesion: 0.83
Nodes (3): main(), materialize(), sha256()

### Community 98 - "migrar_runtime_canonico_v08.py"
Cohesion: 0.83
Nodes (3): migrate_workflow(), read(), write()

### Community 103 - "verificar_studio_oferta_v09.py"
Cohesion: 1.00
Nodes (3): main(), require(), text()

### Community 110 - "editorial-v29.spec.js"
Cohesion: 0.50
Nodes (3): forbiddenClosedClaims, { test, expect }, v30Ids

### Community 111 - "finance-usability-v351.spec.js"
Cohesion: 0.67
Nodes (3): openDesk(), seed(), {test,expect}

### Community 119 - "internal-ux-v330.spec.js"
Cohesion: 0.67
Nodes (3): financeDemo(), internalSession(), {test,expect}

### Community 128 - "product-v305.spec.js"
Cohesion: 0.50
Nodes (3): expected, pizzas, { test, expect }

### Community 132 - "v4-checkout.spec.js"
Cohesion: 0.67
Nodes (3): openCheckout(), seedCart(), { test, expect }

## Knowledge Gaps
- **165 isolated node(s):** `version`, `status`, `import_commit`, `integrity`, `source_zip_drive_id` (+160 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **66 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `order()` connect `procurement-v25.js` to `control-executive-v32.js`, `business-pulse-v34.js`, `finance-v27.js`, `commerce-v14.js`, `finance-procurement-v326.js`, `pilot-daily-v374.js`, `control-v30.js`, `production-v22.js`, `daily-ops-v21.js`, `mfo-v30.js`, `operations-v16.js`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `compute()` connect `control-executive-v32.js` to `procurement-v25.js`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `initCheckout()` connect `commerce-v14.js` to `procurement-v25.js`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Are the 17 inferred relationships involving `order()` (e.g. with `compute()` and `initCheckout()`) actually correct?**
  _`order()` has 17 INFERRED edges - model-reasoned connections that need verification._
- **What connects `version`, `status`, `import_commit` to the rest of the system?**
  _165 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `procurement-v25.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08069381598793364 - nodes in this community are weakly interconnected._
- **Should `approved_for_promotion` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._