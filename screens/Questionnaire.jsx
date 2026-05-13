// Initial Questionnaire screen (S0.5) — simple preference form
function QuestionnaireScreen({onComplete}) {
  const [jobTypes, setJobTypes] = React.useState([]);
  const [areas, setAreas] = React.useState([]);
  const [shift, setShift] = React.useState(null);
  const [exiting, setExiting] = React.useState(false);

  const jobTypeOptions = [
    {key: 'manufacturing', label: '製造・工場'},
    {key: 'office', label: 'オフィス・事務'},
    {key: 'retail', label: '販売・接客'},
    {key: 'logistics', label: '物流・倉庫'},
    {key: 'food', label: '飲食・フード'},
    {key: 'it', label: 'IT・技術'},
  ];

  const areaOptions = [
    {key: 'kanto', label: '関東'},
    {key: 'tokai', label: '東海'},
    {key: 'kansai', label: '関西'},
    {key: 'kyushu', label: '九州'},
    {key: 'tohoku', label: '東北'},
    {key: 'other', label: 'その他'},
  ];

  const shiftOptions = [
    {key: 'day', label: '日勤のみ'},
    {key: 'two', label: '2交替'},
    {key: 'three', label: '3交替'},
    {key: 'flexible', label: 'シフト自由'},
  ];

  const toggleMulti = (arr, setArr, key) => {
    setArr(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const canSubmit = jobTypes.length > 0 && areas.length > 0 && shift !== null;

  const handleSubmit = () => {
    setExiting(true);
    setTimeout(() => onComplete({jobTypes, areas, shift}), 400);
  };

  const chipStyle = (selected) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 16px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
    border: selected ? '2px solid #2a2eea' : '2px solid #e8e8e8',
    background: selected ? '#eef0ff' : '#fff',
    color: selected ? '#2a2eea' : '#555',
    transition: 'all 0.15s ease',
  });

  return (
    <div className="wm-screen" style={{
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      opacity: exiting ? 0 : 1,
      transition: 'opacity 0.35s ease',
    }}>
      {/* Top spacer */}
      <div style={{height: 60, flexShrink: 0}}/>

      {/* Header */}
      <div style={{padding: '0 24px 8px', flexShrink: 0}}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
        }}>
          <img src="assets/mico-mark.png" alt="mico" style={{width: 22, height: 22, objectFit: 'contain'}}/>
          <span style={{fontSize: 12, fontWeight: 600, color: '#999'}}>Mico Work Match</span>
        </div>
        <div style={{
          fontSize: 22, fontWeight: 800, color: '#1a1a1a',
          lineHeight: 1.3, fontFamily: 'var(--wm-font-jp)',
        }}>あなたの希望を教えてください</div>
        <div style={{fontSize: 13, color: '#888', marginTop: 6, lineHeight: 1.5}}>
          かんたんな質問に答えるだけで、<br/>ピッタリの求人が見つかります。
        </div>
      </div>

      {/* Form */}
      <div className="wm-screen-scroll" style={{flex: 1, padding: '12px 24px 0'}}>
        {/* Q1: Job Type */}
        <div style={{marginBottom: 24}}>
          <div style={{
            fontSize: 14, fontWeight: 700, color: '#1a1a1a',
            marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span className="material-symbols-rounded" style={{fontSize: 18, color: '#2a2eea', fontVariationSettings: "'FILL' 1"}}>work</span>
            希望職種
            <span style={{fontSize: 11, color: '#999', fontWeight: 500}}>（複数選択OK）</span>
          </div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
            {jobTypeOptions.map(opt => (
              <button
                key={opt.key}
                style={chipStyle(jobTypes.includes(opt.key))}
                onClick={() => toggleMulti(jobTypes, setJobTypes, opt.key)}
              >{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Q2: Area */}
        <div style={{marginBottom: 24}}>
          <div style={{
            fontSize: 14, fontWeight: 700, color: '#1a1a1a',
            marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span className="material-symbols-rounded" style={{fontSize: 18, color: '#2a2eea', fontVariationSettings: "'FILL' 1"}}>place</span>
            希望エリア
            <span style={{fontSize: 11, color: '#999', fontWeight: 500}}>（複数選択OK）</span>
          </div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
            {areaOptions.map(opt => (
              <button
                key={opt.key}
                style={chipStyle(areas.includes(opt.key))}
                onClick={() => toggleMulti(areas, setAreas, opt.key)}
              >{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Q3: Shift */}
        <div style={{marginBottom: 24}}>
          <div style={{
            fontSize: 14, fontWeight: 700, color: '#1a1a1a',
            marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span className="material-symbols-rounded" style={{fontSize: 18, color: '#2a2eea', fontVariationSettings: "'FILL' 1"}}>schedule</span>
            希望シフト
          </div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
            {shiftOptions.map(opt => (
              <button
                key={opt.key}
                style={chipStyle(shift === opt.key)}
                onClick={() => setShift(opt.key)}
              >{opt.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{padding: '16px 24px 40px', flexShrink: 0}}>
        <button
          className="wm-btn-primary"
          style={{
            width: '100%',
            background: '#2a2eea',
            boxShadow: canSubmit ? '0 4px 16px rgba(42,46,234,0.35)' : 'none',
            opacity: canSubmit ? 1 : 0.4,
            fontSize: 16,
            fontWeight: 700,
            padding: '14px 0',
          }}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          <span className="material-symbols-rounded" style={{fontSize: 18, marginRight: 6, verticalAlign: 'middle', fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
          マッチング開始
        </button>
      </div>
    </div>
  );
}

window.QuestionnaireScreen = QuestionnaireScreen;
