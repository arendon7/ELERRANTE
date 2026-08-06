((root)=>{
  'use strict';

  const VERSION='2.8.0';
  const CACHE='el-errante-v2-8-brand-canon-1';
  const BASE='assets/images/brand-final/';

  const assets=Object.freeze({
    logoMark:'assets/logo-mark.svg',
    logoLockup:'assets/logo-lockup.svg',
    homeHero:BASE+'home-hero.webp',
    homeHeroMobile:BASE+'home-hero-mobile.webp',
    homeMasaFuego:BASE+'home-masa-fuego.webp',
    homeFermentacion:BASE+'home-fermentacion.webp',
    homeIngredientes:BASE+'home-ingredientes.webp',
    homeCompartir:BASE+'home-compartir.webp',
    homeEnCasa:BASE+'home-en-casa.webp',
    homeDespensa:BASE+'home-despensa.webp',
    eventoHero:BASE+'evento-hero.webp',
    eventoNoche:BASE+'evento-noche.webp',
    eventoServicio:BASE+'evento-servicio.webp',
    og:BASE+'og-el-errante.webp',
    harina:BASE+'producto-harina.webp',
    creaTuya:BASE+'producto-crea-tuya.webp',
    margherita:BASE+'producto-margherita.webp',
    diavola:BASE+'producto-diavola.webp',
    bosque:BASE+'producto-bosque.webp',
    cuatroQuesos:BASE+'producto-cuatro-quesos.webp',
    laErrante:BASE+'producto-la-errante.webp',
    salsaTomate:BASE+'producto-salsa-tomate.webp',
    reduccionBalsamica:BASE+'producto-reduccion-balsamica.webp',
    panelaMaracuya:BASE+'producto-panela-maracuya.webp',
    comboPrimeraRuta:BASE+'producto-combo-primera-ruta.webp'
  });

  const aliases=Object.freeze({
    'assets/images/hero-desktop.svg':assets.homeHero,
    'assets/images/hero-mobile.svg':assets.homeHeroMobile,
    'assets/images/v040/v040-hero-desktop.svg':assets.homeHero,
    'assets/images/v040/v040-hero-mobile.svg':assets.homeHeroMobile,
    'assets/images/fermentacion.png':assets.homeFermentacion,
    'assets/images/alveolos.png':assets.homeFermentacion,
    'assets/images/pizza-neo.png':assets.margherita,
    'assets/images/pizza-errante.png':assets.laErrante,
    'assets/images/masa-apertura.png':assets.homeMasaFuego,
    'assets/images/harina-manos.svg':assets.homeMasaFuego,
    'assets/images/harina-horno.svg':assets.homeMasaFuego,
    'assets/images/manos-masa.svg':assets.homeMasaFuego,
    'assets/images/masa-apertura-gold.svg':assets.homeMasaFuego,
    'assets/images/masa-apertura.svg':assets.homeMasaFuego,
    'assets/images/editorial-fuego.svg':assets.homeMasaFuego,
    'assets/images/v040/v040-harina-manos.svg':assets.homeMasaFuego,
    'assets/images/v040/v040-harina-horno.svg':assets.homeMasaFuego,
    'assets/images/v040/v040-manos-masa.svg':assets.homeMasaFuego,
    'assets/images/v040/v040-masa-apertura.svg':assets.homeMasaFuego,
    'assets/images/v040/v040-bitacora-fuego.svg':assets.homeMasaFuego,
    'assets/images/alveolos.svg':assets.homeFermentacion,
    'assets/images/fermentacion.svg':assets.homeFermentacion,
    'assets/images/v040/v040-alveolos.svg':assets.homeFermentacion,
    'assets/images/v040/v040-fermentacion.svg':assets.homeFermentacion,
    'assets/images/v6-harina-aire-tiempo.svg':assets.harina,
    'assets/images/harina-packshot.svg':assets.harina,
    'assets/images/v040/v040-harina-empaques.svg':assets.harina,
    'assets/images/v6-crea-la-tuya.svg':assets.creaTuya,
    'assets/images/v6-margherita-taller.svg':assets.margherita,
    'assets/images/v6-diavola-errante.svg':assets.diavola,
    'assets/images/v6-bosque.svg':assets.bosque,
    'assets/images/v6-cuatro-quesos.svg':assets.cuatroQuesos,
    'assets/images/v6-la-errante.svg':assets.laErrante,
    'assets/images/pizza-la-errante.svg':assets.laErrante,
    'assets/images/pizza-errante.svg':assets.laErrante,
    'assets/images/v040/v040-pizza-errante.svg':assets.laErrante,
    'assets/images/v6-salsa-tomate.svg':assets.salsaTomate,
    'assets/images/salsa-tomate-packshot.svg':assets.salsaTomate,
    'assets/images/v6-reduccion-balsamica.svg':assets.reduccionBalsamica,
    'assets/images/balsamica-packshot.svg':assets.reduccionBalsamica,
    'assets/images/v6-panela-maracuya.svg':assets.panelaMaracuya,
    'assets/images/v6-combo-primera-ruta.svg':assets.comboPrimeraRuta,
    'assets/images/combo-primera-ruta.svg':assets.comboPrimeraRuta,
    'assets/images/pizza-neo.svg':assets.margherita,
    'assets/images/v040/v040-pizza-neo.svg':assets.margherita,
    'assets/images/pizzas-artesanales.svg':assets.homeEnCasa,
    'assets/images/pizzas-coleccion.svg':assets.homeEnCasa,
    'assets/images/v040/v040-pizzas-artesanales.svg':assets.homeEnCasa,
    'assets/images/v040/v040-pizzas-coleccion.svg':assets.homeEnCasa,
    'assets/images/despensa.svg':assets.homeDespensa,
    'assets/images/v040/v040-despensa.svg':assets.homeDespensa,
    'assets/images/aplicaciones-empaque.svg':assets.comboPrimeraRuta,
    'assets/images/v040/v040-aplicaciones-empaque.svg':assets.comboPrimeraRuta,
    'assets/images/pizzeria-movil.svg':assets.eventoHero,
    'assets/images/eventos-noche-gold.svg':assets.eventoNoche,
    'assets/images/evento-operacion-gold.svg':assets.eventoServicio,
    'assets/images/v040/v040-pizzeria-movil.svg':assets.eventoHero
  });

  const productAssets=Object.freeze({
    'harina-aire-y-tiempo':assets.harina,
    'crea-la-tuya':assets.creaTuya,
    'margherita-del-taller':assets.margherita,
    'diavola-errante':assets.diavola,
    'bosque':assets.bosque,
    'cuatro-quesos-montana':assets.cuatroQuesos,
    'la-errante':assets.laErrante,
    'salsa-tomate':assets.salsaTomate,
    'reduccion-balsamica':assets.reduccionBalsamica,
    'panela-maracuya':assets.panelaMaracuya,
    'combo-primera-ruta':assets.comboPrimeraRuta
  });

  function normalize(value){
    return String(value||'').trim().split('?')[0].split('#')[0].replace(/^\.\//,'').replace(/^\//,'');
  }

  function resolve(value){
    const clean=normalize(value);
    return aliases[clean]||clean;
  }

  function canonicalGallery(product){
    const primary=productAssets[product?.id]||resolve(product?.image);
    const secondary={
      'harina-aire-y-tiempo':[assets.homeMasaFuego,assets.homeFermentacion,assets.homeIngredientes],
      'crea-la-tuya':[assets.homeEnCasa,assets.homeMasaFuego,assets.homeIngredientes],
      'margherita-del-taller':[assets.homeMasaFuego,assets.homeIngredientes],
      'diavola-errante':[assets.homeMasaFuego,assets.homeIngredientes],
      'bosque':[assets.homeIngredientes,assets.homeMasaFuego],
      'cuatro-quesos-montana':[assets.homeIngredientes,assets.homeMasaFuego],
      'la-errante':[assets.homeIngredientes,assets.homeMasaFuego],
      'salsa-tomate':[assets.homeDespensa,assets.creaTuya],
      'reduccion-balsamica':[assets.homeDespensa,assets.bosque],
      'panela-maracuya':[assets.homeDespensa,assets.laErrante],
      'combo-primera-ruta':[assets.harina,assets.creaTuya,assets.laErrante]
    }[product?.id]||[];
    return [...new Set([primary,...secondary].filter(Boolean))];
  }

  function applyToData(data){
    if(!data||typeof data!=='object')return data;
    for(const product of data.products||[]){
      const canonical=productAssets[product.id]||resolve(product.image);
      if(canonical)product.image=canonical;
      product.gallery=canonicalGallery(product);
      product.brand_asset_version=VERSION;
    }
    for(const collection of [data.recipes,data.articles]){
      for(const item of collection||[]){
        if(item.image)item.image=resolve(item.image);
        if(Array.isArray(item.gallery))item.gallery=[...new Set(item.gallery.map(resolve))];
      }
    }
    data.brand={
      name:'EL ERRANTE',
      descriptor:'COCINA',
      line:'MASA · FUEGO · TERRITORIO',
      version:VERSION,
      logo_mark:assets.logoMark,
      logo_lockup:assets.logoLockup
    };
    if(data.settings){
      data.settings.version=VERSION;
      data.settings.brand_version=VERSION;
    }
    return data;
  }

  function applyToDom(scope){
    const rootNode=scope||root.document;
    if(!rootNode?.querySelectorAll)return;
    rootNode.querySelectorAll('img[src]').forEach(image=>{
      const next=resolve(image.getAttribute('src'));
      if(next&&next!==normalize(image.getAttribute('src')))image.setAttribute('src',next);
      image.dataset.brandCanon=VERSION;
    });
    rootNode.querySelectorAll('source[srcset]').forEach(source=>{
      const entries=String(source.getAttribute('srcset')||'').split(',').map(part=>part.trim()).filter(Boolean);
      const next=entries.map(entry=>{
        const bits=entry.split(/\s+/);
        bits[0]=resolve(bits[0]);
        return bits.join(' ');
      }).join(', ');
      if(next)source.setAttribute('srcset',next);
    });
  }

  root.EL_ERRANTE_BRAND_V28=Object.freeze({
    version:VERSION,
    cache:CACHE,
    assets,
    aliases,
    productAssets,
    normalize,
    resolve,
    canonicalGallery,
    applyToData,
    applyToDom
  });
})(typeof window!=='undefined'?window:self);
