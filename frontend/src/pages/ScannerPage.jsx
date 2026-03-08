import { useState, useRef, useEffect, useCallback } from 'react';
import { sessionsApi, aiApi } from '../lib/api.js';
import { showToast } from '../components/Toast.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

/* ── helpers ─────────────────────────────────────────────── */
function calcAngle(v1, v2) {
  const dot = v1.x*v2.x + v1.y*v2.y;
  const m = Math.hypot(v1.x,v1.y)*Math.hypot(v2.x,v2.y);
  return m===0 ? 0 : Math.acos(Math.min(Math.max(dot/m,-1),1))*(180/Math.PI);
}
function fmtTime(s) {
  if (s <= 0) return '0s';
  const m = Math.floor(s/60);
  return (m ? m+'m ' : '') + s%60 + 's';
}
function fmtMM(s) {
  return String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0');
}

/* ── TTS ─────────────────────────────────────────────────── */
let ttsBusy = false;
const ttsQ = [];
function speakTH(text) {
  if (!window.speechSynthesis) return;
  ttsQ.push(text);
  if (!ttsBusy) processQ();
}
function processQ() {
  if (!ttsQ.length) { ttsBusy=false; return; }
  ttsBusy=true;
  const u = new SpeechSynthesisUtterance(ttsQ.shift());
  u.lang='th-TH'; u.rate=.9;
  u.onend = processQ;
  window.speechSynthesis.speak(u);
}

