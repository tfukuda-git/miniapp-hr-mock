// Mico Work Match — root app orchestrator
function App() {
  const useState = React.useState;
  const useRef = React.useRef;
  const jobs = window.WM_JOBS;
  const [screen, setScreen] = useState(() => {
    // Allow LP to set initial screen via ?screen= param
    const s = new URLSearchParams(window.location.search).get('screen');
    return ['lineIntro','swipe','history','me','limit'].includes(s) ? s : 'lineIntro';
  }); // lineIntro | swipe | history | detail | limit
  const [detailJob, setDetailJob] = useState(null);
  const [liked, setLiked] = useState(window.WM_HISTORY_LIKED);
  const [skipped, setSkipped] = useState(window.WM_HISTORY_SKIPPED);
  const [remaining, setRemaining] = useState(13); // daily budget remaining (of 20)
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);
  const [likeSheet, setLikeSheet] = useState(null);
  const [feedbackSheet, setFeedbackSheet] = useState(null);
  const swipeCountRef = useRef(0);
  const swipeSeqRef = useRef(0);
  // Incrementing this key forces LineIntro to remount (restart its animations)
  const [lineIntroKey, setLineIntroKey] = React.useState(0);
  // Incrementing this triggers one programmatic nope-swipe in SwipeScreen
  const [autoSwipe, setAutoSwipe] = React.useState(0);
  // Incrementing this remounts SwipeScreen (resets card idx to 0)
  const [swipeKey, setSwipeKey] = React.useState(0);
  // Suppresses feedback sheet during LP auto-swipe sequence
  const autoSwipingRef = React.useRef(false);

  const showToast = (msg) => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast(msg);
    toastRef.current = setTimeout(() => setToast(null), 2400);
  };

  const decrementAndCheckLimit = () => {
    setRemaining(r => {
      const next = Math.max(0, r - 1);
      if (next === 0) {
        setTimeout(() => setScreen('limit'), 300);
      }
      return next;
    });
  };

  // Called by SwipeScreen when a new drag begins. Cancels any lingering
  // feedback (toast / queued sheet) from the previous swipe so it doesn't
  // appear mid-interaction with the next card.
  const cancelPendingSheets = () => {
    ++swipeSeqRef.current;
    setLikeSheet(null);
    setFeedbackSheet(null);
    if (toastRef.current) {
      clearTimeout(toastRef.current);
      toastRef.current = null;
    }
    setToast(null);
  };

  // postMessage command listener — LP scroll-linking sends WM_CMD events
  React.useEffect(() => {
    const onMsg = (e) => {
      const d = e.data || {};
      if (d.type !== 'WM_CMD') return;
      // Clear any open sheets first
      setFeedbackSheet(null);
      setLikeSheet(null);
      if (d.screen) {
        setScreen(d.screen);
        // reset=true forces LineIntro to remount and replay its animation
        if (d.screen === 'lineIntro' && d.reset) {
          setLineIntroKey(k => k + 1);
        }
      }
      if (d.showFeedback) {
        setScreen('swipe');
        // Small delay so the swipe screen transition starts first
        setTimeout(() => setFeedbackSheet({ job: jobs[0], firstTime: false }), 120);
      }
      if (d.swipeNope) {
        // Programmatic swipe-left (no feedback sheet)
        autoSwipingRef.current = true;
        setScreen('swipe');
        setAutoSwipe(n => n + 1);
        setTimeout(() => { autoSwipingRef.current = false; }, 600);
      }
      if (d.resetState) {
        // User left the phone mock — restore demo initial state
        setFeedbackSheet(null);
        setLikeSheet(null);
        setScreen('swipe');
        setRemaining(13);
        setLiked(window.WM_HISTORY_LIKED);
        setSkipped(window.WM_HISTORY_SKIPPED);
        setSwipeKey(k => k + 1); // remount SwipeScreen → resets card idx to 0
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLike = (job) => {
    // add_favorite event
    logEvent('add_favorite', eventParams(job));
    showToast(`Liked! 「${job.subcategory}」系の仕事が好みのようですね`);
    setLiked(arr => [{jobId: job.id, date: '今日', reason: '-'}, ...arr]);
    decrementAndCheckLimit();
    // Open the like-reason sheet after a short delay so the card fly-out
    // animation can finish. Guard against a subsequent swipe via swipeSeqRef.
    const seq = ++swipeSeqRef.current;
    setTimeout(() => {
      if (seq === swipeSeqRef.current) setLikeSheet(job);
    }, 400);
  };

  const handleNope = (job) => {
    // swipe_nope event
    logEvent('swipe_nope', eventParams(job));
    setSkipped(arr => [{jobId: job.id, date: '今日', reason: '-'}, ...arr]);
    swipeCountRef.current += 1;
    decrementAndCheckLimit();
    if (autoSwipingRef.current) return; // suppress feedback during LP auto-swipe
    const count = swipeCountRef.current;
    const shouldAsk = count === 1 || count % 5 === 0;
    const seq = ++swipeSeqRef.current;
    if (shouldAsk) {
      setTimeout(() => {
        if (seq === swipeSeqRef.current) setFeedbackSheet({job, firstTime: count === 1});
      }, 400);
    }
  };

  const handleLikeReasonSubmit = (reason) => {
    logEvent('like_reason', {jobID: likeSheet.id, reason});
    setLikeSheet(null);
  };

  const handleFeedbackSubmit = (reason) => {
    logEvent('feedback_submit', {jobID: feedbackSheet.job.id, reason});
    setFeedbackSheet(null);
  };

  const [detailOrigin, setDetailOrigin] = useState('swipe');
  const openDetail = (job, origin = 'swipe') => {
    logEvent('browse_product', eventParams(job));
    setDetailJob(job);
    setDetailOrigin(origin);
    setScreen('detail');
  };
  const handleApply = (job) => {
    logEvent('apply_start', eventParams(job));
    showToast('応募フォームを開きます（モック）');
    setScreen('swipe');
  };
  const handleConsult = (job) => {
    logEvent('consult_start', eventParams(job));
    showToast('LINE で担当者に相談（モック）');
  };

  const eventParams = (job) => ({
    jobID: job.id,
    category: job.category,
    subcategory: job.subcategory,
    wage: job.wage,
    location: job.location,
    shift: job.shift,
    tags: job.tags.join(','),
    match: job.match,
    companySize: job.companySize,
  });

  const logEvent = (name, params) => {
    // Mock ME tracker - in prod would call mc_tracker.js
    console.log('[ME]', name, params);
  };

  const handleNav = (key, payload) => {
    if (key === 'detail' && payload) {
      openDetail(payload);
    } else {
      setScreen(key);
      if (key !== 'detail') setDetailJob(null);
    }
  };

  // Tweakable config
  const tweaks = window.WM_TWEAKS || {};

  const showLiff = screen !== 'lineIntro';

  return (
    <div style={{position:'relative', width:'100%', height:'100%'}}>
      {/* LINE chat is always rendered as the background. Tapping 求人を探す triggers the miniapp to slide up over it. */}
      <LineIntro key={lineIntroKey} onEnter={()=>setScreen('swipe')}/>

      {/* Miniapp sheet — slides up from bottom when active */}
      <div className={`wm-miniapp-sheet ${showLiff ? 'is-open' : ''}`} aria-hidden={!showLiff}>
        <LineLiffHeader
          title="Mico Work Match"
          onClose={()=>setScreen('lineIntro')}
        />
        <div className="wm-liff-body with-liff">
      {screen === 'swipe' && (
        <SwipeScreen
          key={swipeKey}
          jobs={jobs}
          user={{name:'佐藤'}}
          liked={liked}
          onLike={handleLike}
          onNope={handleNope}
          onSwipeStart={cancelPendingSheets}
          onOpenDetail={openDetail}
          remaining={remaining}
          toastMsg={toast}
          autoSwipe={autoSwipe}
        />
      )}
      {screen === 'history' && (
        <HistoryScreen
          jobs={jobs}
          liked={liked}
          skipped={skipped}
          onOpenDetail={(job, tab) => openDetail(job, tab === 'liked' ? 'liked' : 'skipped')}
          onReconsider={(job) => openDetail(job, 'swipe')}
          remaining={remaining}
        />
      )}
      {screen === 'me' && (
        <MyStub onBack={()=>setScreen('swipe')} liked={liked} skipped={skipped} remaining={remaining} onNav={setScreen}/>
      )}
      {screen === 'detail' && detailJob && (
        <DetailScreen
          job={detailJob}
          origin={detailOrigin}
          onBack={()=>setScreen(detailOrigin === 'swipe' ? 'swipe' : 'history')}
          onLike={()=>{ handleLike(detailJob); setScreen('swipe'); }}
          onSkip={()=>{ handleNope(detailJob); setScreen('swipe'); }}
          onApply={()=>handleApply(detailJob)}
          onConsult={()=>handleConsult(detailJob)}
        />
      )}
      {screen === 'limit' && (
        <LimitScreen
          jobs={jobs}
          liked={liked}
          onNav={(k, p)=>{
            setRemaining(13); // reset for demo
            handleNav(k, p);
          }}
        />
      )}

      {/* Tab bar (hidden on detail / lineIntro / limit) */}
      {screen !== 'detail' && screen !== 'limit' && screen !== 'lineIntro' && (
        <WMTabBar current={screen} onNav={setScreen}/>
      )}

      {/* Reason sheets */}
      {likeSheet && (
        <LikeReasonSheet
          job={likeSheet}
          onClose={()=>setLikeSheet(null)}
          onSubmit={handleLikeReasonSubmit}
        />
      )}
      {feedbackSheet && (
        <FeedbackSheet
          job={feedbackSheet.job}
          firstTime={feedbackSheet.firstTime}
          onClose={()=>setFeedbackSheet(null)}
          onSubmit={handleFeedbackSubmit}
        />
      )}
        </div>
      </div>
    </div>
  );
}

// My Page
function MyStub({onBack, liked, skipped, remaining, onNav}) {
  const Mi = ({name, size=20, fill=0, color}) => (
    <span className="material-symbols-rounded" style={{
      fontSize: size,
      color,
      fontVariationSettings: `'FILL' ${fill}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
    }}>{name}</span>
  );
  const likeCount = liked?.length ?? 0;
  const skipCount = skipped?.length ?? 0;
  const swiped = 20 - (remaining ?? 20);
  return (
    <div className="wm-screen wm-screen-me">
      <div className="wm-screen-scroll" style={{padding:'14px 14px 24px'}}>
        <div style={{fontSize:18, fontWeight:800, letterSpacing:'-0.01em', padding:'4px 2px 10px'}}>マイページ</div>

        {/* Profile card */}
        <div className="wm-me-profile">
          <div className="wm-me-avatar">佐</div>
          <div className="wm-me-pinfo">
            <div className="wm-me-pname">佐藤さん</div>
            <div className="wm-me-pid">LINE連携済 · userId U_abc…3f21</div>
          </div>
          <button className="wm-me-edit" aria-label="編集">
            <Mi name="edit" size={18}/>
          </button>
        </div>

        {/* Activity stats */}
        <div className="wm-me-stats">
          <div className="wm-me-stat" onClick={()=>onNav && onNav('history')}>
            <div className="wm-me-stat-num">{likeCount}</div>
            <div className="wm-me-stat-label">気になる</div>
          </div>
          <div className="wm-me-stat-divider"/>
          <div className="wm-me-stat">
            <div className="wm-me-stat-num">{swiped}<span className="wm-me-stat-sub">/20</span></div>
            <div className="wm-me-stat-label">今日のスワイプ</div>
          </div>
          <div className="wm-me-stat-divider"/>
          <div className="wm-me-stat">
            <div className="wm-me-stat-num">3</div>
            <div className="wm-me-stat-label">応募</div>
          </div>
        </div>

        {/* Profile completeness */}
        <div className="wm-me-card wm-me-profile-card">
          <div className="wm-me-card-head">
            <div>
              <div className="wm-me-card-title">プロフィール</div>
              <div className="wm-me-card-sub">あと少しで完成！マッチ精度がUPします</div>
            </div>
            <div className="wm-me-ring">
              <svg width="48" height="48" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#eef1ee" strokeWidth="4"/>
                <circle cx="24" cy="24" r="20" fill="none" stroke="#2a2eea" strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2*Math.PI*20*0.7} ${2*Math.PI*20}`}
                  transform="rotate(-90 24 24)"/>
              </svg>
              <div className="wm-me-ring-text">70%</div>
            </div>
          </div>
          <div className="wm-me-progress-items">
            <div className="wm-me-prog-item done">
              <Mi name="check_circle" size={16} fill={1} color="#2a2eea"/>
              <span>基本情報</span>
            </div>
            <div className="wm-me-prog-item done">
              <Mi name="check_circle" size={16} fill={1} color="#2a2eea"/>
              <span>希望条件</span>
            </div>
            <div className="wm-me-prog-item">
              <Mi name="radio_button_unchecked" size={16} color="#c6cac6"/>
              <span>職歴</span>
            </div>
            <div className="wm-me-prog-item">
              <Mi name="radio_button_unchecked" size={16} color="#c6cac6"/>
              <span>スキル・資格</span>
            </div>
          </div>
          <button className="wm-me-profile-cta">
            <span>プロフィールを完成させる</span>
            <Mi name="arrow_forward" size={18}/>
          </button>
        </div>

        {/* Preferences summary */}
        <div className="wm-me-card">
          <div className="wm-me-card-head">
            <div className="wm-me-card-title">希望条件</div>
            <button className="wm-me-link">
              <span>編集</span>
              <Mi name="chevron_right" size={16}/>
            </button>
          </div>
          <div className="wm-me-chips">
            <div className="wm-me-chip"><Mi name="place" size={13} color="#6b7069"/>横浜市</div>
            <div className="wm-me-chip"><Mi name="directions_walk" size={13} color="#6b7069"/>通勤30分以内</div>
            <div className="wm-me-chip"><Mi name="payments" size={13} color="#6b7069"/>時給1,300円〜</div>
            <div className="wm-me-chip"><Mi name="calendar_month" size={13} color="#6b7069"/>週3〜</div>
            <div className="wm-me-chip"><Mi name="schedule" size={13} color="#6b7069"/>日勤のみ</div>
          </div>
        </div>

        {/* Menu list */}
        <div className="wm-me-menu">
          <button className="wm-me-menu-row" onClick={()=>onNav && onNav('history')}>
            <div className="wm-me-menu-icon" style={{background:'#ffe9ed', color:'#e5154f'}}>
              <Mi name="favorite" size={18} fill={1}/>
            </div>
            <div className="wm-me-menu-body">
              <div className="wm-me-menu-title">気になるリスト</div>
              <div className="wm-me-menu-sub">保存した求人 {likeCount}件</div>
            </div>
            <Mi name="chevron_right" size={18} color="#c6cac6"/>
          </button>
          <button className="wm-me-menu-row">
            <div className="wm-me-menu-icon" style={{background:'#e6f4ff', color:'#2a2eea'}}>
              <Mi name="work" size={18} fill={1}/>
            </div>
            <div className="wm-me-menu-body">
              <div className="wm-me-menu-title">応募履歴</div>
              <div className="wm-me-menu-sub">3件 · 選考中 2件</div>
            </div>
            <Mi name="chevron_right" size={18} color="#c6cac6"/>
          </button>
          <button className="wm-me-menu-row">
            <div className="wm-me-menu-icon" style={{background:'#fff4d6', color:'#b88100'}}>
              <Mi name="notifications" size={18} fill={1}/>
            </div>
            <div className="wm-me-menu-body">
              <div className="wm-me-menu-title">通知設定</div>
              <div className="wm-me-menu-sub">毎朝6時 おすすめ配信中</div>
            </div>
            <Mi name="chevron_right" size={18} color="#c6cac6"/>
          </button>
          <button className="wm-me-menu-row">
            <div className="wm-me-menu-icon" style={{background:'#e6f4ff', color:'#2a2eea'}}>
              <Mi name="forum" size={18} fill={1}/>
            </div>
            <div className="wm-me-menu-body">
              <div className="wm-me-menu-title">担当者に相談</div>
              <div className="wm-me-menu-sub">LINEでチャット</div>
            </div>
            <Mi name="chevron_right" size={18} color="#c6cac6"/>
          </button>
        </div>

        <div className="wm-me-menu">
          <button className="wm-me-menu-row">
            <div className="wm-me-menu-icon" style={{background:'#f1f4f1', color:'#4a4e4a'}}>
              <Mi name="help" size={18}/>
            </div>
            <div className="wm-me-menu-body">
              <div className="wm-me-menu-title">ヘルプ・よくある質問</div>
            </div>
            <Mi name="chevron_right" size={18} color="#c6cac6"/>
          </button>
          <button className="wm-me-menu-row">
            <div className="wm-me-menu-icon" style={{background:'#f1f4f1', color:'#4a4e4a'}}>
              <Mi name="description" size={18}/>
            </div>
            <div className="wm-me-menu-body">
              <div className="wm-me-menu-title">利用規約・プライバシー</div>
            </div>
            <Mi name="chevron_right" size={18} color="#c6cac6"/>
          </button>
        </div>

        <div className="wm-me-foot">
          <div className="wm-me-foot-brand">Mico Work Match</div>
          <div className="wm-me-foot-ver">ver 1.0.2 · build 240421</div>
        </div>
      </div>
    </div>
  );
}

window.App = App;
