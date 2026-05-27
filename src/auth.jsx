import { useState } from 'react'
import { supabase } from './supabase'

const dm = {
  bg:"#161314", card:"#231e20", card2:"#2e2729", border:"#3a3133",
  text:"#f0eaec", subtext:"#b8a8ac", hint:"#6e5a5e",
  green:"#d4889a", red:"#c05060",
}

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const inp = {
    width:'100%', padding:'13px 14px', borderRadius:12,
    border:`1px solid ${dm.border}`, fontSize:16,
    boxSizing:'border-box', background:dm.card2,
    outline:'none', color:dm.text, marginBottom:12,
  }
  const btn = (primary) => ({
    width:'100%', padding:'15px', borderRadius:14,
    border:`1px solid ${primary ? dm.text : dm.border}`,
    fontSize:16, fontWeight:500, cursor:'pointer',
    background: primary ? dm.text : 'transparent',
    color: primary ? dm.bg : dm.subtext,
    marginBottom:10,
  })

  async function handleSubmit() {
    setLoading(true); setError(''); setMessage('')
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Check your email to confirm your account!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", background:dm.bg, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:28, fontWeight:700, color:dm.text }}>Health Quest</div>
          <div style={{ fontSize:14, color:dm.subtext, marginTop:6 }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </div>
        </div>
        <div style={{ background:dm.card, borderRadius:16, padding:24 }}>
          <input style={inp} type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
          <input style={inp} type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleSubmit()}/>
          {error && <p style={{ fontSize:13, color:dm.red, marginBottom:10 }}>{error}</p>}
          {message && <p style={{ fontSize:13, color:dm.green, marginBottom:10 }}>{message}</p>}
          <button style={btn(true)} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Loading...' : mode === 'login' ? 'Sign in' : 'Sign up'}
          </button>
          <button style={btn(false)} onClick={()=>{ setMode(mode==='login'?'signup':'login'); setError(''); setMessage('') }}>
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}