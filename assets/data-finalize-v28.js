(()=>{
  'use strict';
  const BRAND=window.EL_ERRANTE_BRAND_V28;
  if(!BRAND||BRAND.version!=='2.8.0')throw new Error('No se cargó el canon de marca V2.8');
  if(!window.EE_DATA||!Array.isArray(window.EE_DATA.products))throw new Error('La fuente materializada no expuso EE_DATA');
  const data=BRAND.applyToData(window.EE_DATA);
  if(data.products.length!==11)throw new Error('El catálogo materializado no contiene 11 productos');
  const invalid=data.products.filter(product=>
    !String(product.image||'').startsWith('assets/images/brand-final/')||
    !Array.isArray(product.gallery)||
    product.gallery.some(image=>!String(image).startsWith('assets/images/brand-final/'))
  );
  if(invalid.length)throw new Error('Productos fuera del canon V2.8: '+invalid.map(product=>product.id).join(', '));
  document.documentElement.dataset.eeBrandCanon=BRAND.version;
  document.documentElement.dataset.eeSourceMode='materialized';
})();
