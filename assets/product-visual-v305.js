(()=>{
  'use strict';

  const VERSION='3.0.5';
  const IDS=['margherita-del-taller','la-errante','bosque','diavola-errante','cuatro-quesos-montana'];
  const META={
    'margherita-del-taller':{
      hero:'Tomate, lácteo y masa: una composición donde la proporción debe quedar visible.',
      material:'Tomate y lácteo introducen humedad. Su distribución importa tanto como su presencia.',
      process:'La estructura se construye antes de que entren tomate, queso y acabado.'
    },
    'la-errante':{
      hero:'Grasa, tostado, dulzor y acidez organizados para sentirse como una sola trayectoria.',
      material:'Una receta de capas intensas necesita que cada materia cumpla una función y deje espacio a la siguiente.',
      process:'La masa y el fuego sostienen carga e intensidad; el acabado llega después para reabrir el bocado.'
    },
    'bosque':{
      hero:'Profundidad vegetal construida desde concentración, textura y control del agua.',
      material:'El hongo aporta sabor y también humedad. Concentrarlo sin volverlo insignificante forma parte de la receta.',
      process:'El fuego debe recuperar tostado y estructura sin convertir el centro en vapor ni secar la masa.'
    },
    'diavola-errante':{
      hero:'Una intensidad que crece por zonas y conserva tomate, masa y especias detrás del picante.',
      material:'Grasa, especias y distribución del embutido construyen la curva de calor; no solo su potencia.',
      process:'El fuego activa aroma y grasa sin llevar las especias al amargor ni secar el embutido.'
    },
    'cuatro-quesos-montana':{
      hero:'Riqueza láctea con zonas, contraste y espacio suficiente para que la masa siga presente.',
      material:'Fundencia, cuerpo, maduración y contraste son funciones distintas; no una sola capa de queso.',
      process:'El fuego debe recuperar fundencia sin transformar la mezcla en una superficie uniforme de grasa.'
    }
  };

  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  function currentProduct(){
    const id=new URLSearchParams(location.search).get('id');
    if(!IDS.includes(id))return null;
    return window.EE_DATA?.products?.find(product=>product.id===id)||null;
  }

  function roleForImage(image,index){
    if(index===0)return 'primary';
    const src=String(image.currentSrc||image.getAttribute('src')||'').toLowerCase();
    if(src.includes('ingredientes'))return 'material';
    if(src.includes('masa-fuego')||src.includes('fuego'))return 'process';
    return index===1?'material':'process';
  }

  function captionHTML(product,role){
    const meta=META[product.id];
    if(role==='primary')return `<span>Pieza principal · ${esc(product.territory||'En Casa')}</span><strong>${esc(product.name||'El Errante')}</strong><p>${esc(meta.hero)}</p>`;
    if(role==='material')return `<span>Materia · contexto</span><strong>Lo que entra también cambia el equilibrio.</strong><p>${esc(meta.material)}</p>`;
    return `<span>Proceso · contexto</span><strong>La imagen del producto empieza antes del emplatado.</strong><p>${esc(meta.process)}</p>`;
  }

  function decorateImage(image,index,product){
    if(image.closest('[data-v305-frame]'))return;
    const role=roleForImage(image,index);
    const figure=document.createElement('figure');
    figure.className=`v305-frame v305-frame-${role}`;
    figure.dataset.v305Frame=role;
    figure.dataset.v305Asset=String(image.getAttribute('src')||'');
    image.replaceWith(figure);
    figure.appendChild(image);
    const caption=document.createElement('figcaption');
    caption.innerHTML=captionHTML(product,role);
    figure.appendChild(caption);
    image.decoding='async';
    if(role==='primary'){
      image.loading='eager';
      image.fetchPriority='high';
    }else{
      image.loading='lazy';
    }
  }

  function enhance(){
    const root=document.querySelector('#dynamic-product');
    const product=currentProduct();
    if(!root||!product)return false;
    const gallery=root.querySelector('.product-gallery');
    if(!gallery)return false;
    if(gallery.dataset.v305Gallery==='true'){
      root.dataset.v305Ready='true';
      return true;
    }

    const images=[...gallery.querySelectorAll('img')];
    if(!images.length)return false;
    gallery.classList.add('v305-gallery');
    gallery.setAttribute('aria-label',`Dirección visual de ${product.name||'producto El Errante'}`);

    const head=document.createElement('div');
    head.className='v305-gallery-head';
    head.dataset.v305GalleryHead='true';
    head.innerHTML=`<div><span>Dirección visual · V3.0.5</span><strong>Producto, materia y proceso.</strong></div><p>La pieza principal identifica la pizza. Las imágenes secundarias amplían la lectura del método sin sustituir la ficha técnica ni la evidencia de producción.</p>`;
    gallery.insertBefore(head,gallery.firstChild);

    images.forEach((image,index)=>decorateImage(image,index,product));
    gallery.dataset.v305Gallery='true';
    root.dataset.v305Ready='true';
    document.documentElement.dataset.eeProductVisualVersion=VERSION;
    document.body.classList.add('ee-v305-product');
    return true;
  }

  const root=document.querySelector('#dynamic-product');
  if(!root)return;
  enhance();
  const observer=new MutationObserver(()=>enhance());
  observer.observe(root,{childList:true,subtree:true});
  document.addEventListener('ee:v303-product-detail-ready',enhance);
  setTimeout(()=>{enhance();observer.disconnect();},10000);
})();
