import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { showToast } from '../components/Toast.jsx';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', display_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        showToast('✓ เข้าสู่ระบบสำเร็จ!');
      } else {
        await register(form.email, form.password, form.display_name);
        showToast('✓ สมัครสมาชิกและเข้าสู่ระบบแล้ว!');
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr',
      background: 'var(--cream)'
    }}>
      {/* LEFT — Branding */}
      <div style={{
        background: 'var(--charcoal)', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '80px 60px', position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{
          position:'absolute', top:-80, left:-80, width:320, height:320,
          borderRadius:'50%', border:'1px solid rgba(200,168,130,.1)'
        }}/>
        <div style={{
          position:'absolute', bottom:-60, right:-60, width:240, height:240,
          borderRadius:'50%', border:'1px solid rgba(200,168,130,.08)'
        }}/>

        <div style={{ fontFamily:'Instrument Serif,serif', fontSize:'3.5rem', color:'var(--cream)', lineHeight:1.05, marginBottom:20 }}>
          Stand tall.<br/><em style={{ color:'var(--accent)' }}>Move well.</em>
        </div>
        <p style={{ fontSize:'.95rem', color:'var(--soft)', lineHeight:1.8, maxWidth:360 }}>
          ALIGN วิเคราะห์ท่าทางด้วย AI แบบ real-time และแนะนำวิธีแก้ไขที่เหมาะกับคุณโดยเฉพาะ
        </p>

        <div style={{ marginTop:56, display:'flex', gap:40 }}>
          {[['Real-time', 'Camera Analysis'],['AI-Powered','3 Recommendations'],['Track','Your Progress']].map(([v,l]) => (
            <div key={v}>
              <div style={{ fontFamily:'Instrument Serif,serif', fontSize:'1.5rem', color:'var(--accent)' }}>{v}</div>
              <div style={{ fontSize:'.72rem', color:'var(--soft)', letterSpacing:'.1em', marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Form */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'60px 40px' }}>
        <div style={{ width:'100%', maxWidth:400 }}>

          {/* Tab toggle */}
          <div style={{ display:'flex', marginBottom:32, borderBottom:'1px solid var(--warm)' }}>
            {['login','register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                flex:1, padding:'12px 0', background:'none', border:'none', cursor:'pointer',
                fontFamily:'DM Sans,sans-serif', fontSize:'.82rem', letterSpacing:'.12em',
                textTransform:'uppercase',
                color: mode===m ? 'var(--charcoal)' : 'var(--soft)',
                fontWeight: mode===m ? 600 : 400,
                borderBottom: mode===m ? '2px solid var(--charcoal)' : '2px solid transparent',
                marginBottom:-1, transition:'all .2s'
              }}>
                {m === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
              </button>
            ))}
          </div>

          <div style={{ fontFamily:'Instrument Serif,serif', fontSize:'2rem', marginBottom:8 }}>
            {mode === 'login' ? <>Welcome <em style={{color:'var(--brown)'}}>back</em></> : <>Create <em style={{color:'var(--brown)'}}>account</em></>}
          </div>
          <p style={{ fontSize:'.85rem', color:'var(--soft)', marginBottom:28, lineHeight:1.6 }}>
            {mode === 'login' ? 'เข้าสู่ระบบเพื่อดู session และคำแนะนำของคุณ' : 'สมัครฟรี เริ่มติดตามท่าทางของคุณได้เลย'}
          </p>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="form-field">
                <label className="form-label">ชื่อแสดง</label>
                <input className="form-input" placeholder="เช่น Student01" value={form.display_name} onChange={set('display_name')} />
              </div>
            )}
            <div className="form-field">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
            </div>
            <div className="form-field">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder={mode==='register' ? 'อย่างน้อย 6 ตัวอักษร' : '••••••••'} value={form.password} onChange={set('password')} required />
            </div>

            {error && <div className="form-error" style={{ marginBottom:14 }}>⚠ {error}</div>}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width:'100%', marginTop:8 }}>
              {loading
                ? <><div className="spinner" style={{width:16,height:16,borderWidth:1.5}} /> กำลังดำเนินการ…</>
                : mode === 'login' ? 'เข้าสู่ระบบ →' : 'สมัครสมาชิก →'}
            </button>
          </form>

          <p style={{ marginTop:20, fontSize:'.78rem', color:'var(--soft)', lineHeight:1.6, textAlign:'center' }}>
            ข้อมูลของคุณถูกเข้ารหัสและปลอดภัยด้วย Supabase Auth
          </p>
        </div>
      </div>
    </div>
  );
}
