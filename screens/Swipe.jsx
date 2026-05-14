// Swipe screen — Tinder-style refined. Landscape image card + info below.
function SwipeScreen({jobs, onLike, onNope, onSwipeStart, onOpenDetail, remaining, toastMsg, user, liked, autoSwipe}) {
  const [, forceRender] = React.useState(0);
  const idxRef = React.useRef(0);
  const [drag, setDrag] = React.useState({x: 0, y: 0, active: false, rot: null});
  const [flyout, setFlyout] = React.useState(null); // {dir, x, rot} while card is flying out
  const startRef = React.useRef({x: 0, y: 0});
  const dragRef = React.useRef({x: 0, y: 0, active: false});
  const cardRef = React.useRef(null);
  const animatingRef = React.useRef(false);
  const historyRef = React.useRef([]); // [{dir, idx}] for undo

  const idx = idxRef.current;
  const canUndo = historyRef.current.length > 0;
  const onUndo = () => {
    const last = historyRef.current.pop();
    if (!last) return;
    idxRef.current = Math.max(0, idxRef.current - 1);
    forceRender(n => n + 1);
  };

  // No looping — once swiped, cards don't come back
  const current = idx < jobs.length ? jobs[idx] : null;
  const nextJob = (idx + 1) < jobs.length ? jobs[idx + 1] : null;
  const next2 = (idx + 2) < jobs.length ? jobs[idx + 2] : null;

  const doFinalize = (dir) => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    const curIdx = idxRef.current;
    const targetX = dir === 'like' ? 520 : -520;
    const rot = dir === 'like' ? 22 : -22;

    // 1. Flyout animation
    setFlyout({dir, x: targetX, rot});

    // 2. After flyout animation, advance card
    setTimeout(() => {
      historyRef.current.push({dir, idx: curIdx});
      if (dir === 'like') onLike(jobs[curIdx]);
      else onNope(jobs[curIdx]);

      // Advance index
      idxRef.current = curIdx + 1;

      // Reset drag and flyout
      dragRef.current = {x: 0, y: 0, active: false};
      setDrag({x: 0, y: 0, active: false, rot: null});
      setFlyout(null);
      animatingRef.current = false;
      forceRender(n => n + 1);
    }, 280);
  };

  // Use ref to always have latest doFinalize for event listeners
  const finalizeRef = React.useRef(doFinalize);
  finalizeRef.current = doFinalize;

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
      setDrag({x: dx, y: dy, active: true, rot: null});
    };
    const onUp = (e) => {
      if (!dragRef.current.active) return;
      if (e.type === 'mouseup' && isTouch) { isTouch = false; return; }
      const threshold = 80;
      const x = dragRef.current.x;
      dragRef.current.active = false;
      if (x > threshold) finalizeRef.current('like');
      else if (x < -threshold) finalizeRef.current('nope');
      else {
        dragRef.current = {x: 0, y: 0, active: false};
        setDrag({x: 0, y: 0, active: false, rot: null});
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
  }, []); // No deps — uses refs for everything

  const onPointerDown = (e) => {
    if (animatingRef.current) return;
    const isTouchEvt = !!e.touches;
    const pt = isTouchEvt ? e.touches[0] : e;
    startRef.current = {x: pt.clientX, y: pt.clientY};
    dragRef.current = {x: 0, y: 0, active: true};
    setDrag({x: 0, y: 0, active: true, rot: null});
    onSwipeStart?.();
  };

  // Auto-swipe from LP postMessage
  React.useEffect(() => {
    if (!autoSwipe) return;
    if (animatingRef.current) return;
    finalizeRef.current('nope');
  }, [autoSwipe]);

  // Compute card transform
  const cardRot = flyout ? flyout.rot : (drag.rot != null ? drag.rot : (drag.x / 16));
  const cardX = flyout ? flyout.x : drag.x;
  const cardY = flyout ? 0 : drag.y * 0.3;
  const likeOp = Math.max(0, Math.min(1, cardX / 120));
  const nopeOp = Math.max(0, Math.min(1, -cardX / 120));
  const transform = `translate(${cardX}px, ${cardY}px) rotate(${cardRot}deg)`;

  return (
    <div className="wm-screen wm-screen-tinder" style={{display:'flex', flexDirection:'column'}}>

      <div className="wm-tinder-body">
        <div className="wm-tinder-deck">
          {next2 && !flyout && (
            <div key={'bg2-' + next2.id} className="wm-tcard" style={{
              transform:'scale(0.92) translateY(20px)',
              opacity: 0.4,
              zIndex:1,
              transition: 'transform 0.3s ease, opacity 0.3s ease',
            }}>
              <TinderCardContent job={next2}/>
            </div>
          )}
          {nextJob && !flyout && (
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
              ref={cardRef}
              className={`wm-tcard ${drag.active ? 'dragging' : ''}`}
              style={{
                transform,
                zIndex:3,
                transition: flyout ? 'transform 0.26s ease-out' : 'none',
              }}
              onMouseDown={onPointerDown}
              onTouchStart={onPointerDown}
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
          <button className="wm-tbtn wm-tbtn-nope wm-tbtn-big" onClick={()=> finalizeRef.current('nope')} aria-label="スキップ">
            <span className="material-symbols-rounded" style={{fontSize:32, fontVariationSettings:"'wght' 500"}}>close</span>
          </button>
          <button className="wm-tbtn wm-tbtn-like wm-tbtn-big" onClick={()=> finalizeRef.current('like')} aria-label="いいね">
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
