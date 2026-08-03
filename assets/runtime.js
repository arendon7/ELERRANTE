
(() => {
  const D = window.EE_DATA;
  const STORE = 'ee_v4_overrides';

  const getOverrides = () => {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; }
    catch { return {}; }
  };

  const setOverrides = value => localStorage.setItem(STORE, JSON.stringify(value));

  const deepApply = (target, source) => {
    if (!source || typeof source !== 'object') return target;
    Object.entries(source).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        target[key] = value;
      } else if (value && typeof value === 'object') {
        if (!target[key] || typeof target[key] !== 'object') target[key] = {};
        deepApply(target[key], value);
      } else {
        target[key] = value;
      }
    });
    return target;
  };

  const applyOverrides = () => {
    const o = getOverrides();

    if (o.seller) deepApply(D.settings.seller, o.seller);

    if (o.products) {
      Object.entries(o.products).forEach(([id, change]) => {
        const product = D.products.find(p => p.id === id);
        if (!product) return;
        if (change.variants) {
          Object.entries(change.variants).forEach(([variantId, variantChange]) => {
            const variant = product.variants.find(v => v.id === variantId);
            if (variant) deepApply(variant, variantChange);
          });
        }
        const copy = {...change};
        delete copy.variants;
        deepApply(product, copy);
      });
    }

    if (Array.isArray(o.coverage)) {
      D.coverage = o.coverage;
    }
  };

  applyOverrides();

  window.EE_LOCAL = {
    getOverrides,
    setOverrides,
    reset: () => {
      localStorage.removeItem(STORE);
      location.reload();
    },
    exportAll: () => {
      const snapshot = {
        generated_at: new Date().toISOString(),
        version: D.settings.version,
        overrides: getOverrides(),
        commerce: {
          cart: JSON.parse(localStorage.getItem('ee_v2_cart') || '[]'),
          orders: JSON.parse(localStorage.getItem('ee_v2_orders') || '[]'),
          events: JSON.parse(localStorage.getItem('ee_v2_leads') || '[]'),
          support: JSON.parse(localStorage.getItem('ee_v2_tickets') || '[]')
        },
        operations: {
          production: JSON.parse(localStorage.getItem('ee_v3_production') || '[]'),
          lots: JSON.parse(localStorage.getItem('ee_v3_lots') || '[]'),
          routes: JSON.parse(localStorage.getItem('ee_v3_routes') || '[]'),
          validation: JSON.parse(localStorage.getItem('ee_v3_validation') || '{}')
        }
      };
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `el-errante-demo-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
    },
    importAll: file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const snapshot = JSON.parse(reader.result);
          if (snapshot.overrides) setOverrides(snapshot.overrides);
          const c = snapshot.commerce || {};
          const o = snapshot.operations || {};
          if (c.cart) localStorage.setItem('ee_v2_cart', JSON.stringify(c.cart));
          if (c.orders) localStorage.setItem('ee_v2_orders', JSON.stringify(c.orders));
          if (c.events) localStorage.setItem('ee_v2_leads', JSON.stringify(c.events));
          if (c.support) localStorage.setItem('ee_v2_tickets', JSON.stringify(c.support));
          if (o.production) localStorage.setItem('ee_v3_production', JSON.stringify(o.production));
          if (o.lots) localStorage.setItem('ee_v3_lots', JSON.stringify(o.lots));
          if (o.routes) localStorage.setItem('ee_v3_routes', JSON.stringify(o.routes));
          if (o.validation) localStorage.setItem('ee_v3_validation', JSON.stringify(o.validation));
          resolve(snapshot);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    })
  };
})();
