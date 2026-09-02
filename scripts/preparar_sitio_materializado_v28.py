#!/usr/bin/env python3
"""Construye la superficie ejecutable V2.8 sin loaders Base64 ni archivos históricos."""
from __future__ import annotations

import argparse
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION = '2.8.0'
PUBLIC_BASE = 'https://arendon7.github.io/ELERRANTE'

DATA_TAG = re.compile(r'<script\s+src=["\']assets/data\.js["\']\s*></script>', re.I)
APP_TAG = re.compile(r'<script\s+src=["\']assets/app\.js["\']\s*></script>', re.I)
PREPROD_TAG = re.compile(r'<script\s+src=["\']assets/preprod\.js["\']\s*></script>', re.I)
BRAND_TAG = re.compile(r'<script\s+src=["\']assets/brand-canon-v28\.js["\']\s*></script>', re.I)
PRODUCTS_TAG = re.compile(r'<script\s+src=["\']assets/products-v6\.js["\']\s*></script>', re.I)
CANONICAL_TAG = re.compile(r'<link\s+rel=["\']canonical["\'][^>]*>', re.I)
ROBOTS_TAG = re.compile(r'<meta\s+name=["\']robots["\'][^>]*>', re.I)
HEAD_END = re.compile(r'</head>', re.I)

DATA_SEQUENCE = ('<script src="assets/brand-canon-v28.js"></script>''<script src="assets/generated/data-v28.js"></script>''<script src="assets/products-v6.js"></script>''<script src="assets/data-finalize-v28.js"></script>')
APP_SEQUENCE = ('<script src="assets/generated/app-v28.js"></script>''<script src="assets/app-contract-v28.js"></script>')
PREPROD_SEQUENCE = ('<script src="assets/generated/preprod-v28.js"></script>''<script src="assets/preprod-contract-v28.js"></script>')

INDEXABLE_CANONICALS = {
    'index.html': f'{PUBLIC_BASE}/',
    'tienda.html': f'{PUBLIC_BASE}/tienda.html',
    'en-casa.html': f'{PUBLIC_BASE}/en-casa.html',
    'en-movimiento.html': f'{PUBLIC_BASE}/en-movimiento.html',
    'caso-evento.html': f'{PUBLIC_BASE}/caso-evento.html',
    'metodo.html': f'{PUBLIC_BASE}/metodo.html',
    'historia.html': f'{PUBLIC_BASE}/historia.html',
    'juan-david-ocampo.html': f'{PUBLIC_BASE}/juan-david-ocampo.html',
    'bitacora.html': f'{PUBLIC_BASE}/bitacora.html',
    'recetas.html': f'{PUBLIC_BASE}/recetas.html',
    'herramientas.html': f'{PUBLIC_BASE}/herramientas.html',
    'cobertura.html': f'{PUBLIC_BASE}/cobertura.html',
    'ayuda.html': f'{PUBLIC_BASE}/ayuda.html',
    'legal.html': f'{PUBLIC_BASE}/legal.html',
}

# Query-driven detail templates are intentionally noindex until each entity has
# a stable crawlable URL + canonical. Transaction/account/offline/internal
# presentation surfaces are not organic acquisition destinations.
NOINDEX_SURFACES = {
    'producto.html',
    'articulo.html',
    'receta.html',
    'checkout.html',
    'cuenta.html',
    'offline.html',
    'presentacion.html',
}

HOME_SCHEMA = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Organization',
            '@id': f'{PUBLIC_BASE}/#organization',
            'name': 'El Errante',
            'url': f'{PUBLIC_BASE}/',
            'logo': f'{PUBLIC_BASE}/assets/images/brand-v4/pizzaiolo-mark-v4.webp',
        },
        {
            '@type': 'WebSite',
            '@id': f'{PUBLIC_BASE}/#website',
            'url': f'{PUBLIC_BASE}/',
            'name': 'El Errante',
            'publisher': {'@id': f'{PUBLIC_BASE}/#organization'},
            'inLanguage': 'es-CO',
        },
    ],
}


