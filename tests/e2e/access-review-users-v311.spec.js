const {test,expect}=require('@playwright/test');

const REVIEWERS=[
  {username:'juancho',password:'juancho',displayName:'Juancho'},
  {username:'lucho',password:'lucho',displayName:'Lucho'}
];

async function openReviewLogin(page){
  await page.goto('/acceso.html');
  const switcher=page.getByRole('button',{name:'Ingresar con usuario de revisión'});
  if(await switcher.isVisible())await switcher.click();
  await expect(page.getByRole('heading',{name:'Bienvenido de nuevo.'})).toBeVisible();
}

test.describe('Accesos de revisión V3.1.1',()=>{
  for(const reviewer of REVIEWERS){
    test(`${reviewer.displayName} puede entrar desde un navegador sin cuenta local`,async({page})=>{
      await openReviewLogin(page);
      await page.getByLabel('Usuario').fill(reviewer.username);
      await page.getByLabel('Contraseña',{exact:true}).fill(reviewer.password);
      await page.getByRole('button',{name:'Ingresar al sistema'}).click();

      await expect(page).toHaveURL(/centro-interno\.html/);
      await expect(page.getByRole('heading',{name:'Elige dónde quieres trabajar.'})).toBeVisible();

      const state=await page.evaluate(()=>({
        session:JSON.parse(sessionStorage.getItem('ee_v31_session')),
        localAccount:localStorage.getItem('ee_v31_local_account')
      }));
      expect(state.session.username).toBe(reviewer.username);
      expect(state.session.displayName).toBe(reviewer.displayName);
      expect(state.session.role).toBe('Revisor');
      expect(state.localAccount).toBeNull();
    });
  }

  test('una clave incorrecta no abre una sesión de revisión',async({page})=>{
    await openReviewLogin(page);
    await page.getByLabel('Usuario').fill('juancho');
    await page.getByLabel('Contraseña',{exact:true}).fill('incorrecta');
    await page.getByRole('button',{name:'Ingresar al sistema'}).click();
    await expect(page.locator('#v31-access-message')).toHaveText('Usuario o contraseña incorrectos.');
    const session=await page.evaluate(()=>sessionStorage.getItem('ee_v31_session'));
    expect(session).toBeNull();
  });
});