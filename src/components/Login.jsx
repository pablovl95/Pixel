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
        setMessage('✅ Revisa tu email para confirmar tu cuenta.');
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
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-slate-800">
          {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
              className="px-3 py-2.5 rounded-lg border border-slate-300 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              className="px-3 py-2.5 rounded-lg border border-slate-300 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </label>

          {error   && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-emerald-600 text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-base transition-colors disabled:opacity-60"
          >
            {loading ? 'Procesando...' : isSignUp ? 'Registrarse' : 'Entrar'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
            className="text-emerald-600 font-semibold underline"
          >
            {isSignUp ? 'Inicia sesión' : 'Regístrate'}
          </button>
        </p>
      </div>
    </div>
  );
}