export default function ScannerPage() {
  const { user } = useAuth();

  // Scanner state
  const [running, setRunning] = useState(false);
  const [scanStatus, setScanStatus] = useState({ type: 'warn', text: 'Ready' });
  const [metrics, setMetrics] = useState({ spineDeg: 0, neckDeg: 0, tiltPct: 0, neckPct: 0 });
  const [timer, setTimer] = useState('00:00');
  const [summary, setSummary] = useState(null);

  // Session data after stop
  const [pendingSession, setPendingSession] = useState(null);
  const [thumb, setThumb] = useState(null);

  // HITL modal
  const [showHITL, setShowHITL] = useState(false);

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // Refs (no re-render)
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const poseRef = useRef(null);
  const camRef = useRef(null);
  const runningRef = useRef(false);
  const counters = useRef({ good:0, bad:0, total:0, streak:0, maxStreak:0, badRow:0, start:0 });
  const lastAngles = useRef({ spine:0, neck:0 });
  const timerInterval = useRef(null);

  // ── Camera/Pose init ────────────────────────────────────
  const onResults = useCallback((results) => {
    if (!runningRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    ctx.save();
    ctx.clearRect(0,0,W,H);
    ctx.scale(-1,1); ctx.translate(-W,0);
    if (results.image) ctx.drawImage(results.image,0,0,W,H);

    const lm = results.poseLandmarks;
    if (!lm) { ctx.restore(); return; }

    const ls=lm[11], rs=lm[12], lh=lm[23], rh=lm[24], nose=lm[0];
    if (!ls||!rs||!lh||!rh) { ctx.restore(); return; }

    const shX=(ls.x+rs.x)/2*W, shY=(ls.y+rs.y)/2*H;
    const hX=(lh.x+rh.x)/2*W, hY=(lh.y+rh.y)/2*H;
    const facingDir = nose.x>(ls.x+rs.x)/2 ? 1:-1;
    const spineVec = {x:shX-hX, y:shY-hY};
    const sSpine = calcAngle(spineVec,{x:0,y:-1});

    const backEar = facingDir>0 ? lm[7] : lm[8];
    const earOk = backEar && (backEar.visibility||0) > .2;
    let sNeck = lastAngles.current.neck;
    if (earOk) { sNeck=calcAngle({x:backEar.x*W-shX,y:backEar.y*H-shY},{x:0,y:-1}); }

    const sKypho = Math.abs(shX-hX)/Math.hypot(shX-hX,shY-hY);
    const badSpine=sSpine>15, badNeck=sNeck>30, badKypho=sKypho>.25;
    lastAngles.current = {spine: Math.round(sSpine*10)/10, neck: Math.round(sNeck*10)/10};

    // Update display metrics (throttle setState)
    setMetrics({
      spineDeg: lastAngles.current.spine,
      neckDeg: earOk ? lastAngles.current.neck : lastAngles.current.neck,
      tiltPct: Math.min(sSpine/30*100,100),
      neckPct: Math.min(sNeck/45*100,100),
      neckOk: earOk,
      badSpine, badNeck, badKypho
    });

    // Draw skeleton
    if (window.drawConnectors) window.drawConnectors(ctx,lm,window.POSE_CONNECTIONS,{color:'rgba(255,255,255,.07)',lineWidth:2});
    if (window.drawLandmarks) window.drawLandmarks(ctx,lm,{color:'#C8A882',lineWidth:1,radius:3});

    const midX=(shX+hX)/2, midY=(shY+hY)/2;
    const spineColor = badKypho?'#D4836A':sKypho>.1?'#C8A882':'#7A9E7E';
    ctx.strokeStyle=spineColor; ctx.lineWidth=5; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(hX,hY);
    ctx.quadraticCurveTo(midX+facingDir*Math.min(sKypho*120,40),midY,shX,shY);
    ctx.stroke(); ctx.lineCap='butt';

    ctx.fillStyle='#C8A882';
    ctx.beginPath(); ctx.arc(shX,shY,7,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(hX,hY,7,0,Math.PI*2); ctx.fill();

    ctx.font='600 13px DM Sans'; ctx.fillStyle='white'; ctx.textAlign='left';
    const lx=shX+(facingDir>0?15:-140);
    ctx.fillText(`Spine ${sSpine.toFixed(1)}°`,lx,shY-10);
    if(earOk) ctx.fillText(`Neck ${sNeck.toFixed(1)}°`,lx,shY+12);
    ctx.restore();

    // Count
    const c=counters.current;
    c.total++;
    const isBad=badSpine||badNeck||badKypho;
    if(isBad){ c.bad++; c.streak=0; c.badRow++;
      setScanStatus({type:'bad',text:'หลังค่อม'});
      if(c.badRow>45){speakTH('กรุณาปรับท่าทาง');c.badRow=0;}
    } else { c.good++; c.streak++; c.badRow=0;
      if(c.streak>c.maxStreak) c.maxStreak=c.streak;
      setScanStatus({type:'good',text:'ท่าทางดี'});
    }
  }, []);

  async function startScanner() {
    const c=counters.current;
    c.good=0;c.bad=0;c.total=0;c.streak=0;c.maxStreak=0;c.badRow=0;c.start=Date.now();
    setThumb(null); setSummary(null); setAiData(null); setPendingSession(null);

    if (!poseRef.current) {
      const pose = new window.Pose({ locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}` });
      pose.setOptions({modelComplexity:1,smoothLandmarks:true,minDetectionConfidence:.5,minTrackingConfidence:.5});
      pose.onResults(onResults);
      poseRef.current = pose;
    }

    const vid = videoRef.current;
    const cam = new window.Camera(vid, {
      onFrame: async()=>{ if(runningRef.current) await poseRef.current.send({image:vid}); },
      width:640, height:480
    });
    camRef.current=cam;
    runningRef.current=true; setRunning(true);
    setScanStatus({type:'warn',text:'Detecting…'});

    timerInterval.current = setInterval(()=>{
      const sec = Math.floor((Date.now()-counters.current.start)/1000);
      setTimer(fmtMM(sec));
    },1000);

    await cam.start();
  }

  function stopScanner() {
    runningRef.current=false; setRunning(false);
    if(camRef.current){camRef.current.stop();camRef.current=null;}
    clearInterval(timerInterval.current);
    setScanStatus({type:'warn',text:'Session ended'});

    const c=counters.current;
    const score = c.total>0 ? Math.round((c.good/c.total)*100) : 0;
    const dur = Math.floor((Date.now()-c.start)/1000);
    const sum = {
      score, goodPct:score,
      spineDeg: lastAngles.current.spine,
      neckDeg: lastAngles.current.neck,
      durationSec: dur, totalFrames: c.total,
      goodSec: Math.floor(c.good/30), badSec: Math.floor(c.bad/30),
      maxStreak: Math.floor(c.maxStreak/30)
    };
    setSummary(sum);
    setPendingSession(sum);
  }

  function resetScanner() {
    stopScanner();
    setTimer('00:00');
    setMetrics({spineDeg:0,neckDeg:0,tiltPct:0,neckPct:0});
    setScanStatus({type:'warn',text:'Ready'});
    setSummary(null); setPendingSession(null); setAiData(null); setThumb(null);
    const ctx=canvasRef.current?.getContext('2d');
    if(ctx) ctx.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);
  }

  function openHITL() {
    if (!pendingSession) return;
    if (pendingSession.totalFrames < 30) { showToast('⚠ Session สั้นเกินไป สแกนอย่างน้อย 10 วินาที'); return; }
    setShowHITL(true);
  }

  async function hitlConfirm() {
    setShowHITL(false);
    if (!pendingSession) return;
    setAiLoading(true);
    setAiData(null);

    try {
      // 1. Save session to backend
      const saved = await sessionsApi.submit({
        score: pendingSession.score,
        good_pct: pendingSession.goodPct,
        spine_deg: pendingSession.spineDeg,
        neck_deg: pendingSession.neckDeg,
        duration_sec: pendingSession.durationSec,
        feedback_thumb: thumb
      });
      setSessionId(saved?.session?.id);
      showToast('✓ บันทึก session สำเร็จ');

      // 2. Get AI recommendation
      const recs = await aiApi.recommend({
        score: pendingSession.score,
        spine_deg: pendingSession.spineDeg,
        neck_deg: pendingSession.neckDeg,
        good_pct: pendingSession.goodPct,
        duration_sec: pendingSession.durationSec,
        total_frames: pendingSession.totalFrames
      });
      setAiData(recs);
    } catch (err) {
      showToast('⚠ ' + err.message);
    } finally {
      setAiLoading(false);
    }
  }

  async function rateAI(feedback) {
    showToast(feedback==='helpful' ? '✓ ขอบคุณ!' : '✓ Feedback ถูกบันทึก');
    if (sessionId) {
      try { await sessionsApi.updateFeedback(sessionId, feedback); } catch(_) {}
    }
  }

  const statusColors = { good:'var(--sage)', bad:'var(--coral)', warn:'var(--accent)' };
  const gaugeColor = (pct) => pct > 60 ? 'var(--coral)' : pct > 30 ? 'var(--accent)' : 'var(--sage)';

  return (
    <div className="page" style={{ background:'var(--warm)', paddingBottom:60 }}>

      {/* Hero */}
      <div style={{ padding:'60px 56px 40px', textAlign:'center' }}>
        <div className="section-tag" style={{ justifyContent:'center' }}>AI Posture Scanner</div>
        <h2 style={{ fontFamily:'Instrument Serif,serif', fontSize:'clamp(2rem,4vw,3rem)', marginBottom:8 }}>
          Real-time <em style={{ color:'var(--brown)' }}>Analysis</em>
        </h2>
        <p style={{ fontSize:'.9rem', color:'var(--soft)' }}>
          นั่งหรือยืนด้านข้างกล้อง 90° · ระยะ 1–2 ม. · ให้เห็นศีรษะถึงสะโพก
        </p>
      </div>

      {/* Scanner wrap */}
      <div style={{ maxWidth:960, margin:'0 auto', padding:'0 24px', display:'grid', gridTemplateColumns:'2fr 1fr', gap:24, alignItems:'start' }}>

        {/* Video */}
        <div>
          <div style={{ position:'relative', background:'var(--charcoal)', aspectRatio:'4/3', overflow:'hidden' }}>
            <video ref={videoRef} playsInline style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:0 }} />
            <canvas ref={canvasRef} width={640} height={480} style={{ width:'100%',height:'100%',display:'block',objectFit:'cover' }} />

            {/* Corners */}
            {['tl','tr','bl','br'].map(pos => (
              <div key={pos} style={{
                position:'absolute', width:22, height:22,
                top: pos.includes('t') ? 14 : undefined,
                bottom: pos.includes('b') ? 14 : undefined,
                left: pos.includes('l') ? 14 : undefined,
                right: pos.includes('r') ? 14 : undefined,
                borderColor:'var(--accent)', borderStyle:'solid', borderWidth:0,
                borderTopWidth: pos.includes('t') ? 2 : 0,
                borderBottomWidth: pos.includes('b') ? 2 : 0,
                borderLeftWidth: pos.includes('l') ? 2 : 0,
                borderRightWidth: pos.includes('r') ? 2 : 0,
              }} />
            ))}

            {/* Status badge */}
            <div style={{
              position:'absolute', top:14, left:'50%', transform:'translateX(-50%)',
              background:'rgba(0,0,0,.65)', backdropFilter:'blur(8px)',
              padding:'6px 18px', display:'flex', alignItems:'center', gap:8
            }}>
              <div style={{ width:8,height:8,borderRadius:'50%',background:statusColors[scanStatus.type],animation:'pulse 1.5s ease-in-out infinite' }}/>
              <span style={{ fontSize:'.76rem',color:'white',letterSpacing:'.08em',whiteSpace:'nowrap' }}>{scanStatus.text}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display:'flex', gap:10, marginTop:16, justifyContent:'center', flexWrap:'wrap' }}>
            {!running
              ? <button className="btn btn-primary" onClick={startScanner}>▶ Start Session</button>
              : <button className="btn btn-coral" onClick={stopScanner}>■ Stop</button>}
            <button className="btn btn-ghost" onClick={resetScanner}>↺ Reset</button>
          </div>
        </div>

        {/* Panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div className="panel-card">
            <div style={{ fontSize:'.68rem',letterSpacing:'.15em',textTransform:'uppercase',color:'var(--soft)',marginBottom:8 }}>Posture Status</div>
            <div style={{ fontFamily:'Instrument Serif,serif',fontSize:'1.9rem',color:statusColors[scanStatus.type] }}>{scanStatus.text}</div>
          </div>

          <div className="panel-card">
            <div style={{ fontSize:'.68rem',letterSpacing:'.15em',textTransform:'uppercase',color:'var(--soft)',marginBottom:8 }}>Spine Tilt</div>
            <div style={{ fontFamily:'Instrument Serif,serif',fontSize:'1.6rem' }}>{metrics.spineDeg}°</div>
            <div className="gauge-bar"><div className="gauge-fill" style={{ width:metrics.tiltPct+'%', background:gaugeColor(metrics.tiltPct) }}/></div>
            <div style={{ display:'flex',justifyContent:'space-between',marginTop:5,fontSize:'.74rem',color:'var(--soft)' }}>
              <span>Good &lt;8°</span>
              <span style={{ color: metrics.badSpine?'var(--coral)':metrics.spineDeg>8?'var(--accent)':'var(--sage)' }}>
                {metrics.badSpine?'⚠ Bent':metrics.spineDeg>8?'Slight lean':'✓ Good'}
              </span>
            </div>
          </div>

          <div className="panel-card">
            <div style={{ fontSize:'.68rem',letterSpacing:'.15em',textTransform:'uppercase',color:'var(--soft)',marginBottom:8 }}>Neck / Head</div>
            <div style={{ fontFamily:'Instrument Serif,serif',fontSize:'1.6rem' }}>{metrics.neckOk===false ? '—' : metrics.neckDeg+'°'}</div>
            <div className="gauge-bar"><div className="gauge-fill" style={{ width:metrics.neckPct+'%', background:gaugeColor(metrics.neckPct) }}/></div>
            <div style={{ display:'flex',justifyContent:'space-between',marginTop:5,fontSize:'.74rem',color:'var(--soft)' }}>
              <span>Good &lt;22°</span>
              <span style={{ color: metrics.badNeck?'var(--coral)':metrics.neckDeg>22?'var(--accent)':'var(--sage)' }}>
                {!metrics.neckOk?'Ear hidden':metrics.badNeck?'⚠ Forward':metrics.neckDeg>22?'Slight':' ✓ Good'}
              </span>
            </div>
          </div>

          <div className="panel-card">
            <div style={{ fontSize:'.68rem',letterSpacing:'.15em',textTransform:'uppercase',color:'var(--soft)',marginBottom:6 }}>Session Time</div>
            <div style={{ fontFamily:'Instrument Serif,serif',fontSize:'2.4rem',lineHeight:1 }}>{timer}</div>
          </div>

          {summary && (
            <div className="panel-card">
              <div style={{ fontFamily:'Instrument Serif,serif',fontSize:'1rem',marginBottom:12 }}>Summary</div>
              {[['Good time', fmtTime(summary.goodSec)],['Bad time', fmtTime(summary.badSec)],
                ['Score', summary.score+'%'],['Best streak', fmtTime(summary.maxStreak)]].map(([k,v])=>(
                <div key={k} style={{ display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid var(--warm)',fontSize:'.83rem' }}>
                  <span style={{color:'var(--soft)'}}>{k}</span><span style={{fontWeight:500}}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* HITL Point 1: Save session widget */}
      {pendingSession && !aiData && !aiLoading && (
        <div style={{ maxWidth:960,margin:'20px auto',padding:'0 24px' }}>
          <div style={{ background:'var(--charcoal)',color:'var(--cream)',padding:'24px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap' }}>
            <div>
              <div style={{ fontFamily:'Instrument Serif,serif',fontSize:'1.3rem' }}>Session Complete ✓</div>
              <div style={{ fontSize:'.8rem',color:'var(--soft)',marginTop:4 }}>บันทึก session และรับคำแนะนำจาก AI?</div>
            </div>
            <div style={{ display:'flex',gap:10,flexWrap:'wrap',alignItems:'center' }}>
              <div style={{ display:'flex',gap:8 }}>
                {[['up','👍 ดีขึ้น'],['down','👎 ยังไม่ดี']].map(([t,l])=>(
                  <button key={t} onClick={()=>setThumb(t)} style={{
                    background: thumb===t ? 'rgba(200,168,130,.3)' : 'rgba(255,255,255,.08)',
                    border: thumb===t ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,.15)',
                    color:'white', padding:'8px 14px', cursor:'pointer', fontSize:'.82rem', transition:'all .2s'
                  }}>{l}</button>
                ))}
              </div>
              <button className="btn btn-sage" onClick={openHITL}>บันทึก + AI Rec →</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Loading */}
      {aiLoading && (
        <div style={{ maxWidth:960,margin:'20px auto',padding:'0 24px' }}>
          <div style={{ background:'var(--cream)',padding:'40px',textAlign:'center' }}>
            <div className="spinner" style={{margin:'0 auto 16px'}}/>
            <div style={{fontSize:'.9rem',color:'var(--soft)'}}>กำลังสร้างคำแนะนำ AI…</div>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {aiData && <RecommendationPanel data={aiData} onRate={rateAI} />}

      {/* HITL Modal (Point 2) */}
      {showHITL && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div style={{ fontSize:'2rem',marginBottom:12 }}>🔍</div>
            <h3 style={{ fontFamily:'Instrument Serif,serif',fontSize:'1.8rem',marginBottom:10 }}>ยืนยันก่อนบันทึก</h3>
            <p style={{ fontSize:'.88rem',color:'var(--soft)',lineHeight:1.7,marginBottom:20 }}>
              ตรวจสอบข้อมูล session ด้านล่าง หากข้อมูลไม่ถูกต้อง (เช่น ตั้งกล้องผิดมุม) สามารถยกเลิกได้
            </p>
            <div style={{ background:'var(--warm)',padding:'16px 20px',marginBottom:16 }}>
              {[['User', user?.display_name||user?.email],['Score', pendingSession?.score+'%'],
                ['Spine', pendingSession?.spineDeg+'°'],['Neck', pendingSession?.neckDeg+'°'],
                ['Duration', pendingSession?.durationSec+'s'],
                ['Feeling', thumb==='up'?'👍 ดีขึ้น':thumb==='down'?'👎 ยังไม่ดี':'ไม่ระบุ']
              ].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',fontSize:'.85rem',borderBottom:'1px solid var(--cream)'}}>
                  <span style={{color:'var(--soft)'}}>{k}</span><span>{v}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize:'.74rem',color:'var(--soft)',marginBottom:20,lineHeight:1.6 }}>
              ⚠️ ใช้ข้อมูลจำลองเท่านั้น — ไม่มีข้อมูลส่วนบุคคลจริงที่อ่อนไหวถูกจัดเก็บ
            </p>
            <div style={{ display:'flex',gap:12 }}>
              <button className="btn btn-primary" onClick={hitlConfirm}>✓ ยืนยันและบันทึก</button>
              <button className="btn btn-ghost" onClick={()=>setShowHITL(false)}>✕ ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Recommendation Panel ────────────────────────────────── */
function RecommendationPanel({ data, onRate }) {
  const sevColor = { good:'var(--sage)', moderate:'var(--accent)', severe:'var(--coral)' };
  const recs = data.recommendations || [];

  return (
    <div style={{ maxWidth:960,margin:'20px auto',padding:'0 24px' }}>
      <div style={{ background:'var(--cream)',padding:'32px' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24 }}>
          <h3 style={{ fontFamily:'Instrument Serif,serif',fontSize:'1.7rem' }}>AI <em style={{color:'var(--brown)'}}>Recommendations</em></h3>
          <div style={{ display:'flex',alignItems:'center',gap:8,padding:'6px 14px',background:'var(--charcoal)',color:'var(--cream)' }}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'var(--sage)',animation:'pulse 1.5s ease-in-out infinite'}}/>
            <span style={{fontSize:'.7rem',letterSpacing:'.12em',textTransform:'uppercase'}}>Gemini AI</span>
          </div>
        </div>

        {/* Guardrail banner */}
        {(data.severity==='severe' || data.low_confidence) && (
          <div style={{ background:'rgba(212,131,106,.12)',borderLeft:'3px solid var(--coral)',padding:'12px 16px',marginBottom:20,fontSize:'.83rem',color:'var(--brown)',lineHeight:1.6 }}>
            <strong style={{color:'var(--coral)'}}>⚠ คำเตือน (Guardrail):</strong> ข้อมูลนี้เป็นการประมาณค่าจากกล้อง ไม่ใช่การวินิจฉัยทางการแพทย์
            {data.severity==='severe' && ' คะแนนต่ำมาก ควรปรึกษาแพทย์หรือนักกายภาพบำบัด'}
          </div>
        )}

        {/* Summary */}
        <div style={{ display:'flex',alignItems:'center',gap:12,padding:'14px 18px',background:'var(--warm)',marginBottom:24 }}>
          <div style={{width:10,height:10,borderRadius:'50%',background:sevColor[data.severity]||'var(--accent)',flexShrink:0}}/>
          <div>
            <div style={{fontSize:'.68rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--soft)',marginBottom:2}}>AI Assessment</div>
            <div style={{fontSize:'.9rem'}}>{data.summary}</div>
          </div>
        </div>

        {/* 3 Cards */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16 }}>
          {recs.map((r,i)=>(
            <div key={i} style={{ border:'1px solid var(--accent)',padding:'24px 20px',transition:'all .25s',cursor:'default' }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--warm)'}
              onMouseLeave={e=>e.currentTarget.style.background=''}>
              <div style={{ fontFamily:'Instrument Serif,serif',fontSize:'3rem',color:'var(--warm)',lineHeight:1,marginBottom:-8 }}>0{i+1}</div>
              <div style={{ fontSize:'.66rem',letterSpacing:'.18em',textTransform:'uppercase',color:'var(--soft)',marginBottom:8 }}>
                {r.type==='rule-based' ? '📐 Rule-Based' : '🤖 AI-Generated'}
              </div>
              <div style={{ fontFamily:'Instrument Serif,serif',fontSize:'1.15rem',marginBottom:10 }}>{r.title}</div>
              <div style={{ fontSize:'.83rem',color:'var(--soft)',lineHeight:1.6,marginBottom:10 }}>{r.reason}</div>
              {r.steps?.length > 0 && (
                <ul style={{ paddingLeft:16,fontSize:'.78rem',color:'var(--brown)',lineHeight:1.7 }}>
                  {r.steps.map((s,j)=><li key={j}>{s}</li>)}
                </ul>
              )}
              <div style={{ marginTop:14 }}>
                <span style={{ display:'inline-block',padding:'3px 10px',border:'1px solid var(--accent)',fontSize:'.68rem',letterSpacing:'.1em',textTransform:'uppercase',color:'var(--brown)' }}>{r.tag}</span>
                {r.frequency && <div style={{fontSize:'.74rem',color:'var(--soft)',marginTop:6}}>⏱ {r.frequency}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* HITL Point 2: Feedback on AI */}
        <div style={{ marginTop:24,padding:'16px 18px',background:'var(--warm)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap' }}>
          <div style={{fontSize:'.83rem',color:'var(--brown)'}}>
            <strong>Human Review:</strong> คำแนะนำนี้เป็นประโยชน์หรือไม่?
          </div>
          <div style={{display:'flex',gap:8}}>
            {[['helpful','👍 มีประโยชน์'],['not_helpful','👎 ไม่ตรงจุด'],['see_doctor','🏥 จะพบแพทย์']].map(([t,l])=>(
              <button key={t} onClick={()=>onRate(t)} style={{
                background:'rgba(255,255,255,.6)',border:'1px solid var(--accent)',
                padding:'7px 14px',cursor:'pointer',fontSize:'.78rem',color:'var(--brown)',transition:'all .2s'
              }}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
