from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def replace(path,old,new,required=True):
    target=ROOT/path
    text=target.read_text(encoding='utf-8')
    if old not in text:
        if required: raise SystemExit(f'{path}: falta {old!r}')
        return
    target.write_text(text.replace(old,new),encoding='utf-8')

replace('assets/host-mode.js','PUBLIC_VERSION="2.3.0"','PUBLIC_VERSION="2.4.0"')
replace('assets/host-mode.js','ACTIVE_CACHE="el-errante-v2-3-0"','ACTIVE_CACHE="el-errante-v2-4-0"')
replace('assets/commerce-config-v14.js','version: "2.3.0"','version: "2.4.0"')
replace('assets/admin-v15.js','Administración V2.3','Administración V2.4')
replace('assets/admin-v15.js','V2.0, V2.1, V2.2 y V2.3.','V2.0, V2.1, V2.2, V2.3 y V2.4.')

sw=ROOT/'service-worker.js'
text=sw.read_text(encoding='utf-8')
text=text.replace("const CACHE = 'el-errante-v2-3-0';","const CACHE = 'el-errante-v2-4-0';")
text=text.replace("'./assets/activation-v20.js','./assets/activation-v23.js','./assets/daily-ops-v21.js'","'./assets/activation-v20.js','./assets/activation-v23.js','./assets/activation-v24.js','./assets/daily-ops-v21.js'")
text=text.replace("'./assets/materials-data-v23.js','./assets/materials-v23.js','./assets/host-mode.js'","'./assets/materials-data-v23.js','./assets/materials-v23.js','./assets/measurement-v24.js','./assets/host-mode.js'")
text=text.replace("'./assets/production-v22.css','./assets/materials-v23.css','./assets/operations-v16.js'","'./assets/production-v22.css','./assets/materials-v23.css','./assets/measurement-v24.css','./assets/operations-v16.js'")
text=text.replace("'./backend/supabase/schema-v22.sql','./backend/supabase/schema-v23.sql'","'./backend/supabase/schema-v22.sql','./backend/supabase/schema-v23.sql','./backend/supabase/schema-v24.sql'")
for marker in ('activation-v24.js','measurement-v24.js','measurement-v24.css','schema-v24.sql'):
    if marker not in text: raise SystemExit(f'service-worker.js no incorporó {marker}')
sw.write_text(text,encoding='utf-8')

(ROOT/'deploy-version.txt').write_text('EL ERRANTE PUBLIC RELEASE\nversion=2.4.0\ndeploy_source=main\nrelease_commit=resolved-by-github-actions\ncache=el-errante-v2-4-0\nupdated=resolved-by-github-actions\n',encoding='utf-8')

scripts=[
 'scripts/verificar_release_v13.py','scripts/verificar_operacion_v14.py','scripts/verificar_backend_v15.py',
 'scripts/verificar_operacion_v16.py','scripts/verificar_contenido_v17.py','scripts/verificar_experiencia_compra_v18.py',
 'scripts/verificar_confianza_v19.py','scripts/verificar_operacion_diaria_v21.py','scripts/verificar_produccion_v22.py',
 'scripts/verificar_materiales_v23.py'
]
for path in scripts:
    target=ROOT/path;text=target.read_text(encoding='utf-8')
    text=text.replace('PUBLIC_VERSION="2.3.0"','PUBLIC_VERSION="2.4.0"')
    text=text.replace('ACTIVE_CACHE="el-errante-v2-3-0"','ACTIVE_CACHE="el-errante-v2-4-0"')
    text=text.replace('el-errante-v2-3-0','el-errante-v2-4-0')
    text=text.replace('version=2.3.0','version=2.4.0')
    text=text.replace('cache=el-errante-v2-3-0','cache=el-errante-v2-4-0')
    text=text.replace('version: "2.3.0"','version: "2.4.0"')
    text=text.replace('Operación diaria, producción, materiales y despacho · V2.3','Operación, producción, materiales, medición, compras y despacho · V2.4')
    text=text.replace('Activación V2.3','Activación V2.4')
    text=text.replace('Iteración 10','Iteración 11')
    target.write_text(text,encoding='utf-8')
