const {test,expect}=require('@playwright/test');

async function openStudio(page){
  await page.addInitScript(()=>{
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.1',username:'juan',displayName:'Juan',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
    if(localStorage.getItem('ee_v12_test_seeded')!=='1'){
      localStorage.setItem('ee_v24_material_purchases',JSON.stringify([
        {id:'COM-1',materialId:'MP-HFS',supplier:'Molinos Demo',receivedDate:'2026-08-09',quantity:25000,totalCost:85000,unitCost:3.4,dataStatus:'OBSERVADO',createdAt:'2026-08-09T12:00:00Z'},
        {id:'COM-2',materialId:'MP-HHO',supplier:'Molinos Demo',receivedDate:'2026-08-08',quantity:25000,totalCost:80000,unitCost:3.2,dataStatus:'OBSERVADO',createdAt:'2026-08-08T12:00:00Z'}
      ]));
      localStorage.removeItem('ee_v11_cost_proposal_events');
      localStorage.removeItem('ee_v12_cost_materialization_events');
      localStorage.setItem('ee_v12_test_seeded','1');
    }
  });
  await page.goto('/studio.html');
  await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
  await expect(page.locator('[data-master-materialization-version="1.2.0"]')).toBeVisible();
}

async function approved(page,materialId='MP-HFS',purchaseId='COM-1',cost=3.4){
  return page.evaluate(({materialId,purchaseId,cost})=>{
    const api=window.EL_ERRANTE_MASTER_COST_PROPOSALS_V11;
    const draft=api.createProposal({materialId,evidencePurchaseId:purchaseId,proposedCost:cost,rationale:'La evidencia observada justifica revisar el estándar vigente',actor:'Costos'});
    api.submitProposal(draft.proposalId,{actor:'Costos',note:'Lista para decisión'});
    return api.decideProposal(draft.proposalId,'APPROVE',{actor:'Dirección',reason:'Evidencia suficiente para actualizar el estándar'});
  },{materialId,purchaseId,cost});
}

