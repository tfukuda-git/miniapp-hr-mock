// Like-reason popup and negative-feedback popup — no emoji, SVG icons only

const ReasonIcons = {
  wage: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 4l7 10 7-10"/><line x1="5" y1="14" x2="19" y2="14"/><line x1="5" y1="18" x2="19" y2="18"/><line x1="12" y1="14" x2="12" y2="22"/>
  </svg>,
  location: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>,
  shift: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>,
  beginner: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.5 5 5.5.8-4 4 1 5.7L12 15l-5 2.5 1-5.7-4-4L9.5 7z"/>
  </svg>,
  far: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 8 3 16 6 23 3 23 18 16 21 8 18 1 21 1 6"/><line x1="8" y1="3" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="21"/>
  </svg>,
  low: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
  </svg>,
  type: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>,
  shiftX: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="7" y1="7" x2="17" y2="17"/>
  </svg>,
  nodorm: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><line x1="4" y1="20" x2="20" y2="4"/>
  </svg>,
  other: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>,
};

function LikeReasonSheet({job, onClose, onSubmit}) {
  const [selected, setSelected] = React.useState([]);
  const toggle = (key) => setSelected(s => s.includes(key) ? s.filter(k=>k!==key) : [...s, key]);
  const isOn = (key) => selected.includes(key);
  const options = [
    { key: 'wage', label: '給与', sub: '時給・月収が魅力', icon: ReasonIcons.wage },
    { key: 'location', label: '勤務地', sub: '通いやすい', icon: ReasonIcons.location },
    { key: 'shift', label: 'シフト', sub: '時間が合う', icon: ReasonIcons.shift },
    { key: 'beginner', label: '未経験OK', sub: '始めやすそう', icon: ReasonIcons.beginner },
  ];
  return (
    <>
      <div className="wm-sheet-backdrop" onClick={onClose}/>
      <div className="wm-sheet">
        <div className="wm-sheet-handle"/>
        <div style={{
          margin: '0 auto 10px', width: 48, height: 48, borderRadius: 14,
          background: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)'
        }}>
          <WM.Icon.Heart size={26} fill={1} color="#ff3b5c"/>
        </div>
        <div className="wm-sheet-title">何が良かったですか？</div>
        <div className="wm-sheet-sub">AIが学習して、似た求人を優先表示します</div>

        <div className="wm-reason-grid">
          {options.map(o => (
            <button
              key={o.key}
              className={`wm-reason-btn ${isOn(o.key) ? 'selected' : ''}`}
              onClick={() => toggle(o.key)}
            >
              <div style={{color: isOn(o.key) ? 'var(--wm-blue-600)' : 'var(--wm-ink-700)'}}>
                {o.icon}
              </div>
              <div>{o.label}</div>
              <div className="wm-reason-sub">{o.sub}</div>
            </button>
          ))}
        </div>

        <button
          className="wm-btn-primary"
          style={{width:'100%', opacity: selected.length ? 1 : 0.4, background: '#2968d8'}}
          disabled={!selected.length}
          onClick={() => onSubmit(selected)}
        >
          送信して次へ
        </button>
        <button
          onClick={onClose}
          style={{
            display:'block', margin:'12px auto 0', background:'none', border:'none',
            color:'var(--wm-ink-500)', fontSize:13, fontFamily:'inherit', cursor:'pointer'
          }}
        >
          あとで
        </button>
      </div>
    </>
  );
}

function FeedbackSheet({job, onClose, onSubmit, firstTime=false}) {
  const [selected, setSelected] = React.useState([]);
  const toggle = (key) => setSelected(s => s.includes(key) ? s.filter(k=>k!==key) : [...s, key]);
  const isOn = (key) => selected.includes(key);
  const options = [
    { key: 'far',     label: '遠い',           icon: ReasonIcons.far },
    { key: 'low',     label: '給与が低い',     icon: ReasonIcons.low },
    { key: 'type',    label: '職種が違う',     icon: ReasonIcons.type },
    { key: 'shift',   label: 'シフト合わない', icon: ReasonIcons.shiftX },
    { key: 'nodorm',  label: '寮なし',         icon: ReasonIcons.nodorm },
    { key: 'other',   label: 'その他',         icon: ReasonIcons.other },
  ];
  return (
    <>
      <div className="wm-sheet-backdrop" onClick={onClose}/>
      <div className="wm-sheet">
        <div className="wm-sheet-handle"/>
        <div style={{
          margin: '0 auto 10px', width: 48, height: 48, borderRadius: 14,
          background: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#ff3b5c',
          boxShadow: '0 8px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)'
        }}>
          <WM.Icon.Cross size={22}/>
        </div>
        <div className="wm-sheet-title">
          {firstTime ? 'もう少し教えてください' : '何が合いませんでしたか？'}
        </div>
        <div className="wm-sheet-sub">
          {firstTime
            ? 'はじめの1回だけお聞きします。今後のおすすめに活かします。'
            : '今後、似た条件の求人を抑えます'}
        </div>

        <div className="wm-reason-grid" style={{gridTemplateColumns:'1fr 1fr 1fr', gap: 8}}>
          {options.map(o => (
            <button
              key={o.key}
              className={`wm-reason-btn ${isOn(o.key) ? 'selected' : ''}`}
              onClick={() => toggle(o.key)}
              style={{padding:'12px 6px', alignItems:'center', gap: 6}}
            >
              <div style={{color: isOn(o.key) ? '#2968d8' : 'var(--wm-ink-700)', alignSelf:'center'}}>
                {o.icon}
              </div>
              <div style={{alignSelf:'center', fontSize:12, textAlign:'center'}}>{o.label}</div>
            </button>
          ))}
        </div>

        <button
          className="wm-btn-primary"
          style={{width:'100%', opacity: selected.length ? 1 : 0.4, background: '#2968d8'}}
          disabled={!selected.length}
          onClick={() => onSubmit(selected)}
        >
          送信
        </button>
        <button
          onClick={onClose}
          style={{
            display:'block', margin:'12px auto 0', background:'none', border:'none',
            color:'var(--wm-ink-500)', fontSize:13, fontFamily:'inherit', cursor:'pointer'
          }}
        >
          {firstTime ? 'あとで' : 'スキップ'}
        </button>
      </div>
    </>
  );
}

window.LikeReasonSheet = LikeReasonSheet;
window.FeedbackSheet = FeedbackSheet;
