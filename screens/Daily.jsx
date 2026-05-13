// Daily Picks — top 5 AI recommended
function DailyScreen({jobs, onOpenDetail, remaining}) {
  const top5 = [...jobs].sort((a,b)=>b.match-a.match).slice(0,5);
  const today = new Date();
  const dateStr = `${today.getMonth()+1}月${today.getDate()}日 (${['日','月','火','水','木','金','土'][today.getDay()]})`;

  return (
    <div className="wm-screen">
      <WMTopBar counter={remaining}/>

      <div className="wm-daily-hero">
        <div className="wm-daily-kicker">
          <WM.Icon.Sparkle size={11}/> AI CURATED
        </div>
        <div className="wm-daily-title">本日のおすすめ Top 5</div>
        <div className="wm-daily-date">{dateStr} · 毎朝6時更新</div>
      </div>

      <div className="wm-screen-scroll">
        {top5.map((job, i) => (
          <div key={job.id} className="wm-daily-row" onClick={()=>onOpenDetail(job)}>
            <div className="wm-daily-rank">{i+1}</div>
            <div className="wm-daily-thumb"><WM.JobArt job={job} labelOnly={true}/></div>
            <div className="wm-daily-info">
              <div className="wm-daily-job-title">{job.title}</div>
              <div className="wm-daily-meta">
                <span>{job.company}</span>
                <span style={{color:'var(--wm-ink-200)'}}>·</span>
                <span>{job.locationShort}</span>
              </div>
              <div className="wm-daily-meta" style={{marginBottom:6}}>
                <span className="wm-num" style={{fontWeight:700, color:'var(--wm-ink-900)'}}>
                  ¥{job.wage.toLocaleString()}
                </span>
                <span>/ {job.wageType === '時給' ? '時' : '月'}</span>
              </div>
              <div className="wm-daily-score">
                <span className="wm-num">{job.match}%</span>
                <div className="wm-daily-score-bar"><div style={{width:`${job.match}%`}}/></div>
                <span style={{color:'var(--wm-ink-500)', fontWeight:500}}>マッチ</span>
              </div>
            </div>
          </div>
        ))}

        <div style={{padding:'12px 20px 20px', textAlign:'center', fontSize:11, color:'var(--wm-ink-400)'}}>
          Powered by mico engageAI
        </div>
      </div>
    </div>
  );
}

window.DailyScreen = DailyScreen;
