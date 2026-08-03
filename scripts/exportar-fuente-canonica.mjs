#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT=process.cwd();
const outputArg=process.argv.find(arg=>arg.startsWith("--output="));
const OUTPUT=path.resolve(ROOT,outputArg?outputArg.split("=",2)[1]:".artifacts/canonical");
const CHUNKS=["data-001.txt","data-002.txt","data-003.txt"];

function fail(message){
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function read(relativePath){
  const absolute=path.join(ROOT,relativePath);
  if(!fs.existsSync(absolute)) fail(`No existe ${relativePath}`);
  return fs.readFileSync(absolute,"utf8");
}

function sha256(content){
  return crypto.createHash("sha256").update(content).digest("hex");
}

const encodedParts=CHUNKS.map(name=>read(path.join("assets","chunks",name)).trim());
const encoded=encodedParts.join("");
let decoded;
try{
  decoded=Buffer.from(encoded,"base64").toString("utf8");
}catch(error){
  fail(`No fue posible decodificar los chunks: ${error.message}`);
}

const sandbox={
  window:{},
  console,
  Intl,
  Date,
  JSON,
  Math,
  Number,
  String,
  Boolean,
  Array,
  Object,
  RegExp,
  Map,
  Set,
  URL,
  URLSearchParams,
  setTimeout,
  clearTimeout
};
sandbox.globalThis=sandbox;
vm.createContext(sandbox);

try{
  vm.runInContext(decoded,sandbox,{filename:"assets/data-decoded.js",timeout:5000});
}catch(error){
  fail(`La fuente base no se puede ejecutar: ${error.stack||error.message}`);
}

if(!sandbox.window.EE_DATA||typeof sandbox.window.EE_DATA!=="object"){
  fail("La fuente base no produjo window.EE_DATA");
}

const overlay=read("assets/products-v6.js");
try{
  vm.runInContext(overlay,sandbox,{filename:"assets/products-v6.js",timeout:5000});
}catch(error){
  fail(`El overlay comercial no se puede aplicar: ${error.stack||error.message}`);
}

const canonical=JSON.parse(JSON.stringify(sandbox.window.EE_DATA));
const products=Array.isArray(canonical.products)?canonical.products:[];
const productIds=products.map(product=>product.id);
const uniqueIds=new Set(productIds);

if(products.length!==11) fail(`Se esperaban 11 productos y se encontraron ${products.length}`);
if(uniqueIds.size!==products.length) fail("Existen identificadores de producto duplicados");

for(const product of products){
  if(!product.id||!product.name) fail("Existe un producto sin id o nombre");
  if(!Array.isArray(product.variants)||product.variants.length===0){
    fail(`El producto ${product.id} no tiene variantes`);
  }
  const variantIds=product.variants.map(variant=>variant.id);
  if(new Set(variantIds).size!==variantIds.length){
    fail(`El producto ${product.id} tiene variantes duplicadas`);
  }
}

const expectedIds=[
  "harina-aire-y-tiempo","crea-la-tuya","margherita-del-taller",
  "diavola-errante","bosque","cuatro-quesos-montana","la-errante",
  "salsa-tomate","reduccion-balsamica","panela-maracuya",
  "combo-primera-ruta"
];
for(const id of expectedIds){
  if(!uniqueIds.has(id)) fail(`Falta el producto canónico ${id}`);
}

fs.mkdirSync(OUTPUT,{recursive:true});
const json=JSON.stringify(canonical,null,2)+"\n";
const js=`/* Generado por scripts/exportar-fuente-canonica.mjs. No editar manualmente. */\nwindow.EE_DATA=${JSON.stringify(canonical)};\n`;

const topLevel=Object.fromEntries(Object.entries(canonical).map(([key,value])=>[
  key,
  Array.isArray(value)?value.length:(value&&typeof value==="object"?Object.keys(value).length:typeof value)
]));
const categories=products.reduce((acc,product)=>{
  acc[product.category]=(acc[product.category]||0)+1;
  return acc;
},{});
const variantCount=products.reduce((total,product)=>total+product.variants.length,0);
const report={
  generated_at:new Date().toISOString(),
  source_chunks:CHUNKS.map((name,index)=>({
    path:`assets/chunks/${name}`,
    encoded_chars:encodedParts[index].length,
    sha256:sha256(encodedParts[index])
  })),
  decoded_source_sha256:sha256(decoded),
  overlay_sha256:sha256(overlay),
  canonical_json_sha256:sha256(json),
  product_count:products.length,
  variant_count:variantCount,
  product_ids:productIds,
  categories,
  top_level_counts:topLevel
};

fs.writeFileSync(path.join(OUTPUT,"canonical-data.json"),json);
fs.writeFileSync(path.join(OUTPUT,"canonical-data.js"),js);
fs.writeFileSync(path.join(OUTPUT,"canonical-report.json"),JSON.stringify(report,null,2)+"\n");
fs.writeFileSync(path.join(OUTPUT,"canonical-report.md"),[
  "# Fuente canónica reconstruida",
  "",
  `- Generada: ${report.generated_at}`,
  `- Productos: ${report.product_count}`,
  `- Variantes: ${report.variant_count}`,
  `- SHA-256 JSON: \`${report.canonical_json_sha256}\``,
  `- SHA-256 fuente decodificada: \`${report.decoded_source_sha256}\``,
  `- SHA-256 overlay: \`${report.overlay_sha256}\``,
  "",
  "## Productos",
  "",
  ...productIds.map(id=>`- \`${id}\``),
  "",
  "## Categorías",
  "",
  ...Object.entries(categories).map(([category,count])=>`- ${category}: ${count}`),
  "",
  "## Colecciones superiores",
  "",
  ...Object.entries(topLevel).map(([key,count])=>`- ${key}: ${count}`),
  ""
].join("\n"));

console.log("FUENTE CANÓNICA RECONSTRUIDA");
console.log(`Productos: ${products.length}`);
console.log(`Variantes: ${variantCount}`);
console.log(`Salida: ${path.relative(ROOT,OUTPUT)}`);
console.log(`SHA-256: ${report.canonical_json_sha256}`);
