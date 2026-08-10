(()=>{
  'use strict';

  const VERSION='1.3.0';
  const MATERIALIZATION_KEY='ee_v12_cost_materialization_events';
  const DATA=window.EL_ERRANTE_MATERIALS_V23;
  const n=value=>{const parsed=Number(value);return Number.isFinite(parsed)?parsed:0;};
  const v12=()=>window.EL_ERRANTE_MASTER_COST_MATERIALIZATION_V12||null;

  function baseMaterial(input){
    const id=typeof input==='object'&&input?String(input.id||''):String(input||'');
    if(!id)return null;
    return DATA?.materials?.find(item=>String(item.id)===id)||null;
  }

  function baseProduct(input){
    if(typeof input==='object'&&input)return input;
    const sku=String(input||'');
    return DATA?.products?.find(item=>String(item.sku)===sku)||null;
  }

  function standardMaterial(input){
    const base=baseMaterial(input);
    if(!base)return null;
    const resolved=v12()?.effectiveMaterial?.(base.id)||null;
    const standardCost=n(resolved?.cost??base.cost);
    const baselineCost=n(resolved?.baselineCost??base.cost);
    const standardRevision=n(resolved?.standardRevision??resolved?.revision??0);
    const standardSource=String(resolved?.standardSource??resolved?.source??'CANONICAL_BASELINE');
    return {
      ...base,
      cost:standardCost,
      baselineCost,
      standardCost,
      standardRevision,
      standardSource,
      costOrigin:standardRevision>0?'MATERIALIZED_STANDARD':'CANONICAL_BASELINE',
      materializationEventId:resolved?.materializationEventId||resolved?.lastEvent?.eventId||null
    };
  }

  function resolveMaterial(input,options={}){
    const standard=standardMaterial(input);
    if(!standard)return null;
    const overrideCost=Number(options.overrideCost);
    const hasOverride=Number.isFinite(overrideCost)&&overrideCost>=0;
    if(!hasOverride)return {...standard,simulation:false,override:false};
    return {
      ...standard,
      cost:overrideCost,
      simulation:true,
      override:true,
      costOrigin:'SIMULATION',
      overrideMeta:options.overrideMeta||null
    };
  }

  function productCost(input,options={},seen=new Set()){
    const product=baseProduct(input);
    if(!product)return {sku:'',total:0,lines:[],hasMaterialized:false,hasSimulation:false};
    const sku=String(product.sku||product.name||'');
    if(seen.has(sku))return {sku,total:0,lines:[],hasMaterialized:false,hasSimulation:false,cycle:true};
    const next=new Set(seen);next.add(sku);
    const overrides=options.overrides&&typeof options.overrides==='object'?options.overrides:{};
    const lines=[];
    let total=0;
    let hasMaterialized=false;
    let hasSimulation=false;

    (product.bom||[]).forEach(line=>{
      const id=String(line.materialId||'');
      const override=overrides[id];
      const material=resolveMaterial(id,{overrideCost:override?.cost,overrideMeta:override});
      if(!material)return;
      const qty=n(line.qty);
      const cost=qty*n(material.cost);
      total+=cost;
      hasMaterialized=hasMaterialized||material.standardRevision>0;
      hasSimulation=hasSimulation||material.simulation;
      lines.push({
        kind:'material',id:material.id,name:material.name,unit:material.unit,qty,
        unitCost:n(material.cost),cost,
        baselineUnitCost:n(material.baselineCost),standardUnitCost:n(material.standardCost),
        standardRevision:material.standardRevision,standardSource:material.standardSource,
        costOrigin:material.costOrigin,simulation:material.simulation,
        status:material.status,confidence:material.confidence||''
      });
    });

    (product.components||[]).forEach(component=>{
      const child=baseProduct(component.sku);
      if(!child)return;
      const childCost=productCost(child,options,next);
      const qty=n(component.qty);
      const cost=childCost.total*qty;
      total+=cost;
      hasMaterialized=hasMaterialized||childCost.hasMaterialized;
      hasSimulation=hasSimulation||childCost.hasSimulation;
      lines.push({kind:'component',id:child.sku,name:child.name,unit:'componente',qty,unitCost:childCost.total,cost,costOrigin:childCost.hasSimulation?'SIMULATION':childCost.hasMaterialized?'MATERIALIZED_STANDARD':'CANONICAL_BASELINE',simulation:childCost.hasSimulation,standardRevision:null,status:child.status||'ESTIMADO',confidence:''});
    });

    return {sku,total,lines,hasMaterialized,hasSimulation,legacyCost:n(product.cost)};
  }

  function originLabel(value){
    const origin=typeof value==='string'?value:value?.costOrigin;
    if(origin==='SIMULATION')return 'Simulación financiera';
    if(origin==='MATERIALIZED_STANDARD'){
      const revision=n(value?.standardRevision);
      return revision>0?`Estándar materializado r${revision}`:'Estándar materializado';
    }
    return 'Baseline canónico';
  }

  function signature(){
    const events=v12()?.events?.()||[];
    return JSON.stringify(events.filter(event=>event?.type==='MATERIALIZED').map(event=>[event.materialId,event.toRevision,event.toCost,event.eventId]));
  }

  function snapshot(){
    return {
      materializationText:localStorage.getItem(MATERIALIZATION_KEY),
      materials:JSON.stringify(DATA?.materials||[]),
      products:JSON.stringify(DATA?.products||[])
    };
  }

  function integrityUnchanged(before){
    return before.materializationText===localStorage.getItem(MATERIALIZATION_KEY)
      && before.materials===JSON.stringify(DATA?.materials||[])
      && before.products===JSON.stringify(DATA?.products||[]);
  }

  function emitStandardChanged(detail={}){
    window.dispatchEvent(new CustomEvent('ee:v13:standard-changed',{detail:{version:VERSION,...detail}}));
  }

  window.addEventListener('ee:v12:standard-materialized',event=>emitStandardChanged({source:'materialization',event:event.detail?.event||null}));
  window.addEventListener('storage',event=>{if(event.key===MATERIALIZATION_KEY)emitStandardChanged({source:'storage'});});

  window.EL_ERRANTE_MASTER_COST_BRIDGE_V13=Object.freeze({
    version:VERSION,
    materializationKey:MATERIALIZATION_KEY,
    baseMaterial,
    baseProduct,
    standardMaterial,
    resolveMaterial,
    productCost,
    originLabel,
    signature,
    snapshot,
    integrityUnchanged
  });
})();