import { NavLink } from "react-router-dom";
import { Home, Users, Calendar, FileText, User, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const navItems = [
  { name: "Início", icon: Home, path: "/dashboard" },
  { name: "Pacientes", icon: Users, path: "/patients" },
  { name: "Agenda", icon: Calendar, path: "/agenda" },
  { name: "Atividades", icon: Lightbulb, path: "/activities" },
  { name: "Relatórios", icon: FileText, path: "/reports" },
  { name: "Perfil", icon: User, path: "/profile" },
];

export const Sidebar = () => {
  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-sidebar-background text-sidebar-foreground p-4">
      {/* Logo Section */}
      <div className="flex items-center h-20 mb-4 px-2">
        <Logo />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};