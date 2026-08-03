#!/usr/bin/env python3
"""Diferencia Historia, Nosotros y Demo integral, y retira un archivo huérfano."""

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def read(relative: str) -> str:
    return (ROOT / relative).read_text(encoding="utf-8")


def write(relative: str, content: str) -> None:
    (ROOT / relative).write_text(content, encoding="utf-8")


def replace_title(content: str, title: str) -> str:
    return re.sub(r"<title>.*?</title>", f"<title>{title}</title>", content, count=1, flags=re.S | re.I)


def replace_description(content: str, description: str) -> str:
    pattern = r'<meta\s+name="description"\s+content="[^"]*"\s*/?>'
    replacement = f'<meta name="description" content="{description}">'
    if re.search(pattern, content, flags=re.I):
        return re.sub(pattern, replacement, content, count=1, flags=re.I)
    return content.replace('<meta charset="utf-8">', f'<meta charset="utf-8">{replacement}', 1)


# Historia: relato de marca y puente explícito hacia las personas.
historia = read("historia.html")
historia = replace_title(historia, "Historia y búsqueda · El Errante")
historia = replace_description(
    historia,
    "El origen de El Errante: una búsqueda alrededor de la masa, el fuego y el territorio desarrollada desde Colombia.",
)
if 'id="personas-proyecto"' not in historia:
    section = '''
<section class="section section-paper" id="personas-proyecto"><div class="container split"><div><p class="eyebrow">Las personas detrás de la búsqueda</p><h2>La historia explica el camino. Nosotros presenta a quienes lo recorren.</h2><p class="lead" style="margin-top:22px">Conoce los roles fundadores, las responsabilidades del proyecto y la estructura humana que convierte las pruebas de masa, producto y experiencia en una operación real.</p><div class="button-row"><a class="btn btn-primary" href="nosotros.html">Conocer personas y roles</a><a class="btn btn-outline" href="equipo.html">Abrir demo integral</a></div></div><div class="visual-card"><img src="assets/images/v040/v040-manos-masa.svg" alt="Trabajo colectivo alrededor de la masa"></div></div></section>
'''
    historia = historia.replace("</main>", section + "</main>", 1)
write("historia.html", historia)

# Nosotros: personas, roles y modelo de equipo; no vuelve a contar la historia completa.
nosotros = read("nosotros.html")
nosotros = replace_title(nosotros, "Personas y proyecto · El Errante")
nosotros = replace_description(
    nosotros,
    "Las personas, roles y responsabilidades que construyen El Errante como marca, producto y operación.",
)
nosotros = nosotros.replace(
    '<p class="eyebrow" style="color:var(--wheat)">Origen y equipo</p>',
    '<p class="eyebrow" style="color:var(--wheat)">Personas y proyecto</p>',
)
nosotros = nosotros.replace(
    '<h1>Antes de encontrar una respuesta, encontramos una pregunta.</h1>',
    '<h1>Una búsqueda compartida necesita responsabilidades claras.</h1>',
)
nosotros = nosotros.replace(
    '<p class="lead">Tres amigos empezaron buscando una mejor pizza. Terminaron desarrollando una masa propia, productos para casa y una pizzería móvil.</p>',
    '<p class="lead">Esta página presenta las personas, los roles y las capacidades que sostienen la marca. El relato completo del origen permanece en Historia.</p>',
)
if 'href="historia.html"' not in nosotros:
    nosotros = nosotros.replace(
        "</main>",
        '<section class="section section-paper"><div class="container" style="text-align:center"><p class="eyebrow">Relato de marca</p><h2>¿Cómo empezó la búsqueda?</h2><p class="lead" style="margin:22px auto 0">El origen técnico y conceptual de El Errante se desarrolla en una página separada para no mezclar historia con responsabilidades.</p><a class="btn btn-dark" href="historia.html">Leer la historia</a></div></section></main>',
        1,
    )
write("nosotros.html", nosotros)

# Centro del equipo: se nombra como demo integral para no confundirse con Nosotros.
equipo = read("equipo.html")
equipo = replace_title(equipo, "Demo integral · El Errante")
equipo = replace_description(
    equipo,
    "Demo integral de El Errante: comercio, administración, operación, control, datos y presentación en un solo entorno.",
)
equipo = equipo.replace("Equipo y demo integral", "Demo integral")
equipo = equipo.replace("Centro integral", "Demo integral")
write("equipo.html", equipo)

