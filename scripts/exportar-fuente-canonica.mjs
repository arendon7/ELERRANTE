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
fs.mkdirSync(OUTPUT,{recursive:true});

const sha256=value=>crypto.createHash("sha256").update(value).digest("hex");
const read=relativePath=>{
  const absolute=path.join(ROOT,relativePath);
  if(!fs.existsSync(absolute)) throw new Error(`No existe ${relativePath}`);
  return fs.readFileSync(absolute,"utf8");
};
const base64Bytes=value=>Buffer.from(value.replace(/\s+/g,""),"base64");
const utf8Fatal=bytes=>new TextDecoder("utf-8",{fatal:true}).decode(bytes);
const utf8Lossy=bytes=>new TextDecoder("utf-8",{fatal:false}).decode(bytes);

function invalidBase64Characters(value){
  const invalid=[];
  for(let index=0;index<value.length;index+=1){
    const char=value[index];
    if(!/[A-Za-z0-9+/=\s]/.test(char)){
      invalid.push({
        index,
        char,
        codepoint:`U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4,"0")}`,
        context:value.slice(Math.max(0,index-16),index+17)
      });
    }
  }
  return invalid;
}

function inspectStrategy(name,bytes){
  const result={name,byte_length:bytes.length,bytes_sha256:sha256(bytes),utf8_valid:false,syntax_valid:false};
  const lossy=utf8Lossy(bytes);
  fs.writeFileSync(path.join(OUTPUT,`${name}-lossy.js`),lossy);
  try{
    const source=utf8Fatal(bytes);
    result.utf8_valid=true;
    result.character_length=source.length;
    result.source_sha256=sha256(source);
    try{
      new vm.Script(source,{filename:`${name}.js`});
      result.syntax_valid=true;
    }catch(error){
      result.error=`JavaScript: ${error.message}`;
    }
    return {result,source};
  }catch(error){
    result.error=`UTF-8: ${error.message}`;
    return {result,source:null};
  }
}

