import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SlideUploader from "@/components/SlideUploader";
import CVUploader from "@/components/CVUploader";
import MaterialsUploader from "@/components/MaterialsUploader";

const privateLinks = [
  { label: "Finanzas", href: "/finanzas" },
  { label: "Médicos", href: "/medicos" },
  { label: "Dashboard", href: "/dashboard" },
];

const PrivateHub = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-12">
          <h1 className="font-heading text-3xl text-foreground">Private Area</h1>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Public site
            </a>
            <button
              onClick={handleSignOut}
              className="text-sm text-destructive hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {privateLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="group rounded-xl bg-card p-6 border border-border hover:border-accent/40 transition-all hover:shadow-md"
            >
              <h2 className="font-heading text-xl text-foreground group-hover:text-accent transition-colors">
                {link.label}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Go to {link.label.toLowerCase()} →
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-12 space-y-8">
          <CVUploader />
          <SlideUploader />
          <MaterialsUploader />
        </div>
      </div>
    </div>
  );
};

export default PrivateHub;
