(()=>{
  const hosted=location.protocol==="https:"||location.hostname.endsWith("github.io");
  if(!hosted)return;
  document.documentElement.dataset.eeMode="public";
  document.querySelectorAll(".local-runtime-badge,[data-internal-only],.internal-only").forEach(el=>el.remove());
  document.querySelectorAll(".demo-badge").forEach(el=>{
    const text=(el.textContent||"").toLowerCase();
    if(text.includes("gold master")||text.includes("demo")||text.includes("sin internet")||text.includes("biblioteca editorial completa"))el.remove();
  });
})();
