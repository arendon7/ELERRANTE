const {test,expect}=require('@playwright/test');

async function internalSession(page){
  await page.addInitScript(()=>{
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'demo',displayName:'Demo',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
  });
}

async function financeDemo(page){
  await internalSession(page);
  await page.goto('/finanzas.html');
  await page.evaluate(()=>{
    [
      'ee_v30_mfo_snapshot','ee_v31_finance_working_model','ee_v31_finance_history','ee_v329_finance_demo','ee_v311_operational_demo',
      'ee_v14_orders','ee_v27_finance_movements','ee_v323_cash_counts','ee_v23_material_stock','ee_v24_material_purchases','ee_v25_purchase_orders'
    ].forEach(key=>localStorage.removeItem(key));
  });
  await page.reload();
  const load=page.getByRole('button',{name:'Cargar demo financiera',exact:true});
  await expect(load).toBeVisible();
  await load.click();
  await page.waitForFunction(()=>document.documentElement.dataset.financeDemoVersion==='3.2.9');
  await expect(page.getByText('Datos sintéticos activos',{exact:true})).toBeVisible();
  await expect(page.locator('[data-finance-v330]')).toBeVisible();
}

test.describe('Control V3.2 · lectura ejecutiva',()=>{
  test('permite elegir fecha y traduce excepciones en acciones',async({page})=>{
    await internalSession(page);
    await page.goto('/control.html');
    await expect(page.locator('html')).toHaveAttribute('data-control-executive-version','3.2.0');
    await expect(page.getByRole('heading',{name:'Entender el día antes de ejecutarlo.'})).toBeVisible();
    await expect(page.locator('[data-v32c-date]')).toBeVisible();

    const seeded=await page.evaluate(()=>{
      const data=window.EL_ERRANTE_MATERIALS_V23;
      const product=(data.products||[]).find(p=>(p.bom||[]).length);
      if(!product)return false;
      const date='2026-08-15';
      const materialId=product.bom[0].materialId;
      const item={quantity:2,name:product.name,productId:(product.ids||[])[0]||product.sku};
      localStorage.setItem('ee_v14_orders',JSON.stringify([{id:'UX-ORDER',status:'approved',delivery:{requestedDate:date},items:[item]}]));
      localStorage.setItem('ee_v23_material_stock',JSON.stringify({[materialId]:0}));
      sessionStorage.setItem('ee_v22_selected_date',date);
      window.dispatchEvent(new Event('ee:v22:reload'));
      return true;
    });
    expect(seeded).toBe(true);
    await expect(page.locator('[data-v32c-date]')).toHaveValue('2026-08-15');
    await expect(page.getByText('Bloqueado',{exact:true})).toBeVisible();
    await expect(page.getByText('Resolver faltantes confirmados',{exact:true})).toBeVisible();
    await expect(page.locator('.v32c-track[aria-label="Aprobados"]')).toHaveAttribute('aria-valuenow','1');

    await page.locator('[data-v32c-date]').fill('2026-08-16');
    await page.locator('[data-v32c-date]').dispatchEvent('change');
    await expect.poll(()=>page.evaluate(()=>sessionStorage.getItem('ee_v22_selected_date'))).toBe('2026-08-16');
  });

  test('móvil conserva lectura y acciones dentro del viewport',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.toLowerCase().includes('mobile'),'Validación móvil');
    await internalSession(page);
    await page.goto('/control.html');
    await expect(page.locator('[data-control-v32]')).toBeVisible();
    const geometry=await page.evaluate(()=>{const r=document.querySelector('[data-control-v32]').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,left:r.left,right:r.right,viewport:innerWidth};});
    expect(geometry.overflow).toBeLessThanOrEqual(2);
    expect(geometry.left).toBeGreaterThanOrEqual(-2);
    expect(geometry.right).toBeLessThanOrEqual(geometry.viewport+2);
  });
});

test.describe('Finanzas V3.3 · claridad y navegación',()=>{
  test('organiza el dashboard por preguntas y conserva el detalle especializado',async({page})=>{
    await financeDemo(page);
    await expect(page.locator('html')).toHaveAttribute('data-finance-guidance-version','3.3.0');
    await expect(page.getByRole('heading',{name:'Empieza por la pregunta, no por la hoja.'})).toBeVisible();
    await expect(page.locator('[data-finance-v330] [data-v330-go]')).toHaveCount(11);
    await expect(page.locator('.v330-chart-card')).toHaveCount(4);
    await expect(page.getByText('Siguiente paso recomendado',{exact:true})).toBeVisible();
    await expect(page.getByText('Plan',{exact:true}).first()).toBeVisible();
    await expect(page.getByText('Real',{exact:true}).first()).toBeVisible();
    await expect(page.getByText('Observado',{exact:true}).first()).toBeVisible();
    await expect(page.getByText('Escenario',{exact:true}).first()).toBeVisible();

    await page.getByRole('button',{name:/¿Estamos vendiendo lo planeado/}).click();
    await expect(page.locator('[data-section="real"]')).toHaveClass(/active/);
  });

  test('incluye un diccionario de términos financieros en lenguaje simple',async({page})=>{
    await financeDemo(page);
    const glossary=page.locator('.v330-glossary');
    await expect(glossary).toBeVisible();
    await glossary.locator('summary').click();
    await expect(glossary.getByText('COGS',{exact:true})).toBeVisible();
    await expect(glossary.getByText('Margen directo',{exact:true})).toBeVisible();
    await expect(glossary.getByText('Costo histórico',{exact:true})).toBeVisible();
  });

  test('móvil no introduce desbordamiento horizontal',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.toLowerCase().includes('mobile'),'Validación móvil');
    await financeDemo(page);
    const geometry=await page.evaluate(()=>{const r=document.querySelector('[data-finance-v330]').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,left:r.left,right:r.right,viewport:innerWidth};});
    expect(geometry.overflow).toBeLessThanOrEqual(2);
    expect(geometry.left).toBeGreaterThanOrEqual(-2);
    expect(geometry.right).toBeLessThanOrEqual(geometry.viewport+2);
  });
});
