import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { User, LogOut, History, Settings, Upload } from "lucide-react";

// naviation bar, shows different links based on auth state
// always displays logged-in user info

export function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Boli ste úspešne odhlásený");
      navigate("/login");
    } catch {
      toast.error("Chyba pri odhlasovaní");
    }
  };

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Logo / Brand */}
        <Link to="/" className="text-xl font-bold">
          Slovenskí olympionici
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost">Domov</Button>
          </Link>

          {isLoggedIn ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>

              <Link to="/edit">
                <Button variant="ghost">Edit</Button>
              </Link>

              {/* User dropdown with info — always visible when logged in */}
              <DropdownMenu>

                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="h-4 w-4" />
                    {user?.full_name}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="font-medium">{user?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.login_type === "OAUTH" ? "Google účet" : "Lokálny účet"}
                    </p>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Profil
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate("/login-history")}>
                    <History className="mr-2 h-4 w-4" />
                    História prihlásení
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate("/import")}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import dát
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleLogout} variant="destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Odhlásiť sa
                  </DropdownMenuItem>
                </DropdownMenuContent>

              </DropdownMenu>
            </>

          ) : (

            <>
              <Link to="/login">
                <Button variant="ghost">Prihlásenie</Button>
              </Link>

              <Link to="/register">
                <Button>Registrácia</Button>
              </Link>
            </>

          )}
        </nav>
        
      </div>
    </header>
  );
}