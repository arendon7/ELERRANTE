(()=>{
  const files=["data-001.txt","data-002.txt","data-003.txt"];
  const byteParts=[];

  for(const name of files){
    const request=new XMLHttpRequest();
    request.open("GET","assets/chunks/"+name,false);
    request.send(null);
    if(request.status!==200&&request.status!==0) throw new Error("No se pudo cargar "+name);

    const binary=atob(request.responseText.trim());
    byteParts.push(Uint8Array.from(binary,char=>char.charCodeAt(0)));
  }

  const total=byteParts.reduce((sum,part)=>sum+part.length,0);
  const bytes=new Uint8Array(total);
  let offset=0;
  for(const part of byteParts){
    bytes.set(part,offset);
    offset+=part.length;
  }

  const source=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
  (0,eval)(source);

  const overlay=new XMLHttpRequest();
  overlay.open("GET","assets/products-v6.js",false);
  overlay.send(null);
  if(overlay.status===200||overlay.status===0) (0,eval)(overlay.responseText);
})();
