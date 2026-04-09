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
          large ? "h-14" : "h-11"
        }`}
      >
        <Search className={`ml-4 text-muted-foreground ${large ? "h-5 w-5" : "h-4 w-4"}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Décrivez ce que vous cherchez... ex: bibliothèque d'icônes pour React"
          className={`flex-1 bg-transparent px-3 text-foreground placeholder:text-muted-foreground focus:outline-none ${
            large ? "text-lg" : "text-sm"
          }`}
        />
        <button
          type="submit"
          className={`mr-2 rounded-lg bg-primary px-4 font-label text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90 ${
            large ? "h-10" : "h-7"
          }`}
        >
          Rechercher
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
