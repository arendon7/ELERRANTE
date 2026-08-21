(()=>{
  'use strict';

  const D=window.EE_DATA;
  if(!D||!Array.isArray(D.products))return;

  const generated='assets/images/brand-v4/generated-01-20/';
  const pizzaVisuals={
    'margherita-del-taller':'02-margherita-v4.webp',
    'la-errante':'03-la-errante-v4.webp',
    'bosque':'04-bosque-v4.webp',
    'diavola-errante':'05-diavola-v4.webp',
    'cuatro-quesos-montana':'06-cuatro-quesos-v4.webp'
  };
  const comboVisual='15-combo-primera-ruta-v4.webp';
  const ingredients=generated+'09-ingredientes-v4.webp';
  const process=generated+'08-proceso-v4.webp';

  let promoted=0;
  for(const product of D.products){
    const pizzaFile=pizzaVisuals[product.id];
    if(pizzaFile){
      const primary=generated+pizzaFile;
      product.image=primary;
      product.gallery=[primary,ingredients,process];
      product.v4_visual_status='approved';
      promoted+=1;
      continue;
    }
    if(product.id==='combo-primera-ruta'){
      const primary=generated+comboVisual;
      product.image=primary;
      const prior=Array.isArray(product.gallery)?product.gallery.slice(1):[];
      product.gallery=[primary,...prior];
      product.v4_visual_status='approved-primary';
      promoted+=1;
    }
  }

  document.documentElement.dataset.eeV4ProductData='ready';
  window.EL_ERRANTE_V4_PRODUCT_DATA=Object.freeze({
    version:'4.0.0',
    promoted,
    ids:Object.freeze([...Object.keys(pizzaVisuals),'combo-primera-ruta'])
  });
})();
