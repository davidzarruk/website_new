import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { kanbanSupabase } from '@/integrations/kanban/client';
import KanbanBoard from '@/components/kanban/KanbanBoard';

const Kanban = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    kanbanSupabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session);
    });

    const { data: { subscription } } = kanbanSupabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await kanbanSupabase.auth.signInWithPassword({ email, password });
    if (error) setError('Invalid credentials');
    setLoading(false);
  };

  const handleSignOut = async () => {
    await kanbanSupabase.auth.signOut();
  };

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h1 className="font-heading text-3xl text-foreground">Kanban Board</h1>
            <p className="text-sm text-muted-foreground mt-2">Sign in to access your board</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="k-email" className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input id="k-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="your@email.com" />
            </div>
            <div>
              <label htmlFor="k-pass" className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input id="k-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="••••••••" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <div className="text-center">
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back to site</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="font-heading text-xl text-foreground">Kanban Board</h1>
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back</a>
          <button onClick={handleSignOut} className="text-sm text-destructive hover:underline">Sign out</button>
        </div>
      </header>
      <main className="p-6">
        <KanbanBoard />
      </main>
    </div>
  );
};

export default Kanban;
