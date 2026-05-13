// Shared UI — Material Symbols icons, chips, job art
const WM = (() => {
  // Material Symbols Rounded via Google Fonts (loaded in index.html)
  const Mi = ({name, size=20, fill=0, weight=400, grade=0, opticalSize, style={}, color='currentColor'}) => {
    // opsz should track font-size for correct glyph width
    const opsz = opticalSize || (size <= 20 ? 20 : size <= 24 ? 24 : size <= 40 ? 40 : 48);
    return (
      <span
        className="material-symbols-rounded"
        style={{
          fontSize: size,
          width: size,
          height: size,
          lineHeight: `${size}px`,
          color,
          fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opsz}`,
          userSelect: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          verticalAlign: 'middle',
          flexShrink: 0,
          ...style,
        }}
      >{name}</span>
    );
  };

  const Icon = {
    Heart:    (p) => <Mi name="favorite" {...p}/>,
    HeartO:   (p) => <Mi name="favorite" fill={0} {...p}/>,
    Cross:    (p) => <Mi name="close" weight={600} {...p}/>,
    Star:     (p) => <Mi name="star" fill={1} {...p}/>,
    Info:     (p) => <Mi name="info" {...p}/>,
    Pin:      (p) => <Mi name="location_on" fill={1} {...p}/>,
    Yen:      (p) => <Mi name="currency_yen" weight={500} {...p}/>,
    Clock:    (p) => <Mi name="schedule" {...p}/>,
    Check:    (p) => <Mi name="check" weight={700} {...p}/>,
    Sparkle:  (p) => <Mi name="auto_awesome" fill={1} {...p}/>,
    Back:     (p) => <Mi name="arrow_back" weight={500} {...p}/>,
    Share:    (p) => <Mi name="ios_share" {...p}/>,
    Bookmark: (p) => <Mi name="bookmark" {...p}/>,
    BookmarkFill: (p) => <Mi name="bookmark" fill={1} {...p}/>,
    Flame:    (p) => <Mi name="local_fire_department" fill={1} {...p}/>,
    Bolt:     (p) => <Mi name="bolt" fill={1} {...p}/>,
    History:  (p) => <Mi name="history" {...p}/>,
    Person:   (p) => <Mi name="person" fill={1} {...p}/>,
    Notif:    (p) => <Mi name="notifications" fill={1} {...p}/>,
    Menu:     (p) => <Mi name="menu" {...p}/>,
    Cards:    (p) => <Mi name="style" {...p}/>,
    Chevron:  (p) => <Mi name="chevron_right" {...p}/>,
    Tune:     (p) => <Mi name="tune" {...p}/>,
    Factory:  (p) => <Mi name="factory" fill={1} {...p}/>,
    Dorm:     (p) => <Mi name="apartment" fill={1} {...p}/>,
    Refresh:  (p) => <Mi name="refresh" {...p}/>,
    Close:    (p) => <Mi name="close" weight={500} {...p}/>,
  };

  // Colorful placeholder job art — stripes + label + iconography
  const JobArt = ({job, style={}, labelOnly=false}) => (
    <div className="wm-art" style={{
      background: `linear-gradient(135deg, ${job.color} 0%, ${job.color2} 100%)`,
      ...style,
    }}>
      <div className="wm-art-stripes"/>
      {/* big faded icon watermark */}
      <div style={{
        position:'absolute', right:-10, bottom:-14,
        opacity:0.18, color:'#fff', pointerEvents:'none',
      }}>
        <Mi name={job.artIcon || 'factory'} size={labelOnly? 56 : 120} fill={1}/>
      </div>
      {!labelOnly && <div className="wm-art-label">{job.category} · {job.subcategory}</div>}
    </div>
  );

  const Chip = ({children, variant="default"}) => (
    <span className={`wm-chip wm-chip-${variant}`}>{children}</span>
  );

  const MatchBadge = ({score}) => (
    <div className="wm-match-badge">
      <span style={{color: "var(--wm-green-600)", display:'flex'}}><Icon.Sparkle size={12}/></span>
      <span className="wm-num">{score}</span>
      <span style={{fontWeight:600}}>%</span>
    </div>
  );

  return { Icon, Mi, JobArt, Chip, MatchBadge };
})();

window.WM = WM;
