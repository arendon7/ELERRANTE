from pathlib import Path
import re


def replace(path, old, new, count=None):
    p = Path(path)
    text = p.read_text(encoding='utf-8')
    hits = text.count(old)
    if hits == 0:
        raise SystemExit(f'{path}: no se encontró {old!r}')
    if count is not None and hits != count:
        raise SystemExit(f'{path}: esperadas {count}, encontradas {hits}: {old!r}')
    p.write_text(text.replace(old, new), encoding='utf-8')


def after(path, marker, addition):
    replace(path, marker, marker + addition, 1)


p = 'admin.html'
after(p, '<link rel="stylesheet" href="assets/measurement-v24.css">', '<link rel="stylesheet" href="assets/procurement-v25.css">')
replace(p, 'Activación V2.4', 'Activación V2.5')
replace(p, 'Operación, producción, materiales, medición, compras y despacho · V2.4', 'Operación, producción, materiales, medición, compras, abastecimiento y despacho · V2.5', 1)
replace(p, 'Iteración 11', 'Iteración 12', 1)
replace(p, 'la medición de lotes, las compras y los datos mínimos', 'la medición de lotes, las compras, las órdenes de abastecimiento, las recepciones y los datos mínimos', 1)
replace(p, '<div id="measurement-v24"></div><div id="operations-v16"></div>', '<div id="measurement-v24"></div><div id="procurement-v25"></div><div id="operations-v16"></div>', 1)
replace(p, '<script src="assets/measurement-v24.js"></script><script src="assets/operations-v16.js"></script>', '<script src="assets/measurement-v24.js"></script><script src="assets/procurement-v25.js"></script><script src="assets/operations-v16.js"></script>', 1)

p = 'activacion.html'
replace(p, 'Activación V2.4', 'Activación V2.5')
replace(p, 'Activación operativa y continuidad · V2.4', 'Activación operativa y continuidad · V2.5', 1)
replace(p, 'Iteración 11', 'Iteración 12', 1)
replace(p, 'la medición de lotes, las compras y los datos mínimos', 'la medición de lotes, las compras, las órdenes de abastecimiento, las recepciones y los datos mínimos', 1)
after(p, '<script src="assets/activation-v24.js"></script>', '<script src="assets/activation-v25.js"></script>')

replace('assets/host-mode.js', 'PUBLIC_VERSION="2.4.0"', 'PUBLIC_VERSION="2.5.0"', 1)
replace('assets/host-mode.js', 'ACTIVE_CACHE="el-errante-v2-4-0"', 'ACTIVE_CACHE="el-errante-v2-5-visual-1"', 1)
replace('assets/commerce-config-v14.js', 'version: "2.4.0"', 'version: "2.5.0"', 1)
replace('assets/admin-v15.js', 'Administración V2.4', 'Administración V2.5')
replace('deploy-version.txt', 'version=2.4.0', 'version=2.5.0', 1)
replace('deploy-version.txt', 'cache=el-errante-v2-4-0', 'cache=el-errante-v2-5-visual-1', 1)

p = 'service-worker.js'
replace(p, "const CACHE = 'el-errante-v2-4-0';", "const CACHE = 'el-errante-v2-5-visual-1';", 1)
after(p, "'./assets/activation-v24.js'", ",'./assets/activation-v25.js'")
after(p, "'./assets/measurement-v24.js'", ",'./assets/procurement-v25.js'")
after(p, "'./assets/measurement-v24.css'", ",'./assets/procurement-v25.css'")
after(p, "'./backend/supabase/schema-v24.sql'", ",'./backend/supabase/schema-v25.sql'")

