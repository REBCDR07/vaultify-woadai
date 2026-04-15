import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SearchBarProps {
  initialQuery?: string;
  large?: boolean;
  onSearch?: (query: string) => void;
}

const SearchBar = ({ initialQuery = "", large = false, onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (onSearch) {
      onSearch(query.trim());
    } else {
      navigate(`/results?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`group relative flex items-center rounded-xl border border-border bg-card transition-all duration-150 focus-within:border-primary focus-within:glow-border ${
          large ? "h-12 sm:h-14" : "h-10 sm:h-11"
        }`}
      >
        <Search className={`ml-3 sm:ml-4 shrink-0 text-muted-foreground ${large ? "h-4 w-4 sm:h-5 sm:w-5" : "h-4 w-4"}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={large ? "Décrivez ce que vous cherchez..." : "Rechercher..."}
          className={`flex-1 min-w-0 bg-transparent px-2 sm:px-3 text-foreground placeholder:text-muted-foreground focus:outline-none ${
            large ? "text-sm sm:text-lg" : "text-sm"
          }`}
        />
        <button
          type="submit"
          className={`mr-1.5 sm:mr-2 shrink-0 rounded-lg bg-primary px-3 sm:px-4 font-label text-xs sm:text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90 ${
            large ? "h-8 sm:h-10" : "h-7"
          }`}
        >
          <span className="hidden sm:inline">Rechercher</span>
          <Search className="h-3.5 w-3.5 sm:hidden" />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
