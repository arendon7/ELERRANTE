(()=>{
  const files=[
    "v040-app-001.b64","v040-app-002.b64","v040-app-003.b64",
    "v040-app-004.b64","v040-app-005.b64","v040-app-006.b64"
  ];

  let encoded="";
  for(const name of files){
    const request=new XMLHttpRequest();
    request.open("GET","assets/source/"+name,false);
    request.send(null);
    if(request.status!==200&&request.status!==0){
      throw new Error("No se pudo cargar la fuente íntegra de aplicación: "+name);
    }
    encoded+=request.responseText.replace(/\s+/g,"");
  }

  const binary=atob(encoded);
  const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));
  const source=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
  if(source.includes("[... ELLIPSIZATION ...]")){
    throw new Error("La fuente de aplicación contiene un marcador de truncación");
  }
  (0,eval)(source);

  if(!window.EE||typeof window.EE.addToCart!=="function"){
    throw new Error("La aplicación no expuso el contrato EE esperado");
  }
})();