p = '.github/workflows/pages.yml'
after(p, '            scripts/verificar_medicion_v24.py \\\n', '            scripts/verificar_abastecimiento_v25.py \\\n')
replace(p, 'activation-v24.js \\\n', 'activation-v24.js activation-v25.js \\\n', 1)
replace(p, 'materials-v23.js measurement-v24.js \\\n', 'materials-v23.js measurement-v24.js procurement-v25.js \\\n', 1)
replace(p, 'materials-v23.css measurement-v24.css;', 'materials-v23.css measurement-v24.css procurement-v25.css;', 1)
replace(p, 'version=2.4.0', 'version=2.5.0')
replace(p, 'el-errante-v2-4-0', 'el-errante-v2-5-visual-1')
replace(p, 'Operación, producción, materiales, medición, compras y despacho · V2.4', 'Operación, producción, materiales, medición, compras, abastecimiento y despacho · V2.5')
replace(p, 'Activación V2.4', 'Activación V2.5')
after(p, "          grep -q 'id=\"measurement-v24\"' _site/admin.html\n", "          grep -q 'id=\"procurement-v25\"' _site/admin.html\n")
after(p, "          grep -q 'assets/measurement-v24.js' _site/admin.html\n", "          grep -q 'assets/procurement-v25.js' _site/admin.html\n")
after(p, "          grep -q 'assets/measurement-v24.css' _site/admin.html\n", "          grep -q 'assets/procurement-v25.css' _site/admin.html\n")
after(p, "          grep -q 'assets/activation-v24.js' _site/activacion.html\n", "          grep -q 'assets/activation-v25.js' _site/activacion.html\n")
replace(p, 'production-v22.js materials-data-v23.js materials-v23.js materials-v23.css measurement-v24.js measurement-v24.css activation-v23.js activation-v24.js;', 'production-v22.js materials-data-v23.js materials-v23.js materials-v23.css measurement-v24.js measurement-v24.css procurement-v25.js procurement-v25.css activation-v23.js activation-v24.js activation-v25.js;', 1)
replace(p, 'for schema in 20 21 22 23 24;', 'for schema in 20 21 22 23 24 25;', 1)
after(p, "          grep -q 'save_material_purchase_v24' _site/backend/supabase/schema-v24.sql\n", "          grep -q 'save_material_purchase_order_v25' _site/backend/supabase/schema-v25.sql\n          grep -q 'receive_material_purchase_order_v25' _site/backend/supabase/schema-v25.sql\n          grep -q 'Comprar con evidencia y autorización.' _site/assets/procurement-v25.js\n")
after(p, '          node --check _site/assets/measurement-v24.js\n', '          node --check _site/assets/procurement-v25.js\n')
after(p, '          node --check _site/assets/activation-v24.js\n', '          node --check _site/assets/activation-v25.js\n')
after(p, "          ! grep -qi 'postgres://' _site/assets/measurement-v24.js\n", "          ! grep -qi 'service_role' _site/assets/procurement-v25.js\n          ! grep -qi 'postgres://' _site/assets/procurement-v25.js\n")
after(p, "          test ! -f _site/ELERRANTE_PAQUETE_VISUAL_V1_10.zip\n", "          ! grep -R -n 'assets/images/v040/' _site/*.html _site/assets/data.js _site/assets/host-mode.js\n")

p = '.github/workflows/canonical-audit.yml'
after(p, '            scripts/verificar_medicion_v24.py; do\n', '            scripts/verificar_abastecimiento_v25.py; do\n')
after(p, '          node --check assets/measurement-v24.js\n', '          node --check assets/procurement-v25.js\n')
after(p, '          node --check assets/activation-v24.js\n', '          node --check assets/activation-v25.js\n')

