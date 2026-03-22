import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [message,  setMessage]  = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Revisa tu email para confirmar tu cuenta.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#111] px-4">

      {/* fondo de ruido sutil igual que el canvas */}
      <div className="absolute inset-0 bg-[#0d0d0d] opacity-60 pointer-events-none" />

      <div className="relative w-full max-w-sm">

        {/* logotipo */}
        <div className="text-center mb-8">
          <span className="text-white font-bold tracking-tight text-2xl">SpecularBox</span>
          <p className="text-white/25 text-xs font-mono mt-1">
            {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </p>
        </div>

        {/* card */}
        <div className="bg-black/60 border border-white/10 rounded-2xl backdrop-blur-sm p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <label className="flex flex-col gap-1.5 text-xs font-mono text-white/40 uppercase tracking-widest">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                autoComplete="email"
                className="px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.12]
                           text-white text-sm font-mono placeholder:text-white/20
                           focus:outline-none focus:border-white/40 focus:bg-white/[0.08]
                           transition-colors normal-case tracking-normal"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-mono text-white/40 uppercase tracking-widest">
              Contraseña
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                className="px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.12]
                           text-white text-sm font-mono placeholder:text-white/20
                           focus:outline-none focus:border-white/40 focus:bg-white/[0.08]
                           transition-colors normal-case tracking-normal"
              />
            </label>

            {error   && <p className="text-red-400 text-xs font-mono">{error}</p>}
            {message && <p className="text-white/60 text-xs font-mono">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 py-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12]
                         border border-white/[0.12] hover:border-white/30
                         text-white text-sm font-mono font-medium
                         transition-all select-none disabled:opacity-40"
            >
              {loading ? 'Procesando...' : isSignUp ? 'Registrarse' : 'Entrar'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs font-mono text-white/25">
            {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
              className="text-white/50 hover:text-white/80 underline transition-colors"
            >
              {isSignUp ? 'Inicia sesión' : 'Regístrate'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
