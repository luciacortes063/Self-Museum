import { useState } from 'react'
import { Sparkles, KeyRound } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function sendLink() {
    if (!email) return
    setBusy(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    setBusy(false)
    setMessage(error ? error.message : 'Te he enviado un enlace mágico. Mira tu correo ✨')
  }

  return (
    <main className="auth-screen">
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <section className="auth-card glass">
        <div className="sigil"><Sparkles size={30} /></div>
        <p className="eyebrow">TU UNIVERSO PERSONAL</p>
        <h1>Museo<span>Yo</span></h1>
        <p className="auth-copy">
          Un lugar privado para guardar las criaturas, historias, lugares,
          libros, dibujos y pequeños mundos que forman parte de ti.
        </p>

        <label className="field">
          <span>Tu email</span>
          <input
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </label>

        <button className="primary-button" onClick={sendLink} disabled={busy}>
          <KeyRound size={18} />
          {busy ? 'Enviando…' : 'Entrar con enlace mágico'}
        </button>
        {message && <p className="form-message">{message}</p>}
        <p className="tiny">Sin contraseña. Tu museo permanece privado.</p>
      </section>
    </main>
  )
}