p = '.github/workflows/public-health.yml'
replace(p, 'el-errante-v2-4-0', 'el-errante-v2-5-visual-1')
replace(p, '2.4.0', '2.5.0')
replace(p, 'Operación, producción, materiales, medición, compras y despacho · V2.4', 'Operación, producción, materiales, medición, compras, abastecimiento y despacho · V2.5')
replace(p, 'Activación V2.4', 'Activación V2.5')
replace(p, 'activation-v24.js \\\n', 'activation-v24.js activation-v25.js \\\n', 1)
replace(p, 'materials-v23.js measurement-v24.js;', 'materials-v23.js measurement-v24.js procurement-v25.js;', 1)
replace(p, 'materials-v23.css measurement-v24.css;', 'materials-v23.css measurement-v24.css procurement-v25.css;', 1)
after(p, '            "$PUBLIC_BASE/backend/supabase/schema-v24.sql?verify=$EXPECTED_SHA" > public-schema-v24.sql\n', '          curl --fail --silent --show-error --location --max-time 15 -H \'Cache-Control: no-cache\' \\\n            "$PUBLIC_BASE/backend/supabase/schema-v25.sql?verify=$EXPECTED_SHA" > public-schema-v25.sql\n')
after(p, "          grep -q 'assets/measurement-v24.css' public-service-worker.js\n", "          grep -q 'assets/procurement-v25.js' public-service-worker.js\n          grep -q 'assets/procurement-v25.css' public-service-worker.js\n")
after(p, "          grep -q 'backend/supabase/schema-v24.sql' public-service-worker.js\n", "          grep -q 'backend/supabase/schema-v25.sql' public-service-worker.js\n")
after(p, "          grep -q 'Registrar compra y proveedor' public-measurement-v24.js\n", "          grep -q 'Comprar con evidencia y autorización.' public-procurement-v25.js\n          grep -q 'Marcar emitida' public-procurement-v25.js\n")
after(p, "          grep -q 'material_suppliers' public-schema-v24.sql\n", "          grep -q 'save_material_purchase_order_v25' public-schema-v25.sql\n          grep -q 'receive_material_purchase_order_v25' public-schema-v25.sql\n")
replace(p, "          grep -q \"dataset.activationVersion='2.5.0'\" public-activation-v24.js", "          grep -q \"dataset.activationVersion='2.5.0'\" public-activation-v25.js", 1)
after(p, "          ! grep -qi 'postgres://' public-measurement-v24.js\n", "          ! grep -qi 'service_role' public-procurement-v25.js\n          ! grep -qi 'postgres://' public-procurement-v25.js\n")
after(p, "          assert_contains public-admin.html 'id=\"measurement-v24\"' 'Admin no expone medición V2.4.'\n", "          assert_contains public-admin.html 'id=\"procurement-v25\"' 'Admin no expone abastecimiento V2.5.'\n")
after(p, "          assert_contains public-admin.html 'assets/measurement-v24.css' 'Admin no carga estilos V2.4.'\n", "          assert_contains public-admin.html 'assets/procurement-v25.js' 'Admin no carga abastecimiento V2.5.'\n          assert_contains public-admin.html 'assets/procurement-v25.css' 'Admin no carga estilos V2.5.'\n")
after(p, "          assert_contains public-activacion.html 'assets/activation-v24.js' 'Activación no carga extensión V2.4.'\n", "          assert_contains public-activacion.html 'assets/activation-v25.js' 'Activación no carga extensión V2.5.'\n")
replace(p, 'PUBLIC HEALTH V2.5.0 MEDICIÓN Y COMPRAS', 'PUBLIC HEALTH V2.5.0 ABASTECIMIENTO CONTROLADO')
after(p, '            public-activation-v24.js\n', '            public-activation-v25.js\n')
after(p, '            public-measurement-v24.css\n', '            public-procurement-v25.js\n            public-procurement-v25.css\n')
after(p, '            public-schema-v24.sql\n', '            public-schema-v25.sql\n')

