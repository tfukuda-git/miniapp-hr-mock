// Swipe screen — Tinder-style. Landscape image card + info below.
// v3: simplified state management — no setTimeout, no animatingRef race conditions.
function SwipeScreen({jobs, onLike, onNope, onSwipeStart, onOpenDetail, remaining, toastMsg, user, liked, autoSwipe}) {
  const [idx, setIdx] = React.useState(0);
  const [drag, setDrag] = React.useState({x: 0, y: 0, active: false});
  const [gone, setGone] = React.useState(null); // null | {dir, key} — card currently flying out
  const startRef = React.useRef({x: 0, y: 0});
  const dragRef = React.useRef({x: 0, y: 0, active: false});
  const goneRef = React.useRef(null);
  const historyRef = React.useRef([]); // [{dir, idx}] for undo

  const canUndo = historyRef.current.length > 0;
  const onUndo = () => {
    const last = historyRef.current.pop();
    if (!last) return;
    setGone(null);
    goneRef.current = null;
    setIdx(i => Math.max(0, i - 1));
  };

  const current = idx < jobs.length ? jobs[idx] : null;
  const nextJob = (idx + 1) < jobs.length ? jobs[idx + 1] : null;
  const next2 = (idx + 2) < jobs.length ? jobs[idx + 2] : null;

  // Core action: process a swipe decision
  const doSwipe = React.useCallback((dir) => {
    if (goneRef.current) return; // Already animating out
    const job = jobs[idx];
    if (!job) return;

    // Mark card as gone (triggers CSS flyout)
    const key = job.id + '-' + idx;
    goneRef.current = {dir, key};
    setGone({dir, key});

    // Record history
    historyRef.current.push({dir, idx});

    // Fire callback immediately (no delay)
    if (dir === 'like') onLike(job);
    else onNope(job);
  }, [idx, jobs, onLike, onNope]);

  // After flyout CSS transition ends, advance to next card
  const onTransitionEnd = React.useCallback(() => {
    if (!goneRef.current) return;
    goneRef.current = null;
    setGone(null);
    setIdx(i => i + 1);
    dragRef.current = {x: 0, y: 0, active: false};
    setDrag({x: 0, y: 0, active: false});
  }, []);

  // Fallback: if transitionend doesn't fire, advance after 350ms
  React.useEffect(() => {
    if (!gone) return;
    const timer = setTimeout(() => {
      if (goneRef.current) {
        goneRef.current = null;
        setGone(null);
        setIdx(i => i + 1);
        dragRef.current = {x: 0, y: 0, active: false};
        setDrag({x: 0, y: 0, active: false});
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [gone]);

  // Drag handling via window listeners (refs for no stale closures)
  const doSwipeRef = React.useRef(doSwipe);
  doSwipeRef.current = doSwipe;

  React.useEffect(() => {
    let isTouch = false;
    const onMove = (e) => {
      if (!dragRef.current.active) return;
      if (e.type === 'mousemove' && isTouch) return;
      e.preventDefault?.();
      const pt = e.touches ? e.touches[0] : e;
      const dx = pt.clientX - startRef.current.x;
      const dy = pt.clientY - startRef.current.y;
      dragRef.current = {x: dx, y: dy, active: true};
      setDrag({x: dx, y: dy, active: true});
    };
    const onUp = (e) => {
      if (!dragRef.current.active) return;
      if (e.type === 'mouseup' && isTouch) { isTouch = false; return; }
      const threshold = 80;
      const x = dragRef.current.x;
      dragRef.current.active = false;
      if (x > threshold) doSwipeRef.current('like');
      else if (x < -threshold) doSwipeRef.current('nope');
      else {
        dragRef.current = {x: 0, y: 0, active: false};
        setDrag({x: 0, y: 0, active: false});
      }
      if (e.type === 'touchend') isTouch = true;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, {passive: false});
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  const onPointerDown = (e) => {
    if (goneRef.current) return;
    const isTouchEvt = !!e.touches;
    const pt = isTouchEvt ? e.touches[0] : e;
    startRef.current = {x: pt.clientX, y: pt.clientY};
    dragRef.current = {x: 0, y: 0, active: true};
    setDrag({x: 0, y: 0, active: true});
    onSwipeStart?.();
  };

  // Auto-swipe from LP postMessage
  React.useEffect(() => {
    if (!autoSwipe) return;
    if (goneRef.current) return;
    doSwipeRef.current('nope');
  }, [autoSwipe]);

  // Compute card transform
  const isGone = !!gone;
  let cardX, cardY, cardRot;
  if (isGone) {
    cardX = gone.dir === 'like' ? 520 : -520;
    cardY = 0;
    cardRot = gone.dir === 'like' ? 22 : -22;
  } else {
    cardX = drag.x;
    cardY = drag.y * 0.3;
    cardRot = drag.x / 16;
  }
  const likeOp = Math.max(0, Math.min(1, cardX / 120));
  const nopeOp = Math.max(0, Math.min(1, -cardX / 120));
  const transform = `translate(${cardX}px, ${cardY}px) rotate(${cardRot}deg)`;

  return (
    <div className="wm-screen wm-screen-tinder" style={{display:'flex', flexDirection:'column'}}>
      <div className="wm-tinder-body">
        <div className="wm-tinder-deck">
          {next2 && !isGone && (
            <div key={'bg2-' + next2.id} className="wm-tcard" style={{
              transform:'scale(0.92) translateY(20px)',
              opacity: 0.4,
              zIndex:1,
              transition: 'transform 0.3s ease, opacity 0.3s ease',
            }}>
              <TinderCardContent job={next2}/>
            </div>
          )}
          {nextJob && !isGone && (
            <div key={'bg1-' + nextJob.id} className="wm-tcard" style={{
              transform:'scale(0.96) translateY(10px)',
              opacity: 0.7,
              zIndex:2,
              transition: 'transform 0.3s ease, opacity 0.3s ease',
            }}>
              <TinderCardContent job={nextJob}/>
            </div>
          )}
          {current && (
            <div
              key={'front-' + current.id}
              className={`wm-tcard ${drag.active ? 'dragging' : ''}`}
              style={{
                transform,
                zIndex:3,
                transition: isGone ? 'transform 0.28s ease-out' : 'none',
              }}
              onMouseDown={onPointerDown}
              onTouchStart={onPointerDown}
              onTransitionEnd={onTransitionEnd}
            >
              <TinderCardContent job={current} onDetail={() => onOpenDetail(current)}/>
              <div className="wm-tcard-stamp wm-tcard-stamp-like" style={{opacity: likeOp}}>LIKE</div>
              <div className="wm-tcard-stamp wm-tcard-stamp-nope" style={{opacity: nopeOp}}>NOPE</div>
            </div>
          )}
        </div>

        <div className="wm-tinder-actions">
          <button className="wm-tbtn wm-tbtn-undo" onClick={onUndo} aria-label="やり直し" disabled={!canUndo}>
            <span className="material-symbols-rounded" style={{fontSize:22, fontVariationSettings:"'wght' 500"}}>undo</span>
          </button>
          <button className="wm-tbtn wm-tbtn-nope wm-tbtn-big" onClick={() => doSwipe('nope')} aria-label="スキップ">
            <span className="material-symbols-rounded" style={{fontSize:32, fontVariationSettings:"'wght' 500"}}>close</span>
          </button>
          <button className="wm-tbtn wm-tbtn-like wm-tbtn-big" onClick={() => doSwipe('like')} aria-label="いいね">
            <span className="material-symbols-rounded" style={{fontSize:32, fontVariationSettings:"'FILL' 1"}}>favorite</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="wm-toast-wrap">
          <div className="wm-toast">
            <div className="wm-toast-icon"><span className="material-symbols-rounded" style={{fontSize:13, color:'#fff', fontVariationSettings:"'wght' 700"}}>check</span></div>
            <span>{toastMsg}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Tinder-style card content (landscape image + info below) ---
function TinderCardContent({job, onDetail}) {
  return (
    <div className="wm-tcard-inner wm-tcard-landscape">
      {/* Top: landscape image */}
      <div className="wm-tcard-photo-land">
        {job.photo ? (
          <img src={job.photo} alt="" draggable="false"/>
        ) : (
          <div className="wm-tcard-bg" style={{
            background: `linear-gradient(160deg, ${job.color2} 0%, ${job.color} 60%, ${job.color} 100%)`,
          }}>
            <div className="wm-tcard-bg-stripes"/>
          </div>
        )}
        {/* Category pill on image */}
        <div className="wm-tcard-cat-land">{job.category} · {job.subcategory}</div>
      </div>

      {/* Bottom: info section on white background */}
      <div className="wm-tcard-body-land">
        <div className="wm-tcard-title-land">{job.title}</div>
        <div className="wm-tcard-company-land">
          <span className="material-symbols-rounded" style={{fontSize:13, color:'#888'}}>apartment</span>
          <span>{job.company}</span>
          <span style={{color:'#ccc', margin:'0 2px'}}>·</span>
          <span className="material-symbols-rounded" style={{fontSize:13, color:'#888'}}>location_on</span>
          <span>{job.locationShort}</span>
        </div>

        <div className="wm-tcard-wage-land">
          <span className="wm-tcard-wage-label">{job.wageType}</span>
          <span className="wm-tcard-wage-amount">¥{job.wage.toLocaleString()}</span>
          {job.wageNote && <span className="wm-tcard-wage-note">{job.wageNote}</span>}
        </div>

        <div className="wm-tcard-meta-land">
          <span className="material-symbols-rounded" style={{fontSize:13, color:'#888'}}>schedule</span>
          <span>{job.shift}</span>
        </div>

        <div className="wm-tcard-tags-land">
          {job.tags.slice(0, 4).map((t, i) => (
            <span key={i} className="wm-tcard-tag-land">{t}</span>
          ))}
        </div>

        {onDetail && (
          <button
            onClick={(e) => { e.stopPropagation(); onDetail(); }}
            className="wm-tcard-detail-btn"
          >
            <span className="material-symbols-rounded" style={{fontSize: 16}}>open_in_new</span>
            詳細を見る
          </button>
        )}
      </div>
    </div>
  );
}

window.SwipeScreen = SwipeScreen;
