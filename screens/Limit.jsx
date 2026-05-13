// Daily Limit reached — wrap-up screen
function LimitScreen({jobs, liked, onNav}) {
  const likedJobs = liked.slice(0,3).map(l => jobs.find(j=>j.id===l.jobId)).filter(Boolean);
  return (
    <div className="wm-screen">
      <div className="wm-screen-scroll">
        <div className="wm-wrap" style={{paddingTop:12}}>
          {/* Icon + heading: horizontal row, vertically centred */}
          <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:14}}>
            <div style={{
              width:48, height:48, borderRadius:'50%', flexShrink:0,
              background:'var(--accent)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="wm-wrap-h1" style={{
              fontFamily:'var(--wm-font-jp)', fontWeight:800, fontSize:26, lineHeight:1.2,
            }}>お疲れさまでした</div>
          </div>
          <div className="wm-wrap-sub">本日のスワイプ上限 (20件) に到達しました<br/>明日の朝6時に新着求人が届きます</div>
        </div>

        <div className="wm-wrap-stats">
          <div className="wm-wrap-stat">
            <div className="wm-wrap-stat-num">20</div>
            <div className="wm-wrap-stat-label">スワイプ</div>
          </div>
          <div className="wm-wrap-stat">
            <div className="wm-wrap-stat-num" style={{color:'var(--wm-accent-rose)'}}>{liked.length || 7}</div>
            <div className="wm-wrap-stat-label">気になる</div>
          </div>
          <div className="wm-wrap-stat">
            <div className="wm-wrap-stat-num" style={{color:'var(--wm-accent-amber)'}}>91<span style={{fontSize:14, marginLeft:1}}>%</span></div>
            <div className="wm-wrap-stat-label">平均マッチ</div>
          </div>
        </div>

        <div className="wm-wrap-reco-title">今日の「気になる」</div>
        <div style={{padding:'0 14px'}}>
          {likedJobs.length === 0 && (
            <div style={{
              padding:'18px', background:'#fff', borderRadius:14,
              fontSize:12, color:'var(--wm-ink-500)', textAlign:'center'
            }}>
              今日は「気になる」がありませんでした
            </div>
          )}
          {likedJobs.map(job => (
            <div key={job.id} className="wm-daily-row" onClick={()=>onNav('detail', job)} style={{margin:'0 0 8px', borderRadius:14, borderBottom:'none', boxShadow:'0 1px 3px #0000000a, 0 0 0 1px #00000008'}}>
              <div className="wm-daily-thumb" style={{borderRadius:10}}>
                <img src={job.photo} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
              </div>
              <div className="wm-daily-info">
                <div className="wm-daily-job-title">{job.title}</div>
                <div className="wm-daily-meta">
                  <span>{job.company}</span>
                </div>
                <div className="wm-daily-meta">
                  <span className="wm-num" style={{fontWeight:700, color:'var(--wm-ink-900)'}}>
                    ¥{job.wage.toLocaleString()}
                  </span>
                  <span>/ {job.wageType==='時給'?'時':'月'}</span>
                </div>
              </div>
              <div style={{alignSelf:'center', color:'var(--wm-ink-200)', paddingRight:4}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div className="wm-wrap-cta">
          <button className="wm-btn-primary" style={{width:'100%', background:'var(--accent)', boxShadow:'0 4px 16px rgba(42,46,234,0.35)'}} onClick={()=>onNav('history')}>
            気になるリストを見る
          </button>
        </div>

        <div style={{
          margin:'14px 16px 10px', padding:'10px 12px',
          background:'linear-gradient(135deg, #eef0ff 0%, #d8dcff 100%)',
          borderRadius:12, fontSize:10, color:'#1e1bcc', lineHeight:1.4, fontWeight:600,
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
        }}>
          🔔 新着求人はLINEでお知らせします。通知をONにしておきましょう。
        </div>
      </div>
    </div>
  );
}

window.LimitScreen = LimitScreen;
