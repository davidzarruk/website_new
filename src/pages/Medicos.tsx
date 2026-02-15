import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Medicos = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-12">
          <h1 className="font-heading text-3xl text-foreground">Médicos</h1>
          <div className="flex items-center gap-4">
            <Link to="/private" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Private Hub
            </Link>
            <button onClick={signOut} className="text-sm text-destructive hover:underline">
              Sign out
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-8 text-center">
          <p className="text-muted-foreground">
            Your médicos content will go here. You can add file upload forms, records, or any private tools.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Medicos;
