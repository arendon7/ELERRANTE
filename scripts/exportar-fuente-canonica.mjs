#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {TextDecoder} from "node:util";

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

function base64Bytes(value){
  return Buffer.from(value.replace(/\s+/g,""),"base64");
}

function decodeUtf8Fatal(bytes){
  return new TextDecoder("utf-8",{fatal:true}).decode(bytes);
}

function inspectStrategy(name,bytes){
  const result={name,byte_length:bytes.length,bytes_sha256:sha256(bytes),utf8_valid:false,syntax_valid:false};
  let source;
  try{
    source=decodeUtf8Fatal(bytes);
    result.utf8_valid=true;
    result.character_length=source.length;
    result.source_sha256=sha256(source);
  }catch(error){
    result.error=`UTF-8: ${error.message}`;
    return {result,source:null};
  }
  try{
    new vm.Script(source,{filename:`${name}.js`});
    result.syntax_valid=true;
  }catch(error){
    result.error=`JavaScript: ${error.message}`;
  }
  return {result,source};
}

const encodedParts=CHUNKS.map(name=>read(path.join("assets","chunks",name)).trim());
const decodedByteParts=encodedParts.map(base64Bytes);
const strippedJoin=encodedParts.map((part,index)=>index===encodedParts.length-1?part:part.replace(/=+$/,"" )).join("");

const candidates=[
  ["decode-each-chunk-concat-bytes",Buffer.concat(decodedByteParts)],
  ["join-base64-raw",base64Bytes(encodedParts.join(""))],
  ["join-base64-strip-intermediate-padding",base64Bytes(strippedJoin)]
];

const diagnostics={
  chunks:CHUNKS.map((name,index)=>({
    path:`assets/chunks/${name}`,
    encoded_chars:encodedParts[index].length,
    encoded_mod4:encodedParts[index].length%4,
    suffix:encodedParts[index].slice(-12),
    padding:(encodedParts[index].match(/=+$/)||[""])[0].length,
    decoded_bytes:decodedByteParts[index].length,
    decoded_sha256:sha256(decodedByteParts[index])
  })),
  strategies:[]
};

let selected=null;
for(const [name,bytes] of candidates){
  const inspected=inspectStrategy(name,bytes);
  diagnostics.strategies.push(inspected.result);
  if(!selected&&inspected.result.utf8_valid&&inspected.result.syntax_valid){
    selected={name,bytes,source:inspected.source};
  }
}

if(!selected){
  console.error(JSON.stringify(diagnostics,null,2));
  fail("Ninguna estrategia de ensamblaje produjo JavaScript UTF-8 válido");
}

console.log(`Estrategia válida: ${selected.name}`);
const decoded=selected.source;

const sandbox={
  window:{},console,Intl,Date,JSON,Math,Number,String,Boolean,Array,Object,RegExp,
  Map,Set,URL,URLSearchParams,setTimeout,clearTimeout
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
  if(!Array.isArray(product.variants)||product.variants.length===0) fail(`El producto ${product.id} no tiene variantes`);
  const variantIds=product.variants.map(variant=>variant.id);
  if(new Set(variantIds).size!==variantIds.length) fail(`El producto ${product.id} tiene variantes duplicadas`);
}

const expectedIds=[
  "harina-aire-y-tiempo","crea-la-tuya","margherita-del-taller",
  "diavola-errante","bosque","cuatro-quesos-montana","la-errante",
  "salsa-tomate","reduccion-balsamica","panela-maracuya","combo-primera-ruta"
];
for(const id of expectedIds){
  if(!uniqueIds.has(id)) fail(`Falta el producto canónico ${id}`);
}

fs.mkdirSync(OUTPUT,{recursive:true});
const json=JSON.stringify(canonical,null,2)+"\n";
const js=`/* Generado por scripts/exportar-fuente-canonica.mjs. No editar manualmente. */\nwindow.EE_DATA=${JSON.stringify(canonical)};\n`;
const topLevel=Object.fromEntries(Object.entries(canonical).map(([key,value])=>[
  key,Array.isArray(value)?value.length:(value&&typeof value==="object"?Object.keys(value).length:typeof value)
]));
const categories=products.reduce((acc,product)=>{
  acc[product.category]=(acc[product.category]||0)+1;
  return acc;
},{});
const variantCount=products.reduce((total,product)=>total+product.variants.length,0);
const report={
  generated_at:new Date().toISOString(),
  decode_strategy:selected.name,
  source_chunks:diagnostics.chunks,
  strategy_diagnostics:diagnostics.strategies,
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
  "# Fuente canónica reconstruida","",
  `- Generada: ${report.generated_at}`,
  `- Estrategia: ${report.decode_strategy}`,
  `- Productos: ${report.product_count}`,
  `- Variantes: ${report.variant_count}`,
  `- SHA-256 JSON: \`${report.canonical_json_sha256}\``,
  `- SHA-256 fuente decodificada: \`${report.decoded_source_sha256}\``,
  `- SHA-256 overlay: \`${report.overlay_sha256}\``,"",
  "## Chunks","",
  ...report.source_chunks.map(chunk=>`- \`${chunk.path}\`: ${chunk.decoded_bytes} bytes · padding ${chunk.padding} · \`${chunk.decoded_sha256}\``),"",
  "## Estrategias","",
  ...report.strategy_diagnostics.map(strategy=>`- ${strategy.name}: UTF-8 ${strategy.utf8_valid?"válido":"inválido"}; JavaScript ${strategy.syntax_valid?"válido":"inválido"}${strategy.error?`; ${strategy.error}`:""}`),"",
  "## Productos","",...productIds.map(id=>`- \`${id}\``),"",
  "## Categorías","",...Object.entries(categories).map(([category,count])=>`- ${category}: ${count}`),"",
  "## Colecciones superiores","",...Object.entries(topLevel).map(([key,count])=>`- ${key}: ${count}`),""
].join("\n"));

console.log("FUENTE CANÓNICA RECONSTRUIDA");
console.log(`Estrategia: ${selected.name}`);
console.log(`Productos: ${products.length}`);
console.log(`Variantes: ${variantCount}`);
console.log(`Salida: ${path.relative(ROOT,OUTPUT)}`);
console.log(`SHA-256: ${report.canonical_json_sha256}`);
