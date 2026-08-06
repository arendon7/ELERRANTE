#!/usr/bin/env python3
"""Barrera integral de estructura, marca, contenido y seguridad para El Errante V2.8."""
from __future__ import annotations

from pathlib import Path
from urllib.parse import unquote
import json
import re
import sys

ROOT = Path(__file__).resolve().parent
ISSUES: list[str] = []
CHECKED: list[str] = []

PUBLIC_PAGES = [
    'index.html','historia.html','nosotros.html','tienda.html','producto.html',
    'producto-harina.html','producto-crea-tuya.html','en-casa.html','en-movimiento.html',
    'bitacora.html','articulo.html','recetas.html','receta.html','herramientas.html',
    'cobertura.html','ayuda.html','checkout.html','cuenta.html','caso-evento.html',
    'legal.html','offline.html'
]
INTERNAL_PAGES = ['equipo.html','admin.html','activacion.html','control.html','operacion.html','studio.html','actas.html','presentacion.html']
CRITICAL_SCRIPTS = [
    'assets/brand-canon-v28.js','assets/data.js','assets/runtime.js','assets/app.js',
    'assets/preprod.js','assets/host-mode.js','assets/commerce-runtime-config.js',
    'assets/admin-v15.js','assets/daily-ops-v21.js','assets/production-v22.js',
    'assets/materials-data-v23.js','assets/materials-v23.js','assets/measurement-v24.js',
    'assets/procurement-v25.js','assets/procurement-v25-guard.js','assets/finance-v27.js',
    'assets/operations-v16.js','service-worker.js','scripts/exportar-fuente-canonica.mjs',
    'scripts/materializar_fuentes_locales_v28.py','scripts/verificar_canon_marca_v28.py',
    'scripts/verificar_activos_hq_v28.py','scripts/verificar_modulos_v28.py',
    'scripts/abrir_local_v28.sh','servidor_demo.py'
]
GENERATED_SOURCES = [
    'assets/generated/data-v28.js','assets/generated/app-v28.js',
    'assets/generated/preprod-v28.js','assets/generated/manifest-v28.json'
]
LOCAL_ENTRYPOINTS = [
    'ABRIR_EL_ERRANTE.command','ABRIR_EL_ERRANTE_LOCAL_V28.command','ABRIR_ADMIN_LOCAL_V28.command',
    'ABRIR_CONTROL.command','ABRIR_PRESENTACION.command','DETENER_EL_ERRANTE_LOCAL_V28.command',
    'VERIFICAR_DEMO.command','VERIFICAR_PAQUETE_LOCAL_V28.command','PREPARAR_RETORNO_GITHUB_V28.command',
    'LEER_PRIMERO_PAQUETE_LOCAL_V28.txt'
]
CANONICAL_WEBPS = [
    'home-hero.webp','home-hero-mobile.webp','home-masa-fuego.webp','home-fermentacion.webp',
    'home-ingredientes.webp','home-compartir.webp','home-en-casa.webp','home-despensa.webp',
    'evento-hero.webp','evento-noche.webp','evento-servicio.webp','og-el-errante.webp',
    'producto-harina.webp','producto-crea-tuya.webp','producto-margherita.webp','producto-diavola.webp',
    'producto-bosque.webp','producto-cuatro-quesos.webp','producto-la-errante.webp',
    'producto-salsa-tomate.webp','producto-reduccion-balsamica.webp','producto-panela-maracuya.webp',
    'producto-combo-primera-ruta.webp'
]
PRODUCT_IDS = [
    'harina-aire-y-tiempo','crea-la-tuya','margherita-del-taller','diavola-errante',
    'bosque','cuatro-quesos-montana','la-errante','salsa-tomate',
    'reduccion-balsamica','panela-maracuya','combo-primera-ruta'
]
OBSOLETE_ACTIVE_FILES = [
    'ABRIR_EL_ERRANTE_LOCAL_V27.command','VERIFICAR_PAQUETE_LOCAL_V27.command',
    'DETENER_EL_ERRANTE_LOCAL_V27.command','PREPARAR_RETORNO_GITHUB_V27.command',
    'LEER_PRIMERO_PAQUETE_LOCAL_V27.txt','README.txt',
    'AUDITORIA_V0_1_Y_CAMBIOS_V0_2.md','RECUPERACION_VISUAL_V0_6.md',
    'REPORTE_GOLD_MASTER_V0_5.txt','REPORTE_LOCAL_V0_4.txt',
    'REPORTE_PREPRODUCCION_V0_3.txt','REPORTE_PRUEBAS_V0_2.txt',
    'assets/brand-final-editorial.js','assets/brand-final-products-a.js',
    'assets/brand-final-products-b.js','assets/brand-final-products-c.js',
    'scripts/materializar_activos_visuales.py',
    'scripts/verificar_release_v12.py','scripts/verificar_release_v13.py',
    'scripts/verificar_operacion_v14.py','scripts/verificar_backend_v15.py',
    'scripts/verificar_operacion_v16.py','scripts/verificar_contenido_v17.py',
    'scripts/verificar_experiencia_compra_v18.py','scripts/verificar_confianza_v19.py',
    'scripts/verificar_activacion_v20.py','scripts/verificar_operacion_diaria_v21.py',
    'scripts/verificar_produccion_v22.py','scripts/verificar_materiales_v23.py',
    'scripts/verificar_medicion_v24.py','scripts/verificar_abastecimiento_v25.py'
]
ARCHIVE_REQUIREMENTS = [
    'archive/legacy-brand-overlays/README.md',
    'archive/legacy-brand-overlays/brand-final-editorial.js',
    'archive/legacy-brand-overlays/brand-final-products-a.js',
    'archive/legacy-brand-overlays/brand-final-products-b.js',
    'archive/legacy-brand-overlays/brand-final-products-c.js',
    'archive/legacy-brand-overlays/materializar_activos_visuales.py',
    'archive/legacy-verifiers/README.md',
    'archive/early-iterations/README.md',
    'archive/early-iterations/README.txt',
    'archive/early-iterations/AUDITORIA_V0_1_Y_CAMBIOS_V0_2.md',
    'archive/early-iterations/RECUPERACION_VISUAL_V0_6.md',
    'archive/early-iterations/REPORTE_GOLD_MASTER_V0_5.txt',
    'archive/early-iterations/REPORTE_LOCAL_V0_4.txt',
    'archive/early-iterations/REPORTE_PREPRODUCCION_V0_3.txt',
    'archive/early-iterations/REPORTE_PRUEBAS_V0_2.txt'
]
EXTERNAL = ('http:','https:','//','mailto:','tel:','javascript:','data:','blob:','#')