def asset_ignore(directory: str, names: list[str]) -> set[str]:
    current = Path(directory).resolve(); ignored: set[str] = set()
    if current == (ROOT / 'assets').resolve(): ignored.update(name for name in ('source','chunks','data.js','app.js','preprod.js') if name in names)
    ignored.update(name for name in names if name in {'.DS_Store','__pycache__'}); return ignored


def copy_surface(target: Path) -> None:
    if target.exists(): shutil.rmtree(target)
    target.mkdir(parents=True)
    for source in sorted(ROOT.glob('*.html')): shutil.copy2(source, target / source.name)
    for name in ('service-worker.js','manifest.webmanifest','robots.txt','sitemap.xml','deploy-version.txt','historical-cost-version.txt','inventory-valuation-version.txt','demo-manifest.json','.nojekyll'):
        source = ROOT / name
        if source.exists(): shutil.copy2(source, target / name)
    shutil.copytree(ROOT / 'assets', target / 'assets', ignore=asset_ignore)
    for directory in ('backend','documentacion'):
        source = ROOT / directory
        if source.is_dir(): shutil.copytree(source, target / directory, ignore=shutil.ignore_patterns('.DS_Store','__pycache__'))


def add_head_markup(content: str, markup: str) -> str:
    if not HEAD_END.search(content):
        raise SystemExit('HTML sin cierre </head> durante materialización SEO')
    return HEAD_END.sub(markup + '</head>', content, count=1)


