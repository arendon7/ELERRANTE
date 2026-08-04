(()=>{
  const files=[
    "app-001.txt","app-002.txt","app-003.txt","app-004.txt",
    "app-005.txt","app-006.txt","app-007.txt","app-008.txt"
  ];

  let encoded="";
  for(const name of files){
    const request=new XMLHttpRequest();
    request.open("GET","assets/chunks/"+name,false);
    request.send(null);
    if(request.status!==200&&request.status!==0){
      throw new Error("No se pudo cargar "+name);
    }
    encoded+=request.responseText.trim();
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