test.describe('Datos maestros V1.2 · materialización controlada',()=>{
  test('materializa una aprobación como nueva revisión sin mutar fuente ni hechos',async({page})=>{
    await openStudio(page);
    const proposal=await approved(page);
    const result=await page.evaluate(proposalId=>{
      const api=window.EL_ERRANTE_MASTER_COST_MATERIALIZATION_V12;
      const before=api.snapshot();
      const output=api.materializeProposal(proposalId,{actor:'Dirección',reason:'Aplicar decisión aprobada al estándar prospectivo'});
      return {output,unchanged:api.integrityUnchanged(before),rawCost:window.EL_ERRANTE_MATERIALS_V23.materials.find(x=>x.id==='MP-HFS').cost,effective:api.currentStandard('MP-HFS'),events:api.events()};
    },proposal.proposalId);
    expect(result.unchanged).toBe(true);
    expect(result.rawCost).toBe(2.8);
    expect(result.effective).toMatchObject({cost:3.4,baselineCost:2.8,revision:1,source:'MATERIALIZED'});
    expect(result.events).toHaveLength(1);
    expect(result.output.event).toMatchObject({type:'MATERIALIZED',fromRevision:0,toRevision:1,fromCost:2.8,toCost:3.4,proposalId:proposal.proposalId});
  });

  test('no materializa borradores, revisiones ni propuestas rechazadas',async({page})=>{
    await openStudio(page);
    const result=await page.evaluate(()=>{
      const p=window.EL_ERRANTE_MASTER_COST_PROPOSALS_V11;
      const m=window.EL_ERRANTE_MASTER_COST_MATERIALIZATION_V12;
      const draft=p.createProposal({materialId:'MP-HFS',evidencePurchaseId:'COM-1',proposedCost:3.4,rationale:'Evidencia suficiente para abrir revisión formal',actor:'Costos'});
      let draftError='';try{m.materializeProposal(draft.proposalId,{reason:'No debería poder materializarse todavía'});}catch(error){draftError=error.message;}
      p.submitProposal(draft.proposalId,{actor:'Costos'});
      let reviewError='';try{m.materializeProposal(draft.proposalId,{reason:'Tampoco debe aplicar durante la revisión'});}catch(error){reviewError=error.message;}
      p.decideProposal(draft.proposalId,'REJECT',{actor:'Dirección',reason:'Se requiere evidencia adicional antes de cambiar'});
      let rejectedError='';try{m.materializeProposal(draft.proposalId,{reason:'Una propuesta rechazada nunca se aplica'});}catch(error){rejectedError=error.message;}
      return {draftError,reviewError,rejectedError,events:m.events()};
    });
    expect(result.draftError).toContain('Sólo una propuesta aprobada');
    expect(result.reviewError).toContain('Sólo una propuesta aprobada');
    expect(result.rejectedError).toContain('Sólo una propuesta aprobada');
    expect(result.events).toHaveLength(0);
  });

  test('bloquea doble materialización y aprobación obsoleta',async({page})=>{
    await openStudio(page);
    const first=await approved(page,'MP-HFS','COM-1',3.4);
    const second=await approved(page,'MP-HFS','COM-1',3.6);
    const result=await page.evaluate(({firstId,secondId})=>{
      const api=window.EL_ERRANTE_MASTER_COST_MATERIALIZATION_V12;
      api.materializeProposal(firstId,{actor:'Dirección',reason:'Primera revisión aprobada y vigente'});
      let duplicate='';let stale='';
      try{api.materializeProposal(firstId,{actor:'Dirección',reason:'No debe duplicarse la misma aprobación'});}catch(error){duplicate=error.message;}
      try{api.materializeProposal(secondId,{actor:'Dirección',reason:'Esta aprobación nació contra un estándar anterior'});}catch(error){stale=error.message;}
      return {duplicate,stale,standard:api.currentStandard('MP-HFS'),events:api.events()};
    },{firstId:first.proposalId,secondId:second.proposalId});
    expect(result.duplicate).toContain('ya fue materializada');
    expect(result.stale).toContain('Propuesta obsoleta');
    expect(result.standard.cost).toBe(3.4);
    expect(result.standard.revision).toBe(1);
    expect(result.events).toHaveLength(1);
  });

  test('el resolver recalcula costos prospectivos sin reescribir el costo legado del producto',async({page})=>{
    await openStudio(page);
    const proposal=await approved(page,'MP-HFS','COM-1',3.4);
    const result=await page.evaluate(proposalId=>{
      const api=window.EL_ERRANTE_MASTER_COST_MATERIALIZATION_V12;
      const product=window.EL_ERRANTE_MATERIALS_V23.products.find(x=>x.sku==='EE-MAR-01');
      const before=api.effectiveProductCost(product);
      const legacyBefore=product.cost;
      api.materializeProposal(proposalId,{actor:'Dirección',reason:'Actualizar estándar prospectivo con trazabilidad'});
      const after=api.effectiveProductCost(product);
      return {before,after,legacyBefore,legacyAfter:product.cost,delta:after-before};
    },proposal.proposalId);
    expect(result.legacyBefore).toBe(7090);
    expect(result.legacyAfter).toBe(7090);
    expect(result.delta).toBeCloseTo(105,6);
    expect(result.after).toBeGreaterThan(result.before);
  });

  test('una propuesta posterior captura el estándar efectivo materializado',async({page})=>{
    await openStudio(page);
    const first=await approved(page,'MP-HFS','COM-1',3.4);
    const result=await page.evaluate(firstId=>{
      const materialization=window.EL_ERRANTE_MASTER_COST_MATERIALIZATION_V12;
      const proposals=window.EL_ERRANTE_MASTER_COST_PROPOSALS_V11;
      materialization.materializeProposal(firstId,{actor:'Dirección',reason:'Cerrar primera revisión del estándar'});
      const next=proposals.createProposal({materialId:'MP-HFS',evidencePurchaseId:'COM-1',proposedCost:3.6,rationale:'Nueva evidencia se compara con el estándar ya materializado',actor:'Costos'});
      return {standard:materialization.currentStandard('MP-HFS'),next};
    },first.proposalId);
    expect(result.standard).toMatchObject({cost:3.4,revision:1,source:'MATERIALIZED'});
    expect(result.next.standardCost).toBe(3.4);
    expect(result.next.proposedCost).toBe(3.6);
  });

  test('la UI conserva aprobación pendiente tras recargar',async({page})=>{
    await openStudio(page);
    await approved(page);
    await page.reload();
    await expect(page.locator('[data-master-materialization-version="1.2.0"]')).toBeVisible();
    await expect(page.locator('.md-v12-card')).toHaveCount(1);
    await expect(page.locator('.md-v12-card')).toContainText('Lista para materializar');
    await expect(page.locator('[data-md-v12-standard="MP-HFS"]')).toContainText('Baseline canónico');
  });

  test('no genera desbordamiento horizontal en móvil',async({page,isMobile})=>{
    test.skip(!isMobile,'Sólo proyecto móvil');
    await openStudio(page);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });
});