def require(relative: str, label: str) -> Path:
    path = ROOT / relative
    if not path.is_file():
        ISSUES.append(f'{label} faltante: {relative}')
    else:
        CHECKED.append(relative)
    return path


def read(relative: str) -> str:
    path = ROOT / relative
    return path.read_text(encoding='utf-8', errors='ignore') if path.is_file() else ''


def clean_reference(value: str) -> str | None:
    value = unquote(value.strip())
    if not value or value.startswith(EXTERNAL) or '${' in value or '{{' in value:
        return None
    value = value.split('#', 1)[0].split('?', 1)[0].removeprefix('./').removeprefix('/')
    return value or None


for page in PUBLIC_PAGES: require(page, 'Página pública')
for page in INTERNAL_PAGES: require(page, 'Módulo interno')
for script in CRITICAL_SCRIPTS: require(script, 'Runtime o barrera crítica')
for generated in GENERATED_SOURCES: require(generated, 'Fuente materializada V2.8')
for entry in LOCAL_ENTRYPOINTS: require(entry, 'Acceso local V2.8')
for path in ['deploy-version.txt','assets/logo-mark.svg','assets/logo-lockup.svg','manifest.webmanifest','package.json','README.md','CHANGELOG.md']:
    require(path, 'Archivo canónico')
for path in ARCHIVE_REQUIREMENTS: require(path, 'Archivo histórico aislado')

brand = read('assets/brand-canon-v28.js')
data = read('assets/data.js')
app = read('assets/app.js')
preprod = read('assets/preprod.js')
host = read('assets/host-mode.js')
sw = read('service-worker.js')
deploy = read('deploy-version.txt')
admin = read('admin.html')
products = read('assets/products-v6.js')
runtime_config = read('assets/commerce-runtime-config.js')
package = read('package.json')
server = read('servidor_demo.py')
launcher = read('scripts/abrir_local_v28.sh')
materializer = read('scripts/materializar_fuentes_locales_v28.py')
readme = read('README.md')
changelog = read('CHANGELOG.md')

required_markers = {
    'manifiesto de marca V2.8': "const VERSION='2.8.0'" in brand,
    'caché compartida V2.8': "el-errante-v2-8-brand-canon-1" in brand and 'const CACHE=BRAND.cache' in sw,
    'datos prefieren fuente materializada': "requestText('assets/generated/data-v28.js',false)" in data,
    'aplicación prefiere fuente materializada': "requestText('assets/generated/app-v28.js',false)" in app,
    'preproducción prefiere fuente materializada': "requestText('assets/generated/preprod-v28.js',false)" in preprod,
    'datos normalizados antes de renderizar': 'BRAND.applyToData(window.EE_DATA)' in data,
    'DOM usa manifiesto compartido': 'BRAND.applyToDom' in host and 'const VISUALS=' not in host,
    'service worker importa manifiesto': "importScripts('./assets/brand-canon-v28.js')" in sw,
    'service worker reconoce fuentes generadas': 'const GENERATED=' in sw and 'assets/generated/data-v28.js' in sw,
    'materializador declara tres salidas': all(name in materializer for name in ('data-v28.js','app-v28.js','preprod-v28.js')),
    'release declarada V2.8': 'version=2.8.0' in deploy and 'cache=el-errante-v2-8-brand-canon-1' in deploy,
    'paquete declarado V2.8': '"version": "2.8.0"' in package,
    'panel integral identificado V2.8': '· V2.8' in admin,
    'servidor local identificado V2.8': 'EL ERRANTE LOCAL V2.8' in server and "range(8787, 8801)" in server,
    'lanzador materializa y ejecuta barreras': 'materializar_fuentes_locales_v28.py' in launcher and all(marker in launcher for marker in ('verificar_demo.py','verificar_canon_marca_v28.py','verificar_activos_hq_v28.py','verificar_modulos_v28.py')),
    'README vigente': '# El Errante V2.8' in readme,
    'changelog vigente': '## [2.8.0]' in changelog,
    'finanzas V2.7 conservadas': 'assets/finance-v27.js' in admin and 'id="finance-v27"' in admin,
    'abastecimiento V2.5 conservado': 'assets/procurement-v25.js' in admin and 'id="procurement-v25"' in admin,
}
for label, ok in required_markers.items():
    if not ok: ISSUES.append(f'Falla canónica: {label}')

