/* Tercih edilen tema, ilk boyamadan önce uygulanır ki tema sıçraması olmasın. */
try{document.documentElement.setAttribute("data-tema",localStorage.getItem("aoc_tema")||"koyu");}
catch(e){document.documentElement.setAttribute("data-tema","koyu");}
