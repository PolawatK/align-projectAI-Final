import { useState, useRef, useEffect } from 'react';
import { aiApi } from '../lib/api.js';

// Add chat to api lib inline
async function sendChat(message, history) {
  const token = localStorage.getItem('align_token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ message, history })
  });
  if (!res.ok) throw new Error('Chat failed');
  return res.json();
}

const SUGGESTED = [
  'หลังค่อมแก้ยังไงดี?',
  'ท่านั่งทำงานที่ถูกต้องเป็นยังไง?',
  'ปวดคอ-บ่า บรรเทาได้ยังไง?',
  'Office Syndrome คืออะไร?',
  'ท่าบริหารที่ทำได้ที่โต๊ะมีอะไรบ้าง?',
  'จัดโต๊ะยังไงให้ถูก Ergonomics?',
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'สวัสดีครับ! 👋 ฉันคือ ALIGN Assistant ช่วยเรื่องท่าทางและ Office Syndrome ได้เลยครับ',
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  async function send(text) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Build history (exclude first greeting)
    const history = messages.slice(1).map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', content: m.content }));

    try {
      const { reply, sources } = await sendChat(msg, history);
      const botMsg = { role: 'assistant', content: reply, sources: sources || [] };
      setMessages(prev => [...prev, botMsg]);
      if (!open) setUnread(n => n + 1);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'ขออภัยครับ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง 🙏',
        sources: []
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const bubbleStyle = (role) => ({
    maxWidth: '82%',
    padding: '11px 15px',
    fontSize: '.86rem',
    lineHeight: 1.65,
    borderRadius: role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
    background: role === 'user' ? 'var(--charcoal)' : 'white',
    color: role === 'user' ? 'var(--cream)' : 'var(--charcoal)',
    boxShadow: '0 2px 8px rgba(0,0,0,.06)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  });

  return (
    <>
      {/* ── Floating Button ── */}
      <button onClick={() => setOpen(o => !o)} style={{
        position: 'fixed', bottom: 52, right: 28, zIndex: 1000,
        width: 52, height: 52, borderRadius: '50%',
        background: open ? 'var(--charcoal)' : 'var(--brown)',
        border: 'none', cursor: 'pointer', color: 'white', fontSize: '1.3rem',
        boxShadow: '0 4px 20px rgba(0,0,0,.2)',
        transition: 'all .25s', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title="ALIGN Assistant">
        {open ? '✕' : '💬'}
        {unread > 0 && !open && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: 'var(--coral)', color: 'white',
            width: 18, height: 18, borderRadius: '50%',
            fontSize: '.65rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{unread}</span>
        )}
      </button>

      {/* ── Chat Window ── */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 112, right: 28, zIndex: 999,
          width: 360, height: 520,
          background: 'var(--cream)', border: '1px solid var(--warm)',
          boxShadow: '0 8px 40px rgba(0,0,0,.15)',
          display: 'flex', flexDirection: 'column',
          animation: 'slideUp .25s ease',
          fontFamily: 'DM Sans, sans-serif',
        }}>

          {/* Header */}
          <div style={{
            background: 'var(--charcoal)', padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--brown))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '.9rem', flexShrink: 0,
            }}>🧠</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--cream)', fontWeight: 600, fontSize: '.88rem' }}>ALIGN Assistant</div>
              <div style={{ color: 'var(--soft)', fontSize: '.7rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sage)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                ผู้เชี่ยวชาญด้านท่าทาง &amp; Office Syndrome
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'none', border: 'none', color: 'var(--soft)',
              cursor: 'pointer', fontSize: '1rem', padding: 4,
            }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={bubbleStyle(m.role)}>{m.content}</div>
                {/* Sources */}
                {m.sources?.length > 0 && (
                  <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {m.sources.map((s, j) => (
                      <span key={j} style={{
                        fontSize: '.62rem', padding: '2px 8px',
                        background: 'rgba(107,91,71,.08)', color: 'var(--brown)',
                        border: '1px solid rgba(107,91,71,.15)',
                      }}>📎 {s.title}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{ ...bubbleStyle('assistant'), display: 'flex', alignItems: 'center', gap: 6 }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: 'var(--accent)', display: 'inline-block',
                      animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions (show only at start) */}
          {messages.length <= 1 && (
            <div style={{ padding: '0 14px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUGGESTED.slice(0, 3).map(q => (
                <button key={q} onClick={() => send(q)} style={{
                  fontSize: '.72rem', padding: '5px 10px',
                  background: 'white', border: '1px solid var(--accent)',
                  color: 'var(--brown)', cursor: 'pointer', transition: 'all .2s',
                  textAlign: 'left', lineHeight: 1.4,
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--warm)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Guardrail notice */}
          <div style={{
            padding: '5px 14px', fontSize: '.66rem', color: 'var(--soft)',
            background: 'rgba(200,168,130,.08)', borderTop: '1px solid var(--warm)',
            textAlign: 'center', flexShrink: 0,
          }}>
            ⚠️ ให้คำแนะนำเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px', borderTop: '1px solid var(--warm)',
            display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0,
            background: 'white',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="ถามเรื่องท่าทาง หรือ Office Syndrome..."
              disabled={loading}
              rows={1}
              style={{
                flex: 1, resize: 'none', border: '1px solid var(--warm)',
                padding: '9px 12px', fontFamily: 'DM Sans, sans-serif',
                fontSize: '.84rem', color: 'var(--charcoal)', background: 'var(--cream)',
                outline: 'none', lineHeight: 1.5, maxHeight: 80, overflowY: 'auto',
              }}
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px'; }}
            />
            <button onClick={() => send()} disabled={!input.trim() || loading} style={{
              width: 38, height: 38, background: input.trim() && !loading ? 'var(--charcoal)' : 'var(--warm)',
              border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default',
              color: input.trim() && !loading ? 'var(--cream)' : 'var(--soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', transition: 'all .2s', flexShrink: 0,
            }}>→</button>
          </div>
        </div>
      )}
    </>
  );
}
