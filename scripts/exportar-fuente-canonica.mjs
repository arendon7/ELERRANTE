#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { TextDecoder } from "node:util";

const ROOT = process.cwd();
const outputArg = process.argv.find(arg => arg.startsWith("--output="));
const OUTPUT = path.resolve(ROOT, outputArg ? outputArg.split("=", 2)[1] : ".artifacts/canonical");
const TRUSTED_PARTS = [
  "assets/source/v040-data-001.b64",
  "assets/source/v040-data-002.b64",
  "assets/source/v040-data-003.b64",
  "assets/source/v040-data-004.b64"
];
const LEGACY_PARTS = [
  "assets/chunks/data-001.txt",
  "assets/chunks/data-002.txt",
  "assets/chunks/data-003.txt"
];
const PRODUCT_OVERLAY = "assets/products-v6.js";
const BRAND_CANON = "assets/brand-canon-v28.js";
const EXPECTED_IDS = [
  "harina-aire-y-tiempo", "crea-la-tuya", "margherita-del-taller",
  "diavola-errante", "bosque", "cuatro-quesos-montana", "la-errante",
  "salsa-tomate", "reduccion-balsamica", "panela-maracuya",
  "combo-primera-ruta"
];

const sha256 = value => crypto.createHash("sha256").update(value).digest("hex");
const read = relativePath => {
  const absolute = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolute)) throw new Error(`No existe ${relativePath}`);
  return fs.readFileSync(absolute, "utf8");
};
const fail = message => {
  fs.mkdirSync(OUTPUT, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT, "EXPORT_FAILED.txt"), `${message}\n`);
  console.error(`ERROR: ${message}`);
  process.exit(1);
};