for q in Path('scripts').glob('verificar_*.py'):
    text = q.read_text(encoding='utf-8')
    text = text.replace('version=2.4.0', 'version=2.5.0')
    text = text.replace('cache=el-errante-v2-4-0', 'cache=el-errante-v2-5-visual-1')
    text = text.replace('PUBLIC_VERSION="2.4.0"', 'PUBLIC_VERSION="2.5.0"')
    text = text.replace('ACTIVE_CACHE="el-errante-v2-4-0"', 'ACTIVE_CACHE="el-errante-v2-5-visual-1"')
    text = text.replace("const CACHE = 'el-errante-v2-4-0';", "const CACHE = 'el-errante-v2-5-visual-1';")
    text = text.replace('version: "2.4.0"', 'version: "2.5.0"')
    text = text.replace('Operación, producción, materiales, medición, compras y despacho · V2.4', 'Operación, producción, materiales, medición, compras, abastecimiento y despacho · V2.5')
    text = text.replace('Administración V2.4', 'Administración V2.5')
    text = text.replace('Activación V2.4', 'Activación V2.5')
    text = text.replace('Iteración 11', 'Iteración 12')
    q.write_text(text, encoding='utf-8')

p = Path('tests/e2e/activation-v20.spec.js')
text = p.read_text(encoding='utf-8')
text = text.replace('Activación operativa V2.4', 'Activación operativa V2.5')
text = text.replace("'data-activation-version', '2.4.0'", "'data-activation-version', '2.5.0'")
text = text.replace('/V2.3 y V2.4/', '/V2.4 y V2.5/')
text = text.replace("name: 'Activación V2.4'", "name: 'Activación V2.5'")
text = text.replace("'/assets/activation-v24.js']", "'/assets/activation-v24.js','/assets/activation-v25.js']")
p.write_text(text, encoding='utf-8')

visual_pattern = re.compile(r'assets/images/v040/(v040-[A-Za-z0-9_-]+\.svg)')


def visual_target(filename):
    name = filename.lower()
    if 'hero-mobile' in name:
        return 'assets/images/brand-final/home-hero-mobile.webp'
    if 'hero' in name:
        return 'assets/images/brand-final/home-hero.webp'
    if 'noche' in name:
        return 'assets/images/brand-final/evento-noche.webp'
    if any(token in name for token in ('pizzeria', 'evento', 'operacion', 'servicio')):
        return 'assets/images/brand-final/evento-servicio.webp'
    if 'despensa' in name or 'empaque' in name:
        return 'assets/images/brand-final/home-despensa.webp'
    if 'harina-empaques' in name or 'harina-horno' in name:
        return 'assets/images/brand-final/producto-harina.webp'
    if any(token in name for token in ('harina-manos', 'manos-masa', 'masa-apertura', 'bitacora-fuego')):
        return 'assets/images/brand-final/home-masa-fuego.webp'
    if any(token in name for token in ('fermentacion', 'alveolos')):
        return 'assets/images/brand-final/home-fermentacion.webp'
    if 'pizza-errante' in name:
        return 'assets/images/brand-final/producto-la-errante.webp'
    if any(token in name for token in ('pizzas', 'coleccion')):
        return 'assets/images/brand-final/home-en-casa.webp'
    if 'ingrediente' in name or 'receta' in name:
        return 'assets/images/brand-final/home-ingredientes.webp'
    return 'assets/images/brand-final/home-compartir.webp'


live_visual_files = [*Path('.').glob('*.html'), Path('assets/data.js'), Path('assets/host-mode.js')]
for visual_file in live_visual_files:
    text = visual_file.read_text(encoding='utf-8')
    updated = visual_pattern.sub(lambda match: visual_target(match.group(1)), text)
    visual_file.write_text(updated, encoding='utf-8')

for visual_file in live_visual_files:
    text = visual_file.read_text(encoding='utf-8')
    if 'assets/images/v040/' in text:
        raise SystemExit(f'{visual_file}: conserva referencias visuales v040')
    for reference in re.findall(r'assets/images/brand-final/[A-Za-z0-9_-]+\.webp', text):
        if not Path(reference).is_file():
            raise SystemExit(f'{visual_file}: activo visual inexistente {reference}')

