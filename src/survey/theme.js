/* Tercih edilen tema ilk boyamadan önce uygulanır. */
try{document.documentElement.setAttribute("data-tema",localStorage.getItem("aoc_anket_tema")||"koyu");}
catch(e){document.documentElement.setAttribute("data-tema","koyu");}
