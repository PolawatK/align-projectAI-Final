import { useState, useEffect, useCallback } from 'react';

// Simple event bus for toast
const listeners = new Set();
export function showToast(msg, duration = 3500) {
  listeners.forEach(fn => fn(msg, duration));
}

export default function Toast() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const handler = (msg, duration) => {
      const id = Date.now();
      setMessages(prev => [...prev, { id, msg }]);
      setTimeout(() => setMessages(prev => prev.filter(m => m.id !== id)), duration);
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  return (
    <div style={{ position:'fixed', bottom:52, right:28, zIndex:9999, display:'flex', flexDirection:'column', gap:8 }}>
      {messages.map(({ id, msg }) => (
        <div key={id} className="toast">{msg}</div>
      ))}
    </div>
  );
}