p = 'assets/procurement-v25.js'
after(
    p,
    "    if(!payload.invoiceReference)throw new Error('La factura o remisión es obligatoria para reconciliar la recepción.');\n",
    "    if(!snapshot.remote){\n"
    "      const duplicate=read(KEYS.purchases,[]).some(item=>String(item.sourceOrderId||item.source_order_id||'')===order.id&&norm(item.invoiceReference||item.invoice_reference)===norm(payload.invoiceReference));\n"
    "      if(duplicate)throw new Error('Esta factura o remisión ya fue registrada para la orden.');\n"
    "    }\n"
)

after(
    'scripts/verificar_abastecimiento_v25.py',
    "    'referencia externa antes de emitirla',\n",
    "    'Esta factura o remisión ya fue registrada para la orden.',\n"
)

duplicate_test = """  test('impide duplicar una factura y el movimiento de inventario local',async({page})=>{
    await seed(page);
    const panel=await openAdmin(page);
    await panel.locator('[data-v25-suggestion=\"MP-HFS\"]').getByRole('button',{name:'Crear borrador'}).click();
    let form=panel.locator('#ee-v25-order-form');
    await form.locator('input[name=\"supplier\"]').fill('Proveedor de harina');
    await form.locator('input[name=\"unitCost\"]').fill('3');
    await form.locator('input[name=\"externalReference\"]').fill('COT-DUP');
    await form.getByRole('button',{name:'Guardar borrador'}).click();
    let row=panel.locator('[data-v25-order-row]');
    await acceptAndClick(page,row.getByRole('button',{name:'Aprobar'}));
    row=panel.locator('[data-v25-order-row]');
    await acceptAndClick(page,row.getByRole('button',{name:'Marcar emitida'}));
    row=panel.locator('[data-v25-order-row]');
    await row.getByRole('button',{name:'Registrar recepción'}).click();
    let receipt=panel.locator('#ee-v25-receipt-form');
    await receipt.locator('input[name=\"quantity\"]').fill('100');
    await receipt.locator('input[name=\"totalCost\"]').fill('300');
    await receipt.locator('input[name=\"invoiceReference\"]').fill('FAC-DUP');
    await receipt.locator('input[name=\"updateStock\"]').check();
    await receipt.getByRole('button',{name:'Confirmar recepción'}).click();
    row=panel.locator('[data-v25-order-row]');
    await row.getByRole('button',{name:'Registrar recepción'}).click();
    receipt=panel.locator('#ee-v25-receipt-form');
    await receipt.locator('input[name=\"quantity\"]').fill('50');
    await receipt.locator('input[name=\"totalCost\"]').fill('150');
    await receipt.locator('input[name=\"invoiceReference\"]').fill('FAC-DUP');
    await receipt.locator('input[name=\"updateStock\"]').check();
    await receipt.getByRole('button',{name:'Confirmar recepción'}).click();
    await expect(panel.getByText('Esta factura o remisión ya fue registrada para la orden.')).toBeVisible();
    const state=await page.evaluate(()=>({
      stock:JSON.parse(localStorage.getItem('ee_v23_material_stock')||'{}'),
      purchases:JSON.parse(localStorage.getItem('ee_v24_material_purchases')||'[]'),
      orders:JSON.parse(localStorage.getItem('ee_v25_purchase_orders')||'[]')
    }));
    expect(state.stock['MP-HFS']).toBe(200);
    expect(state.purchases).toHaveLength(1);
    expect(state.orders[0].receivedQty).toBe(100);
    expect(state.orders[0].status).toBe('partial');
  });

"""
replace(
    'tests/e2e/procurement-v25.spec.js',
    "  test('compara proveedores únicamente con compras observadas',async({page})=>{\n",
    duplicate_test + "  test('compara proveedores únicamente con compras observadas',async({page})=>{\n",
    1
)
