(()=>{
  'use strict';

  function readText(path){
    const request=new XMLHttpRequest();
    request.open('GET',path,false);
    request.send(null);
    if(request.status!==200&&request.status!==0)throw new Error('No se pudo cargar '+path);
    return request.responseText;
  }

  if(!window.EL_ERRANTE_BRAND_V28){
    (0,eval)(readText('assets/brand-canon-v28.js'));
  }
  const BRAND=window.EL_ERRANTE_BRAND_V28;
  if(!BRAND||BRAND.version!=='2.8.0')throw new Error('No se cargó el canon de marca V2.8');

  const files=['v040-data-001.b64','v040-data-002.b64','v040-data-003.b64','v040-data-004.b64'];
  let encoded='';
  for(const name of files)encoded+=readText('assets/source/'+name).replace(/\s+/g,'');
  const binary=atob(encoded);
  const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));
  const source=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
  if(source.includes('[... ELLIPSIZATION ...]'))throw new Error('La fuente de datos está truncada');
  (0,eval)(source);

  (0,eval)(readText('assets/products-v6.js'));

  const D=BRAND.applyToData(window.EE_DATA);
  if(!D||!Array.isArray(D.products)||D.products.length!==11){
    throw new Error('El catálogo canónico no produjo los 11 productos esperados');
  }
  const invalid=D.products.filter(product=>!String(product.image||'').startsWith('assets/images/brand-final/'));
  if(invalid.length)throw new Error('Existen productos fuera del canon visual V2.8: '+invalid.map(item=>item.id).join(', '));
  document.documentElement.dataset.eeBrandCanon=BRAND.version;
})();
