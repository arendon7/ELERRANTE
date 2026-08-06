(()=>{
  'use strict';
  if(!window.EE||typeof window.EE.addToCart!=='function'){
    throw new Error('La aplicación materializada no expuso el contrato EE esperado');
  }
  document.documentElement.dataset.eeAppSource='materialized';
})();
