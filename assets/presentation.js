
(() => {
  function initPresentation(){
    const deck=document.querySelector('.presentation-deck');
    if(!deck) return;
    const slides=[...deck.querySelectorAll('.presentation-slide')];
    let index=0;

    const update=()=>{
      slides.forEach((s,i)=>s.classList.toggle('active',i===index));
      document.querySelector('.presentation-count').textContent=`${index+1} / ${slides.length}`;
      document.querySelector('.presentation-progress span').style.width=`${(index+1)/slides.length*100}%`;
    };

    const next=()=>{index=Math.min(index+1,slides.length-1);update()};
    const prev=()=>{index=Math.max(index-1,0);update()};

    document.querySelector('[data-next-slide]').addEventListener('click',next);
    document.querySelector('[data-prev-slide]').addEventListener('click',prev);
    document.addEventListener('keydown',e=>{
      if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();next()}
      if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();prev()}
      if(e.key==='Home'){index=0;update()}
      if(e.key==='End'){index=slides.length-1;update()}
    });
    update();
  }
  document.addEventListener('DOMContentLoaded',initPresentation);
})();
