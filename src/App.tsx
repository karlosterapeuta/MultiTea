import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Patients from "./pages/Patients";
import Agenda from "./pages/Agenda";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Activities from "./pages/Activities";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

// Layout
import AppLayout from "./components/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthContextProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Rotas Privadas com Layout */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Index />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/activities" element={<Activities />} />
          </Route>

          {/* Rota de Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;