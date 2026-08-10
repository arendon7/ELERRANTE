const {test,expect}=require('@playwright/test');

async function openStudio(page){
  await page.addInitScript(()=>{
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.1',username:'juan',displayName:'Juan',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
    localStorage.setItem('ee_v24_material_purchases',JSON.stringify([
      {id:'COM-1',materialId:'MP-HFS',supplier:'Molinos Demo',invoiceReference:'FAC-001',receivedDate:'2026-08-09',quantity:25000,totalCost:85000,unitCost:3.4,dataStatus:'OBSERVADO',createdAt:'2026-08-09T12:00:00Z'},
      {id:'COM-2',materialId:'MP-HHO',supplier:'Molinos Demo',invoiceReference:'FAC-002',receivedDate:'2026-08-08',quantity:25000,totalCost:74000,unitCost:2.96,dataStatus:'OBSERVADO',createdAt:'2026-08-08T12:00:00Z'}
    ]));
    localStorage.removeItem('ee_v11_cost_proposal_events');
  });
  await page.goto('/studio.html');
  await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
  await expect(page.locator('[data-master-cost-version="1.1.0"]')).toBeVisible();
}

test.describe('Datos maestros V1.1 · propuestas de costo',()=>{
  test('crea propuesta desde evidencia sin mutar estándar ni compra',async({page})=>{
    await openStudio(page);
    const result=await page.evaluate(()=>{
      const api=window.EL_ERRANTE_MASTER_COST_PROPOSALS_V11;
      const before=api.integritySnapshot();
      const proposal=api.createProposal({materialId:'MP-HFS',evidencePurchaseId:'COM-1',proposedCost:3.4,rationale:'La compra observada supera el estándar vigente',actor:'Costos'});
      return {version:api.version,proposal,unchanged:api.integrityUnchanged(before),standard:window.EL_ERRANTE_MATERIALS_V23.materials.find(x=>x.id==='MP-HFS').cost,purchases:JSON.parse(localStorage.getItem('ee_v24_material_purchases'))};
    });
    expect(result.version).toBe('1.1.0');
    expect(result.unchanged).toBe(true);
    expect(result.standard).toBe(2.8);
    expect(result.purchases).toHaveLength(2);
    expect(result.proposal).toMatchObject({materialId:'MP-HFS',standardCost:2.8,proposedCost:3.4,status:'DRAFT'});
    expect(result.proposal.evidence).toMatchObject({purchaseId:'COM-1',unitCost:3.4,supplier:'Molinos Demo',date:'2026-08-09'});
  });

  test('requiere revisión antes de decidir y razón explícita',async({page})=>{
    await openStudio(page);
    const result=await page.evaluate(()=>{
      const api=window.EL_ERRANTE_MASTER_COST_PROPOSALS_V11;
      const draft=api.createProposal({materialId:'MP-HFS',evidencePurchaseId:'COM-1',proposedCost:3.4,rationale:'La evidencia reciente requiere revisar el estándar',actor:'Costos'});
      let draftDecisionError='';
      try{api.decideProposal(draft.proposalId,'APPROVE',{reason:'Razón suficientemente explícita',actor:'Dirección'});}catch(error){draftDecisionError=error.message;}
      const review=api.submitProposal(draft.proposalId,{actor:'Costos',note:'Lista para revisión'});
      let shortReasonError='';
      try{api.decideProposal(draft.proposalId,'APPROVE',{reason:'Sí',actor:'Dirección'});}catch(error){shortReasonError=error.message;}
      return {draftDecisionError,shortReasonError,review,events:api.events()};
    });
    expect(result.draftDecisionError).toContain('debe estar en revisión');
    expect(result.shortReasonError).toContain('razón explícita');
    expect(result.review.status).toBe('IN_REVIEW');
    expect(result.events.map(x=>x.type)).toEqual(['CREATED','SUBMITTED']);
  });

  test('aprobar añade evento pero no aplica costo al maestro',async({page})=>{
    await openStudio(page);
    const result=await page.evaluate(()=>{
      const api=window.EL_ERRANTE_MASTER_COST_PROPOSALS_V11;
      const before=api.integritySnapshot();
      const draft=api.createProposal({materialId:'MP-HFS',evidencePurchaseId:'COM-1',proposedCost:3.4,rationale:'La evidencia reciente requiere revisar el estándar',actor:'Costos'});
      api.submitProposal(draft.proposalId,{actor:'Costos',note:'Enviar a comité'});
      const approved=api.decideProposal(draft.proposalId,'APPROVE',{actor:'Dirección',reason:'Evidencia suficiente para materialización futura'});
      return {approved,unchanged:api.integrityUnchanged(before),standard:window.EL_ERRANTE_MATERIALS_V23.materials.find(x=>x.id==='MP-HFS').cost,hasApply:typeof api.applyProposal==='function',events:api.events()};
    });
    expect(result.approved.status).toBe('APPROVED_FOR_MATERIALIZATION');
    expect(result.approved.events.map(x=>x.type)).toEqual(['CREATED','SUBMITTED','APPROVED']);
    expect(result.unchanged).toBe(true);
    expect(result.standard).toBe(2.8);
    expect(result.hasApply).toBe(false);
  });

  test('rechazar conserva historia y tampoco altera el estándar',async({page})=>{
    await openStudio(page);
    const result=await page.evaluate(()=>{
      const api=window.EL_ERRANTE_MASTER_COST_PROPOSALS_V11;
      const before=api.integritySnapshot();
      const draft=api.createProposal({materialId:'MP-HHO',evidencePurchaseId:'COM-2',proposedCost:2.96,rationale:'La compra observada amerita revisión del estándar',actor:'Costos'});
      api.submitProposal(draft.proposalId,{actor:'Costos'});
      const rejected=api.decideProposal(draft.proposalId,'REJECT',{actor:'Dirección',reason:'Se requiere una segunda evidencia comparable'});
      return {rejected,unchanged:api.integrityUnchanged(before),standard:window.EL_ERRANTE_MATERIALS_V23.materials.find(x=>x.id==='MP-HHO').cost,events:api.events()};
    });
    expect(result.rejected.status).toBe('REJECTED');
    expect(result.rejected.events).toHaveLength(3);
    expect(result.rejected.lastEvent.reason).toContain('segunda evidencia');
    expect(result.unchanged).toBe(true);
    expect(result.standard).toBe(2.96);
  });

  test('impide propuestas sin compra observada y duplicados abiertos',async({page})=>{
    await openStudio(page);
    const result=await page.evaluate(()=>{
      const api=window.EL_ERRANTE_MASTER_COST_PROPOSALS_V11;
      let noEvidence='';let duplicate='';
      try{api.createProposal({materialId:'MP-SALAME',proposedCost:10,rationale:'No existe evidencia observada suficiente',actor:'Costos'});}catch(error){noEvidence=error.message;}
      api.createProposal({materialId:'MP-HFS',evidencePurchaseId:'COM-1',proposedCost:3.4,rationale:'Primera propuesta abierta con evidencia real',actor:'Costos'});
      try{api.createProposal({materialId:'MP-HFS',evidencePurchaseId:'COM-1',proposedCost:3.5,rationale:'Segunda propuesta que no debería permitirse',actor:'Costos'});}catch(error){duplicate=error.message;}
      return {noEvidence,duplicate};
    });
    expect(result.noEvidence).toContain('requiere una compra observada');
    expect(result.duplicate).toContain('propuesta abierta');
  });

  test('la UI crea el borrador y muestra que aprobar no equivale a aplicar',async({page})=>{
    await openStudio(page);
    const form=page.locator('#md-v11-form');
    await form.getByLabel('Material').selectOption('MP-HFS');
    await form.getByLabel('Compra observada').selectOption('COM-1');
    await form.getByLabel('Costo propuesto por unidad').fill('3.4');
    await form.getByLabel('Justificación').fill('Compra observada consistente con revisión del estándar');
    await form.getByRole('button',{name:'Crear borrador'}).click();
    await expect(page.locator('.md-v11-card')).toHaveCount(1);
    await expect(page.locator('.md-v11-card')).toContainText('Borrador');
    await page.getByRole('button',{name:'Enviar a revisión'}).click();
    await expect(page.locator('.md-v11-card')).toContainText('En revisión');
  });

  test('no genera desbordamiento horizontal del documento en móvil',async({page,isMobile})=>{
    test.skip(!isMobile,'Sólo proyecto móvil');
    await openStudio(page);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });
});
