(()=>{
  'use strict';

  function requestText(path,required=true){
    const request=new XMLHttpRequest();
    request.open('GET',path,false);
    try{request.send(null);}catch(error){if(required)throw error;return null;}
    if(request.status!==200&&request.status!==0){
      if(required)throw new Error('No se pudo cargar '+path);
      return null;
    }
    return request.responseText||null;
  }

  let source=requestText('assets/generated/preprod-v28.js',false);
  if(!source){
    const files=[
      'v040-preprod-001a.b64','v040-preprod-001b.b64','v040-preprod-001c.b64',
      'v040-preprod-001d.b64','v040-preprod-002.b64','v040-preprod-003.b64'
    ];
    let encoded='';
    for(const name of files)encoded+=requestText('assets/source/'+name).replace(/\s+/g,'');
    const binary=atob(encoded);
    const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));
    source=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
  }
  if(source.includes('[... ELLIPSIZATION ...]'))throw new Error('La lógica de preproducción contiene un marcador de truncación');
  (0,eval)(source);
  document.documentElement.dataset.eePreprodSource=source.includes('Fuente materializada de forma determinista')?'materialized':'compatibility';
})();
