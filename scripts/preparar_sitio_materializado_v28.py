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

DATA_TAG = re.compile(r'<script\s+src=["\']assets/data\.js["\']\s*></script>', re.I)
APP_TAG = re.compile(r'<script\s+src=["\']assets/app\.js["\']\s*></script>', re.I)
PREPROD_TAG = re.compile(r'<script\s+src=["\']assets/preprod\.js["\']\s*></script>', re.I)
BRAND_TAG = re.compile(r'<script\s+src=["\']assets/brand-canon-v28\.js["\']\s*></script>', re.I)
PRODUCTS_TAG = re.compile(r'<script\s+src=["\']assets/products-v6\.js["\']\s*></script>', re.I)

DATA_SEQUENCE = ('<script src="assets/brand-canon-v28.js"></script>''<script src="assets/generated/data-v28.js"></script>''<script src="assets/products-v6.js"></script>''<script src="assets/data-finalize-v28.js"></script>')
APP_SEQUENCE = ('<script src="assets/generated/app-v28.js"></script>''<script src="assets/app-contract-v28.js"></script>')
PREPROD_SEQUENCE = ('<script src="assets/generated/preprod-v28.js"></script>''<script src="assets/preprod-contract-v28.js"></script>')

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

def patch_html(target: Path) -> dict[str, int]:
    counters = {'data':0,'app':0,'preprod':0,'pages':0}
    for html in sorted(target.glob('*.html')):
        content=html.read_text(encoding='utf-8'); original=content
        if DATA_TAG.search(content):
            content=BRAND_TAG.sub('',content); content=PRODUCTS_TAG.sub('',content); content,count=DATA_TAG.subn(DATA_SEQUENCE,content); counters['data']+=count
        content,count=APP_TAG.subn(APP_SEQUENCE,content); counters['app']+=count
        content,count=PREPROD_TAG.subn(PREPROD_SEQUENCE,content); counters['preprod']+=count
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

def verify_surface(target: Path,counters:dict[str,int])->None:
    required=['index.html','tienda.html','admin.html','activacion.html','service-worker.js','manifest.webmanifest','robots.txt','sitemap.xml','deploy-version.txt','historical-cost-version.txt','inventory-valuation-version.txt','assets/brand-canon-v28.js','assets/generated/data-v28.js','assets/generated/app-v28.js','assets/generated/preprod-v28.js','assets/generated/manifest-v28.json','assets/data-finalize-v28.js','assets/app-contract-v28.js','assets/preprod-contract-v28.js','assets/finance-v27.js','assets/procurement-v25.js','assets/images/brand-final/home-hero.webp','assets/images/brand-final/producto-margherita.webp']
    missing=[path for path in required if not (target/path).is_file()]
    if missing: raise SystemExit(f'Superficie materializada incompleta: {missing}')
    forbidden=['archive','assets/source','assets/chunks','assets/data.js','assets/app.js','assets/preprod.js','assets/brand-final-editorial.js','assets/brand-final-products-a.js','assets/brand-final-products-b.js','assets/brand-final-products-c.js']
    present=[path for path in forbidden if (target/path).exists()]
    if present: raise SystemExit(f'Archivos no ejecutables presentes en la superficie: {present}')
    manifest=json.loads((target/'assets/generated/manifest-v28.json').read_text(encoding='utf-8'))
    if manifest.get('version')!=VERSION or len(manifest.get('outputs',[]))!=3: raise SystemExit('El manifiesto de fuentes materializadas no corresponde a V2.8')
    site_manifest={'version':VERSION,'mode':'materialized-no-base64-runtime','html_pages':len(list(target.glob('*.html'))),'patched_pages':counters['pages'],'data_replacements':counters['data'],'app_replacements':counters['app'],'preprod_replacements':counters['preprod'],'contains_source_base64':False,'contains_legacy_overlays':False}
    (target/'materialized-site-v28.json').write_text(json.dumps(site_manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def main()->int:
    parser=argparse.ArgumentParser(); parser.add_argument('--output',default='.local_site'); args=parser.parse_args(); target=Path(args.output)
    if not target.is_absolute(): target=ROOT/target
    target=target.resolve()
    if target==ROOT or ROOT not in target.parents: raise SystemExit('La salida debe ser un subdirectorio del proyecto')
    generated=ROOT/'assets/generated/manifest-v28.json'
    if not generated.is_file(): raise SystemExit('Primero ejecuta scripts/materializar_fuentes_locales_v28.py')
    copy_surface(target); counters=patch_html(target); verify_surface(target,counters)
    print('SITIO MATERIALIZADO V2.8 PREPARADO'); print(f'- salida: {target.relative_to(ROOT)}'); print(f"- páginas modificadas: {counters['pages']}"); print('- loaders Base64 activos: 0'); return 0

if __name__=='__main__': raise SystemExit(main())
