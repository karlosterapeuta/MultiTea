import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNavigation } from "./BottomNavigation";
import { Header } from "./Header";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const AppLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>
        <BottomNavigation />
      </div>
    </div>
  );
};

export default AppLayout;