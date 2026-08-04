(()=>{
  const files=[
    "v040-data-001.b64",
    "v040-data-002.b64",
    "v040-data-003.b64",
    "v040-data-004.b64"
  ];

  let encoded="";
  for(const name of files){
    const request=new XMLHttpRequest();
    request.open("GET","assets/source/"+name,false);
    request.send(null);
    if(request.status!==200&&request.status!==0) throw new Error("No se pudo cargar la fuente íntegra "+name);
    encoded+=request.responseText.trim();
  }

  const binary=atob(encoded);
  const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));
  const source=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
  (0,eval)(source);

  const overlay=new XMLHttpRequest();
  overlay.open("GET","assets/products-v6.js",false);
  overlay.send(null);
  if(overlay.status!==200&&overlay.status!==0) throw new Error("No se pudo cargar assets/products-v6.js");
  (0,eval)(overlay.responseText);

  const visualMap=new Map([
    ["assets/images/fermentacion.png","assets/images/v040/v040-fermentacion.svg"],
    ["assets/images/pizza-neo.png","assets/images/v040/v040-pizza-neo.svg"],
    ["assets/images/alveolos.png","assets/images/v040/v040-alveolos.svg"],
    ["assets/images/pizza-errante.png","assets/images/v040/v040-pizza-errante.svg"],
    ["assets/images/masa-apertura.png","assets/images/v040/v040-masa-apertura.svg"]
  ]);
  const remap=value=>visualMap.get(value)||value;
  for(const collection of [window.EE_DATA?.products,window.EE_DATA?.recipes,window.EE_DATA?.articles]){
    for(const item of collection||[]){
      if(item.image) item.image=remap(item.image);
      if(Array.isArray(item.gallery)) item.gallery=item.gallery.map(remap);
    }
  }

  if(!window.EE_DATA||!Array.isArray(window.EE_DATA.products)||window.EE_DATA.products.length!==11){
    throw new Error("La fuente canónica no produjo los 11 productos esperados");
  }
})();
