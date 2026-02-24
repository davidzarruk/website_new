import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Berlin from "./pages/Berlin";
import Login from "./pages/Login";
import PrivateHub from "./pages/PrivateHub";
import Finanzas from "./pages/Finanzas";
import Medicos from "./pages/Medicos";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Kanban from "./pages/Kanban";
import ContentCalendar from "./pages/ContentCalendar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/berlin" element={<Berlin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/private" element={<ProtectedRoute><PrivateHub /></ProtectedRoute>} />
            <Route path="/finanzas" element={<ProtectedRoute><Finanzas /></ProtectedRoute>} />
            <Route path="/medicos" element={<ProtectedRoute><Medicos /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/kanban" element={<Kanban />} />
            <Route path="/content-calendar" element={<ContentCalendar />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