try{
  const encodedParts=CHUNKS.map(name=>read(path.join("assets","chunks",name)).trim());
  const decodedByteParts=encodedParts.map(base64Bytes);
  const strippedJoin=encodedParts.map((part,index)=>index===encodedParts.length-1?part:part.replace(/=+$/,"" )).join("");
  const candidates=[
    ["decode-each-chunk-concat-bytes",Buffer.concat(decodedByteParts)],
    ["join-base64-raw",base64Bytes(encodedParts.join(""))],
    ["join-base64-strip-intermediate-padding",base64Bytes(strippedJoin)]
  ];

  const diagnostics={
    generated_at:new Date().toISOString(),
    chunks:CHUNKS.map((name,index)=>({
      path:`assets/chunks/${name}`,
      encoded_chars:encodedParts[index].length,
      encoded_mod4:encodedParts[index].length%4,
      prefix:encodedParts[index].slice(0,24),
      suffix:encodedParts[index].slice(-24),
      padding:(encodedParts[index].match(/=+$/)||[""])[0].length,
      invalid_characters:invalidBase64Characters(encodedParts[index]),
      decoded_bytes:decodedByteParts[index].length,
      decoded_sha256:sha256(decodedByteParts[index]),
      decoded_prefix_lossy:utf8Lossy(decodedByteParts[index]).slice(0,160),
      decoded_suffix_lossy:utf8Lossy(decodedByteParts[index]).slice(-160)
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
  fs.writeFileSync(path.join(OUTPUT,"chunk-diagnostics.json"),JSON.stringify(diagnostics,null,2)+"\n");

  if(!selected){
    console.error(JSON.stringify(diagnostics,null,2));
    throw new Error("Ninguna estrategia de ensamblaje produjo JavaScript UTF-8 válido");
  }

  const decoded=selected.source;
  const sandbox={window:{},console,Intl,Date,JSON,Math,Number,String,Boolean,Array,Object,RegExp,Map,Set,URL,URLSearchParams,setTimeout,clearTimeout};
  sandbox.globalThis=sandbox;
  vm.createContext(sandbox);
  vm.runInContext(decoded,sandbox,{filename:"assets/data-decoded.js",timeout:5000});
  if(!sandbox.window.EE_DATA||typeof sandbox.window.EE_DATA!=="object") throw new Error("La fuente base no produjo window.EE_DATA");

  const overlay=read("assets/products-v6.js");
  vm.runInContext(overlay,sandbox,{filename:"assets/products-v6.js",timeout:5000});
  const canonical=JSON.parse(JSON.stringify(sandbox.window.EE_DATA));
  const products=Array.isArray(canonical.products)?canonical.products:[];
  const expectedIds=["harina-aire-y-tiempo","crea-la-tuya","margherita-del-taller","diavola-errante","bosque","cuatro-quesos-montana","la-errante","salsa-tomate","reduccion-balsamica","panela-maracuya","combo-primera-ruta"];
  const productIds=products.map(product=>product.id);
  if(products.length!==11) throw new Error(`Se esperaban 11 productos y se encontraron ${products.length}`);
  if(new Set(productIds).size!==products.length) throw new Error("Existen identificadores de producto duplicados");
  for(const id of expectedIds) if(!productIds.includes(id)) throw new Error(`Falta el producto canónico ${id}`);
  for(const product of products){
    if(!Array.isArray(product.variants)||product.variants.length===0) throw new Error(`El producto ${product.id} no tiene variantes`);
    const variantIds=product.variants.map(variant=>variant.id);
    if(new Set(variantIds).size!==variantIds.length) throw new Error(`El producto ${product.id} tiene variantes duplicadas`);
  }

  const json=JSON.stringify(canonical,null,2)+"\n";
  const js=`/* Generado por scripts/exportar-fuente-canonica.mjs. No editar manualmente. */\nwindow.EE_DATA=${JSON.stringify(canonical)};\n`;
  const topLevel=Object.fromEntries(Object.entries(canonical).map(([key,value])=>[key,Array.isArray(value)?value.length:(value&&typeof value==="object"?Object.keys(value).length:typeof value)]));
  const categories=products.reduce((acc,product)=>{acc[product.category]=(acc[product.category]||0)+1;return acc;},{});
  const variantCount=products.reduce((total,product)=>total+product.variants.length,0);
  const report={generated_at:new Date().toISOString(),decode_strategy:selected.name,source_chunks:diagnostics.chunks,strategy_diagnostics:diagnostics.strategies,decoded_source_sha256:sha256(decoded),overlay_sha256:sha256(overlay),canonical_json_sha256:sha256(json),product_count:products.length,variant_count:variantCount,product_ids:productIds,categories,top_level_counts:topLevel};

  fs.writeFileSync(path.join(OUTPUT,"canonical-data.json"),json);
  fs.writeFileSync(path.join(OUTPUT,"canonical-data.js"),js);
  fs.writeFileSync(path.join(OUTPUT,"canonical-report.json"),JSON.stringify(report,null,2)+"\n");
  fs.writeFileSync(path.join(OUTPUT,"canonical-report.md"),[
    "# Fuente canónica reconstruida","",`- Generada: ${report.generated_at}`,`- Estrategia: ${report.decode_strategy}`,`- Productos: ${report.product_count}`,`- Variantes: ${report.variant_count}`,`- SHA-256 JSON: \`${report.canonical_json_sha256}\``,"","## Productos","",...productIds.map(id=>`- \`${id}\``),"","## Colecciones superiores","",...Object.entries(topLevel).map(([key,count])=>`- ${key}: ${count}`),""
  ].join("\n"));
  console.log(`FUENTE CANÓNICA RECONSTRUIDA · ${products.length} productos · ${variantCount} variantes · ${report.canonical_json_sha256}`);
}catch(error){
  fs.writeFileSync(path.join(OUTPUT,"EXPORT_FAILED.txt"),`${error.stack||error.message}\n`);
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
}
