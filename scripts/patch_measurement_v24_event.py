from pathlib import Path

measurement=Path('assets/measurement-v24.js')
text=measurement.read_text(encoding='utf-8')
old="""      if(fd.get('updateStock')){const stock=read(KEYS.stock,{});if(stock[materialId]===undefined||stock[materialId]===null||stock[materialId]===''){flash='Compra guardada. El inventario no cambió porque este material aún no tiene conteo físico.';}else{stock[materialId]=Number(stock[materialId])+quantity;write(KEYS.stock,stock);flash='Compra guardada e inventario actualizado desde el conteo existente.';window.dispatchEvent(new CustomEvent('ee:admin:ready',{detail:{mode:'local'}}));}}else flash='Compra guardada. El inventario no fue modificado.';
      render();
"""
new="""      let stockUpdated=false;
      if(fd.get('updateStock')){const stock=read(KEYS.stock,{});if(stock[materialId]===undefined||stock[materialId]===null||stock[materialId]===''){flash='Compra guardada. El inventario no cambió porque este material aún no tiene conteo físico.';}else{stock[materialId]=Number(stock[materialId])+quantity;write(KEYS.stock,stock);flash='Compra guardada e inventario actualizado desde el conteo existente.';stockUpdated=true;}}else flash='Compra guardada. El inventario no fue modificado.';
      render();
      if(stockUpdated)window.dispatchEvent(new CustomEvent('ee:v24:stock-updated'));
"""
if old not in text:
    raise SystemExit('No se encontró el bloque de compra V2.4 esperado')
measurement.write_text(text.replace(old,new,1),encoding='utf-8')

materials=Path('assets/materials-v23.js')
text=materials.read_text(encoding='utf-8')
old="""  window.addEventListener('ee:admin:ready',shell);
  window.addEventListener('storage',event=>{if([ORDER_KEY,STOCK_KEY].includes(event.key))shell();});
"""
new="""  window.addEventListener('ee:admin:ready',shell);
  window.addEventListener('ee:v24:stock-updated',shell);
  window.addEventListener('storage',event=>{if([ORDER_KEY,STOCK_KEY].includes(event.key))shell();});
"""
if old not in text:
    raise SystemExit('No se encontró el bloque de eventos V2.3 esperado')
materials.write_text(text.replace(old,new,1),encoding='utf-8')
