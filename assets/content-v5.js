(()=>{
  const data=window.EE_DATA;
  const required={
    products:11,
    articles:1,
    recipes:1,
    faqs:1
  };

  const counts={};
  const missing=[];

  if(!data){
    window.EE_CONTENT_STATUS={
      ready:false,
      release:"v0.6.1-integrated",
      missing:["EE_DATA"],
      counts:{}
    };
    document.documentElement.dataset.eeContent="missing";
    console.error("El Errante: la fuente maestra EE_DATA no está disponible.");
    return;
  }

  Object.entries(required).forEach(([key,minimum])=>{
    const value=data[key];
    counts[key]=Array.isArray(value)?value.length:0;
    if(counts[key]<minimum) missing.push(key);
  });

  const ready=missing.length===0;
  window.EE_CONTENT_STATUS={
    ready,
    release:"v0.6.1-integrated",
    source:"assets/data.js + assets/preprod.js + assets/products-v6.js",
    missing,
    counts,
    checkedAt:new Date().toISOString()
  };

  data.settings={
    ...(data.settings||{}),
    content_release:"v0.6.1-integrated",
    content_ready:ready
  };

  document.documentElement.dataset.eeContent=ready?"ready":"incomplete";
  document.dispatchEvent(new CustomEvent("ee:content-ready",{
    detail:window.EE_CONTENT_STATUS
  }));

  if(!ready){
    console.warn("El Errante: contenido incompleto",window.EE_CONTENT_STATUS);
  }
})();
