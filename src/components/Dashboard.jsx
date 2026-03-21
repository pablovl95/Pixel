import { supabase } from '../lib/supabaseClient';

export default function Dashboard({ session }) {
  const { user } = session;

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error al cerrar sesión:', error.message);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center items-start py-8 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl">
        {/* Cabecera */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cerrar sesión
          </button>
        </header>

        {/* Contenido */}
        <section className="mb-6">
          <p className="text-lg text-slate-700 mb-1">
            ¡Hola, <span className="font-semibold">{user.email}</span>!
          </p>
          <p className="text-slate-500 text-sm">Estás autenticado correctamente. 🎉</p>
        </section>

        {/* Debug */}
        <details className="mt-4">
          <summary className="text-xs text-slate-400 cursor-pointer select-none">
            Ver datos de sesión (debug)
          </summary>
          <pre className="mt-3 bg-slate-100 rounded-lg p-4 text-xs overflow-x-auto text-slate-600">
            {JSON.stringify({ id: user.id, email: user.email, role: user.role }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