try {
  fs.mkdirSync(OUTPUT, { recursive: true });

  const encodedParts = TRUSTED_PARTS.map(read).map(value => value.replace(/\s+/g, ""));
  for (const [index, part] of encodedParts.entries()) {
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(part)) {
      throw new Error(`La parte confiable ${TRUSTED_PARTS[index]} contiene caracteres Base64 inválidos`);
    }
  }

  const encoded = encodedParts.join("");
  if (encoded.length % 4 !== 0) {
    throw new Error(`La fuente íntegra tiene longitud Base64 inválida: ${encoded.length}`);
  }

  const bytes = Buffer.from(encoded, "base64");
  const source = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  new vm.Script(source, { filename: "assets/source/v040-data.js" });

  const sandbox = {
    window: {}, console, Intl, Date, JSON, Math, Number, String, Boolean,
    Array, Object, RegExp, Map, Set, URL, URLSearchParams, TextDecoder,
    setTimeout, clearTimeout
  };
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: "assets/source/v040-data.js", timeout: 5000 });

  if (!sandbox.window.EE_DATA || typeof sandbox.window.EE_DATA !== "object") {
    throw new Error("El baseline v0.4 no produjo window.EE_DATA");
  }

  const overlay = read(PRODUCT_OVERLAY);
  new vm.Script(overlay, { filename: PRODUCT_OVERLAY });
  vm.runInContext(overlay, sandbox, { filename: PRODUCT_OVERLAY, timeout: 5000 });

  const brandSource = read(BRAND_CANON);
  new vm.Script(brandSource, { filename: BRAND_CANON });
  vm.runInContext(brandSource, sandbox, { filename: BRAND_CANON, timeout: 5000 });
  const brand = sandbox.window.EL_ERRANTE_BRAND_V28;
  if (!brand || brand.version !== "2.8.0" || typeof brand.applyToData !== "function") {
    throw new Error("El manifiesto de marca V2.8 no quedó disponible en la reconstrucción canónica");
  }
  brand.applyToData(sandbox.window.EE_DATA);

  const canonical = JSON.parse(JSON.stringify(sandbox.window.EE_DATA));
  const products = Array.isArray(canonical.products) ? canonical.products : [];
  const productIds = products.map(product => product.id);

  if (products.length !== 11) {
    throw new Error(`Se esperaban 11 productos y se encontraron ${products.length}`);
  }
  if (new Set(productIds).size !== products.length) {
    throw new Error("Existen identificadores de producto duplicados");
  }
  for (const id of EXPECTED_IDS) {
    if (!productIds.includes(id)) throw new Error(`Falta el producto canónico ${id}`);
  }
  for (const product of products) {
    if (!product.id || !product.name) throw new Error("Existe un producto sin id o nombre");
    if (!Array.isArray(product.variants) || product.variants.length === 0) {
      throw new Error(`El producto ${product.id} no tiene variantes`);
    }
    const variantIds = product.variants.map(variant => variant.id);
    if (new Set(variantIds).size !== variantIds.length) {
      throw new Error(`El producto ${product.id} tiene variantes duplicadas`);
    }
    if (!String(product.image || "").startsWith("assets/images/brand-final/")) {
      throw new Error(`El producto ${product.id} no usa imagen brand-final`);
    }
    if (!Array.isArray(product.gallery) || product.gallery.length === 0 ||
        product.gallery.some(image => !String(image).startsWith("assets/images/brand-final/"))) {
      throw new Error(`La galería canónica de ${product.id} está incompleta`);
    }
    if (product.brand_asset_version !== "2.8.0") {
      throw new Error(`El producto ${product.id} no registra brand_asset_version=2.8.0`);
    }
  }
  if (canonical.brand?.version !== "2.8.0") {
    throw new Error("La fuente exportada no declara brand.version=2.8.0");
  }

  const legacy = LEGACY_PARTS.map(relativePath => {
    const content = read(relativePath);
    const marker = "[... ELLIPSIZATION ...]";
    return {
      path: relativePath,
      chars: content.length,
      sha256: sha256(content),
      contains_ellipsization_marker: content.includes(marker),
      marker_index: content.indexOf(marker)
    };
  });

  const json = `${JSON.stringify(canonical, null, 2)}\n`;
  const js = `/* Generado por scripts/exportar-fuente-canonica.mjs. No editar manualmente. */\nwindow.EE_DATA=${JSON.stringify(canonical)};\n`;
  const variantCount = products.reduce((total, product) => total + product.variants.length, 0);
  const categories = products.reduce((result, product) => {
    result[product.category] = (result[product.category] || 0) + 1;
    return result;
  }, {});
  const topLevelCounts = Object.fromEntries(Object.entries(canonical).map(([key, value]) => [
    key,
    Array.isArray(value) ? value.length : value && typeof value === "object" ? Object.keys(value).length : typeof value
  ]));
  const report = {
    generated_at: new Date().toISOString(),
    version: "2.8.0",
    provenance: {
      baseline: "El Errante v0.4.0 autocontenida validada",
      baseline_files: TRUSTED_PARTS.map((relativePath, index) => ({
        path: relativePath,
        encoded_chars: encodedParts[index].length,
        sha256: sha256(encodedParts[index])
      })),
      baseline_source_bytes: bytes.length,
      baseline_source_sha256: sha256(source),
      product_overlay: PRODUCT_OVERLAY,
      product_overlay_sha256: sha256(overlay),
      brand_canon: BRAND_CANON,
      brand_canon_sha256: sha256(brandSource)
    },
    legacy_chunks: {
      status: "truncated-ellipsized-do-not-use",
      files: legacy
    },
    canonical_json_sha256: sha256(json),
    canonical_js_sha256: sha256(js),
    product_count: products.length,
    variant_count: variantCount,
    product_ids: productIds,
    categories,
    top_level_counts: topLevelCounts
  };

  fs.writeFileSync(path.join(OUTPUT, "canonical-data.json"), json);
  fs.writeFileSync(path.join(OUTPUT, "canonical-data.js"), js);
  fs.writeFileSync(path.join(OUTPUT, "canonical-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(path.join(OUTPUT, "canonical-report.md"), [
    "# Fuente canónica reconstruida V2.8",
    "",
    `- Generada: ${report.generated_at}`,
    `- Baseline: ${report.provenance.baseline}`,
    `- Canon de marca: ${report.provenance.brand_canon}`,
    `- Productos: ${report.product_count}`,
    `- Variantes: ${report.variant_count}`,
    `- SHA-256 JSON: \`${report.canonical_json_sha256}\``,
    `- SHA-256 JavaScript: \`${report.canonical_js_sha256}\``,
    `- Chunks heredados: ${report.legacy_chunks.status}`,
    "",
    "## Colecciones superiores",
    "",
    ...Object.entries(topLevelCounts).map(([key, count]) => `- ${key}: ${count}`),
    "",
    "## Productos",
    "",
    ...productIds.map(id => `- \`${id}\``),
    "",
    "## Chunks heredados",
    "",
    ...legacy.map(file => `- \`${file.path}\`: marcador de elipsis ${file.contains_ellipsization_marker ? `detectado en ${file.marker_index}` : "no detectado"}`),
    ""
  ].join("\n"));

  console.log("FUENTE CANÓNICA V2.8 RECONSTRUIDA");
  console.log(`Productos: ${products.length}`);
  console.log(`Variantes: ${variantCount}`);
  console.log(`Marca: ${canonical.brand.version}`);
  console.log(`SHA-256: ${report.canonical_json_sha256}`);
} catch (error) {
  fail(error.stack || error.message);
}
