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
 *
 * Three states, and the third matters: "running" is the mark held at the centre,
 * "done" is it drifting home, "landed" is it at rest. Anyone who skips the
 * entrance goes straight to "landed", because "done" carries the raised z-index
 * that lifts the lockup over the scrim and a visitor who never saw it must not
 * keep it.
 *
 * It plays on every load, reloads included. BUILD-BRIEF §6's "fires once per
 * session" is overruled by the owner — see DECISIONS. The session flag was also
 * why the entrance looked broken while it was being worked on: the first load
 * consumed it, and every reload after that skipped the thing under test.
 */
export const ENTRANCE_SCRIPT = `(function(){
var r=document.documentElement;
/* Runs more than once: React re-inserts the node during hydration, and the second
   execution would restart an entrance that is already playing. Whoever gets here
   first decides, and the attribute is the record of that. */
if(r.dataset.entrance)return;
try{
  /* No session flag. Reduced motion and a hash deep link still skip it: one is
     an accessibility preference, the other is someone who asked for a specific
     part of the page and should not be held at the top of it. */
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var deep=location.hash!=='';
  if(reduced||deep){r.dataset.entrance='landed';return}
  var e=document.querySelector('[data-vj-emblem="full"]');
  if(!e){r.dataset.entrance='landed';return}
  var x=0,y=0,n=e;
  while(n){x+=n.offsetLeft;y+=n.offsetTop;n=n.offsetParent}
  var cx=x+e.offsetWidth/2-(window.pageXOffset||0);
  var cy=y+e.offsetHeight/2-(window.pageYOffset||0);
  r.style.setProperty('--vj-ent-dx',(window.innerWidth/2-cx).toFixed(1)+'px');
  r.style.setProperty('--vj-ent-dy',(window.innerHeight/2-cy).toFixed(1)+'px');
  r.dataset.entrance='running';
  /* Two seconds, and the mark is alive for both of them: the rings keep turning
     and the vajana keeps drifting in the hollow, exactly as they do in the hero,
     because it *is* the hero's emblem and nothing here freezes it.

     A timer is right for this and rAF was right for an earlier, much shorter
     version. The slip that made setTimeout unreliable at 300ms — measured firing
     at 751, 844 and 1257ms — is hydration competing for the main thread, and
     hydration is long finished two seconds in.

     This overruns BUILD-BRIEF §6's 2.5s deliberately; see DECISIONS. */
  setTimeout(function(){r.dataset.entrance='done'},2000);
}catch(err){r.dataset.entrance='landed'}
})()`;
