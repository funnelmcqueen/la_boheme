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
  /* The clock starts here, at paint, not at hydration. Started from React it
     would be 2.3s *after* the bundle arrives, which on a phone on 4G is well past
     the 2.5s the whole thing is allowed — and the person it would be keeping
     waiting is the one at the table trying to read the menu. */
  setTimeout(function(){r.dataset.entrance='done'},2300);
}catch(err){r.dataset.entrance='done'}
})()`;
