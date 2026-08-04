#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODEL = ROOT / 'documentacion' / 'modelo-oferta-v09.json'
REQUIRED_GATES = {
    'concepto_y_rol','narrativa_comercial','visual_editorial','formula',
    'costo_unitario','precio_final','margen','empaque_fisico','etiqueta',
    'sanitario','vida_util','conservacion_validada','fotografia_fisica',
    'capacidad_produccion','inventario_real','cobertura_real','instrucciones_validadas'
}
EXPECTED_PRODUCTS = 11
EXPECTED_VARIANTS = 14


def fail(message: str) -> None:
    raise SystemExit(f'ERROR: {message}')


def main() -> None:
    if not MODEL.exists():
        fail(f'No existe {MODEL}')
    data = json.loads(MODEL.read_text(encoding='utf-8'))
    if data.get('status') != 'propuesta_para_validacion_humana':
        fail('El estado debe dejar explícita la validación humana pendiente.')
    if 'demostración' not in data.get('disclaimer',''):
        fail('Falta advertencia de datos de demostración.')
    products = data.get('products', [])
    if len(products) != EXPECTED_PRODUCTS:
        fail(f'Se esperaban {EXPECTED_PRODUCTS} productos y hay {len(products)}.')
    ids = [p.get('id') for p in products]
    if len(ids) != len(set(ids)):
        fail('Hay IDs de producto duplicados.')
    variants = [v for p in products for v in p.get('variants', [])]
    if len(variants) != EXPECTED_VARIANTS:
        fail(f'Se esperaban {EXPECTED_VARIANTS} variantes y hay {len(variants)}.')
    skus = [v.get('sku') for v in variants]
    if len(skus) != len(set(skus)):
        fail('Hay SKU duplicados.')
    for product in products:
        missing = REQUIRED_GATES - set(product.get('gates', {}))
        if missing:
            fail(f"{product.get('id')} no contiene puertas: {sorted(missing)}")
        if product.get('priority') not in {'alta','media','baja'}:
            fail(f"Prioridad inválida en {product.get('id')}")
        if product.get('proposed_wave') not in {'ola_1_nucleo','ola_2_extension'}:
            fail(f"Ola inválida en {product.get('id')}")
        for variant in product.get('variants', []):
            if 'demo_price_cop' not in variant or 'demo_stock' not in variant:
                fail(f"Variante incompleta en {product.get('id')}")
            if 'validated_price_cop' in variant or 'real_stock' in variant:
                fail(f"La matriz no debe inventar datos reales en {product.get('id')}")
    wave_1 = data.get('waves',{}).get('ola_1_nucleo',{}).get('products',[])
    wave_2 = data.get('waves',{}).get('ola_2_extension',{}).get('products',[])
    if set(wave_1 + wave_2) != set(ids):
        fail('Las olas no cubren exactamente los productos del modelo.')
    if set(wave_1) & set(wave_2):
        fail('Un producto aparece en ambas olas.')
    print('MATRIZ MAESTRA DE OFERTA V0.9: PASS')
    print(f'productos={len(products)}')
    print(f'variantes={len(variants)}')
    print(f'ola_1={len(wave_1)}')
    print(f'ola_2={len(wave_2)}')
    print(f'sku_unicos={len(set(skus))}')
    print('precios_e_inventarios=solo_demostracion')
    print('validacion_humana=pendiente')

if __name__ == '__main__':
    main()
