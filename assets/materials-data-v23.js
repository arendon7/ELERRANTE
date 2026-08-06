(()=>{
  'use strict';
  const M=(id,name,unit,cost,status='ESTIMADO',confidence='Media')=>({id,name,unit,cost,status,confidence});
  const materials=[
    M('MP-HFS','Harina Flor Suprema','g',2.8,'CONFIRMADO','Media'),
    M('MP-HHO','Harina Haz de Oro','g',2.96,'ESTIMADO','Baja-media'),
    M('MP-AGU','Agua','g',0,'INFERIDO','Baja'),
    M('MP-LEV','Levadura','g',80,'ESTIMADO','Baja'),
    M('MP-SAL','Sal','g',2.51,'ESTIMADO','Baja'),
    M('MP-ACE','Aceite de oliva','ml',40,'ESTIMADO','Media'),
    M('MP-POM90','Pomodoro porción grande','porción',1500,'ESTIMADO','Media'),
    M('MP-POM70','Pomodoro porción pequeña','porción',1200,'ESTIMADO','Baja'),
    M('MP-MOZ','Mozzarella','g',28,'ESTIMADO','Media'),
    M('MP-PAR','Parmesano','g',66,'ESTIMADO','Media'),
    M('MP-SALAME','Salame picante','g',130,'ESTIMADO','Baja'),
    M('MP-CHAMP','Champiñón fresco','g',40,'ESTIMADO','Baja'),
    M('MP-GOU','Gouda semimadurado','g',75,'ESTIMADO','Baja'),
    M('MP-AZU','Queso azul','g',130,'ESTIMADO','Baja'),
    M('MP-CHO','Chorizo artesanal','g',70,'ESTIMADO','Baja'),
    M('MP-MIE','Miel','g',50,'ESTIMADO','Baja'),
    M('MP-CEB','Cebolla caramelizada terminada','g',17.78,'ESTIMADO','Baja'),
    M('MP-AJO','Ajo confitado','g',18,'ESTIMADO','Baja'),
    M('MP-BAL','Acabado balsámico','ml',26,'ESTIMADO','Baja'),
    M('MP-PYM','Reducción panela-maracuyá','ml',28,'ESTIMADO','Baja'),
    M('MP-ALB','Albahaca','unidad',50,'ESTIMADO','Baja'),
    M('EMP-VAC1','Bolsa individual al vacío','unidad',800,'CONFIRMADO','Media'),
    M('EMP-VAC2','Bolsa paquete x2','unidad',1000,'CONFIRMADO','Media'),
    M('EMP-ETQ','Etiqueta','unidad',250,'ESTIMADO','Baja-media'),
    M('EMP-DYP1','Doypack 1 kg','unidad',1200,'ESTIMADO','Baja'),
    M('EMP-DYP25','Doypack 2,5 kg','unidad',1700,'ESTIMADO','Baja'),
    M('EMP-BOL5','Bolsa reforzada 5 kg','unidad',2500,'ESTIMADO','Baja'),
    M('EMP-FRA500','Frasco, tapa, etiqueta y sello 500 g','unidad',3400,'ESTIMADO','Baja'),
    M('EMP-BOT250','Botella 250 ml','unidad',700,'ESTIMADO','Baja'),
    M('EMP-COMBO','Empaque exterior combo','unidad',2000,'ESTIMADO','Baja'),
    M('CIF-GAS','Gas de horneo','unidad',100,'ESTIMADO','Baja-media')
  ];
  const b=(materialId,qty)=>({materialId,qty});
  const products=[
    {sku:'EE-MAR-01',ids:['margherita-del-taller'],names:['Margherita del Taller'],name:'Margherita del Taller',price:20900,cost:7090,physicalUnits:1,status:'ESTIMADO',bom:[b('MP-HFS',175),b('MP-HHO',75),b('MP-POM90',1),b('MP-MOZ',100),b('MP-PAR',8),b('MP-ALB',1),b('MP-ACE',5),b('EMP-VAC1',1),b('EMP-ETQ',1),b('CIF-GAS',1)]},
    {sku:'EE-BOS-01',ids:['bosque'],names:['Bosque'],name:'Bosque',price:23900,cost:10560,physicalUnits:1,status:'ESTIMADO',bom:[b('MP-HFS',175),b('MP-HHO',75),b('MP-POM90',1),b('MP-MOZ',90),b('MP-CHAMP',80),b('MP-PAR',8),b('MP-AJO',10),b('MP-ACE',5),b('MP-BAL',5),b('EMP-VAC1',1),b('EMP-ETQ',1),b('CIF-GAS',1)]},
    {sku:'EE-DIA-01',ids:['diavola-errante'],names:['Diavola Errante'],name:'Diavola Errante',price:24900,cost:13070,physicalUnits:1,status:'ESTIMADO',bom:[b('MP-HFS',175),b('MP-HHO',75),b('MP-POM90',1),b('MP-MOZ',90),b('MP-SALAME',45),b('MP-PAR',5),b('MP-MIE',8),b('MP-ACE',3),b('EMP-VAC1',1),b('EMP-ETQ',1),b('CIF-GAS',1)]},
    {sku:'EE-CQM-01',ids:['cuatro-quesos-montana'],names:['Cuatro Quesos de Montaña','Cuatro Quesos Montaña'],name:'Cuatro Quesos de Montaña',price:24900,cost:9590,physicalUnits:1,status:'ESTIMADO',bom:[b('MP-HFS',175),b('MP-HHO',75),b('MP-POM90',1),b('MP-MOZ',65),b('MP-GOU',25),b('MP-AZU',12),b('MP-PAR',8),b('MP-ACE',3),b('EMP-VAC1',1),b('EMP-ETQ',1),b('CIF-GAS',1)]},
    {sku:'EE-ERR-01',ids:['la-errante'],names:['La Errante'],name:'La Errante',price:25900,cost:10900,physicalUnits:1,status:'ESTIMADO',bom:[b('MP-HFS',175),b('MP-HHO',75),b('MP-POM90',1),b('MP-MOZ',80),b('MP-CHO',45),b('MP-CEB',45),b('MP-PAR',8),b('MP-PYM',8),b('MP-ACE',3),b('EMP-VAC1',1),b('EMP-ETQ',1),b('CIF-GAS',1)]},
    {sku:'EE-CTP-02',ids:['crea-la-tuya-pequena','crea-la-tuya-small'],names:['Crea la Tuya pequeña','Crea pequeña x2'],name:'Crea la Tuya pequeña x2',price:17000,cost:4900,physicalUnits:2,status:'CONFIRMADO PARCIAL',bom:[b('MP-HFS',238),b('MP-HHO',102),b('MP-POM70',2),b('MP-ALB',2),b('EMP-VAC2',1),b('EMP-ETQ',1),b('CIF-GAS',2)]},
    {sku:'EE-CTG-02',ids:['crea-la-tuya-grande','crea-la-tuya-large','crea-la-tuya'],names:['Crea la Tuya grande','Crea grande x2','Crea la Tuya'],name:'Crea la Tuya grande x2',price:25000,cost:5880,physicalUnits:2,status:'CONFIRMADO PARCIAL',bom:[b('MP-HFS',350),b('MP-HHO',150),b('MP-POM90',2),b('MP-ALB',2),b('EMP-VAC2',1),b('EMP-ETQ',1),b('CIF-GAS',2)]},
    {sku:'EE-HAT-1000',ids:['harina-aire-y-tiempo-1kg'],names:['Harina Aire y Tiempo 1 kg'],name:'Harina Aire y Tiempo 1 kg',price:12900,cost:5830,physicalUnits:0,status:'ESTIMADO',bom:[b('MP-HFS',700),b('MP-HHO',300),b('EMP-DYP1',1),b('EMP-ETQ',1)]},
    {sku:'EE-HAT-2500',ids:['harina-aire-y-tiempo-2-5kg'],names:['Harina Aire y Tiempo 2,5 kg'],name:'Harina Aire y Tiempo 2,5 kg',price:27900,cost:12210,physicalUnits:0,status:'ESTIMADO',bom:[b('MP-HFS',1750),b('MP-HHO',750),b('EMP-DYP25',1),b('EMP-ETQ',1)]},
    {sku:'EE-HAT-5000',ids:['harina-aire-y-tiempo-5kg','harina-aire-y-tiempo'],names:['Harina Aire y Tiempo 5 kg','Harina Aire y Tiempo'],name:'Harina Aire y Tiempo 5 kg',price:49900,cost:22820,physicalUnits:0,status:'ESTIMADO',bom:[b('MP-HFS',3500),b('MP-HHO',1500),b('EMP-BOL5',1),b('EMP-ETQ',1)]},
    {sku:'EE-RBA-250',ids:['reduccion-balsamica'],names:['Reducción balsámica tradicional','Reducción balsámica'],name:'Reducción balsámica tradicional 250 ml',price:25000,cost:6500,physicalUnits:0,status:'CONFIRMADO PARCIAL',bom:[b('MP-BAL',250),b('EMP-BOT250',1),b('EMP-ETQ',1)]},
    {sku:'EE-PYM-250',ids:['panela-maracuya'],names:['Reducción panela + maracuyá','Panela + maracuyá'],name:'Reducción panela y maracuyá 250 ml',price:28000,cost:7000,physicalUnits:0,status:'ESTIMADO',bom:[b('MP-PYM',250),b('EMP-BOT250',1),b('EMP-ETQ',1)]},
    {sku:'EE-STP-500',ids:['salsa-tomate','salsa'],names:['Salsa de tomate','Salsa de tomate / pomodoro'],name:'Salsa de tomate 500 g',price:19900,cost:12320,physicalUnits:0,status:'ESTIMADO',bom:[b('MP-POM90',5.56),b('EMP-FRA500',1)]},
    {sku:'EE-CPR-01',ids:['combo-primera-ruta'],names:['Combo Primera Ruta'],name:'Combo Primera Ruta',price:49900,cost:19230,physicalUnits:2,status:'ESTIMADO',components:[{sku:'EE-HAT-1000',qty:1},{sku:'EE-CTP-02',qty:1},{sku:'EE-RBA-250',qty:1}],bom:[b('EMP-COMBO',1)]}
  ];
  const recipe={
    id:'REC-MASA-BASE-V23',name:'Masa base con poolish',status:'INFERIDO PARCIAL',yieldGrams:12516,
    note:'La hidratación total de 63 % implica 3.225 g de agua adicional; ese valor debe confirmarse con Juan David.',
    ingredients:[
      {stage:'Poolish',name:'Harina Flor Suprema',qty:1500,unit:'g'},
      {stage:'Poolish',name:'Agua',qty:1500,unit:'g'},
      {stage:'Poolish',name:'Levadura',qty:2,unit:'g'},
      {stage:'Masa final',name:'Harina Flor Suprema',qty:3750,unit:'g'},
      {stage:'Masa final',name:'Harina Haz de Oro',qty:2250,unit:'g'},
      {stage:'Masa final',name:'Agua adicional inferida',qty:3225,unit:'g'},
      {stage:'Masa final',name:'Levadura',qty:4,unit:'g'},
      {stage:'Masa final',name:'Sal',qty:195,unit:'g'},
      {stage:'Masa final',name:'Aceite de oliva',qty:100,unit:'ml'}
    ]
  };
  window.EL_ERRANTE_MATERIALS_V23=Object.freeze({
    version:'2.3.0',source:'Transferencia Financiera y Operativa v1.0 · agosto 2026',
    notice:'Modelo provisional. Los costos, rendimientos, mermas y vidas útiles deben conservar su estado de evidencia y no presentarse como mediciones reales.',
    stockPolicy:{coverageDays:7,safetyPercent:10,leadTimeDays:2},
    stageCosts:{stage:'Piloto',monthly:370000,items:[['Servicios e internet',90000],['Aseo y consumibles',50000],['Contabilidad y software',70000],['Mercadeo',80000],['Mantenimiento',40000],['Sanitario, etiquetas y registros',40000]]},
    materials,products,recipes:[recipe]
  });
})();