manifest_path = ROOT / 'assets/generated/manifest-v28.json'
if manifest_path.is_file():
    try:
        manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
        outputs = manifest.get('outputs', [])
        expected_paths = {
            'assets/generated/data-v28.js','assets/generated/app-v28.js','assets/generated/preprod-v28.js'
        }
        if manifest.get('version') != '2.8.0':
            ISSUES.append('El manifiesto generado no declara version=2.8.0')
        if {item.get('path') for item in outputs} != expected_paths:
            ISSUES.append('El manifiesto generado no contiene exactamente las tres fuentes V2.8')
        for item in outputs:
            path = ROOT / str(item.get('path', ''))
            if not path.is_file() or path.stat().st_size != item.get('bytes'):
                ISSUES.append(f"Fuente generada ausente o con tamaño inconsistente: {item.get('path')}")
    except (json.JSONDecodeError, TypeError) as error:
        ISSUES.append(f'Manifiesto generado inválido: {error}')

for generated in GENERATED_SOURCES[:3]:
    text = read(generated)
    if 'Fuente materializada de forma determinista' not in text:
        ISSUES.append(f'Fuente generada sin encabezado determinista: {generated}')
    if '[... ELLIPSIZATION ...]' in text:
        ISSUES.append(f'Fuente generada truncada: {generated}')

for product_id in PRODUCT_IDS:
    if f'"{product_id}"' not in products and f"'{product_id}'" not in products:
        ISSUES.append(f'Catálogo incompleto: falta {product_id}')
    if product_id not in brand:
        ISSUES.append(f'Manifiesto visual sin producto: {product_id}')

for name in CANONICAL_WEBPS:
    path = require(f'assets/images/brand-final/{name}', 'Activo WebP canónico')
    if path.is_file():
        raw = path.read_bytes()
        if len(raw) < 100_000 or raw[:4] != b'RIFF' or raw[8:12] != b'WEBP':
            ISSUES.append(f'WebP inválido o degradado: {path.relative_to(ROOT)}')

for obsolete in OBSOLETE_ACTIVE_FILES:
    if (ROOT / obsolete).exists(): ISSUES.append(f'Archivo heredado aún activo: {obsolete}')

for html in sorted(ROOT.glob('*.html')):
    content = html.read_text(encoding='utf-8', errors='ignore')
    for forbidden in ('brand-final-editorial.js','brand-final-products-a.js','brand-final-products-b.js','brand-final-products-c.js'):
        if forbidden in content: ISSUES.append(f'{html.name} carga overlay visual obsoleto: {forbidden}')
    refs = re.findall(r'(?:href|src|poster|action)=["\']([^"\']+)["\']', content, re.I)
    refs += [item.strip().split(' ',1)[0] for group in re.findall(r'srcset=["\']([^"\']+)["\']', content, re.I) for item in group.split(',')]
    for ref in refs:
        clean = clean_reference(ref)
        if clean and not (ROOT / clean).exists(): ISSUES.append(f'{html.name}: referencia faltante {ref}')

if 'url: ""' not in runtime_config or 'publishableKey: ""' not in runtime_config:
    ISSUES.append('La edición local no conserva Supabase inactivo.')
if re.search(r'\bservice_role\b|postgres://|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----', '\n'.join([brand,data,app,preprod,host,sw,runtime_config]), re.I):
    ISSUES.append('Se detectó material sensible o una credencial privilegiada en el runtime.')

print('EL ERRANTE V2.8 — BARRERA INTEGRAL')
print('=' * 42)
print(f'Páginas públicas: {len(PUBLIC_PAGES)}')
print(f'Módulos internos: {len(INTERNAL_PAGES)}')
print(f'Productos: {len(PRODUCT_IDS)}')
print(f'WebP canónicos: {len(CANONICAL_WEBPS)}')
print(f'Fuentes materializadas: {len(GENERATED_SOURCES) - 1}')
print(f'Archivos obligatorios comprobados: {len(CHECKED)}')
print(f'Problemas: {len(ISSUES)}')
if ISSUES:
    for issue in ISSUES: print('-', issue)
    sys.exit(1)
print('RESULTADO: PASS')
