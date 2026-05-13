// Job detail screen
function DetailScreen({job, origin = 'swipe', onBack, onLike, onSkip, onApply, onConsult}) {
  if (!job) return null;
  return (
    <div className="wm-screen" style={{paddingTop: 0, paddingBottom: 0, background:'#fff'}}>
      <div className="wm-detail-hero">
        {job.photo ? (
          <img
            src={job.photo}
            alt=""
            style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block'}}
            draggable="false"
          />
        ) : (
          <WM.JobArt job={job}/>
        )}
        <div style={{
          position:'absolute', inset:0,
          background:'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 40%, rgba(0,0,0,0.6) 100%)'
        }}/>

        {/* top controls */}
        <div style={{
          position:'absolute', top:16, left:16, right:16, zIndex:10,
          display:'flex', justifyContent:'space-between'
        }}>
          <button onClick={onBack} style={{
            width:38, height:38, borderRadius:'50%', border:'none',
            background:'rgba(255,255,255,0.9)', backdropFilter:'blur(10px)',
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
            color:'var(--wm-ink-900)', boxShadow:'0 2px 6px rgba(0,0,0,0.1)'
          }}>
            <WM.Icon.Back size={20}/>
          </button>
          <div style={{display:'flex', gap:8}}>
            <button style={{
              width:38, height:38, borderRadius:'50%', border:'none',
              background:'rgba(255,255,255,0.9)', backdropFilter:'blur(10px)',
              display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
              color:'var(--wm-ink-900)', boxShadow:'0 2px 6px rgba(0,0,0,0.1)'
            }}>
              <WM.Icon.Bookmark size={18}/>
            </button>
            <button style={{
              width:38, height:38, borderRadius:'50%', border:'none',
              background:'rgba(255,255,255,0.9)', backdropFilter:'blur(10px)',
              display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
              color:'var(--wm-ink-900)', boxShadow:'0 2px 6px rgba(0,0,0,0.1)'
            }}>
              <WM.Icon.Share size={18}/>
            </button>
          </div>
        </div>

        {/* title overlay */}
        <div style={{position:'absolute', left:16, right:16, bottom:16, color:'#fff', zIndex:5}}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
            <WM.MatchBadge score={job.match}/>
            <span className="wm-chip" style={{background:'rgba(255,255,255,0.22)', color:'#fff', backdropFilter:'blur(8px)'}}>
              {job.category} · {job.subcategory}
            </span>
          </div>
          <div style={{fontSize:22, fontWeight:800, lineHeight:1.25, textShadow:'0 1px 4px rgba(0,0,0,0.3)'}}>
            {job.title}
          </div>
          <div style={{fontSize:13, marginTop:4, opacity:0.95}}>
            {job.company} · {job.companySize}
          </div>
        </div>
      </div>

      <div className="wm-screen-scroll" style={{paddingBottom: 96}}>
        <div className="wm-detail-content">
          {/* wage callout */}
          <div className="wm-detail-wage">
            <div>
              <div style={{fontSize:11, color:'var(--wm-ink-500)', fontWeight:600, letterSpacing:'0.05em'}}>時給</div>
              <div className="wm-detail-wage-amt">¥{job.wage.toLocaleString()}</div>
              <div style={{fontSize:11, color:'var(--wm-ink-500)', marginTop:2}}>{job.wageNote}</div>
            </div>
            <div style={{
              background:'rgba(255,255,255,0.6)', borderRadius:10, padding:'6px 10px',
              fontSize:11, color:'var(--wm-green-700)', fontWeight:700,
              display:'flex', alignItems:'center', gap:4
            }}>
              <WM.Icon.Flame size={14}/> 人気
            </div>
          </div>

          {/* AI match reason */}
          <div style={{
            padding:'12px 14px', background:'#f3f6f4', borderRadius:12,
            display:'flex', gap:10, alignItems:'flex-start'
          }}>
            <div style={{
              width:28, height:28, borderRadius:'50%',
              background:'linear-gradient(135deg, var(--wm-green-600), var(--wm-green-500))',
              color:'#fff', flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center'
            }}>
              <WM.Icon.Sparkle size={14}/>
            </div>
            <div>
              <div style={{fontSize:11, fontWeight:700, color:'var(--wm-green-700)', letterSpacing:'0.04em'}}>AI MATCH</div>
              <div style={{fontSize:13, fontWeight:600, marginTop:2, lineHeight:1.4}}>
                {job.matchReason}
              </div>
            </div>
          </div>

          {/* Basics */}
          <div>
            <div className="wm-detail-section-title">基本情報</div>
            <dl className="wm-kv-grid">
              <dt>勤務地</dt><dd>{job.location}</dd>
              <dt>アクセス</dt><dd style={{fontWeight:500, color:'var(--wm-ink-700)'}}>{job.access}</dd>
              <dt>勤務時間</dt><dd>{job.shift}</dd>
              <dt>職種</dt><dd>{job.category} / {job.subcategory}</dd>
            </dl>
          </div>

          {/* shift details */}
          <div>
            <div className="wm-detail-section-title">シフト詳細</div>
            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              {job.shiftDetails.map((s,i)=>(
                <div key={i} style={{
                  padding:'10px 12px', background:'var(--wm-ink-50)', borderRadius:10,
                  fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:8
                }}>
                  <WM.Icon.Clock size={14}/>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div>
            <div className="wm-detail-section-title">おすすめポイント</div>
            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              {job.highlights.map((h,i)=>(
                <div key={i} style={{display:'flex', gap:8, alignItems:'flex-start', fontSize:13, lineHeight:1.45}}>
                  <div style={{
                    color:'var(--wm-green-600)', flexShrink:0,
                    marginTop:3
                  }}>
                    <WM.Icon.Check size={14}/>
                  </div>
                  <span style={{fontWeight:600}}>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="wm-detail-section-title">仕事内容</div>
            <p style={{fontSize:13, lineHeight:1.7, margin:0, color:'var(--wm-ink-700)'}}>
              {job.desc}
            </p>
          </div>

          {/* Tags */}
          <div>
            <div className="wm-detail-section-title">特徴</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
              {job.tags.map((t,i)=>(
                <WM.Chip key={i} variant={['green','amber','sky','rose'][i%4]}>{t}</WM.Chip>
              ))}
            </div>
          </div>

          {/* Welfare */}
          <div>
            <div className="wm-detail-section-title">福利厚生</div>
            <ul style={{margin:0, padding:'0 0 0 18px', fontSize:13, color:'var(--wm-ink-700)', lineHeight:1.8}}>
              {job.welfare.map((w,i)=><li key={i}>{w}</li>)}
            </ul>
          </div>

          <div style={{
            fontSize:10, color:'var(--wm-ink-400)', textAlign:'center',
            fontFamily:'var(--wm-font-num)', marginTop:4
          }}>
            Job ID: {job.id}
          </div>
        </div>
      </div>

      {/* CTA buttons — context dependent */}
      <div className="wm-detail-cta">
        {origin === 'liked' && (
          <>
            <button onClick={onConsult} className="wm-btn-ghost" style={{flex:1}}>
              担当者に相談
            </button>
            <button onClick={onApply} className="wm-btn-primary" style={{flex:2, background:'var(--tg-500)'}}>
              応募に進む
            </button>
          </>
        )}
        {origin === 'skipped' && (
          <button onClick={onLike} className="wm-btn-primary" style={{flex:1}}>
            <WM.Icon.Heart size={18} fill="#fff" stroke="none"/>
            やっぱり気になる
          </button>
        )}
        {origin === 'swipe' && (
          <>
            <button onClick={onSkip} className="wm-btn-ghost" style={{flex:1}}>
              スキップ
            </button>
            <button onClick={onLike} className="wm-btn-primary" style={{flex:2}}>
              <WM.Icon.Heart size={18} fill="#fff" stroke="none"/>
              気になる
            </button>
          </>
        )}
      </div>
    </div>
  );
}

window.DetailScreen = DetailScreen;
