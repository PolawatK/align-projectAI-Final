import { useState, useEffect } from 'react';
import { sessionsApi } from '../lib/api.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { showToast } from '../components/Toast.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [statsRes, histRes] = await Promise.all([
        sessionsApi.stats(),
        sessionsApi.history(50)
      ]);
      setStats(statsRes);
      setSessions(histRes.sessions || []);
    } catch (err) {
      showToast('⚠ ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    if (!sessions.length) { showToast('ไม่มีข้อมูลให้ export'); return; }
    const header = 'created_at,score,good_pct,spine_deg,neck_deg,duration_sec,feedback_thumb';
    const body = sessions.map(r =>
      [r.created_at,r.score,r.good_pct,r.spine_deg,r.neck_deg,r.duration_sec,r.feedback_thumb||''].join(',')
    ).join('\n');
    const blob = new Blob([header+'\n'+body], {type:'text/csv'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='align_sessions.csv'; a.click();
    showToast('✓ Export สำเร็จ');
  }

  const scoreClass = s => s>=70?'chip chip-good':s>=45?'chip chip-warn':'chip chip-bad';

  if (loading) return (
    <div className="page" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="spinner"/>
    </div>
  );

  const trend = stats?.trend || [];

  return (
    <div className="page" style={{ background:'var(--cream)', paddingBottom:80 }}>

      {/* Hero / KPI */}
      <div style={{ background:'var(--charcoal)',padding:'56px 56px 0' }}>
        <div style={{ fontSize:'.72rem',letterSpacing:'.22em',textTransform:'uppercase',color:'var(--accent)',marginBottom:10 }}>KPI Dashboard · ALIGN</div>
        <h2 style={{ fontFamily:'Instrument Serif,serif',fontSize:'clamp(2rem,4vw,3rem)',color:'var(--cream)',marginBottom:6 }}>
          Posture <em style={{color:'var(--accent)'}}>Progress</em>
        </h2>
        <p style={{ fontSize:'.88rem',color:'var(--soft)',marginBottom:36 }}>สวัสดี {user?.display_name} · ประวัติและ KPI ที่วัดได้จากระบบ</p>

        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:1,background:'rgba(200,168,130,.15)' }}>
          {[
            [stats?.total??0, 'Total Sessions', 'จำนวน session ที่บันทึก'],
            [stats?.avg_score!=null?stats.avg_score+'%':'—', 'Avg Score', 'คะแนนท่าทางเฉลี่ย'],
            [stats?.good_rate!=null?stats.good_rate+'%':'—', 'Good Posture Rate', '% เวลาที่ท่าทางดี'],
            [stats?.positive_feedback_rate!=null?stats.positive_feedback_rate+'%':'—', 'Positive Feedback', '% ผู้ใช้รู้สึกดีขึ้น'],
          ].map(([val,label,note])=>(
            <div key={label} style={{ background:'var(--charcoal)',padding:'28px 24px',borderTop:'1px solid rgba(200,168,130,.1)' }}>
              <div style={{ fontFamily:'Instrument Serif,serif',fontSize:'2.8rem',color:'var(--cream)' }}>{val}</div>
              <div style={{ fontSize:'.68rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--accent)',marginTop:6 }}>{label}</div>
              <div style={{ fontSize:'.74rem',color:'var(--soft)',marginTop:4 }}>{note}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:'48px 56px' }}>

        {/* Chart */}
        <div style={{ marginBottom:48 }}>
          <h3 style={{ fontFamily:'Instrument Serif,serif',fontSize:'1.7rem',marginBottom:4 }}>
            Score Trend
            <span style={{ fontFamily:'DM Sans,sans-serif',fontSize:'.72rem',color:'var(--soft)',fontWeight:400,marginLeft:12 }}>
              {trend.length} sessions ล่าสุด
            </span>
          </h3>
          {trend.length === 0 ? (
            <div style={{ padding:'40px',textAlign:'center',color:'var(--soft)',fontSize:'.88rem' }}>
              ยังไม่มีข้อมูล — กลับไปสแกนท่าทางก่อน
            </div>
          ) : (
            <div style={{ display:'flex',alignItems:'flex-end',gap:8,height:140,paddingBottom:24,borderBottom:'1px solid var(--warm)',marginTop:24 }}>
              {trend.map((t,i)=>{
                const pct = Math.round((t.score/100)*100);
                const bg = t.score>=70?'var(--sage)':t.score>=45?'var(--accent)':'var(--coral)';
                const d = t.date ? new Date(t.date).toLocaleDateString('th-TH',{month:'short',day:'numeric'}) : '#'+(i+1);
                return (
                  <div key={i} style={{ display:'flex',flexDirection:'column',alignItems:'center',flex:1 }}>
                    <div style={{ fontSize:'.68rem',color:'var(--soft)',marginBottom:4 }}>{t.score}%</div>
                    <div style={{ width:'100%',background:bg,height:pct+'%',minHeight:3,transition:'height .5s ease' }}/>
                    <div style={{ fontSize:'.62rem',color:'var(--soft)',marginTop:6,textAlign:'center' }}>{d}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Today stat */}
        {stats?.sessions_today > 0 && (
          <div style={{ padding:'14px 20px',background:'rgba(122,158,126,.1)',borderLeft:'3px solid var(--sage)',marginBottom:32,fontSize:'.85rem',color:'var(--brown)' }}>
            🎯 วันนี้สแกนแล้ว <strong>{stats.sessions_today}</strong> session
          </div>
        )}

        {/* Table */}
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
          <h3 style={{ fontFamily:'Instrument Serif,serif',fontSize:'1.7rem' }}>Session History</h3>
          <div style={{ display:'flex',gap:10 }}>
            <button className="btn btn-ghost btn-sm" onClick={loadData}>↻ Refresh</button>
            <button className="btn btn-ghost btn-sm" onClick={exportCSV}>⬇ Export CSV</button>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div style={{ textAlign:'center',padding:'80px 40px',color:'var(--soft)' }}>
            <div style={{ fontSize:'3rem',marginBottom:16,opacity:.4 }}>📊</div>
            <p style={{ fontSize:'.9rem' }}>ยังไม่มีข้อมูล · กลับไปสแกนท่าทางก่อน</p>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead>
                <tr>
                  {['วันที่/เวลา','Score','Spine','Neck','Duration','Feeling','AI Rec'].map(h=>(
                    <th key={h} style={{ fontSize:'.68rem',letterSpacing:'.13em',textTransform:'uppercase',color:'var(--soft)',textAlign:'left',padding:'10px 14px',borderBottom:'2px solid var(--accent)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map(r=>(
                  <tr key={r.id} style={{ transition:'background .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--warm)'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{ padding:'13px 14px',borderBottom:'1px solid var(--warm)',fontSize:'.83rem' }}>
                      {r.created_at ? new Date(r.created_at).toLocaleString('th-TH') : '—'}
                    </td>
                    <td style={{ padding:'13px 14px',borderBottom:'1px solid var(--warm)' }}>
                      <span className={scoreClass(r.score||0)}>{r.score||0}%</span>
                    </td>
                    <td style={{ padding:'13px 14px',borderBottom:'1px solid var(--warm)',fontSize:'.83rem' }}>{r.spine_deg||0}°</td>
                    <td style={{ padding:'13px 14px',borderBottom:'1px solid var(--warm)',fontSize:'.83rem' }}>{r.neck_deg||0}°</td>
                    <td style={{ padding:'13px 14px',borderBottom:'1px solid var(--warm)',fontSize:'.83rem' }}>{r.duration_sec||0}s</td>
                    <td style={{ padding:'13px 14px',borderBottom:'1px solid var(--warm)',fontSize:'.85rem' }}>
                      {r.feedback_thumb==='up'?'👍':r.feedback_thumb==='down'?'👎':r.feedback_thumb||'—'}
                    </td>
                    <td style={{ padding:'13px 14px',borderBottom:'1px solid var(--warm)',fontSize:'.83rem',color:'var(--sage)' }}>
                      {r.ai_recs && r.ai_recs!=='null' ? '✓' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
