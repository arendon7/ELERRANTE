(()=>{
  const files=["data-001.txt","data-002.txt","data-003.txt"];
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

  const overlay=new XMLHttpRequest();
  overlay.open("GET","assets/products-v6.js",false);
  overlay.send(null);
  if(overlay.status===200||overlay.status===0) (0,eval)(overlay.responseText);
})();
