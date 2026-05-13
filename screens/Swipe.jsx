// Swipe screen — Tinder-style refined. Full-bleed image card, minimal overlay,
// clean floating action buttons below.
function SwipeScreen({jobs, onLike, onNope, onSwipeStart, onOpenDetail, remaining, toastMsg, user, liked, autoSwipe}) {
  const [idx, setIdx] = React.useState(0);
  const [drag, setDrag] = React.useState({x: 0, y: 0, active: false, rot: null});
  const startRef = React.useRef({x: 0, y: 0});
  const dragRef = React.useRef({x: 0, y: 0, active: false});
  const cardRef = React.useRef(null);
  const animatingRef = React.useRef(false);
  const historyRef = React.useRef([]); // [{dir, idx}] for undo

  const canUndo = historyRef.current.length > 0;
  const onUndo = () => {
    const last = historyRef.current.pop();
    if (!last) return;
    setIdx(i => (i - 1 + jobs.length) % jobs.length);
  };

  const current = jobs[idx];
  const nextJob = jobs[(idx+1) % jobs.length];
  const next2 = jobs[(idx+2) % jobs.length];

  const finalize = React.useCallback((dir) => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    const targetX = dir === 'like' ? 520 : -520;
    const rot = dir === 'like' ? 22 : -22;
    dragRef.current = {x: targetX, y: 0, active: false};
    setDrag({x: targetX, y: 0, active: false, rot});
    setTimeout(() => {
      historyRef.current.push({dir, idx});
      if (dir === 'like') onLike(jobs[idx]);
      else onNope(jobs[idx]);
      setIdx(i => (i + 1) % jobs.length);
      dragRef.current = {x: 0, y: 0, active: false};
      setDrag({x: 0, y: 0, active: false, rot: null});
      animatingRef.current = false;
    }, 260);
  }, [jobs, idx, onLike, onNope]);

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
      console.log('[SWIPE-UP]', 'dx=', x, 'dir=', x > threshold ? 'like' : x < -threshold ? 'nope' : 'cancel', 'via=', e.type);
      dragRef.current.active = false;
      if (x > threshold) finalize('like');
      else if (x < -threshold) finalize('nope');
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
  }, [finalize]);

  const onPointerDown = (e) => {
    if (animatingRef.current) return;
    const isTouchEvt = !!e.touches;
    const pt = isTouchEvt ? e.touches[0] : e;
    startRef.current = {x: pt.clientX, y: pt.clientY};
    dragRef.current = {x: 0, y: 0, active: true};
    setDrag({x: 0, y: 0, active: true, rot: null});
    onSwipeStart?.();
  };

  // Keep a ref to the latest finalize so the auto-swipe effect doesn't
  // re-fire every time finalize is recreated (which happens after each idx change).
  const finalizeRef = React.useRef(finalize);
  React.useEffect(() => { finalizeRef.current = finalize; });

  // Auto-swipe from LP postMessage — fires only when autoSwipe counter increments
  React.useEffect(() => {
    if (!autoSwipe) return;
    if (animatingRef.current) return;
    finalizeRef.current('nope');
  }, [autoSwipe]); // intentionally omit finalize to prevent cascade re-triggers

  const rot = drag.rot != null ? drag.rot : (drag.x / 16);
  const likeOp = Math.max(0, Math.min(1, drag.x / 120));
  const nopeOp = Math.max(0, Math.min(1, -drag.x / 120));
  const transform = `translate(${drag.x}px, ${drag.y*0.3}px) rotate(${rot}deg)`;

  return (
    <div className="wm-screen wm-screen-tinder">
      <WMRichBar
        user={user}
        remaining={remaining}
        total={20}
        liked={(liked || []).length}
        interviews={1}
      />

      <div className="wm-tinder-body">
        <div className="wm-tinder-deck">
          {next2 && (
            <div className="wm-tcard" style={{transform:'scale(0.92) translateY(20px)', opacity:0.4, zIndex:1}}>
              <TinderCardContent job={next2}/>
            </div>
          )}
          {nextJob && (
            <div className="wm-tcard" style={{transform:'scale(0.96) translateY(10px)', opacity:0.7, zIndex:2}}>
              <TinderCardContent job={nextJob}/>
            </div>
          )}
          {current && (
            <div
              ref={cardRef}
              className={`wm-tcard ${drag.active ? 'dragging' : ''}`}
              style={{transform, zIndex:3}}
              onMouseDown={onPointerDown}
              onTouchStart={onPointerDown}
            >
              <TinderCardContent job={current}/>
              <div className="wm-tcard-stamp wm-tcard-stamp-like" style={{opacity: likeOp}}>LIKE</div>
              <div className="wm-tcard-stamp wm-tcard-stamp-nope" style={{opacity: nopeOp}}>NOPE</div>
              <button
                className="wm-tcard-info"
                onClick={(e)=>{e.stopPropagation(); if(Math.abs(drag.x)<8) onOpenDetail(current); }}
                aria-label="詳細を見る"
                title="詳細を見る"
              >
                <span className="material-symbols-rounded" style={{fontSize:20, fontVariationSettings:"'wght' 500"}}>info</span>
              </button>
            </div>
          )}
        </div>

        <div className="wm-tinder-actions">
          <button className="wm-tbtn wm-tbtn-undo" onClick={onUndo} aria-label="やり直し" disabled={!canUndo}>
            <span className="material-symbols-rounded" style={{fontSize:22, fontVariationSettings:"'wght' 500"}}>undo</span>
          </button>
          <button className="wm-tbtn wm-tbtn-nope wm-tbtn-big" onClick={()=>{console.log('[NOPE-BTN CLICK]'); finalize('nope');}} aria-label="スキップ">
            <span className="material-symbols-rounded" style={{fontSize:32, fontVariationSettings:"'wght' 500"}}>close</span>
          </button>
          <button className="wm-tbtn wm-tbtn-like wm-tbtn-big" onClick={()=>{console.log('[LIKE-BTN CLICK]'); finalize('like');}} aria-label="いいね">
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

// --- Tinder-style card content ---
function TinderCardContent({job}) {
  return (
    <div className="wm-tcard-inner">
      <div className="wm-tcard-photo">
        {job.photo ? (
          <img src={job.photo} alt="" draggable="false"/>
        ) : (
          <div className="wm-tcard-bg" style={{
            background: `linear-gradient(160deg, ${job.color2} 0%, ${job.color} 60%, ${job.color} 100%)`,
          }}>
            <div className="wm-tcard-bg-stripes"/>
          </div>
        )}
        <div className="wm-tcard-photo-fade"/>
      </div>

      {/* Match badge top-left */}
      <div className="wm-tcard-match">
        <span className="material-symbols-rounded" style={{fontSize:12, color:'var(--tg-500)', fontVariationSettings:"'FILL' 1"}}>auto_awesome</span>
        <span className="num">{job.match}</span>
        <span className="pct">%</span>
        <span className="label">マッチ</span>
      </div>

      {/* Category pill top-right area */}
      <div className="wm-tcard-cat">{job.category} · {job.subcategory}</div>

      {/* Bottom info block */}
      <div className="wm-tcard-info-block">
        <div className="wm-tcard-title">
          <span>{job.title}</span>
        </div>
        <div className="wm-tcard-company">
          <span className="material-symbols-rounded" style={{fontSize:14, opacity:0.85}}>location_on</span>
          <span>{job.company} · {job.locationShort}</span>
        </div>

        <div className="wm-tcard-wage">
          <span className="yen">¥</span>
          <span className="amt">{job.wage.toLocaleString()}</span>
          <span className="unit">/ {job.wageType === '時給' ? '時間' : '月'}</span>
          <span className="shift">{job.shift}</span>
        </div>

        <div className="wm-tcard-tags">
          {job.tags.slice(0, 3).map((t, i) => (
            <span key={i} className="wm-tcard-tag">{t}</span>
          ))}
        </div>

        <div className="wm-tcard-reason">
          <span className="material-symbols-rounded" style={{fontSize:12, color:'var(--tg-ink)', fontVariationSettings:"'FILL' 1"}}>auto_awesome</span>
          <span>{job.matchReason}</span>
        </div>
      </div>
    </div>
  );
}

window.SwipeScreen = SwipeScreen;
