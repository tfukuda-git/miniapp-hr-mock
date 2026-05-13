// Top bar and bottom tab bar
// ============================================================
// LINE in-app browser header (LIFF chrome)
// ============================================================
function LineLiffHeader({title='Mico Work Match', onClose}) {
  return (
    <div className="wm-liff-header">
      <button className="wm-liff-close" onClick={onClose} aria-label="閉じる">
        <span className="material-symbols-rounded" style={{fontSize:22}}>close</span>
      </button>
      <div className="wm-liff-title">
        <span className="wm-liff-title-text">{title}</span>
        <span className="wm-liff-title-host">liff.line.me</span>
      </div>
      <button className="wm-liff-more" aria-label="メニュー">
        <span className="material-symbols-rounded" style={{fontSize:22}}>more_horiz</span>
      </button>
    </div>
  );
}

// ============================================================
// Rich top bar — user, stats, daily progress
// ============================================================
function WMRichBar({user, remaining, total=10, liked=0, interviews=1}) {
  const pct = Math.max(0, Math.min(100, ((total-remaining)/total)*100));
  const initial = (user?.name || 'A').charAt(0).toUpperCase();
  return (
    <div className="wm-richbar">
      <div className="wm-richbar-top">
        <div className="wm-richbar-brand">
          <img src="assets/mico-mark.png" alt="mico" style={{width:26, height:26, objectFit:'contain', display:'block'}}/>
          <span>Mico Work Match</span>
          <span className="wm-brand-sub">by mico</span>
        </div>
        <div className="wm-richbar-icons">
          <button className="wm-richbar-iconbtn" aria-label="通知">
            <span className="material-symbols-rounded" style={{fontSize:16}}>notifications</span>
            <span className="badge">3</span>
          </button>
          <button className="wm-richbar-iconbtn" aria-label="検索">
            <span className="material-symbols-rounded" style={{fontSize:16}}>tune</span>
          </button>
          <div className="wm-richbar-avatar" title={user?.name}>{initial}</div>
        </div>
      </div>

      <div className="wm-richbar-greet">
        <span className="wm-richbar-greet-hi">Good morning,</span>
        <span className="wm-richbar-greet-name">{user?.name || '佐藤'} さん</span>
      </div>

      <div className="wm-richbar-stats">
        <div className="wm-richbar-stat">
          <div className="wm-richbar-stat-label">本日の残り</div>
          <div className="wm-richbar-stat-val">{remaining}<span className="unit">/{total}</span></div>
        </div>
        <div className="wm-richbar-stat">
          <div className="wm-richbar-stat-label">気になる</div>
          <div className="wm-richbar-stat-val">{liked}<span className="unit">件</span></div>
        </div>
        <div className="wm-richbar-stat">
          <div className="wm-richbar-stat-label">面談予定</div>
          <div className="wm-richbar-stat-val">{interviews}<span className="unit">件</span></div>
        </div>
      </div>

      <div className="wm-richbar-progress">
        <div style={{width:`${pct}%`}}/>
      </div>
    </div>
  );
}

// ============================================================
// Plain top bar (retained for other screens)
// ============================================================
function WMTopBar({counter, left=null, right=null, title=null}) {
  return (
    <div className="wm-topbar">
      {left || (title ? (
        <div className="wm-topbar-title">
          <span className="wm-logo-dot"/>
          <span>{title}</span>
        </div>
      ) : (
        <div className="wm-topbar-title">
          <span className="wm-logo-dot"/>
          <span>Mico Work Match</span>
        </div>
      ))}
      {right !== null ? right : (counter != null && (
        <div className="wm-pill-counter" title="今日の残りスワイプ回数">
          <span className="material-symbols-rounded" style={{fontSize:14, color:'var(--wm-green-700)'}}>bolt</span>
          <span>残り</span>
          <span className="wm-num">{counter}</span>
          <span>回</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Bottom tab bar — Material Symbols
// ============================================================
function WMTabBar({current, onNav}) {
  const Mi = ({name, fill=0}) => (
    <span className="material-symbols-rounded" style={{
      fontSize: 22,
      fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
    }}>{name}</span>
  );
  const tab = (key, label, iconName) => (
    <button
      className={`wm-tab ${current===key ? 'active' : ''}`}
      onClick={() => onNav(key)}
    >
      <Mi name={iconName} fill={current===key ? 1 : 0}/>
      <span>{label}</span>
    </button>
  );
  return (
    <div className="wm-tabbar">
      {tab('swipe', 'スワイプ', 'style')}
      {tab('history', '気になる', 'favorite')}
      {tab('me', 'マイページ', 'person')}
    </div>
  );
}

window.LineLiffHeader = LineLiffHeader;
window.WMRichBar = WMRichBar;
window.WMTopBar = WMTopBar;
window.WMTabBar = WMTabBar;
