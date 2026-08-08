#!/usr/bin/env python3
from pathlib import Path
import json
import sys

ROOT=Path(__file__).resolve().parents[1]
ISSUES=[]


def require(condition,message):
    if not condition:
        ISSUES.append(message)


def text(path):
    file=ROOT/path
    require(file.exists(),f'Falta {path}')
    return file.read_text(encoding='utf-8') if file.exists() else ''


def main():
    model_path=ROOT/'documentacion/modelo-oferta-v09.json'
    require(model_path.exists(),'Falta el modelo de oferta v0.9')
    model=json.loads(model_path.read_text(encoding='utf-8')) if model_path.exists() else {}
    require(len(model.get('products',[]))==11,'Studio debe consumir 11 productos')

    studio=text(Path('studio.html'))
    control=text(Path('control.html'))
    module=text(Path('assets/offer-studio-v09.js'))
    adapter=text(Path('assets/offer-governance-v09.js'))
    styles=text(Path('assets/offer-studio-v09.css'))
    worker=text(Path('service-worker.js'))

    for marker in ['assets/offer-studio-v09.css','assets/offer-studio-v09.js','assets/offer-governance-v09.js']:
        require(marker in studio,f'Studio no enlaza {marker}')
    require('href="studio.html"' in control,'Panel de Control no enlaza la superficie de datos maestros')
    for marker in ['assets/offer-studio-v09.css','assets/offer-studio-v09.js','assets/offer-governance-v09.js']:
        require(marker not in control,f'Panel de Control V3.0 no debe cargar {marker}')

    require("documentacion/modelo-oferta-v09.json" in module,'El módulo no consume el modelo canónico de oferta')
    require("ee_v09_offer_governance" in module,'Falta persistencia local separada de gobierno de oferta')
    require("data-offer-studio-v09" in module,'Falta contrato visual de Studio de Oferta')
    require("EE_OFFER_STUDIO_V09" in module,'Falta contrato de estado para pruebas funcionales')
    require("window.EE_DATA" not in module,'Studio de Oferta no debe mutar el catálogo público')
    require("localStorage" in adapter,'El adaptador debe preservar decisiones locales')
    require(len(styles)>1000,'La capa visual de Studio parece incompleta')

    for asset in [
        './assets/offer-studio-v09.js','./assets/offer-studio-v09.css',
        './assets/offer-governance-v09.js','./documentacion/modelo-oferta-v09.json'
    ]:
        require(asset in worker,f'La caché integral no incluye {asset}')

    public_pages=['index.html','tienda.html','producto.html','checkout.html']
    for page in public_pages:
        content=text(Path(page))
        require('offer-studio-v09.js' not in content,f'{page} no debe cargar el módulo interno de oferta')

    if ISSUES:
        print('STUDIO DE OFERTA V0.9: FAIL')
        for issue in ISSUES:
            print('-',issue)
        sys.exit(1)

    print('STUDIO DE OFERTA V0.9: PASS')
    print('productos=11')
    print('persistencia=local_separada')
    print('tienda_publica=sin_mutaciones')
    print('studio=dueno_gobierno_oferta')
    print('control_v30=sin_acoplamiento_oferta')


if __name__=='__main__':
    main()
