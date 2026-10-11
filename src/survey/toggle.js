(function(){
  var K="aoc_anket_tema";
  var btn=document.getElementById("btnTema"), lbl=document.getElementById("temaLbl");
  function uygula(t){
    document.documentElement.setAttribute("data-tema",t);
    if(btn) btn.setAttribute("aria-pressed", t==="koyu"?"true":"false");
    if(lbl) lbl.textContent = t==="koyu" ? "Koyu" : "Açık";
  }
  var m; try{ m=localStorage.getItem(K); }catch(e){}
  uygula(m==="acik"?"acik":"koyu");
  if(btn) btn.addEventListener("click",function(){
    var y=document.documentElement.getAttribute("data-tema")==="koyu"?"acik":"koyu";
    try{ localStorage.setItem(K,y); }catch(e){}
    uygula(y);
  });
})();