# Navegación: Historia + Nosotros + Demo integral, con propósitos inequívocos.
host = read("assets/host-mode.js")
host = host.replace(
    'addNavigationLink(desktop,\'a[href="equipo.html"]\',"Equipo","equipo.html",null);',
    'addNavigationLink(desktop,\'a[href="nosotros.html"]\',"Nosotros","nosotros.html",\'a[href="bitacora.html"]\');\n    addNavigationLink(desktop,\'a[href="equipo.html"]\',"Demo integral","equipo.html",null);',
)
host = host.replace(
    'addNavigationLink(mobile,\'a[href="equipo.html"]\',"Equipo","equipo.html",null,"btn btn-outline");',
    'addNavigationLink(mobile,\'a[href="nosotros.html"]\',"Nosotros","nosotros.html",\'a[href="bitacora.html"]\',"btn btn-outline");\n    addNavigationLink(mobile,\'a[href="equipo.html"]\',"Demo integral","equipo.html",null,"btn btn-outline");',
)
host = host.replace(
    'if(page==="equipo") document.querySelectorAll(\'a[href="equipo.html"]\').forEach(link=>link.classList.add("active"));',
    'if(page==="nosotros") document.querySelectorAll(\'a[href="nosotros.html"]\').forEach(link=>link.classList.add("active"));\n    if(page==="equipo") document.querySelectorAll(\'a[href="equipo.html"]\').forEach(link=>link.classList.add("active"));',
)
write("assets/host-mode.js", host)

# README: las tres superficies quedan documentadas por separado.
readme = read("README.md")n = None
if "- `nosotros.html` — personas, roles y estructura del proyecto" not in readme:
    readme = readme.replace(
        "- `historia.html` — historia y concepto\n",
        "- `historia.html` — origen, búsqueda y concepto de marca\n- `nosotros.html` — personas, roles y estructura del proyecto\n",
    )
readme = readme.replace("- `equipo.html` — puerta de entrada general", "- `equipo.html` — puerta de entrada a la demo integral")
write("README.md", readme)

# Verificador de fuentes: el archivo alterado ya no debe existir.
verifier = read("scripts/verificar_fuentes.py")
check = '''\norphan = ROOT / "assets/source/v040-preprod-001.b64"\nif orphan.exists():\n    ISSUES.append("Permanece el bloque funcional huérfano v040-preprod-001.b64")\n'''
if "Permanece el bloque funcional huérfano" not in verifier:
    verifier = verifier.replace("print(\"EL ERRANTE — PROCEDENCIA DE FUENTES\")", check + "\nprint(\"EL ERRANTE — PROCEDENCIA DE FUENTES\")")
write("scripts/verificar_fuentes.py", verifier)

# Verificación estructural de las tres superficies.
demo = read("verificar_demo.py")
marker = "# Distinción entre relato, personas y demo integral."
if marker not in demo:
    block = '''\n# Distinción entre relato, personas y demo integral.\nfor page_name, required_text in {\n    "historia.html": ["Historia y búsqueda", "nosotros.html", "personas-proyecto"],\n    "nosotros.html": ["Personas y proyecto", "historia.html"],\n    "equipo.html": ["Demo integral"],\n}.items():\n    page_text = text(page_name)\n    for expected_text in required_text:\n        if expected_text not in page_text:\n            ISSUES.append(f"{page_name}: falta la distinción estructural {expected_text}")\n\nfor required_nav in [\n    'a[href="nosotros.html"]', '"Nosotros"',\n    'a[href="equipo.html"]', '"Demo integral"',\n]:\n    if required_nav not in host_mode:\n        ISSUES.append(f"host-mode.js: falta navegación diferenciada {required_nav}")\n'''
    demo = demo.replace("# CI y despliegue.", block + "\n# CI y despliegue.")
write("verificar_demo.py", demo)

# Retira la copia huérfana que no participa en el runtime.
orphan = ROOT / "assets/source/v040-preprod-001.b64"
if orphan.exists():
    orphan.unlink()

# Documento de decisión.
write(
    "documentacion/DISTINCION_HISTORIA_NOSOTROS_DEMO.md",
    '''# Historia, Nosotros y Demo integral\n\n## Decisión\n\nLas tres rutas se conservan porque representan superficies distintas:\n\n- `historia.html`: origen, búsqueda y concepto de marca.\n- `nosotros.html`: personas, roles y responsabilidades del proyecto.\n- `equipo.html`: demo integral de comercio, administración, operación, control y datos.\n\n## Cambios\n\n- Se añadieron enlaces cruzados entre Historia y Nosotros.\n- La navegación pública incorpora `Nosotros`.\n- El antiguo enlace `Equipo` pasa a llamarse `Demo integral`.\n- La página `equipo.html` deja de presentarse como página corporativa de equipo.\n- Se retiró `assets/source/v040-preprod-001.b64`, copia huérfana y no utilizada.\n\n## Regla\n\nNo volver a fusionar Historia y Nosotros en una sola página: una explica el relato y la otra la estructura humana. La demo integral tampoco debe presentarse como la página pública del equipo.\n''',
)

print("Cierre estructural v0.8 aplicado.")
