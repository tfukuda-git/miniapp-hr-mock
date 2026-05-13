// Tutorial screen (S0) — swipeable onboarding cards
function TutorialScreen({onComplete}) {
  const [page, setPage] = React.useState(0);
  const [exiting, setExiting] = React.useState(false);

  const pages = [
    {
      icon: 'auto_awesome',
      iconBg: 'linear-gradient(135deg, #2a2eea, #5e60ff)',
      title: 'かんたん求人マッチング',
      desc: 'AIがあなたにピッタリの求人を\n毎日届けます。スワイプするだけで\nあなた好みの仕事が見つかります。',
      img: 'assets/illust-thumbsup.png',
    },
    {
      icon: 'swipe',
      iconBg: 'linear-gradient(135deg, #ff3b5c, #ff6b81)',
      title: 'スワイプで選ぶ',
      desc: '右スワイプ → 気になる\n左スワイプ → スキップ\nかんたん操作で好みを教えてください。',
      img: null,
      demoSwipe: true,
    },
    {
      icon: 'favorite',
      iconBg: 'linear-gradient(135deg, #ff3b5c, #ff6b81)',
      title: '気になるリストを確認',
      desc: '「気になる」に追加した求人は\nいつでもリッチメニューから確認できます。',
      img: null,
    },
  ];

  const current = pages[page];
  const isLast = page === pages.length - 1;

  const handleNext = () => {
    if (isLast) {
      setExiting(true);
      setTimeout(onComplete, 400);
    } else {
      setPage(p => p + 1);
    }
  };

  return (
    <div className="wm-screen" style={{
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      opacity: exiting ? 0 : 1,
      transition: 'opacity 0.35s ease',
    }}>
      {/* Top spacer for status bar */}
      <div style={{height: 60, flexShrink: 0}}/>

      {/* Brand */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 24px 16px', flexShrink: 0,
      }}>
        <img src="assets/mico-mark.png" alt="mico" style={{width: 24, height: 24, objectFit: 'contain'}}/>
        <span style={{fontSize: 13, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.01em'}}>Mico Work Match</span>
      </div>

      {/* Card content area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 28px',
        textAlign: 'center',
      }}>
        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: current.iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
          boxShadow: '0 8px 24px rgba(42,46,234,0.25)',
        }}>
          <span className="material-symbols-rounded" style={{
            fontSize: 36, color: '#fff',
            fontVariationSettings: "'FILL' 1, 'wght' 500",
          }}>{current.icon}</span>
        </div>

        {/* Swipe demo visual on page 2 */}
        {current.demoSwipe && (
          <div style={{
            display: 'flex', gap: 32, alignItems: 'center',
            marginBottom: 20,
          }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '2px solid #e0e0e0', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="material-symbols-rounded" style={{fontSize: 24, color: '#999', fontVariationSettings: "'wght' 500"}}>close</span>
              </div>
              <span style={{fontSize: 10, color: '#999', fontWeight: 600}}>スキップ</span>
            </div>
            <div style={{fontSize: 20, color: '#ccc'}}>
              <span className="material-symbols-rounded" style={{fontSize: 24}}>swipe</span>
            </div>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '2px solid #ff3b5c', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="material-symbols-rounded" style={{fontSize: 24, color: '#ff3b5c', fontVariationSettings: "'FILL' 1"}}>favorite</span>
              </div>
              <span style={{fontSize: 10, color: '#ff3b5c', fontWeight: 600}}>気になる</span>
            </div>
          </div>
        )}

        {/* Illustration */}
        {current.img && (
          <div style={{marginBottom: 16}}>
            <img src={current.img} alt="" style={{width: 100, height: 100, objectFit: 'contain'}}/>
          </div>
        )}

        {/* Title */}
        <div style={{
          fontSize: 24, fontWeight: 800, color: '#1a1a1a',
          lineHeight: 1.3, marginBottom: 12,
          fontFamily: 'var(--wm-font-jp)',
        }}>{current.title}</div>

        {/* Description */}
        <div style={{
          fontSize: 14, color: '#666', lineHeight: 1.7,
          whiteSpace: 'pre-line',
        }}>{current.desc}</div>
      </div>

      {/* Dots + CTA */}
      <div style={{
        padding: '20px 24px 40px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        flexShrink: 0,
      }}>
        {/* Page dots */}
        <div style={{display: 'flex', gap: 8}}>
          {pages.map((_, i) => (
            <div key={i} style={{
              width: i === page ? 20 : 8, height: 8,
              borderRadius: 4,
              background: i === page ? '#2a2eea' : '#ddd',
              transition: 'all 0.3s ease',
            }}/>
          ))}
        </div>

        {/* Button */}
        <button
          onClick={handleNext}
          className="wm-btn-primary"
          style={{
            width: '100%',
            background: isLast ? '#2a2eea' : '#2a2eea',
            boxShadow: '0 4px 16px rgba(42,46,234,0.35)',
            fontSize: 16,
            fontWeight: 700,
            padding: '14px 0',
          }}
        >
          {isLast ? 'はじめる' : '次へ'}
        </button>

        {!isLast && (
          <button
            onClick={() => { setExiting(true); setTimeout(onComplete, 400); }}
            style={{
              background: 'none', border: 'none',
              color: '#999', fontSize: 13, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >スキップ</button>
        )}
      </div>
    </div>
  );
}

window.TutorialScreen = TutorialScreen;
