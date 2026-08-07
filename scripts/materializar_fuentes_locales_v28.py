#!/usr/bin/env python3
"""Materializa fuentes históricas Base64 en JavaScript legible y verificable."""
from __future__ import annotations

import base64
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets/source'
OUTPUT = ROOT / 'assets/generated'
VERSION = '2.8.0'

GROUPS = {
    'data-v28.js': [
        'v040-data-001.b64','v040-data-002.b64','v040-data-003.b64','v040-data-004.b64'
    ],
    'app-v28.js': [
        'v040-app-001.b64','v040-app-002.b64','v040-app-003.b64',
        'v040-app-004.b64','v040-app-005.b64','v040-app-006.b64'
    ],
    'preprod-v28.js': [
        'v040-preprod-001a.b64','v040-preprod-001b.b64','v040-preprod-001c.b64',
        'v040-preprod-001d.b64','v040-preprod-002.b64','v040-preprod-003.b64'
    ],
}
EXPECTED_MARKERS = {
    'data-v28.js': ('window.EE_DATA',),
    'app-v28.js': ('window.EE', 'addToCart'),
    'preprod-v28.js': (),
}


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def materialize(output_name: str, parts: list[str]) -> dict:
    encoded_chunks: list[str] = []
    sources: list[dict] = []
    for name in parts:
        path = SOURCE / name
        if not path.is_file():
            raise SystemExit(f'Falta fragmento fuente: {path.relative_to(ROOT)}')
        raw = path.read_bytes()
        text = raw.decode('ascii')
        compact = re.sub(r'\s+', '', text)
        if not compact or not re.fullmatch(r'[A-Za-z0-9+/]*={0,2}', compact):
            raise SystemExit(f'Fragmento Base64 inválido: {path.relative_to(ROOT)}')
        encoded_chunks.append(compact)
        sources.append({'path': str(path.relative_to(ROOT)), 'bytes': len(raw), 'sha256': sha256(raw)})

    encoded = ''.join(encoded_chunks)
    try:
        decoded = base64.b64decode(encoded, validate=True)
        source = decoded.decode('utf-8')
    except Exception as error:
        raise SystemExit(f'No se pudo materializar {output_name}: {error}') from error

    if '[... ELLIPSIZATION ...]' in source:
        raise SystemExit(f'{output_name} contiene marcador de truncación')
    for marker in EXPECTED_MARKERS[output_name]:
        if marker not in source:
            raise SystemExit(f'{output_name} no contiene contrato esperado: {marker}')

    header = (
        f'/* EL ERRANTE V{VERSION} · Fuente materializada de forma determinista.\n'
        f'   No editar directamente: regenerar con scripts/materializar_fuentes_locales_v28.py. */\n'
    )
    payload = (header + source.rstrip() + '\n').encode('utf-8')
    target = OUTPUT / output_name
    temporary = target.with_suffix(target.suffix + '.tmp')
    temporary.write_bytes(payload)
    temporary.replace(target)
    return {
        'path': str(target.relative_to(ROOT)),
        'bytes': len(payload),
        'sha256': sha256(payload),
        'decoded_source_sha256': sha256(decoded),
        'parts': sources,
    }


def main() -> int:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    outputs = [materialize(name, parts) for name, parts in GROUPS.items()]
    manifest = {
        'version': VERSION,
        'generator': 'scripts/materializar_fuentes_locales_v28.py',
        'outputs': outputs,
    }
    manifest_path = OUTPUT / 'manifest-v28.json'
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('FUENTES LOCALES V2.8 MATERIALIZADAS')
    for item in outputs:
        print(f"- {item['path']}: {item['bytes']} bytes · {item['sha256']}")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
