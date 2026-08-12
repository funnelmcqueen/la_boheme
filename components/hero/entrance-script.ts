/**
 * Runs synchronously at the end of the hero markup, before first paint.
 *
 * It has to be inline and it has to be *there* rather than in <head>: it measures
 * the emblem's resting position to work out how far it travels, so the DOM above it
 * must already exist, and it must resolve before the browser paints or the mark
 * appears at rest for a frame and then jumps to the centre of the screen.
 *
 * Everything it writes is a transform or an opacity. No layout is affected, so the
 * entrance cannot shift anything, and the page underneath is complete either way.
 */
export const ENTRANCE_SCRIPT = `(function(){
var r=document.documentElement;
/* Runs more than once: React re-inserts the node during hydration, and the second
   execution would find the session flag the first one just wrote and land the
   entrance before it had played. Whoever gets here first decides. */
if(r.dataset.entrance)return;
try{
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var deep=location.hash!=='';
  var seen=sessionStorage.getItem('vj-entrance')==='seen';
  if(reduced||deep||seen){r.dataset.entrance='done';return}
  var e=document.querySelector('[data-vj-emblem="full"]');
  if(!e){r.dataset.entrance='done';return}
  var x=0,y=0,n=e;
  while(n){x+=n.offsetLeft;y+=n.offsetTop;n=n.offsetParent}
  var cx=x+e.offsetWidth/2-(window.pageXOffset||0);
  var cy=y+e.offsetHeight/2-(window.pageYOffset||0);
  r.style.setProperty('--vj-ent-dx',(window.innerWidth/2-cx).toFixed(1)+'px');
  r.style.setProperty('--vj-ent-dy',(window.innerHeight/2-cy).toFixed(1)+'px');
  sessionStorage.setItem('vj-entrance','seen');
  r.dataset.entrance='running';
  /* Two frames, not a timer.
     
     This was setTimeout(2300), and the number was never the duration it looked
     like: it is scheduled on the main thread at exactly the moment hydration is
     using it, so it fires late by however busy the page is. Measured on a loaded
     machine, a nominal 300ms fired at 751, 844 and 1257ms across three runs — the
     slip was larger than the value. On a phone on 4G, which is the case §6 is
     written for, it is larger still.

     requestAnimationFrame twice instead: the first frame paints the mark at the
     centre, the second releases it. The hold is then one frame rather than a
     promise the platform cannot keep, and the entrance's length is the travel —
     which is a CSS transition on the compositor and does hold its duration. */
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    r.dataset.entrance='done';
  })});
}catch(err){r.dataset.entrance='done'}
})()`;
