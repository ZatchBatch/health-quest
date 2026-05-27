import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Auth from './Auth'
import Tracker from './Tracker'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ background:'#161314', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#b8a8ac', fontSize:16 }}>Loading...</div>
    </div>
  )

  return session ? <Tracker session={session} /> : <Auth />
}