import { Link, useLocation } from "react-router-dom";
import { BookmarkIcon, Settings, Home, Users } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  if (isLanding) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container px-4 flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
            <span className="font-display text-xs text-background">V</span>
          </div>
          <span className="font-display text-base text-foreground hidden sm:inline">Vaultify</span>
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-1">
          <NavItem to="/home" icon={<Home className="h-4 w-4" />} label="Home" />
          <NavItem to="/devs-benin" icon={<Users className="h-4 w-4" />} label="Devs 🇧🇯" />
          <NavItem to="/favorites" icon={<BookmarkIcon className="h-4 w-4" />} label="Favoris" />
          <NavItem to="/settings" icon={<Settings className="h-4 w-4" />} label="Config" />
        </nav>
      </div>
    </header>
  );
};

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-1 sm:gap-1.5 rounded-md px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-label transition-colors duration-150 ${
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
};

export default Header;
