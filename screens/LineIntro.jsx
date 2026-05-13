// LINE-style chat intro — user taps rich menu "求人を探す" to enter miniapp
function LineIntro({onEnter}) {
  const [tapped, setTapped] = React.useState(false);
  // Staged reveal: 0 = typing, 1 = first bubble, 2 = typing for 2nd, 3 = both bubbles
  const [stage, setStage] = React.useState(0);

  React.useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 700);   // 1st bubble appears
    const t2 = setTimeout(() => setStage(2), 1600);  // typing indicator before 2nd
    const t3 = setTimeout(() => setStage(3), 2500);  // 2nd bubble appears
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleTap = () => {
    if (tapped) return;
    setTapped(true);
    setTimeout(onEnter, 520);
  };

  return (
    <div className="wm-line-chat">
      {/* LINE header */}
      <div className="wm-line-header">
        <div className="wm-line-hdr-left">
          <span className="material-symbols-rounded" style={{fontSize:22, color:'#333'}}>arrow_back_ios_new</span>
        </div>
        <div className="wm-line-hdr-center">
          <div className="wm-line-hdr-title">Mico Work Match 公式</div>
        </div>
        <div className="wm-line-hdr-right">
          <span className="material-symbols-rounded" style={{fontSize:24, color:'#333'}}>search</span>
          <span className="material-symbols-rounded" style={{fontSize:24, color:'#333'}}>article</span>
          <span className="material-symbols-rounded" style={{fontSize:24, color:'#333'}}>menu</span>
        </div>
      </div>

      {/* Chat area */}
      <div className="wm-line-chat-area">
        <div className="wm-line-date">今日</div>

        {/* Official account bubble — 1st */}
        {stage === 0 ? (
          <div className="wm-line-msg-row">
            <div className="wm-line-avatar">
              <img src="assets/mico-mark.png" alt="" style={{width:28, height:28, objectFit:'contain'}}/>
            </div>
            <div className="wm-line-msg-group">
              <div className="wm-line-name">Mico Work Match 公式</div>
              <div className="wm-line-typing">
                <span/><span/><span/>
              </div>
            </div>
          </div>
        ) : (
          <div className="wm-line-msg-row wm-line-msg-enter">
            <div className="wm-line-avatar">
              <img src="assets/mico-mark.png" alt="" style={{width:28, height:28, objectFit:'contain'}}/>
            </div>
            <div className="wm-line-msg-group">
              <div className="wm-line-name">Mico Work Match 公式</div>
              <div className="wm-line-bubble">
                Mico Work Match へようこそ🎉<br/>
                まずは求人一覧をスワイプして、<br/>
                <b>あなたに合う求人</b>を教えてください。
              </div>
              <div className="wm-line-time">9:12</div>
            </div>
          </div>
        )}

        {/* 2nd bubble — typing then message */}
        {stage === 2 && (
          <div className="wm-line-msg-row wm-line-msg-cont wm-line-msg-enter">
            <div className="wm-line-avatar-spacer"/>
            <div className="wm-line-msg-group">
              <div className="wm-line-typing">
                <span/><span/><span/>
              </div>
            </div>
          </div>
        )}
        {stage >= 3 && (
          <div className="wm-line-msg-row wm-line-msg-cont wm-line-msg-enter">
            <div className="wm-line-avatar-spacer"/>
            <div className="wm-line-msg-group">
              <div className="wm-line-bubble">
                スワイプするほど精度が上がり、<br/>
                明日から<b>あなた専用のおすすめ</b>が<br/>
                毎日届きます。
              </div>
              <div className="wm-line-time">9:12</div>
            </div>
          </div>
        )}
      </div>

      {/* Rich menu */}
      <div className="wm-line-richmenu">
        <div className="wm-line-richmenu-inner">
        <div className="wm-line-richmenu-grid">
          <button
            className={`wm-rm-tile wm-rm-primary ${tapped ? 'tapped' : ''}`}
            onClick={handleTap}
          >
            <div className="wm-rm-primary-inner">
              <div className="wm-rm-primary-eyebrow">
                <span className="material-symbols-rounded" style={{fontSize:14, fontVariationSettings:"'FILL' 1"}}>auto_awesome</span>
                まずはここから
              </div>
              <div className="wm-rm-primary-title">求人を<br/>探す</div>
              <div className="wm-rm-primary-foot">
                <span>スワイプで好みを教えよう</span>
                <span className="material-symbols-rounded" style={{fontSize:18}}>arrow_forward</span>
              </div>
              <div className="wm-rm-primary-deco">
                <img src="assets/illust-thumbsup.png" alt="" style={{width:110, height:110, objectFit:'contain', display:'block'}}/>
              </div>
            </div>
          </button>

          <div className="wm-rm-col">
            <button className="wm-rm-tile wm-rm-sub">
              <span className="material-symbols-rounded" style={{fontSize:22}}>favorite</span>
              <span>気になる</span>
            </button>
            <button className="wm-rm-tile wm-rm-sub">
              <span className="material-symbols-rounded" style={{fontSize:22}}>event</span>
              <span>面談予約</span>
            </button>
          </div>
        </div>
        <div className="wm-line-richmenu-grid2">
          <button className="wm-rm-tile wm-rm-sub wide">
            <span className="material-symbols-rounded" style={{fontSize:20}}>person</span>
            <span>マイページ</span>
          </button>
          <button className="wm-rm-tile wm-rm-sub wide">
            <span className="material-symbols-rounded" style={{fontSize:20}}>help</span>
            <span>お問合せ</span>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

window.LineIntro = LineIntro;
