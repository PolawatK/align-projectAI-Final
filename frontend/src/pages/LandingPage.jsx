import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

/* ── Animated counter hook ── */
function useCounter(target, duration = 1800, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return val;
}

/* ── Intersection observer hook ── */
function useVisible(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const heroRef = useRef(null);

  // Stats section visibility for counter animation
  const [statsRef, statsVisible] = useVisible(0.3);
  const c1 = useCounter(94, 1600, statsVisible);
  const c2 = useCounter(3, 1000, statsVisible);
  const c3 = useCounter(12, 1400, statsVisible);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    const onMouse = (e) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouse, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', onMouse); };
  }, []);

  const parallaxY = scrollY * 0.35;
  const heroOpacity = Math.max(0, 1 - scrollY / 600);

  return (
    <div style={{ background: '#0C0B09', color: '#F0EBE1', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 100,
        padding: '20px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: scrollY > 60 ? 'rgba(12,11,9,.95)' : 'transparent',
        backdropFilter: scrollY > 60 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 60 ? '1px solid rgba(200,168,130,.08)' : 'none',
        transition: 'all .4s ease',
      }}>
        <div style={{ fontFamily: 'Cormorant Garamond, Instrument Serif, serif', fontSize: '1.6rem', letterSpacing: '.35em', textTransform: 'uppercase', color: '#C8A882' }}>
          Align
        </div>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {['Features', 'How It Works', 'Science'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g,'-')}`} style={{ fontSize: '.75rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(240,235,225,.5)', transition: 'color .2s', textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = '#C8A882'}
              onMouseLeave={e => e.target.style.color = 'rgba(240,235,225,.5)'}>
              {item}
            </a>
          ))}
          <button onClick={() => navigate('/scanner')} style={{
            background: 'transparent', border: '1px solid rgba(200,168,130,.4)', color: '#C8A882',
            padding: '9px 22px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase', transition: 'all .25s'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,168,130,.1)'; e.currentTarget.style.borderColor = '#C8A882'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(200,168,130,.4)'; }}>
            {user ? 'Open Scanner' : 'Get Started'}
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>

        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: .04,
          backgroundImage: `
            linear-gradient(rgba(200,168,130,.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,168,130,.6) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          transform: `translateY(${parallaxY * 0.3}px)`,
        }} />

        {/* Radial glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 80% 70% at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(200,168,130,.06) 0%, transparent 60%)`,
          transition: 'background .8s ease',
          pointerEvents: 'none',
        }} />

        {/* Floating spine visual */}
        <div style={{
          position: 'absolute', right: '8%', top: '50%',
          transform: `translateY(calc(-50% + ${-parallaxY * 0.2}px))`,
          opacity: heroOpacity,
        }}>
          <SpineVisual mousePos={mousePos} />
        </div>

        {/* Hero text */}
        <div style={{ padding: '0 60px', maxWidth: 760, opacity: heroOpacity, transform: `translateY(${parallaxY * 0.1}px)` }}>
          <div style={{
            fontSize: '.7rem', letterSpacing: '.35em', textTransform: 'uppercase',
            color: '#C8A882', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14,
            animation: 'fadeUp .8s ease both',
          }}>
            <span style={{ width: 40, height: 1, background: '#C8A882', display: 'inline-block' }} />
            AI Posture Intelligence
          </div>

          <h1 style={{
            fontFamily: 'Cormorant Garamond, Instrument Serif, serif',
            fontSize: 'clamp(4rem, 8vw, 8rem)',
            lineHeight: .95, fontWeight: 300, marginBottom: 32,
            animation: 'fadeUp .9s .1s ease both',
          }}>
            Your spine<br />
            <em style={{ fontStyle: 'italic', color: '#C8A882' }}>deserves</em><br />
            better.
          </h1>

          <p style={{
            fontSize: '1.05rem', lineHeight: 1.8, color: 'rgba(240,235,225,.55)',
            maxWidth: 460, marginBottom: 48, fontWeight: 300,
            animation: 'fadeUp .9s .2s ease both',
          }}>
            ALIGN ใช้ computer vision วิเคราะห์ท่าทางของคุณแบบ real-time แล้วให้ AI แนะนำ 3 วิธีปรับแก้ที่เหมาะกับคุณโดยเฉพาะ
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', animation: 'fadeUp .9s .3s ease both' }}>
            <button onClick={() => navigate(user ? '/scanner' : '/auth')} style={{
              background: '#C8A882', color: '#0C0B09', padding: '16px 40px', border: 'none',
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '.8rem',
              letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 600,
              transition: 'all .25s', position: 'relative', overflow: 'hidden',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#d4b894'}
              onMouseLeave={e => e.currentTarget.style.background = '#C8A882'}>
              {user ? `สแกนเลย, ${user.display_name} →` : 'เริ่มใช้งานฟรี →'}
            </button>
            <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} style={{
              background: 'transparent', color: 'rgba(240,235,225,.65)', padding: '16px 28px',
              border: '1px solid rgba(240,235,225,.15)', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: '.8rem',
              letterSpacing: '.18em', textTransform: 'uppercase', transition: 'all .25s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,168,130,.4)'; e.currentTarget.style.color = '#C8A882'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(240,235,225,.15)'; e.currentTarget.style.color = 'rgba(240,235,225,.65)'; }}>
              ดูวิธีการทำงาน
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: .4,
          animation: 'fadeUp 1s .8s ease both',
        }}>
          <div style={{ width: 1, height: 60, background: 'linear-gradient(to bottom, transparent, #C8A882)', animation: 'scrollLine 2s ease-in-out infinite' }} />
          <span style={{ fontSize: '.6rem', letterSpacing: '.2em', textTransform: 'uppercase', color: '#C8A882' }}>Scroll</span>
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} style={{ padding: '0 60px', borderTop: '1px solid rgba(200,168,130,.1)', borderBottom: '1px solid rgba(200,168,130,.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'rgba(200,168,130,.08)' }}>
          {[
            [c1 + '%', 'Posture Improvement', 'จากผู้ใช้ที่ฝึกต่อเนื่อง 30 วัน'],
            [c2 + ' sec', 'Analysis Time', 'เริ่มรับผลลัพธ์ได้ทันที'],
            [c3 + ' issues', 'Problems Detected', 'ประเภทท่าทางที่ระบบรู้จัก'],
          ].map(([val, label, note]) => (
            <div key={label} style={{ padding: '48px 40px', background: '#0C0B09', transition: 'background .25s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#131210'}
              onMouseLeave={e => e.currentTarget.style.background = '#0C0B09'}>
              <div style={{ fontFamily: 'Cormorant Garamond, Instrument Serif, serif', fontSize: '4rem', color: '#C8A882', lineHeight: 1, fontWeight: 300 }}>{val}</div>
              <div style={{ fontSize: '.72rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(240,235,225,.8)', marginTop: 10 }}>{label}</div>
              <div style={{ fontSize: '.8rem', color: 'rgba(240,235,225,.35)', marginTop: 6, lineHeight: 1.6 }}>{note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '120px 60px' }}>
        <RevealBlock>
          <div style={{ fontSize: '.7rem', letterSpacing: '.3em', textTransform: 'uppercase', color: '#C8A882', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 28, height: 1, background: '#C8A882', display: 'inline-block' }} />
            How It Works
          </div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Instrument Serif, serif', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 300, marginBottom: 72, lineHeight: 1.05 }}>
            Three steps to<br /><em style={{ color: '#C8A882' }}>perfect posture.</em>
          </h2>
        </RevealBlock>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'rgba(200,168,130,.08)' }}>
          {[
            { num: '01', title: 'เปิดกล้อง', desc: 'นั่งหรือยืนด้านข้างกล้อง 90° ระยะ 1–2 เมตร ระบบจะเริ่มตรวจจับโครงกระดูกของคุณโดยอัตโนมัติ', icon: '◎' },
            { num: '02', title: 'AI วิเคราะห์', desc: 'MediaPipe วัดมุม Spine และ Neck แบบ real-time AI ประเมินท่าทางและระบุจุดที่ต้องปรับปรุง', icon: '◈' },
            { num: '03', title: 'รับคำแนะนำ', desc: 'Gemini AI สร้างคำแนะนำ 3 ข้อที่เฉพาะเจาะจงสำหรับท่าทางของคุณ พร้อม step-by-step', icon: '◇' },
          ].map(({ num, title, desc, icon }, i) => (
            <RevealBlock key={num} delay={i * 120}>
              <div style={{ padding: '56px 44px', background: '#0C0B09', height: '100%', position: 'relative', overflow: 'hidden', transition: 'background .3s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#111009'}
                onMouseLeave={e => e.currentTarget.style.background = '#0C0B09'}>
                <div style={{ position: 'absolute', top: 28, right: 36, fontFamily: 'Cormorant Garamond, serif', fontSize: '5rem', color: 'rgba(200,168,130,.06)', fontWeight: 300, lineHeight: 1 }}>{num}</div>
                <div style={{ fontSize: '1.8rem', color: '#C8A882', marginBottom: 20 }}>{icon}</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, Instrument Serif, serif', fontSize: '1.8rem', marginBottom: 16, fontWeight: 400 }}>{title}</h3>
                <p style={{ fontSize: '.88rem', color: 'rgba(240,235,225,.5)', lineHeight: 1.8 }}>{desc}</p>
              </div>
            </RevealBlock>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '40px 60px 120px', background: '#0F0E0B' }}>
        <RevealBlock>
          <div style={{ fontSize: '.7rem', letterSpacing: '.3em', textTransform: 'uppercase', color: '#C8A882', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 28, height: 1, background: '#C8A882', display: 'inline-block' }} />
            Features
          </div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Instrument Serif, serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 300, marginBottom: 64, lineHeight: 1.05 }}>
            Built for <em style={{ color: '#C8A882' }}>real results.</em>
          </h2>
        </RevealBlock>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {/* Big feature */}
          <RevealBlock delay={0}>
            <FeatureCard
              big
              icon="⬡"
              title="Real-time Skeleton Tracking"
              desc="MediaPipe Pose ประมวลผล 30 frames/วินาที บน device ของคุณ ไม่ส่งวิดีโอไปไหนทั้งนั้น — privacy สมบูรณ์"
              tag="On-device AI"
            />
          </RevealBlock>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { icon: '◈', title: 'Groq AI Recommendations', desc: 'คำแนะนำ 3 ข้อที่ปรับตามมุม Spine และ Neck จริงของคุณ ไม่ใช่ template ทั่วไป', tag: 'AI-Powered' },
              { icon: '◎', title: 'Session History & KPI', desc: 'ติดตาม Score, Good Posture Rate และ Streak ของทุก session บน Dashboard', tag: 'Analytics' },
            ].map(({ icon, title, desc, tag }, i) => (
              <RevealBlock key={title} delay={i * 100 + 100}>
                <FeatureCard icon={icon} title={title} desc={desc} tag={tag} />
              </RevealBlock>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 20 }}>
          {[
            { icon: '◷', title: 'Voice Alerts (TH)', desc: 'เตือนด้วยเสียงภาษาไทยเมื่อหลังค่อมต่อเนื่องเกิน 1.5 วินาที', tag: 'Accessibility' },
            { icon: '◻', title: 'Human-in-the-Loop', desc: 'ผู้ใช้ review และยืนยันก่อนบันทึกทุกครั้ง — AI assist ไม่ใช่ AI decide', tag: 'HITL Safety' },
            { icon: '◬', title: 'Medical Guardrail', desc: 'ระบบแจ้งเตือนอัตโนมัติเมื่อตรวจพบความผิดปกติที่ควรปรึกษาแพทย์', tag: 'Safety First' },
          ].map(({ icon, title, desc, tag }, i) => (
            <RevealBlock key={title} delay={i * 80 + 200}>
              <FeatureCard icon={icon} title={title} desc={desc} tag={tag} />
            </RevealBlock>
          ))}
        </div>
      </section>

      {/* ── SCIENCE ── */}
      <section id="science" style={{ padding: '120px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <RevealBlock>
          <div style={{ fontSize: '.7rem', letterSpacing: '.3em', textTransform: 'uppercase', color: '#C8A882', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 28, height: 1, background: '#C8A882', display: 'inline-block' }} />
            The Science
          </div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Instrument Serif, serif', fontSize: 'clamp(2.2rem, 4vw, 3.8rem)', fontWeight: 300, marginBottom: 28, lineHeight: 1.1 }}>
            Biomechanics<br /><em style={{ color: '#C8A882' }}>meets AI.</em>
          </h2>
          <p style={{ fontSize: '.92rem', color: 'rgba(240,235,225,.5)', lineHeight: 1.9, marginBottom: 32 }}>
            ระบบวัดมุม Spine Tilt และ Neck Forward ที่ได้รับการอ้างอิงจากงานวิจัย biomechanics โดย มุม spine &lt;8° และ neck &lt;22° ถือว่าอยู่ในเกณฑ์ดี
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[['Spine Tilt', 'ดี < 8°', 'เสี่ยง > 15°', 60], ['Neck Angle', 'ดี < 22°', 'เสี่ยง > 30°', 45], ['Kyphosis', 'ดี < 0.15', 'เสี่ยง > 0.25', 70]].map(([label, good, risk, pct]) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '.78rem' }}>
                  <span style={{ color: 'rgba(240,235,225,.7)', letterSpacing: '.08em' }}>{label}</span>
                  <span style={{ color: 'rgba(240,235,225,.4)', fontSize: '.72rem' }}>{good} · {risk}</span>
                </div>
                <div style={{ height: 3, background: 'rgba(200,168,130,.1)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: pct + '%', background: 'linear-gradient(90deg, #7A9E7E, #C8A882)', transition: 'width 1.2s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </RevealBlock>

        <RevealBlock delay={200}>
          <div style={{ position: 'relative', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Decorative rings */}
            {[280, 220, 160].map((size, i) => (
              <div key={size} style={{
                position: 'absolute', width: size, height: size, borderRadius: '50%',
                border: `1px solid rgba(200,168,130,${0.06 + i * 0.04})`,
                animation: `rotateSlow ${20 + i * 8}s linear infinite ${i % 2 ? 'reverse' : ''}`,
              }} />
            ))}
            <SpineDetailVisual />
          </div>
        </RevealBlock>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '100px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden', borderTop: '1px solid rgba(200,168,130,.08)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(200,168,130,.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <RevealBlock>
          <div style={{ fontSize: '.7rem', letterSpacing: '.3em', textTransform: 'uppercase', color: '#C8A882', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
            <span style={{ width: 28, height: 1, background: '#C8A882', display: 'inline-block' }} />
            Start Today
            <span style={{ width: 28, height: 1, background: '#C8A882', display: 'inline-block' }} />
          </div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Instrument Serif, serif', fontSize: 'clamp(3rem, 7vw, 6rem)', fontWeight: 300, lineHeight: 1, marginBottom: 24 }}>
            Your posture,<br /><em style={{ color: '#C8A882' }}>transformed.</em>
          </h2>
          <p style={{ fontSize: '.95rem', color: 'rgba(240,235,225,.45)', lineHeight: 1.8, maxWidth: 440, margin: '0 auto 48px' }}>
            เริ่มต้นได้เลยทันที ไม่ต้องติดตั้งอะไร ไม่ต้องใส่บัตรเครดิต
          </p>
          <button onClick={() => navigate(user ? '/scanner' : '/auth')} style={{
            background: '#C8A882', color: '#0C0B09', padding: '18px 52px', border: 'none',
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '.82rem',
            letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 700,
            transition: 'all .3s', display: 'inline-block',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#d4b894'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(200,168,130,.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#C8A882'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
            {user ? 'Go to Scanner →' : 'สมัครฟรี ใช้เลย →'}
          </button>
        </RevealBlock>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '40px 60px', borderTop: '1px solid rgba(200,168,130,.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, Instrument Serif, serif', fontSize: '1.3rem', letterSpacing: '.3em', color: '#C8A882' }}>ALIGN</div>
        <div style={{ fontSize: '.72rem', color: 'rgba(240,235,225,.25)', letterSpacing: '.1em' }}>AI Posture Intelligence · All processing on-device · No video stored</div>
        <div style={{ fontSize: '.72rem', color: 'rgba(240,235,225,.25)', letterSpacing: '.08em' }}>VibeCode Final Project 2025</div>
      </footer>

      {/* ── KEYFRAMES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollLine {
          0%, 100% { opacity: .4; transform: scaleY(1); }
          50%       { opacity: .8; transform: scaleY(1.3); }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes spinePulse {
          0%, 100% { opacity: .6; }
          50%       { opacity: 1; }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-14px); }
        }
      `}</style>
    </div>
  );
}

/* ── Reveal wrapper ── */
function RevealBlock({ children, delay = 0 }) {
  const [ref, visible] = useVisible(0.1);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity .7s ${delay}ms ease, transform .7s ${delay}ms ease`,
    }}>
      {children}
    </div>
  );
}

/* ── Feature card ── */
function FeatureCard({ icon, title, desc, tag, big = false }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{
      padding: big ? '48px 44px' : '36px 32px',
      background: hovered ? '#111009' : '#0F0E0B',
      border: '1px solid rgba(200,168,130,.08)',
      transition: 'all .3s', height: '100%',
      borderColor: hovered ? 'rgba(200,168,130,.2)' : 'rgba(200,168,130,.08)',
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div style={{ fontSize: big ? '2.2rem' : '1.6rem', color: '#C8A882', marginBottom: 16, opacity: hovered ? 1 : .7, transition: 'opacity .3s' }}>{icon}</div>
      <h3 style={{ fontFamily: 'Cormorant Garamond, Instrument Serif, serif', fontSize: big ? '1.8rem' : '1.4rem', marginBottom: 12, fontWeight: 400 }}>{title}</h3>
      <p style={{ fontSize: '.85rem', color: 'rgba(240,235,225,.45)', lineHeight: 1.8 }}>{desc}</p>
      <span style={{
        display: 'inline-block', marginTop: 20, padding: '4px 12px',
        border: '1px solid rgba(200,168,130,.25)', fontSize: '.66rem',
        letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(200,168,130,.7)',
      }}>{tag}</span>
    </div>
  );
}

/* ── Spine hero visual ── */
function SpineVisual({ mousePos }) {
  const tiltX = (mousePos.x - 0.5) * 12;
  const tiltY = (mousePos.y - 0.5) * 8;
  return (
    <div style={{
      width: 260, height: 480,
      transform: `perspective(800px) rotateY(${tiltX}deg) rotateX(${-tiltY}deg)`,
      transition: 'transform .6s ease',
      animation: 'floatY 5s ease-in-out infinite',
    }}>
      <svg viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        {/* Head */}
        <circle cx="50" cy="14" r="10" stroke="#C8A882" strokeWidth="1" fill="none" opacity=".8" />
        {/* Spine segments */}
        {[0,1,2,3,4,5,6].map(i => (
          <g key={i}>
            <rect x={38 - i*0.5} y={28 + i*20} width={24 + i} height={8} rx={2} fill="rgba(200,168,130,.12)" stroke="rgba(200,168,130,.3)" strokeWidth=".5" />
            <line x1="50" y1={28 + i*20} x2="50" y2={36 + i*20} stroke="rgba(200,168,130,.4)" strokeWidth=".8" />
          </g>
        ))}
        {/* Pelvis */}
        <ellipse cx="50" cy="172" rx="22" ry="12" fill="rgba(200,168,130,.08)" stroke="rgba(200,168,130,.35)" strokeWidth=".8" />
        {/* Glow lines */}
        <line x1="50" y1="24" x2="50" y2="168" stroke="rgba(200,168,130,.12)" strokeWidth="2" />
        <line x1="50" y1="24" x2="50" y2="168" stroke="rgba(200,168,130,.06)" strokeWidth="8" />
        {/* Good posture indicator */}
        <line x1="72" y1="28" x2="72" y2="168" stroke="rgba(122,158,126,.3)" strokeWidth=".5" strokeDasharray="3 4" />
        <text x="76" y="100" fill="rgba(122,158,126,.5)" fontSize="5" fontFamily="DM Sans" letterSpacing="1">ALIGNED</text>
      </svg>
    </div>
  );
}

/* ── Spine detail visual ── */
function SpineDetailVisual() {
  return (
    <svg viewBox="0 0 120 180" fill="none" xmlns="http://www.w3.org/2000/svg" width={200} height={300} style={{ animation: 'spinePulse 3s ease-in-out infinite' }}>
      <circle cx="60" cy="18" r="12" stroke="#C8A882" strokeWidth="1.2" fill="none" />
      {[0,1,2,3,4].map(i => (
        <g key={i}>
          <rect x={46 - i} y={34 + i*22} width={28 + i*2} height={10} rx="2.5" fill="rgba(200,168,130,.1)" stroke="#C8A882" strokeWidth=".8" opacity={.4 + i*.1} />
        </g>
      ))}
      <ellipse cx="60" cy="152" rx="26" ry="14" fill="rgba(200,168,130,.07)" stroke="#C8A882" strokeWidth=".8" opacity=".5" />
      {/* Angle indicator */}
      <line x1="60" y1="30" x2="60" y2="150" stroke="rgba(122,158,126,.4)" strokeWidth="1" strokeDasharray="4 4" />
      <path d="M60 60 L72 80" stroke="#D4836A" strokeWidth="1.2" strokeLinecap="round" opacity=".6" />
      <text x="74" y="84" fill="rgba(212,131,106,.7)" fontSize="7" fontFamily="DM Sans">12°</text>
      <text x="62" y="170" fill="rgba(200,168,130,.4)" fontSize="6" fontFamily="DM Sans" letterSpacing="1" textAnchor="middle">SPINE ANALYSIS</text>
    </svg>
  );
}