def patch_seo(html: Path, content: str) -> str:
    canonical = INDEXABLE_CANONICALS.get(html.name)
    if canonical:
        tag = f'<link rel="canonical" href="{canonical}">'
        if CANONICAL_TAG.search(content):
            content = CANONICAL_TAG.sub(tag, content, count=1)
        else:
            content = add_head_markup(content, tag)

    if html.name in NOINDEX_SURFACES:
        tag = '<meta name="robots" content="noindex,follow">'
        if ROBOTS_TAG.search(content):
            content = ROBOTS_TAG.sub(tag, content, count=1)
        else:
            content = add_head_markup(content, tag)

    if html.name == 'index.html' and 'data-seo-schema="v4"' not in content:
        payload = json.dumps(HOME_SCHEMA, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
        content = add_head_markup(content, f'<script type="application/ld+json" data-seo-schema="v4">{payload}</script>')

    return content


def patch_html(target: Path) -> dict[str, int]:
    counters = {'data':0,'app':0,'preprod':0,'pages':0,'seo_pages':0}
    for html in sorted(target.glob('*.html')):
        content=html.read_text(encoding='utf-8'); original=content
        if DATA_TAG.search(content):
            content=BRAND_TAG.sub('',content); content=PRODUCTS_TAG.sub('',content); content,count=DATA_TAG.subn(DATA_SEQUENCE,content); counters['data']+=count
        content,count=APP_TAG.subn(APP_SEQUENCE,content); counters['app']+=count
        content,count=PREPROD_TAG.subn(PREPROD_SEQUENCE,content); counters['preprod']+=count
        before_seo=content
        content=patch_seo(html,content)
        if content!=before_seo: counters['seo_pages']+=1
        if content!=original: counters['pages']+=1; html.write_text(content,encoding='utf-8')
    if counters['data']==0 or counters['app']==0 or counters['preprod']==0: raise SystemExit(f'No se sustituyeron todos los loaders esperados: {counters}')
    for html in target.glob('*.html'):
        content=html.read_text(encoding='utf-8')
        for forbidden in ('assets/data.js','assets/app.js','assets/preprod.js'):
            if f'src="{forbidden}"' in content or f"src='{forbidden}'" in content: raise SystemExit(f'{html.name} conserva loader heredado: {forbidden}')
        if 'assets/generated/data-v28.js' in content:
            expected=('assets/brand-canon-v28.js','assets/products-v6.js','assets/data-finalize-v28.js')
            if not all(marker in content for marker in expected): raise SystemExit(f'{html.name} tiene una secuencia materializada incompleta')
    return counters


def verify_seo_surface(target: Path) -> None:
    for filename, canonical in INDEXABLE_CANONICALS.items():
        content=(target/filename).read_text(encoding='utf-8')
        expected=f'<link rel="canonical" href="{canonical}">'
        if expected not in content: raise SystemExit(f'{filename} no materializó canonical esperado')
        if 'name="robots" content="noindex' in content: raise SystemExit(f'{filename} no debe quedar noindex')

    for filename in NOINDEX_SURFACES:
        content=(target/filename).read_text(encoding='utf-8')
        if '<meta name="robots" content="noindex,follow">' not in content: raise SystemExit(f'{filename} no materializó noindex')

    home=(target/'index.html').read_text(encoding='utf-8')
    if 'type="application/ld+json" data-seo-schema="v4"' not in home: raise SystemExit('Home no materializó JSON-LD base')
    if f'"@id":"{PUBLIC_BASE}/#website"' not in home: raise SystemExit('Home JSON-LD no declara WebSite canónico')


def verify_surface(target: Path,counters:dict[str,int])->None:
    required=['index.html','tienda.html','admin.html','activacion.html','service-worker.js','manifest.webmanifest','robots.txt','sitemap.xml','deploy-version.txt','historical-cost-version.txt','inventory-valuation-version.txt','assets/brand-canon-v28.js','assets/generated/data-v28.js','assets/generated/app-v28.js','assets/generated/preprod-v28.js','assets/generated/manifest-v28.json','assets/data-finalize-v28.js','assets/app-contract-v28.js','assets/preprod-contract-v28.js','assets/finance-v27.js','assets/procurement-v25.js','assets/images/brand-final/home-hero.webp','assets/images/brand-final/producto-margherita.webp']
    missing=[path for path in required if not (target/path).is_file()]
    if missing: raise SystemExit(f'Superficie materializada incompleta: {missing}')
    forbidden=['archive','assets/source','assets/chunks','assets/data.js','assets/app.js','assets/preprod.js','assets/brand-final-editorial.js','assets/brand-final-products-a.js','assets/brand-final-products-b.js','assets/brand-final-products-c.js']
    present=[path for path in forbidden if (target/path).exists()]
    if present: raise SystemExit(f'Archivos no ejecutables presentes en la superficie: {present}')
    manifest=json.loads((target/'assets/generated/manifest-v28.json').read_text(encoding='utf-8'))
    if manifest.get('version')!=VERSION or len(manifest.get('outputs',[]))!=3: raise SystemExit('El manifiesto de fuentes materializadas no corresponde a V2.8')
    verify_seo_surface(target)
    site_manifest={'version':VERSION,'mode':'materialized-no-base64-runtime','html_pages':len(list(target.glob('*.html'))),'patched_pages':counters['pages'],'seo_patched_pages':counters['seo_pages'],'data_replacements':counters['data'],'app_replacements':counters['app'],'preprod_replacements':counters['preprod'],'contains_source_base64':False,'contains_legacy_overlays':False}
    (target/'materialized-site-v28.json').write_text(json.dumps(site_manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')


def main()->int:
    parser=argparse.ArgumentParser(); parser.add_argument('--output',default='.local_site'); args=parser.parse_args(); target=Path(args.output)
    if not target.is_absolute(): target=ROOT/target
    target=target.resolve()
    if target==ROOT or ROOT not in target.parents: raise SystemExit('La salida debe ser un subdirectorio del proyecto')
    generated=ROOT/'assets/generated/manifest-v28.json'
    if not generated.is_file(): raise SystemExit('Primero ejecuta scripts/materializar_fuentes_locales_v28.py')
    copy_surface(target); counters=patch_html(target); verify_surface(target,counters)
    print('SITIO MATERIALIZADO V2.8 PREPARADO'); print(f'- salida: {target.relative_to(ROOT)}'); print(f"- páginas modificadas: {counters['pages']}"); print(f"- páginas SEO materializadas: {counters['seo_pages']}"); print('- loaders Base64 activos: 0'); return 0

if __name__=='__main__': raise SystemExit(main())
