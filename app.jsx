// Mico Work Match — root app orchestrator (v5)
function App() {
  const useState = React.useState;
  const useRef = React.useRef;
  const jobs = window.WM_JOBS;

  // First-launch state (in-memory for mock)
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  const [screen, setScreen] = useState(() => {
    // Allow LP to set initial screen via ?screen= param
    const s = new URLSearchParams(window.location.search).get('screen');
    if (['swipe','history','complete'].includes(s)) return s;
    return 'tutorial'; // v5: start with tutorial
  });

  const [detailJob, setDetailJob] = useState(null);
  const [liked, setLiked] = useState([]);
  const [skipped, setSkipped] = useState([]);
  const [remaining, setRemaining] = useState(10); // v5: budget of 10
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);
  const [likeSheet, setLikeSheet] = useState(null);
  const [feedbackSheet, setFeedbackSheet] = useState(null);
  const swipeCountRef = useRef(0);
  const swipeSeqRef = useRef(0);
  const [autoSwipe, setAutoSwipe] = React.useState(0);
  const [swipeKey, setSwipeKey] = React.useState(0);
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
        setTimeout(() => setScreen('complete'), 300);
      }
      return next;
    });
  };

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
      setFeedbackSheet(null);
      setLikeSheet(null);
      if (d.screen) {
        setScreen(d.screen);
      }
      if (d.showFeedback) {
        setScreen('swipe');
        setTimeout(() => setFeedbackSheet({ job: jobs[0], firstTime: false }), 120);
      }
      if (d.swipeNope) {
        autoSwipingRef.current = true;
        setScreen('swipe');
        setAutoSwipe(n => n + 1);
        setTimeout(() => { autoSwipingRef.current = false; }, 600);
      }
      if (d.resetState) {
        setFeedbackSheet(null);
        setLikeSheet(null);
        setScreen('swipe');
        setRemaining(10);
        setLiked([]);
        setSkipped([]);
        setSwipeKey(k => k + 1);
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const handleLike = (job) => {
    logEvent('add_favorite', eventParams(job));
    showToast(`Liked! 「${job.subcategory}」系の仕事が好みのようですね`);
    setLiked(arr => [{jobId: job.id, date: '今日', reason: '-'}, ...arr]);
    decrementAndCheckLimit();
    const seq = ++swipeSeqRef.current;
    setTimeout(() => {
      if (seq === swipeSeqRef.current) setLikeSheet(job);
    }, 400);
  };

  const handleNope = (job) => {
    logEvent('swipe_nope', eventParams(job));
    setSkipped(arr => [{jobId: job.id, date: '今日', reason: '-'}, ...arr]);
    swipeCountRef.current += 1;
    decrementAndCheckLimit();
    if (autoSwipingRef.current) return;
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

  const handleRestart = () => {
    setRemaining(10);
    setSwipeKey(k => k + 1);
    swipeCountRef.current = 0;
    setScreen('swipe');
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

  // Tutorial complete → go to questionnaire (first launch) or swipe
  const handleTutorialComplete = () => {
    if (isFirstLaunch) {
      setScreen('questionnaire');
    } else {
      setScreen('swipe');
    }
  };

  // Questionnaire complete → go to swipe
  const handleQuestionnaireComplete = (prefs) => {
    logEvent('questionnaire_complete', prefs);
    setIsFirstLaunch(false);
    setScreen('swipe');
  };

  // v5: no LIFF header / LineIntro for tutorial and questionnaire
  const showLiff = !['tutorial', 'questionnaire'].includes(screen);

  return (
    <div style={{position:'relative', width:'100%', height:'100%'}}>
      {/* Tutorial screen — full screen, no LIFF chrome */}
      {screen === 'tutorial' && (
        <TutorialScreen onComplete={handleTutorialComplete}/>
      )}

      {/* Questionnaire screen — full screen, no LIFF chrome */}
      {screen === 'questionnaire' && (
        <QuestionnaireScreen onComplete={handleQuestionnaireComplete}/>
      )}

      {/* Main app screens — with simplified LIFF header */}
      {showLiff && (
        <div className="wm-miniapp-sheet is-open" style={{position:'absolute', inset:0}}>
          <LineLiffHeader
            title="Mico Work Match"
            onClose={() => {
              // In v5 MVP, closing goes back to tutorial
              setScreen('tutorial');
            }}
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
            {screen === 'detail' && detailJob && (
              <DetailScreen
                job={detailJob}
                origin={detailOrigin}
                onBack={()=>setScreen(detailOrigin === 'swipe' ? 'swipe' : 'history')}
                onLike={()=>{ handleLike(detailJob); setScreen('swipe'); }}
                onSkip={()=>{ handleNope(detailJob); setScreen('swipe'); }}
                onApply={()=>handleApply(detailJob)}
                onConsult={()=>handleConsult(detailJob)}
                onExternalLink={()=>setScreen('swipe')}
              />
            )}
            {screen === 'complete' && (
              <LimitScreen
                jobs={jobs}
                liked={liked}
                onNav={(k, p)=>{
                  handleNav(k, p);
                }}
                onRestart={handleRestart}
              />
            )}

            {/* No tab bar in v5 MVP — navigation via flow */}
            {/* Back to swipe button on history screen */}
            {screen === 'history' && (
              <div style={{
                position:'absolute', bottom:16, left:16, right:16, zIndex:20,
              }}>
                <button
                  className="wm-btn-primary"
                  style={{
                    width:'100%', background:'#2a2eea',
                    boxShadow:'0 4px 16px rgba(42,46,234,0.35)',
                  }}
                  onClick={()=>setScreen('swipe')}
                >
                  <span className="material-symbols-rounded" style={{fontSize:18, marginRight:4, verticalAlign:'middle'}}>arrow_back</span>
                  スワイプに戻る
                </button>
              </div>
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
      )}
    </div>
  );
}

window.App = App;
